'use client';

import { Clock, Compass, Database, MapPin } from 'lucide-react';

interface Props {
  birthLocation: string;
  birthLat?: number;
  birthLng?: number;
  calculatedAt?: string;
}

export function TrustEvidenceBar({
  birthLocation,
  birthLat,
  birthLng,
  calculatedAt,
}: Props) {
  const timestamp =
    calculatedAt ||
    new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  const coordStr =
    birthLat && birthLng
      ? `${Math.abs(birthLat).toFixed(4)}°${birthLat >= 0 ? 'N' : 'S'}, ${Math.abs(birthLng).toFixed(4)}°${birthLng >= 0 ? 'E' : 'W'}`
      : birthLocation;

  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-x-6 gap-y-2  border border-white/5 bg-white/[0.02] px-4 py-3 font-mono text-[11px] tracking-wide text-white/40">
      <span className="flex items-center gap-1.5">
        <Database className="text-primary/50 h-3 w-3" />
        NASA JPL Ephemeris
      </span>
      <span className="flex items-center gap-1.5">
        <MapPin className="text-primary/50 h-3 w-3" />
        {coordStr}
      </span>
      <span className="flex items-center gap-1.5">
        <Compass className="text-primary/50 h-3 w-3" />
        Western Tropical System
      </span>
      <span className="flex items-center gap-1.5">
        <Clock className="text-primary/50 h-3 w-3" />
        {timestamp}
      </span>
    </div>
  );
}
