import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  searches: defineTable({
    userId: v.id("users"),
    query: v.string(),
    response: v.string(),
    sources: v.array(v.object({
      title: v.string(),
      url: v.string(),
    })),
    createdAt: v.number(),
  }).index("by_user", ["userId"]).index("by_created", ["createdAt"]),
});
