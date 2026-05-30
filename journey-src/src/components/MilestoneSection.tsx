import React from 'react';
import type { Milestone } from '../data/journeyData';

interface MilestoneCardProps {
  milestone: Milestone;
  index: number;
  isActive: boolean;
}

export const MilestoneCard: React.FC<MilestoneCardProps> = ({
  milestone,
  index,
  isActive,
}) => {
  return (
    <div className={`story-card-panel milestone-card-${index} ${isActive ? 'active' : ''}`}>
      {/* Top Accent Strip */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${milestone.color} rounded-t-3xl`} />
      
      <div className="flex items-center justify-between mt-2">
        <span className="text-amber-500 font-extrabold text-2xl md:text-3xl leading-none">
          {milestone.year}
        </span>
        {milestone.stats && (
          <div className="flex flex-col items-end">
            <span className="text-amber-400 font-black text-lg md:text-xl leading-none">
              {milestone.stats.value}
            </span>
            <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mt-1">
              {milestone.stats.label}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-white text-xl md:text-2xl font-black tracking-tight leading-snug">
          {milestone.title}
        </h3>
        <p className="text-slate-300 text-sm leading-relaxed font-light">
          {milestone.description}
        </p>
      </div>

      {/* Photo Container */}
      <div className="w-full h-44 md:h-52 rounded-2xl overflow-hidden border border-white/5 relative select-none shadow-md">
        <img
          src={milestone.image}
          alt={milestone.title}
          className={`parallax-img-${index} w-full h-full object-cover`}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
      </div>
    </div>
  );
};
