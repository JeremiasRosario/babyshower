import React from 'react';
import { RSVPStatus } from '@/lib/types';

interface RSVPSectionProps {
  status: RSVPStatus;
  onSelect: (status: RSVPStatus) => void;
  onSubmit: () => void;
}

export const RSVPSection: React.FC<RSVPSectionProps> = ({ status, onSelect, onSubmit }) => {
  return (
    <div className="max-w-md mx-auto bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] border border-white/50 shadow-2xl text-center">
      <h2 className="text-3xl font-cursive text-slate-800 mb-3">¿Podrás acompañarnos?</h2>
      <p className="text-slate-500 mb-10 text-sm tracking-wide">Tu presencia haría este día inolvidable.</p>
      
      <div className="grid grid-cols-1 gap-4 mb-10">
        <button
          onClick={() => onSelect('yes')}
          className={`group py-5 px-8 rounded-3xl font-bold transition-all duration-500 flex items-center justify-between border-2 ${
            status === 'yes' 
              ? 'bg-[#E991A5] border-[#E991A5] text-white shadow-xl scale-[1.02]' 
              : 'bg-white border-sky-100 text-slate-400 hover:border-[#E991A5] hover:text-[#E991A5]'
          }`}
        >
          <span className="text-lg">Sí, ¡allí estaré!</span>
          <span className="text-2xl group-hover:scale-125 transition-transform">✨</span>
        </button>
        <button
          onClick={() => onSelect('no')}
          className={`group py-5 px-8 rounded-3xl font-bold transition-all duration-500 flex items-center justify-between border-2 ${
            status === 'no' 
              ? 'bg-slate-400 border-slate-400 text-white shadow-xl scale-[1.02]' 
              : 'bg-white border-sky-100 text-slate-400 hover:border-slate-300 hover:text-slate-500'
          }`}
        >
          <span className="text-lg">No podré asistir</span>
          <span className="text-2xl group-hover:scale-125 transition-transform">🤍</span>
        </button>
      </div>

      <button
        disabled={!status}
        onClick={onSubmit}
        className={`w-full py-5 rounded-3xl font-bold text-lg transition-all shadow-xl uppercase tracking-widest ${
          status 
            ? 'bg-[#E6B325] hover:bg-[#cf9e1d] text-white cursor-pointer active:scale-95' 
            : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
        }`}
      >
        Confirmar
      </button>
    </div>
  );
};
