'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader2, MapPin } from 'lucide-react';

import { Input } from '@/shared/components/ui/input';

interface Location {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationAutocompleteProps {
  value?: string;
  onChange?: (displayName: string, lat: number, lon: number) => void;
}

export function LocationAutocomplete({
  value: controlledValue,
  onChange: onLocationChange,
}: LocationAutocompleteProps = {}) {
  const [query, setQuery] = useState(controlledValue ?? '');
  const [results, setResults] = useState<Location[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced API fetch
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    // Only fetch if the dropdown is open (meaning the user is typing, not just selected)
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&featuretype=city&limit=5`,
          {
            headers: {
              'Accept-Language': 'en-US,en;q=0.9',
            },
          }
        );
        const data = await res.json();
        setResults(data);
      } catch (error) {
        console.error('Failed to fetch locations', error);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <MapPin className="text-muted-foreground pointer-events-none absolute top-2.5 left-3 z-10 h-4 w-4" />
      <Input
        id="location"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          if (query.trim().length >= 2) setIsOpen(true);
        }}
        placeholder="New York, US"
        className="focus-visible:ring-primary/50 h-11 w-full  border-white/10 bg-black/50 pl-9 text-white"
        autoComplete="off"
      />

      {isOpen && (results.length > 0 || isLoading) && (
        <div className="absolute top-[calc(100%+8px)] left-0 z-[100] w-full min-w-[240px] overflow-hidden  border border-white/10 bg-[#15131A] p-2 shadow-2xl backdrop-blur-xl">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="text-primary h-5 w-5 animate-spin" />
            </div>
          ) : (
            <ul className="hidden-scrollbar max-h-60 overflow-y-auto">
              {results.map((loc) => {
                const parts = loc.display_name.split(',');
                const mainName = parts[0];
                const subName = parts.slice(1).join(',').trim();

                return (
                  <li
                    key={loc.place_id}
                    className="mb-1 flex cursor-pointer flex-col  px-3 py-2 text-sm text-white/80 transition-colors last:mb-0 hover:bg-white/5"
                    onClick={() => {
                      const displayName = `${mainName}${subName ? `, ${subName.split(',').pop()?.trim()}` : ''}`;
                      setQuery(displayName);
                      setIsOpen(false);
                      if (onLocationChange) {
                        onLocationChange(
                          displayName,
                          parseFloat(loc.lat),
                          parseFloat(loc.lon)
                        );
                      }
                    }}
                  >
                    <span className="font-semibold text-white">{mainName}</span>
                    <span className="text-muted-foreground block truncate text-[10px]">
                      {loc.display_name}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
