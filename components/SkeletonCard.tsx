import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="w-full bg-surface border border-white/5 rounded-lg p-3 flex flex-col gap-3 animate-pulse">
      {/* Image Placeholder */}
      <div className="w-full aspect-[4/3] bg-white/5 rounded-md relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
      </div>
      
      {/* Text Lines */}
      <div className="space-y-2">
        <div className="w-3/4 h-3 bg-white/10 rounded-sm" />
        <div className="w-1/2 h-2 bg-white/5 rounded-sm" />
      </div>
    </div>
  );
};
