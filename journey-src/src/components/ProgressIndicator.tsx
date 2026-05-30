import React from 'react';
import type { Milestone } from '../data/journeyData';

interface ProgressIndicatorProps {
  milestones: Milestone[];
  activeIndex: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  milestones,
  activeIndex,
}) => {
  return (
    <>
      {/* Mobile horizontal progress indicator (top fixed) */}
      <div className="lg:hidden fixed top-20 left-0 right-0 h-1 bg-slate-950/80 backdrop-blur-md z-45 flex">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-orange-600 transition-all duration-300 ease-out"
          style={{ width: `${((activeIndex + 1) / (milestones.length + 1)) * 100}%` }}
        />
        <div className="absolute top-2 right-4 text-xs font-semibold tracking-wider text-amber-500 bg-slate-900/90 px-2 py-0.5 rounded-full border border-amber-500/20">
          {activeIndex === -1 ? 'Journey' : (milestones[activeIndex]?.year || 'Stats')}
        </div>
      </div>
    </>
  );
};
