import React from 'react';

const HangingShape: React.FC<{ 
  color: string, 
  shape: 'star' | 'heart', 
  left: string, 
  top: string, 
  length: string,
  delay: string 
}> = ({ color, shape, left, top, length, delay }) => (
  <div 
    className="absolute flex flex-col items-center animate-sway pointer-events-none" 
    style={{ left, top, animationDelay: delay }}
  >
    <div className="hanging-line" style={{ height: length }}></div>
    <div className="paper-shadow -mt-1" style={{ color }}>
      {shape === 'star' ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      )}
    </div>
  </div>
);

export const FloatingShapes: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Top Clouds */}
      <div className="absolute top-0 w-full flex justify-around opacity-90">
         <div className="w-64 h-32 bg-white rounded-full blur-xl -mt-16 -ml-10"></div>
         <div className="w-80 h-40 bg-white rounded-full blur-2xl -mt-20"></div>
         <div className="w-64 h-32 bg-white rounded-full blur-xl -mt-16 -mr-10"></div>
      </div>

      {/* Main Paper Clouds at Top */}
      <div className="absolute top-0 w-full flex justify-between px-4">
        <div className="paper-shadow bg-white/95 rounded-full w-48 h-20 -mt-8 -ml-8"></div>
        <div className="paper-shadow bg-white/95 rounded-full w-64 h-28 -mt-10"></div>
        <div className="paper-shadow bg-white/95 rounded-full w-56 h-24 -mt-12 -mr-8"></div>
      </div>

      {/* Hanging Elements Left */}
      <HangingShape color="#F4B4C1" shape="heart" left="10%" top="0" length="120px" delay="0s" />
      <HangingShape color="#E6B325" shape="star" left="15%" top="0" length="250px" delay="0.5s" />
      <HangingShape color="#FFFFFF" shape="star" left="22%" top="0" length="80px" delay="1s" />
      <HangingShape color="#A66352" shape="heart" left="28%" top="0" length="320px" delay="0.2s" />
      
      {/* Hanging Elements Right */}
      <HangingShape color="#2E2E2E" shape="heart" left="72%" top="0" length="200px" delay="0.7s" />
      <HangingShape color="#FFFFFF" shape="star" left="80%" top="0" length="150px" delay="0.1s" />
      <HangingShape color="#F4B4C1" shape="heart" left="88%" top="0" length="280px" delay="1.2s" />
      <HangingShape color="#E6B325" shape="star" left="93%" top="0" length="100px" delay="0.3s" />

      {/* The Central Smiling Cloud (Small decorative version for background) */}
      <div className="absolute top-[20%] right-[10%] opacity-20 hidden lg:block">
        <div className="relative paper-shadow animate-float">
           <div className="w-48 h-24 bg-white rounded-full relative">
              <div className="absolute top-0 right-4 -mt-6">
                <svg width="40" height="40" viewBox="0 0 100 100" className="text-[#E6B325] drop-shadow-sm">
                  <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" fill="currentColor"/>
                </svg>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 flex gap-4 -mt-2">
                 <div className="w-4 h-1 bg-slate-800 rounded-full"></div>
                 <div className="w-4 h-1 bg-slate-800 rounded-full"></div>
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-4 border-b-2 border-slate-800 rounded-full"></div>
           </div>
        </div>
      </div>
    </div>
  );
};
