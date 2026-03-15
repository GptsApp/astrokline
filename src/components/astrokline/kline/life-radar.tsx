"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Focus } from "lucide-react";
import { RadarData } from "@/lib/astrokline/mock-astrology-data";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTick = ({ payload, x, y, cx, cy, index, onMouseEnter, activeIndex, dataArray }: any) => {
  const data = dataArray.find((d: RadarData) => d.dimension === payload.value);
  const score = data ? data.score : "";
  const isActive = index === activeIndex;

  // Calculate vector direction from chart center to the vertex
  const dx = x - (cx || x);
  const dy = y - (cy || y);
  const length = Math.sqrt(dx * dx + dy * dy);
  
  // Push text 20px further out from the actual vertex
  const offset = 20;
  const finalX = length ? x + (dx / length) * offset : x;
  const finalY = length ? y + (dy / length) * offset : y;

  return (
    <g 
      className="recharts-layer recharts-polar-angle-axis-tick" 
      onMouseEnter={() => onMouseEnter?.(index)}
      onClick={() => onMouseEnter?.(index)}
      style={{ cursor: 'pointer', pointerEvents: 'auto' }}
    >
      <text textAnchor="middle" dominantBaseline="middle" className="transition-all">
        <tspan 
          x={finalX} 
          y={finalY - 8} 
          fill={isActive ? "#FFFFFF" : "#D4AF37"} 
          fontSize={18} 
          fontWeight="bold" 
          className="transition-colors drop-shadow-md"
        >
          {score}
        </tspan>
        <tspan 
          x={finalX} 
          y={finalY + 14} 
          fill={isActive ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.5)"} 
          fontSize={11} 
          fontFamily="monospace"
          className="transition-colors"
        >
          {payload.value}
        </tspan>
      </text>
    </g>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomRadarDot = (props: any) => {
  const { cx, cy, index, activeIndex, setActiveIndex } = props;
  const isActive = index === activeIndex;

  return (
    <g 
      className="cursor-pointer" 
      onMouseEnter={() => setActiveIndex(index)} 
      onClick={() => setActiveIndex(index)}
      style={{ pointerEvents: 'auto' }}
    >
      {isActive && (
        <>
          <line x1={cx} y1={cy} x2="50%" y2="50%" stroke="rgba(255,255,255,0.6)" strokeWidth={1.5} className="animate-pulse" />
          <circle cx={cx} cy={cy} r={4.5} fill="#FFFFFF" stroke="#D4AF37" strokeWidth={2.5} className="drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]" />
        </>
      )}
      {/* Invisible larger hover area for the dot */}
      <circle cx={cx} cy={cy} r={25} fill="transparent" stroke="transparent" />
    </g>
  );
};

export function LifeRadar({ data }: { data: RadarData[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeData = data[activeIndex] || data[0];
  const radarContainerRef = useRef<HTMLDivElement>(null);

  const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!radarContainerRef.current) return;
    
    // Calculate mouse position relative to center of radar container
    const rect = radarContainerRef.current.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Distance check to avoid triggering when mouse is in the very corners of the box far outside the radar
    // We constrain the interaction radius to be precisely around the labels/numbers.
    // The actual radar is at 65% of container half-width, so 85% generously covers the text labels.
    const distance = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2));
    const maxInteractRadius = Math.min(cx, cy) * 0.85; 
    if (distance > maxInteractRadius) return;

    // Calculate angle in degrees. Math.atan2(y, x) where top is negative y.
    let angleDeg = (Math.atan2(y - cy, x - cx) * 180) / Math.PI;
    
    // Shift coordinate system: Top (-90 deg) becomes 0, and we normalize to 0-360
    angleDeg = angleDeg + 90;
    if (angleDeg < 0) angleDeg += 360;

    // We have 7 dimensions. Calculate sector size.
    const numItems = data.length;
    const anglePerItem = 360 / numItems;

    // Snap to closest index
    let closestIndex = 0;
    let minDiff = 360;

    for (let i = 0; i < numItems; i++) {
        const itemAngle = i * anglePerItem;
        let diff = Math.abs(angleDeg - itemAngle);
        if (diff > 180) diff = 360 - diff; // Handle 360 wrapping
        if (diff < minDiff) {
            minDiff = diff;
            closestIndex = i;
        }
    }

    if (activeIndex !== closestIndex) {
        setActiveIndex(closestIndex);
    }
  };

  return (
    <div className="w-full space-y-8">
      <div className="flex items-center gap-3 mb-10">
        <h2 className="text-3xl font-serif tracking-tight text-white/90">Cosmic Dimension Radar</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent ml-4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-[#111015] border border-white/5 rounded-[2.5rem] p-6 md:p-10 shadow-2xl">
        
        {/* Left Side: The Radar Chart */}
        <div 
          ref={radarContainerRef}
          onMouseMove={handleContainerMouseMove}
          className="relative h-[350px] md:h-[450px] w-full flex items-center justify-center cursor-crosshair"
        >
           {/* Deep glow background */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[#D4AF37]/5 rounded-full blur-[80px] pointer-events-none" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-purple-600/5 rounded-full blur-[60px] pointer-events-none" />
           
           <ResponsiveContainer width="100%" height="100%">
             <RadarChart 
               cx="50%" 
               cy="50%" 
               outerRadius="65%" 
               data={data}
               style={{ pointerEvents: 'none' }} // Disable internal recharts hover to prevent conflicts
             >
               <PolarGrid stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
               <PolarAngleAxis 
                 dataKey="dimension" 
                 tick={(props: any) => <CustomTick {...props} onMouseEnter={setActiveIndex} activeIndex={activeIndex} dataArray={data} />}
               />
               <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
               
               <defs>
                 <linearGradient id="radarGlow" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.8}/>
                   <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                 </linearGradient>
                 <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                   <feGaussianBlur stdDeviation="4" result="blur" />
                   <feComposite in="SourceGraphic" in2="blur" operator="over" />
                 </filter>
               </defs>

               <Radar
                 name="Cosmic Blueprint"
                 dataKey="score"
                 stroke="#FCDD73"
                 strokeWidth={2}
                 fill="url(#radarGlow)"
                 fillOpacity={0.5}
                 filter="url(#glowFilter)"
                 dot={<CustomRadarDot activeIndex={activeIndex} setActiveIndex={setActiveIndex} />}
                 activeDot={false}
                 isAnimationActive={false}
               />
             </RadarChart>
           </ResponsiveContainer>
        </div>

        {/* Right Side: Interactive Active Dimension Analysis */}
        <div className="flex flex-col justify-center h-full px-4 md:px-8 py-4">
            <div className="w-full transition-all duration-150 ease-out">
              <div className="mb-6">
                <div className="flex items-center gap-3 text-[#D4AF37] mb-2 relative">
                  <Focus className="w-5 h-5 animate-spin-slow" />
                  <span className="font-mono text-xs tracking-[0.2em] uppercase">Active Dimension</span>
                </div>
                <h3 className="text-4xl md:text-5xl font-serif text-white tracking-tight">{activeData.dimension}</h3>
              </div>
              
              <div className="flex items-end gap-5 mb-8">
                <div className="text-8xl font-light text-[#D4AF37] leading-none mb-[-8px] tracking-tighter">
                  {activeData.score}
                </div>
                <div className="pb-2">
                  <div className="text-white/40 text-[10px] font-mono uppercase tracking-[0.2em] mb-1">Astrological Anchor</div>
                  <div className="text-white/80 font-medium">{activeData.house}</div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-8 shadow-inner relative">
                <motion.div 
                  animate={{ 
                    width: `${activeData.score}%`
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`absolute top-0 left-0 h-full ${activeData.score >= 90 ? 'bg-gradient-to-r from-[#D4AF37] to-[#FCDD73]' : 'bg-gradient-to-r from-emerald-600 to-emerald-400'}`}
                />
              </div>

              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm min-h-[120px] flex items-center">
                <div className={`absolute top-0 left-0 w-1 h-full ${activeData.score >= 90 ? 'bg-[#D4AF37]' : 'bg-emerald-500'}`} />
                <p className="text-white/80 leading-relaxed text-sm md:text-base">
                  {activeData.description}
                </p>
              </div>
            </div>
          
          <div className="mt-8 flex items-center gap-2 justify-center opacity-40">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <p className="text-xs font-mono uppercase tracking-widest text-center">
              Hover chart to decode dimensions
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
