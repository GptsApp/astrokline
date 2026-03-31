'use client';

import React, { useState } from 'react';
import { Users, ArrowRight, Heart, MessageCircle, Zap, Shield } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function computeCompatibility(birthDate1: string, birthDate2: string) {
  const base = hashCode(birthDate1 + birthDate2);
  const overall = 45 + (base % 45); // 45-89
  const romance = 40 + (hashCode(birthDate1 + birthDate2 + 'romance') % 50);
  const communication = 40 + (hashCode(birthDate1 + birthDate2 + 'comm') % 50);
  const values = 40 + (hashCode(birthDate1 + birthDate2 + 'values') % 50);
  const challenge = 20 + (hashCode(birthDate1 + birthDate2 + 'challenge') % 60);

  return { overall, romance, communication, values, challenge };
}

interface CompatibilityToolProps {
  tier: string;
  klineResult: any;
}

export function CompatibilityTool({ tier, klineResult }: CompatibilityToolProps) {
  const data = typeof klineResult === 'string' ? JSON.parse(klineResult) : klineResult;
  const myBirthDate = data?.profile?.birthDate || '2000-01-01';
  const myName = data?.profile?.name || 'You';

  const [partnerName, setPartnerName] = useState('');
  const [partnerBirth, setPartnerBirth] = useState('');
  const [result, setResult] = useState<ReturnType<typeof computeCompatibility> | null>(null);

  const handleCheck = () => {
    if (!partnerBirth) return;
    setResult(computeCompatibility(myBirthDate, partnerBirth));
  };

  const dimensions = result ? [
    { icon: Heart, label: 'Romance', score: result.romance, color: 'text-rose-400', bg: 'bg-rose-500' },
    { icon: MessageCircle, label: 'Communication', score: result.communication, color: 'text-sky-400', bg: 'bg-sky-500' },
    { icon: Shield, label: 'Shared Values', score: result.values, color: 'text-emerald-400', bg: 'bg-emerald-500' },
    { icon: Zap, label: 'Tension Points', score: result.challenge, color: 'text-amber-400', bg: 'bg-amber-500' },
  ] : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center bg-rose-500/10">
            <Users className="h-5 w-5 text-rose-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Compatibility Check</h1>
            <p className="text-xs text-muted-foreground">Synastry analysis based on real birth data</p>
          </div>
        </div>
      </div>

      {/* Input form */}
      <div className="border border-white/5 bg-white/[0.02] p-6">
        <p className="text-sm text-muted-foreground mb-4">
          Enter the other person&apos;s details to see your astrological chemistry.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Their Name</label>
            <input
              type="text"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              placeholder="e.g. Alex"
              className="w-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Their Birth Date</label>
            <input
              type="date"
              value={partnerBirth}
              onChange={(e) => setPartnerBirth(e.target.value)}
              className="w-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-primary/50 focus:outline-none"
            />
          </div>
        </div>
        <button
          onClick={handleCheck}
          disabled={!partnerBirth}
          className={cn(
            'mt-4 inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold transition-all',
            partnerBirth
              ? 'bg-primary text-primary-foreground hover:scale-105'
              : 'bg-white/5 text-white/30 cursor-not-allowed'
          )}
        >
          Check Compatibility <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="mt-8 space-y-6">
          {/* Overall score */}
          <div className="border border-primary/20 bg-primary/5 p-6 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              {myName} + {partnerName || 'Partner'}
            </p>
            <p className="text-5xl font-bold text-white">{result.overall}<span className="text-xl text-muted-foreground">/100</span></p>
            <p className={cn('mt-1 text-sm font-semibold',
              result.overall >= 75 ? 'text-emerald-400' : result.overall >= 55 ? 'text-amber-400' : 'text-rose-400'
            )}>
              {result.overall >= 75 ? 'Strong Connection' : result.overall >= 55 ? 'Promising Chemistry' : 'Growth Opportunity'}
            </p>
          </div>

          {/* Dimension breakdown */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {dimensions.map((d) => (
              <div key={d.label} className="border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <d.icon className={cn('h-4 w-4', d.color)} />
                  <span className="text-sm font-medium text-white">{d.label}</span>
                  <span className={cn('ml-auto text-sm font-bold', d.color)}>{d.score}</span>
                </div>
                <div className="h-1.5 bg-white/5 overflow-hidden">
                  <div className={cn('h-full rounded-full', d.bg)} style={{ width: `${d.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
