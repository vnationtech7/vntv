"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, FileText, Video } from "lucide-react";
import { Button } from "@/components/ui";
import { getSearchSuggestions } from "@/app/actions/search";

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SearchDialog({ open, onClose }: SearchDialogProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      const { data } = await getSearchSuggestions(query);
      console.log("Search suggestions:", data); // Debug log
      setSuggestions(data || []);
      setIsLoading(false);
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSearch = useCallback(
    (searchQuery: string) => {
      if (searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        onClose();
        setQuery("");
        setSuggestions([]);
      }
    },
    [router, onClose]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleSuggestionClick = (suggestion: any) => {
    const url = suggestion.type === "article" ? `/news/${suggestion.slug}` : `/video/${suggestion.slug}`;
    router.push(url);
    onClose();
    setQuery("");
    setSuggestions([]);
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop - Blur background and prevent clicks */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-x-0 top-0 z-50 animate-in slide-in-from-top duration-200">
        <div className="bg-surface-primary border-b-2 border-accent-yellow/20 shadow-2xl">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Search Form */}
            <form onSubmit={handleSubmit} className="mb-6">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-accent-yellow" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search articles, videos, and authors..."
                  className="w-full pl-16 pr-16 py-5 text-lg bg-surface-secondary border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-yellow focus:border-accent-yellow text-text-primary placeholder:text-text-tertiary transition-all"
                  autoFocus
                />
                {isLoading && (
                  <Loader2 className="absolute right-16 top-1/2 -translate-y-1/2 w-6 h-6 text-accent-yellow animate-spin" />
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-surface-secondary"
                  aria-label="Close search"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </form>

            {/* No Results Message */}
            {query.trim().length >= 2 && !isLoading && suggestions.length === 0 && (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
                <p className="text-text-secondary text-lg">No results found for &quot;{query}&quot;</p>
                <p className="text-text-tertiary text-sm mt-2">Try different keywords or browse our categories</p>
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-3 px-2">
                  <p className="text-xs text-text-tertiary uppercase tracking-wider font-semibold">
                    {suggestions.length} {suggestions.length === 1 ? 'Result' : 'Results'}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    Press ESC to close
                  </p>
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.type}-${suggestion.slug}-${index}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-4 py-4 rounded-xl hover:bg-surface-secondary/80 transition-all flex items-start gap-4 group border-2 border-transparent hover:border-accent-yellow/30"
                  >
                    {/* Thumbnail */}
                    <div className="flex-shrink-0 w-24 h-24 bg-surface-secondary rounded-lg overflow-hidden border border-border group-hover:border-accent-yellow/50 transition-all">
                      {suggestion.image_path ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${suggestion.image_path}`}
                          alt={suggestion.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            // Fallback to icon if image fails to load
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-surface-secondary">${suggestion.type === 'video' ? '<svg class="w-8 h-8 text-text-tertiary" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>' : '<svg class="w-8 h-8 text-text-tertiary" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>'}</div>`;
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-surface-secondary">
                          {suggestion.type === "video" ? (
                            <Video className="w-8 h-8 text-text-tertiary" />
                          ) : (
                            <FileText className="w-8 h-8 text-text-tertiary" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start gap-2">
                        <p className="text-base font-semibold text-text-primary group-hover:text-accent-yellow line-clamp-2 transition-colors leading-snug">
                          {suggestion.title}
                        </p>
                      </div>
                      {(suggestion.excerpt || suggestion.description) && (
                        <p className="text-sm text-text-tertiary line-clamp-2 leading-relaxed">
                          {suggestion.excerpt || suggestion.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 pt-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-surface-secondary text-accent-yellow border border-accent-yellow/30">
                          {suggestion.type === "video" ? (
                            <>
                              <Video className="w-3 h-3" />
                              Video
                            </>
                          ) : (
                            <>
                              <FileText className="w-3 h-3" />
                              Article
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* View All Results Button */}
            {query.trim().length > 0 && (
              <div className="mt-6">
                <Button
                  variant="outline"
                  className="w-full py-6 text-base font-bold hover:bg-accent-yellow hover:text-black hover:border-accent-yellow transition-all"
                  onClick={() => handleSearch(query)}
                >
                  <Search className="w-5 h-5 mr-2" />
                  View All Results for &quot;{query}&quot;
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 208, 0, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 208, 0, 0.5);
        }
      `}</style>
    </>
  );
}
