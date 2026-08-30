"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui";

interface MediaAsset {
  id: string;
  file_name: string;
  storage_path: string;
  media_type: string;
  alt_text: string | null;
}

interface MediaSearchPickerProps {
  value: string;
  onChange: (value: string) => void;
  mediaType?: "image" | "video" | "all";
  label?: string;
  placeholder?: string;
}

export function MediaSearchPicker({
  value,
  onChange,
  mediaType = "image",
  label = "Media Asset",
  placeholder = "Search media by name...",
}: MediaSearchPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaAsset | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // Fetch media assets when search query changes
  useEffect(() => {
    const fetchMedia = async () => {
      if (searchQuery.length < 1) {
        setMedia([]);
        return;
      }

      setLoading(true);
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        // Build the query - search by filename or ID
        let query = supabase
          .from("media_assets")
          .select("id, file_name, storage_path, media_type, alt_text")
          .order("created_at", { ascending: false })
          .limit(20);

        // Filter by media type
        if (mediaType !== "all") {
          query = query.eq("media_type", mediaType);
        }

        // Execute query first, then filter client-side for better results
        const { data, error } = await query;

        if (!error && data) {
          // Filter results by search query (filename or ID)
          const searchLower = searchQuery.toLowerCase();
          const filtered = (data as MediaAsset[]).filter(item => 
            item.file_name.toLowerCase().includes(searchLower) ||
            item.id.toLowerCase().includes(searchLower)
          );
          setMedia(filtered.slice(0, 20));
        }
      } catch (err) {
        console.error("Error fetching media:", err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchMedia, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, mediaType]);

  // Fetch selected media details when value changes
  useEffect(() => {
    const fetchSelectedMedia = async () => {
      if (!value) {
        setSelectedMedia(null);
        return;
      }

      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        const { data, error } = await supabase
          .from("media_assets")
          .select("id, file_name, storage_path, media_type, alt_text")
          .eq("id", value)
          .single();

        if (!error && data) {
          setSelectedMedia(data);
        }
      } catch (err) {
        console.error("Error fetching selected media:", err);
      }
    };

    fetchSelectedMedia();
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (mediaAsset: MediaAsset) => {
    onChange(mediaAsset.id);
    setSelectedMedia(mediaAsset);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClear = () => {
    onChange("");
    setSelectedMedia(null);
    setSearchQuery("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-text-primary mb-2">
        {label}
      </label>

      {/* Selected Media Preview */}
      {selectedMedia && (
        <div className="mb-2 p-3 bg-surface-secondary border border-border rounded-lg flex items-center gap-3">
          {selectedMedia.media_type === "image" ? (
            <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
              <img
                src={`${supabaseUrl}/storage/v1/object/public/${selectedMedia.storage_path}`}
                alt={selectedMedia.alt_text || selectedMedia.file_name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded bg-surface-tertiary flex items-center justify-center flex-shrink-0">
              <ImageIcon className="w-8 h-8 text-text-tertiary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              {selectedMedia.file_name}
            </p>
            <p className="text-xs text-text-tertiary">
              ID: {selectedMedia.id.substring(0, 8)}...
            </p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1 hover:bg-surface-tertiary rounded transition-colors"
          >
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface-secondary border border-border text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-yellow"
        />
      </div>

      {/* Dropdown Results */}
      {isOpen && searchQuery.length >= 1 && (
        <div className="absolute z-50 w-full mt-1 bg-surface-secondary border border-border rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-text-secondary">
              Searching...
            </div>
          ) : media.length === 0 ? (
            <div className="p-4 text-center text-text-secondary">
              No media found for "{searchQuery}"
            </div>
          ) : (
            <div className="p-2">
              {media.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full p-2 flex items-center gap-3 hover:bg-surface-tertiary rounded-lg transition-colors text-left"
                >
                  {item.media_type === "image" ? (
                    <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={`${supabaseUrl}/storage/v1/object/public/${item.storage_path}`}
                        alt={item.alt_text || item.file_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to icon if image fails to load
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = `
                            <div class="w-12 h-12 rounded bg-surface-tertiary flex items-center justify-center">
                              <svg class="w-6 h-6 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                            </div>
                          `;
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded bg-surface-tertiary flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="w-6 h-6 text-text-tertiary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {item.file_name}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {item.media_type} • {item.id.substring(0, 8)}...
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Helper Text */}
      <p className="mt-1 text-xs text-text-tertiary">
        Search by filename or ID • Selected: {value ? value.substring(0, 8) + "..." : "None"}
      </p>
    </div>
  );
}
