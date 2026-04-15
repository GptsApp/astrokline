'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, ChevronUp, X } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

const STORAGE_KEY = 'astrokline_onboarding';
const DISMISSED_KEY = 'astrokline_onboarding_dismissed';

export interface OnboardingStep {
  id: string;
  label: string;
  href?: string;
  isComplete: boolean;
}

interface OnboardingState {
  completedSteps: string[];
}

function loadOnboardingState(): OnboardingState {
  if (typeof window === 'undefined') return { completedSteps: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completedSteps: [] };
    const parsed = JSON.parse(raw);
    return { completedSteps: Array.isArray(parsed.completedSteps) ? parsed.completedSteps : [] };
  } catch {
    return { completedSteps: [] };
  }
}

function saveOnboardingState(state: OnboardingState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function isDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(DISMISSED_KEY) === '1';
}

function setDismissed() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DISMISSED_KEY, '1');
}

export function completeOnboardingStep(stepId: string) {
  const state = loadOnboardingState();
  if (!state.completedSteps.includes(stepId)) {
    state.completedSteps.push(stepId);
    saveOnboardingState(state);
  }
}

export function useOnboardingSteps(steps: OnboardingStep[]): {
  resolvedSteps: OnboardingStep[];
  completedCount: number;
  totalCount: number;
  percentage: number;
} {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    const state = loadOnboardingState();
    setCompletedSteps(state.completedSteps);
  }, []);

  // Poll localStorage every 2s to auto-detect newly completed steps
  useEffect(() => {
    const interval = setInterval(() => {
      const state = loadOnboardingState();
      setCompletedSteps((prev) => {
        const next = state.completedSteps;
        if (next.length !== prev.length || next.some((s, i) => s !== prev[i])) return next;
        return prev;
      });
    }, 2000);

    // Also listen to cross-tab/cross-component storage events
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const state = loadOnboardingState();
        setCompletedSteps(state.completedSteps);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => { clearInterval(interval); window.removeEventListener('storage', onStorage); };
  }, []);

  const resolvedSteps = steps.map((step) => ({
    ...step,
    isComplete: step.isComplete || completedSteps.includes(step.id),
  }));

  const completedCount = resolvedSteps.filter((s) => s.isComplete).length;
  const totalCount = resolvedSteps.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return { resolvedSteps, completedCount, totalCount, percentage };
}

export function OnboardingGuide({
  steps,
  hasChart,
  hasAskedChart,
  onNavigate,
}: {
  steps: OnboardingStep[];
  hasChart: boolean;
  hasAskedChart: boolean;
  onNavigate?: (href: string) => void;
}) {
  const [dismissed, setDismissedState] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setDismissedState(isDismissed());
  }, []);

  const enrichedSteps = steps.map((step) => {
    if (step.id === 'create_chart') return { ...step, isComplete: step.isComplete || hasChart };
    if (step.id === 'ask_chart') return { ...step, isComplete: step.isComplete || hasAskedChart };
    return step;
  });

  const { resolvedSteps, completedCount, totalCount, percentage } =
    useOnboardingSteps(enrichedSteps);

  const allComplete = completedCount === totalCount;

  const handleDismiss = useCallback(() => {
    setDismissed();
    setDismissedState(true);
  }, []);

  if (dismissed || allComplete) return null;

  return (
    <div className="mx-2 mt-4 rounded-md border border-primary/15 bg-gradient-to-b from-primary/5 to-transparent p-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="flex items-center gap-2 text-left"
        >
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary/70">
            Getting Started
          </span>
          {collapsed ? (
            <ChevronDown className="h-3.5 w-3.5 text-primary/40" />
          ) : (
            <ChevronUp className="h-3.5 w-3.5 text-primary/40" />
          )}
        </button>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-medium tabular-nums text-primary/50">
            {completedCount}/{totalCount}
          </span>
          <button
            type="button"
            onClick={handleDismiss}
            className="text-white/30 transition-colors hover:text-white/60"
            aria-label="Dismiss guide"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Steps */}
      {!collapsed && (
        <div className="mt-3 space-y-0.5">
          {resolvedSteps.map((step, index) => (
            <button
              key={step.id}
              type="button"
              onClick={() => {
                if (!step.isComplete && step.href && onNavigate) {
                  onNavigate(step.href);
                }
              }}
              disabled={step.isComplete}
              className={cn(
                'flex w-full items-center gap-3 rounded-sm px-2 py-2 text-left text-sm transition-colors',
                step.isComplete
                  ? 'text-white/35 cursor-default'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              )}
            >
              <div
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border text-[10px] font-bold',
                  step.isComplete
                    ? 'border-emerald-400/40 bg-emerald-400/15 text-emerald-400'
                    : 'border-primary/25 bg-primary/5 text-primary/50'
                )}
              >
                {step.isComplete ? <Check className="h-3 w-3" /> : index + 1}
              </div>
              <span className={step.isComplete ? 'line-through' : ''}>
                {step.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Skip link */}
      {!collapsed && (
        <div className="mt-2">
          <button
            type="button"
            onClick={handleDismiss}
            className="text-[11px] text-white/30 transition-colors hover:text-white/50"
          >
            Skip guide
          </button>
        </div>
      )}
    </div>
  );
}
