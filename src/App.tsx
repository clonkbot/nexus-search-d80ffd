import { useConvexAuth, useQuery, useMutation, useAction } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../convex/_generated/api";
import { useState, useRef, useEffect } from "react";
import { Search, Sparkles, Clock, ExternalLink, Trash2, LogOut, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { Id } from "../convex/_generated/dataModel";

interface SearchRecord {
  _id: Id<"searches">;
  _creationTime: number;
  userId: Id<"users">;
  query: string;
  response: string;
  sources: { title: string; url: string }[];
  createdAt: number;
}

function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch {
      setError(flow === "signIn" ? "Invalid credentials" : "Could not create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-fuchsia-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-400 rounded-2xl blur-lg opacity-30" />
        <div className="relative bg-[#12121a]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-xl blur-lg opacity-50" />
              <div className="relative bg-gradient-to-br from-violet-500 to-cyan-400 p-3 rounded-xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-white via-violet-200 to-cyan-200 bg-clip-text text-transparent">
            Nexus Search
          </h1>
          <p className="text-white/50 text-center mb-8 text-sm">
            AI-powered search at your fingertips
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-white/70 text-sm font-medium">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-white/70 text-sm font-medium">Password</label>
              <input
                name="password"
                type="password"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                placeholder="••••••••"
              />
            </div>
            <input name="flow" type="hidden" value={flow} />

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {flow === "signIn" ? "Sign In" : "Create Account"}
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setFlow(flow === "signIn" ? "signUp" : "signIn");
                setError("");
              }}
              className="text-white/50 hover:text-white/80 text-sm transition-colors"
            >
              {flow === "signIn" ? "Don't have an account? " : "Already have an account? "}
              <span className="text-violet-400 hover:text-violet-300 font-medium">
                {flow === "signIn" ? "Sign up" : "Sign in"}
              </span>
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#12121a] text-white/40">or</span>
            </div>
          </div>

          <button
            onClick={() => signIn("anonymous")}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-medium py-3 rounded-xl transition-all duration-300"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}

function SearchApp() {
  const { signOut } = useAuthActions();
  const recentSearches = useQuery(api.searches.getRecent);
  const allSearches = useQuery(api.searches.list);
  const performSearch = useAction(api.searches.performSearch);
  const deleteSearch = useMutation(api.searches.deleteSearch);

  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [currentResult, setCurrentResult] = useState<{ response: string; sources: { title: string; url: string }[] } | null>(null);
  const [error, setError] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setIsSearching(true);
    setError("");
    setCurrentResult(null);

    try {
      const result = await performSearch({ query: q });
      setCurrentResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-fuchsia-500/3 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-lg blur opacity-50" />
              <div className="relative bg-gradient-to-br from-violet-500 to-cyan-400 p-2 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent hidden sm:block">
              Nexus Search
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white/70 hover:text-white transition-all"
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </button>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 rounded-xl text-sm text-white/70 hover:text-red-400 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Search Box */}
        <div className="mb-8 sm:mb-12">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-400 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition-opacity" />
            <div className="relative bg-[#12121a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 sm:p-3 flex items-center gap-2 sm:gap-3">
              <div className="flex-shrink-0 p-2 sm:p-3">
                <Search className="w-5 h-5 sm:w-6 sm:h-6 text-white/40" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                className="flex-1 bg-transparent text-base sm:text-lg text-white placeholder-white/30 focus:outline-none min-w-0"
              />
              <button
                onClick={() => handleSearch()}
                disabled={isSearching || !query.trim()}
                className="flex-shrink-0 bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-white font-medium px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-violet-500/20"
              >
                {isSearching ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span className="hidden sm:inline">Search</span>
                    <Sparkles className="w-4 h-4 sm:hidden" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-medium">Search failed</p>
              <p className="text-red-400/70 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Current Result */}
        {currentResult && (
          <div className="mb-8 animate-fade-in">
            <div className="bg-[#12121a]/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-white/5">
                <div className="flex items-center gap-2 text-violet-400 text-sm mb-2">
                  <Sparkles className="w-4 h-4" />
                  AI Answer
                </div>
                <div className="prose prose-invert prose-sm sm:prose-base max-w-none">
                  <div className="text-white/90 leading-relaxed whitespace-pre-wrap break-words">
                    {currentResult.response}
                  </div>
                </div>
              </div>

              {currentResult.sources.length > 0 && (
                <div className="p-4 sm:p-6 bg-white/[0.02]">
                  <div className="text-xs text-white/40 uppercase tracking-wider mb-3">Sources</div>
                  <div className="flex flex-wrap gap-2">
                    {currentResult.sources.map((source, index) => (
                      <a
                        key={index}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white/60 hover:text-white transition-all group"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span className="truncate max-w-[150px] sm:max-w-[200px]">
                          {new URL(source.url).hostname.replace('www.', '')}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Searches - Quick Access */}
        {!currentResult && !isSearching && recentSearches && recentSearches.length > 0 && (
          <div className="mb-8">
            <div className="text-xs text-white/40 uppercase tracking-wider mb-4">Recent Searches</div>
            <div className="grid gap-3">
              {recentSearches.slice(0, 3).map((search: SearchRecord) => (
                <button
                  key={search._id}
                  onClick={() => {
                    setQuery(search.query);
                    handleSearch(search.query);
                  }}
                  className="text-left bg-[#12121a]/40 hover:bg-[#12121a]/60 border border-white/5 hover:border-white/10 rounded-xl p-4 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-white/30 flex-shrink-0" />
                    <span className="text-white/70 group-hover:text-white transition-colors truncate">
                      {search.query}
                    </span>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 ml-auto flex-shrink-0 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* History Panel */}
        {showHistory && (
          <div className="fixed inset-0 z-50 flex items-start justify-end">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowHistory(false)}
            />
            <div className="relative w-full max-w-md h-full bg-[#12121a] border-l border-white/10 overflow-auto">
              <div className="sticky top-0 bg-[#12121a]/90 backdrop-blur-xl border-b border-white/10 p-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Search History</h2>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>
              <div className="p-4 space-y-3">
                {allSearches && allSearches.length > 0 ? (
                  allSearches.map((search: SearchRecord) => (
                    <div
                      key={search._id}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 group"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <button
                          onClick={() => {
                            setQuery(search.query);
                            setShowHistory(false);
                            handleSearch(search.query);
                          }}
                          className="text-left text-white/90 hover:text-white font-medium transition-colors"
                        >
                          {search.query}
                        </button>
                        <button
                          onClick={() => deleteSearch({ id: search._id })}
                          className="p-1.5 hover:bg-red-500/20 rounded-lg text-white/30 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-white/40 text-sm line-clamp-2">
                        {search.response.substring(0, 150)}...
                      </p>
                      <div className="text-xs text-white/30 mt-2">
                        {new Date(search.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-white/40 py-12">
                    No search history yet
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isSearching && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full blur-lg opacity-50 animate-pulse" />
              <div className="relative bg-[#12121a] p-4 rounded-full">
                <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
              </div>
            </div>
            <p className="mt-4 text-white/50">Searching the web...</p>
          </div>
        )}

        {/* Empty State */}
        {!currentResult && !isSearching && !error && (!recentSearches || recentSearches.length === 0) && (
          <div className="text-center py-16">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-2xl blur-lg opacity-30" />
              <div className="relative bg-[#12121a] p-6 rounded-2xl border border-white/10">
                <Search className="w-12 h-12 text-white/40" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white/90 mb-2">Start Searching</h2>
            <p className="text-white/50 max-w-md mx-auto">
              Ask any question and get AI-powered answers with real-time web sources
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-white/30 text-xs">
            Requested by <span className="text-white/40">@stringer_kade</span> · Built by <span className="text-white/40">@clonkbot</span>
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full blur-lg opacity-50 animate-pulse" />
          <div className="relative bg-[#12121a] p-4 rounded-full">
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <SignInForm />;
  }

  return <SearchApp />;
}
