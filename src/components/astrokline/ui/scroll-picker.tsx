'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '@/shared/lib/utils';

interface ScrollPickerProps {
  items: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  itemHeight?: number;
  visibleCount?: number;
  loop?: boolean;
}

/**
 * iOS-style drum scroll picker.
 * Users can scroll (mouse wheel / touch drag) to pick a value.
 * The selected item snaps to the center highlight band.
 */
export function ScrollPicker({
  items,
  value,
  onChange,
  placeholder = 'Select',
  className,
  itemHeight = 38,
  visibleCount = 5,
  loop = false,
}: ScrollPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isUserScrolling = useRef(false);
  const isProgrammaticScrolling = useRef(false);
  const snapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rebaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [activeRenderIndex, setActiveRenderIndex] = useState(0);

  // Padding items so the first/last can reach center
  const padCount = Math.floor(visibleCount / 2);
  const totalHeight = itemHeight * visibleCount;

  const selectedIndex = items.findIndex((it) => it.value === value);
  const copyCount = loop && items.length > 0 ? 21 : 1;
  const middleCopyOffset =
    loop && items.length > 0 ? items.length * Math.floor(copyCount / 2) : 0;
  const renderedItems = loop
    ? Array.from({ length: items.length * copyCount }, (_, idx) => ({
        ...items[idx % items.length],
        renderedKey: `${items[idx % items.length]?.value ?? idx}-${idx}`,
      }))
    : items.map((item) => ({ ...item, renderedKey: item.value }));

  const normalizeLoopIndex = useCallback(
    (idx: number) => {
      if (!loop || items.length === 0) return idx;
      const normalized =
        (((idx % items.length) + items.length) % items.length) +
        middleCopyOffset;
      return normalized;
    },
    [items.length, loop, middleCopyOffset]
  );

  const getStableRenderIndex = useCallback(
    (idx: number) => {
      if (!loop || items.length === 0) return idx;

      const upperEdge = items.length * (copyCount - 1);
      if (idx < items.length || idx >= upperEdge) {
        return normalizeLoopIndex(idx);
      }

      return idx;
    },
    [copyCount, items.length, loop, normalizeLoopIndex]
  );

  // Scroll to index without animation
  const scrollToIndex = useCallback(
    (idx: number, smooth = false) => {
      const el = containerRef.current;
      if (!el) return;
      const target = idx * itemHeight;
      isProgrammaticScrolling.current = true;
      el.scrollTo({ top: target, behavior: smooth ? 'smooth' : 'auto' });
      window.setTimeout(
        () => {
          isProgrammaticScrolling.current = false;
        },
        smooth ? 240 : 0
      );
    },
    [itemHeight]
  );

  // On mount, scroll to selected
  useEffect(() => {
    setIsMounted(true);
    const initialIndex =
      selectedIndex >= 0
        ? loop
          ? normalizeLoopIndex(selectedIndex)
          : selectedIndex
        : loop
          ? middleCopyOffset
          : 0;

    requestAnimationFrame(() => {
      setActiveRenderIndex(initialIndex);
      scrollToIndex(initialIndex, false);
    });
  }, []); // eslint-disable-line

  // When value changes externally, scroll to it
  useEffect(() => {
    if (!isMounted) return;
    if (isUserScrolling.current) return;
    const currentValueIndex =
      loop && items.length > 0
        ? ((activeRenderIndex % items.length) + items.length) % items.length
        : activeRenderIndex;
    if (selectedIndex >= 0) {
      if (currentValueIndex === selectedIndex) return;
      const targetIndex = loop
        ? normalizeLoopIndex(selectedIndex)
        : selectedIndex;
      setActiveRenderIndex(targetIndex);
      scrollToIndex(targetIndex, true);
    }
  }, [
    value,
    selectedIndex,
    scrollToIndex,
    isMounted,
    loop,
    normalizeLoopIndex,
    activeRenderIndex,
    items.length,
  ]);

  useEffect(() => {
    return () => {
      if (snapTimer.current) {
        clearTimeout(snapTimer.current);
      }
      if (rebaseTimer.current) {
        clearTimeout(rebaseTimer.current);
      }
    };
  }, []);

  // Snap to nearest item after scrolling stops
  const handleScroll = useCallback(() => {
    if (isProgrammaticScrolling.current) return;
    if (snapTimer.current) clearTimeout(snapTimer.current);
    isUserScrolling.current = true;

    snapTimer.current = setTimeout(() => {
      const el = containerRef.current;
      if (!el) return;
      const scrollTop = el.scrollTop;
      const idx = Math.round(scrollTop / itemHeight);

      if (items.length === 0) {
        isUserScrolling.current = false;
        return;
      }

      const bounded = loop
        ? Math.max(0, Math.min(renderedItems.length - 1, idx))
        : Math.max(0, Math.min(items.length - 1, idx));
      const stableIdx = loop ? getStableRenderIndex(bounded) : bounded;
      const valueIdx = loop
        ? ((bounded % items.length) + items.length) % items.length
        : bounded;

      // First snap to where the user actually stopped.
      scrollToIndex(bounded, true);
      setActiveRenderIndex(bounded);

      // Update value
      if (items[valueIdx] && items[valueIdx].value !== value) {
        onChange(items[valueIdx].value);
      }

      if (rebaseTimer.current) clearTimeout(rebaseTimer.current);
      rebaseTimer.current = setTimeout(() => {
        if (stableIdx !== bounded) {
          setActiveRenderIndex(stableIdx);
          scrollToIndex(stableIdx, false);
        }
        isUserScrolling.current = false;
      }, 260);
    }, 80);
  }, [
    scrollToIndex,
    itemHeight,
    items,
    loop,
    getStableRenderIndex,
    onChange,
    renderedItems.length,
    value,
  ]);

  // Click to select
  const handleItemClick = useCallback(
    (idx: number) => {
      const targetIdx = loop ? getStableRenderIndex(idx) : idx;
      const valueIdx = loop
        ? ((idx % items.length) + items.length) % items.length
        : idx;

      setActiveRenderIndex(targetIdx);
      scrollToIndex(targetIdx, true);
      if (items[valueIdx]) {
        onChange(items[valueIdx].value);
      }
    },
    [getStableRenderIndex, items, loop, onChange, scrollToIndex]
  );

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-white/10 bg-black/40',
        className
      )}
      style={{ height: totalHeight }}
    >
      {/* Top/bottom gradient fade — scroll hints */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[38%] bg-gradient-to-b from-[#0D0B12] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[38%] bg-gradient-to-t from-[#0D0B12] to-transparent" />

      {/* Center highlight band */}
      <div
        className="border-primary/30 bg-primary/[0.07] pointer-events-none absolute inset-x-2 z-[5] rounded-lg border"
        style={{
          top: padCount * itemHeight,
          height: itemHeight,
        }}
      />

      {/* Scrollable list */}
      <div
        ref={containerRef}
        className="scrollbar-none absolute inset-0 overflow-y-auto"
        style={{
          WebkitOverflowScrolling: 'touch',
        }}
        onScroll={handleScroll}
      >
        {/* Top padding */}
        <div style={{ height: padCount * itemHeight }} />

        {/* Items */}
        {renderedItems.map((item, idx) => {
          const isSelected = idx === activeRenderIndex;
          return (
            <div
              key={item.renderedKey}
              onClick={() => handleItemClick(idx)}
              className={cn(
                'flex cursor-pointer items-center justify-center transition-all duration-150 select-none',
                isSelected
                  ? 'text-primary text-base font-bold'
                  : 'text-sm text-white/40 hover:text-white/60'
              )}
              style={{
                height: itemHeight,
              }}
            >
              {item.label}
            </div>
          );
        })}

        {/* Bottom padding */}
        <div style={{ height: padCount * itemHeight }} />
      </div>

      {/* Placeholder when empty */}
      {!value && items.length === 0 && (
        <div className="text-muted-foreground/50 absolute inset-0 z-20 flex items-center justify-center text-sm">
          {placeholder}
        </div>
      )}
    </div>
  );
}
