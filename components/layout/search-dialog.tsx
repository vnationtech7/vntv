"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-x-0 top-0 z-50 animate-in slide-in-from-top duration-200">
        <div className="bg-surface-primary border-b border-border shadow-lg">
          <div className="container mx-auto px-4 py-6">
            {/* Search Form */}
            <form onSubmit={handleSubmit} className="mb-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search articles, videos, and authors..."
                  className="w-full pl-12 pr-12 py-4 text-lg bg-surface-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-yellow text-text-primary placeholder:text-text-tertiary"
                  autoFocus
                />
                {isLoading && (
                  <Loader2 className="absolute right-12 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary animate-spin" />
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-text-tertiary uppercase tracking-wide mb-2 px-2">
                  Suggestions
                </p>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-surface-secondary transition-colors flex items-center gap-3"
                  >
                    <Search className="w-4 h-4 text-text-tertiary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary truncate">
                        {suggestion.title}
                      </p>
                      <p className="text-xs text-text-tertiary capitalize">
                        {suggestion.type}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* View All Results Button */}
            {query.trim().length > 0 && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSearch(query)}
                >
                  View all results for &quot;{query}&quot;
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
