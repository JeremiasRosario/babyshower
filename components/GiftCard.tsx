import React from 'react';
import Image from 'next/image';
import { Gift } from '@/lib/types';

interface GiftCardProps {
  gift: Gift;
}

export const GiftCard: React.FC<GiftCardProps> = ({ gift }) => {
  return (
    <div className="paper-shadow bg-white/90 backdrop-blur-md rounded-[2.5rem] overflow-hidden group border border-white/50 transition-all duration-500 hover:-translate-y-2">
      <div className="relative h-60 overflow-hidden">
        <Image 
          src={gift.imageUrl} 
          alt={gift.name} 
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-1000"
        />
        <div className="absolute top-5 right-5">
          <span className="px-4 py-2 bg-white/90 text-slate-700 text-[10px] font-bold rounded-full uppercase tracking-widest shadow-sm">
            {gift.category}
          </span>
        </div>
      </div>
      
      <div className="p-8">
        <h3 className="text-2xl font-cursive text-slate-800 mb-3 group-hover:text-[#E991A5] transition-colors">
          {gift.name}
        </h3>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed font-light">
          {gift.description}
        </p>
        
        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-4 flex items-center gap-2">
            <span className="w-4 h-px bg-slate-200"></span>
            Ver en tienda
            <span className="w-4 h-px bg-slate-200"></span>
          </p>
          <div className="flex flex-col gap-3">
            <a 
              href={gift.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between py-4 px-6 bg-[#FF9900]/5 hover:bg-[#FF9900]/10 text-[#232F3E] font-bold rounded-2xl transition-all border border-[#FF9900]/10 group/btn"
            >
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                </svg>
                <span className="text-sm uppercase tracking-wider">Amazon</span>
              </div>
              <svg className="w-4 h-4 opacity-50 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>

            <a 
              href="https://bebemundo.com.do/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between py-4 px-6 bg-sky-50/50 hover:bg-sky-100/50 text-sky-700 font-bold rounded-2xl transition-all border border-sky-100 group/btn"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">👶</span>
                <span className="text-sm uppercase tracking-wider">Bebemundo</span>
              </div>
              <svg className="w-4 h-4 opacity-50 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
