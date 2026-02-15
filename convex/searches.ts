import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("searches")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);
  },
});

export const getRecent = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("searches")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(5);
  },
});

export const saveSearch = mutation({
  args: {
    query: v.string(),
    response: v.string(),
    sources: v.array(v.object({
      title: v.string(),
      url: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("searches", {
      userId,
      query: args.query,
      response: args.response,
      sources: args.sources,
      createdAt: Date.now(),
    });
  },
});

export const deleteSearch = mutation({
  args: { id: v.id("searches") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const search = await ctx.db.get(args.id);
    if (!search || search.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(args.id);
  },
});

export const performSearch = action({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      throw new Error("PERPLEXITY_API_KEY environment variable not set");
    }

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "system",
            content: "You are a helpful search assistant. Provide clear, concise, and accurate answers based on web search results. Format your response in markdown for readability."
          },
          {
            role: "user",
            content: args.query
          }
        ],
        return_citations: true,
        return_images: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Perplexity API error: ${error}`);
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || "No response received";
    const citations = data.citations || [];

    const sources = citations.map((url: string, index: number) => ({
      title: `Source ${index + 1}`,
      url: url,
    }));

    await ctx.runMutation(api.searches.saveSearch, {
      query: args.query,
      response: answer,
      sources,
    });

    return {
      response: answer,
      sources,
    };
  },
});
