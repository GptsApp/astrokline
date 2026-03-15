'use client';

import { Compass, MapPin, Clock, Database } from 'lucide-react';

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
  const timestamp = calculatedAt || new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  const coordStr = birthLat && birthLng
    ? `${Math.abs(birthLat).toFixed(4)}°${birthLat >= 0 ? 'N' : 'S'}, ${Math.abs(birthLng).toFixed(4)}°${birthLng >= 0 ? 'E' : 'W'}`
    : birthLocation;

  return (
    <div className="w-full rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-white/40 font-mono tracking-wide">
      <span className="flex items-center gap-1.5">
        <Database className="w-3 h-3 text-primary/50" />
        Swiss Ephemeris Engine
      </span>
      <span className="flex items-center gap-1.5">
        <MapPin className="w-3 h-3 text-primary/50" />
        {coordStr}
      </span>
      <span className="flex items-center gap-1.5">
        <Compass className="w-3 h-3 text-primary/50" />
        Geocentric · Tropical
      </span>
      <span className="flex items-center gap-1.5">
        <Clock className="w-3 h-3 text-primary/50" />
        {timestamp}
      </span>
    </div>
  );
}
