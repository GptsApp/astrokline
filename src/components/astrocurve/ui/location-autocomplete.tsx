'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, MapPin, Search } from 'lucide-react';

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
  const [hasSearched, setHasSearched] = useState(false);
  const [isSelected, setIsSelected] = useState(!!controlledValue);
  const [networkError, setNetworkError] = useState(false);
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

  // Debounced API fetch with auto-retry (broadened search on empty results)
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      setHasSearched(false);
      return;
    }

    if (!isOpen) return;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setNetworkError(false);
      try {
        // First try: city-level search
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&featuretype=city&limit=6`,
          { headers: { 'Accept-Language': 'en-US,en;q=0.9' } }
        );
        let data: Location[] = await res.json();

        // Auto-retry without featuretype if no city-level results
        if (data.length === 0) {
          const retryRes = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              query
            )}&limit=6`,
            { headers: { 'Accept-Language': 'en-US,en;q=0.9' } }
          );
          data = await retryRes.json();
        }

        setResults(data);
        setHasSearched(true);
      } catch (error) {
        console.error('Failed to fetch locations', error);
        setNetworkError(true);
        setResults([]);
        setHasSearched(true);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const handleSelect = (loc: Location) => {
    const parts = loc.display_name.split(',');
    const mainName = parts[0];
    const subName = parts.slice(1).join(',').trim();
    const displayName = `${mainName}${subName ? `, ${subName.split(',').pop()?.trim()}` : ''}`;
    setQuery(displayName);
    setIsOpen(false);
    setIsSelected(true);
    if (onLocationChange) {
      onLocationChange(displayName, parseFloat(loc.lat), parseFloat(loc.lon));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
    // If user edits after selecting, clear the selection
    if (isSelected) {
      setIsSelected(false);
      if (onLocationChange) {
        onLocationChange('', 0, 0);
      }
    }
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {/* Input with status icon */}
      <div className="relative">
        {isSelected ? (
          <CheckCircle2 className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-3 z-10 h-4 w-4 text-emerald-400" />
        ) : (
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 -translate-y-1/2 left-3 z-10 h-4 w-4" />
        )}
        <Input
          id="location"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (query.trim().length >= 2 && !isSelected) setIsOpen(true);
          }}
          placeholder="Search your birth city..."
          className={`focus-visible:ring-primary/50 h-11 w-full border-white/10 bg-black/50 pl-9 text-white ${
            isSelected ? 'border-emerald-500/30' : ''
          }`}
          autoComplete="off"
        />
      </div>

      {/* Helper text: must select from list */}
      {!isSelected && query.length > 0 && !isOpen && (
        <p className="mt-1.5 text-[9px] font-mono text-amber-400/70 uppercase tracking-wider">
          ↑ Please select a city from the dropdown list
        </p>
      )}

      {/* Dropdown */}
      {isOpen && (query.trim().length >= 2) && (
        <div className="absolute top-[calc(100%+8px)] left-0 z-[100] w-full min-w-[240px] overflow-hidden border border-white/10 bg-[#15131A] shadow-2xl backdrop-blur-xl">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 p-4">
              <Loader2 className="text-primary h-4 w-4 animate-spin" />
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Searching...</span>
            </div>
          ) : networkError ? (
            /* Network error state */
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                <span className="text-xs text-rose-400">Connection error. Please check your network.</span>
              </div>
              <button
                onClick={() => { setHasSearched(false); setIsOpen(true); }}
                className="text-[10px] font-mono text-primary/70 hover:text-primary uppercase tracking-wider underline underline-offset-2"
              >
                Retry
              </button>
            </div>
          ) : results.length > 0 ? (
            /* Results list */
            <ul className="hidden-scrollbar max-h-60 overflow-y-auto p-2">
              {results.map((loc) => {
                const parts = loc.display_name.split(',');
                const mainName = parts[0];
                return (
                  <li
                    key={loc.place_id}
                    className="mb-1 flex cursor-pointer flex-col px-3 py-2 text-sm text-white/80 transition-colors last:mb-0 hover:bg-white/5"
                    onClick={() => handleSelect(loc)}
                  >
                    <span className="font-semibold text-white">{mainName}</span>
                    <span className="text-muted-foreground block truncate text-[10px]">
                      {loc.display_name}
                    </span>
                  </li>
                );
              })}
              {/* Accuracy note at bottom of results */}
              <li className="mt-2 px-3 py-1.5 border-t border-white/5">
                <span className="text-[9px] font-mono text-white/25 uppercase tracking-wider">
                  Accuracy within 50 mi is sufficient for your chart
                </span>
              </li>
            </ul>
          ) : hasSearched ? (
            /* No results state */
            <div className="p-4 space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-amber-400/70 shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <p className="text-xs text-white/60">
                    No cities found for &ldquo;{query}&rdquo;
                  </p>
                  <p className="text-[10px] text-white/40 leading-relaxed">
                    Try searching for a <span className="text-white/60">nearby major city</span> instead.
                    Accuracy within 50 miles is sufficient for astrological calculations.
                  </p>
                </div>
              </div>
              <div className="border-t border-white/5 pt-2">
                <p className="text-[9px] font-mono text-white/25 uppercase tracking-wider">
                  Still can&apos;t find it?{' '}
                  <a
                    href="mailto:support@astrocurve.net?subject=Birth%20Location%20Help"
                    className="text-primary/60 hover:text-primary underline underline-offset-2"
                  >
                    Contact support
                  </a>
                </p>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
