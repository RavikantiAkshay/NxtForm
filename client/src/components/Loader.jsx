import React from 'react';

export default function Loader({ text = "Loading...", fullScreen = false }) {
  const loaderContent = (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* AI Form Building Loader */}
      <div className="relative w-20 h-24 bg-[#0a0a0a] border border-[#333] rounded-lg p-3 shadow-[0_0_30px_rgba(139,92,246,0.15)] overflow-hidden flex flex-col">
        {/* Top bar / Header */}
        <div className="w-full flex justify-between mb-3">
          <div className="w-3/5 h-2 bg-[#8b5cf6]/50 rounded animate-pulse"></div>
          <div className="w-1/4 h-2 bg-[#222] rounded"></div>
        </div>
        
        {/* Form Field 1 */}
        <div className="w-full h-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded mb-2 relative overflow-hidden">
           <div className="absolute top-0 left-0 h-full bg-[#333] w-1/3 animate-[slideRight_1.5s_infinite_alternate]"></div>
        </div>
        
        {/* Form Field 2 (Checkbox style) */}
        <div className="flex gap-2 mb-2">
           <div className="w-3 h-3 bg-[#8b5cf6]/30 border border-[#8b5cf6]/50 rounded-sm"></div>
           <div className="w-full h-3 bg-[#1a1a1a] rounded"></div>
        </div>
        
        {/* Form Field 3 */}
        <div className="w-4/5 h-3 bg-[#1a1a1a] rounded mb-auto"></div>
        
        {/* Submit Button Skeleton */}
        <div className="w-full h-4 bg-[#8b5cf6] rounded mt-2 opacity-80"></div>

        {/* AI Scanner Laser */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#c4b5fd] to-transparent animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_12px_#c4b5fd] z-10"></div>
      </div>
      
      {/* Status Text */}
      <div className="text-[#c4b5fd] font-display font-bold tracking-[0.2em] uppercase text-[11px] animate-pulse text-center">
        {text}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#050505]/90 backdrop-blur-xl flex items-center justify-center">
        {loaderContent}
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[200px] flex items-center justify-center">
      {loaderContent}
    </div>
  );
}
