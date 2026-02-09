'use client';

import React, { useState } from 'react';
import { VALID_GUESTS, GIFT_LIST } from '@/lib/constants';
import { RSVPStatus } from '@/lib/types';
import { FloatingShapes } from '@/components/FloatingShapes';
import { GiftCard } from '@/components/GiftCard';
import { RSVPSection } from '@/components/RSVPSection';

export default function Home() {
  const [accessCode, setAccessCode] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [loginError, setLoginError] = useState('');
  const [rsvpStatus, setRsvpStatus] = useState<RSVPStatus>(null);
  const [hasConfirmedRsvp, setHasConfirmedRsvp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');

    setTimeout(() => {
      const name = VALID_GUESTS[accessCode.toUpperCase()];
      if (name) {
        setGuestName(name);
        setIsLoggedIn(true);
      } else {
        setLoginError('Código no válido. Por favor, verifica tu invitación.');
      }
      setIsLoading(false);
    }, 800);
  };

  const handleConfirmRSVP = () => {
    setIsLoading(true);
    setTimeout(() => {
      setHasConfirmedRsvp(true);
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1000);
  };

  return (
    <div className="min-h-screen relative font-['Quicksand'] selection:bg-rose-100 overflow-x-hidden">
      <FloatingShapes />
      
      <div className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center">
        
        {!isLoggedIn ? (
          /* Login Section with Paper Cloud Style */
          <div className="max-w-md w-full mt-10 lg:mt-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="relative mb-12 flex justify-center">
              {/* Smiling Cloud UI Element */}
              <div className="paper-shadow bg-white rounded-full px-12 py-8 relative animate-float">
                <div className="absolute -top-4 right-6 rotate-12">
                   <svg width="30" height="40" viewBox="0 0 50 50" fill="#E6B325">
                     <path d="M25 0 L30 18 L50 25 L30 32 L25 50 L20 32 L0 25 L20 18 Z" />
                   </svg>
                </div>
                {/* Face */}
                <div className="flex flex-col items-center">
                   <div className="flex gap-6 mb-2">
                      <div className="w-5 h-1 bg-slate-800 rounded-full"></div>
                      <div className="w-5 h-1 bg-slate-800 rounded-full"></div>
                   </div>
                   <div className="w-10 h-5 border-b-2 border-slate-800 rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-5xl md:text-6xl font-cursive text-slate-800 mb-2">Baby shower</h1>
              <p className="text-slate-600 font-medium tracking-widest uppercase text-xs">Bienvenido a nuestro sueño</p>
            </div>

            <form onSubmit={handleLogin} className="bg-white/70 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl border border-white/50">
              <div className="mb-8">
                <label className="block text-slate-500 font-bold mb-3 ml-1 text-sm uppercase tracking-widest">Código Único</label>
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="INGRESA CÓDIGO"
                  className="w-full px-6 py-5 rounded-3xl border-2 border-sky-100 focus:border-sky-300 focus:outline-none transition-all text-center text-xl uppercase tracking-[0.2em] font-bold text-slate-700 placeholder:text-slate-300"
                  required
                />
              </div>

              {loginError && (
                <p className="text-red-400 text-sm text-center mb-6 font-medium bg-red-50/50 py-3 rounded-2xl border border-red-100/50">
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#E991A5] hover:bg-[#d87a8f] text-white font-bold py-5 rounded-3xl transition-all shadow-xl shadow-rose-200 active:scale-95 disabled:opacity-50 text-lg uppercase tracking-widest"
              >
                {isLoading ? 'Entrando...' : 'Ingresar'}
              </button>
            </form>
          </div>
        ) : !hasConfirmedRsvp ? (
          /* RSVP Section */
          <div className="animate-in fade-in zoom-in duration-700 w-full max-w-2xl">
             <div className="text-center mb-12">
                <p className="text-slate-500 uppercase tracking-widest text-sm mb-4">Para nuestro invitado especial</p>
                <h1 className="text-5xl font-cursive text-slate-800 mb-2">{guestName}</h1>
                <div className="w-24 h-1 bg-[#E6B325]/40 mx-auto rounded-full mt-4"></div>
             </div>
             <RSVPSection 
               status={rsvpStatus} 
               onSelect={setRsvpStatus} 
               onSubmit={handleConfirmRSVP}
             />
          </div>
        ) : (
          /* Gift Registry Dashboard */
          <div className="animate-in fade-in slide-in-from-top-4 duration-700 w-full">
            <header className="text-center mb-16">
              <h1 className="text-6xl md:text-7xl font-cursive text-slate-800 mb-4">Lista de Regalos</h1>
              <p className="max-w-2xl mx-auto text-slate-600 text-lg px-4 font-light">
                ¡Gracias por confirmar tu asistencia, <strong>{guestName}</strong>! 
                Si deseas hacernos un presente, aquí tienes nuestra selección de favoritos:
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {GIFT_LIST.map((gift) => (
                <GiftCard key={gift.id} gift={gift} />
              ))}
            </div>

            <footer className="mt-24 text-center pb-20">
              <div className="inline-block paper-shadow bg-white rounded-full p-6 animate-sway mb-10">
                <span className="text-4xl">🍼</span>
              </div>
              <p className="text-slate-800 font-cursive text-4xl mb-4">¡Te esperamos con amor!</p>
              <div className="flex justify-center gap-4 opacity-50">
                 <div className="w-2 h-2 rounded-full bg-[#F4B4C1]"></div>
                 <div className="w-2 h-2 rounded-full bg-[#E6B325]"></div>
                 <div className="w-2 h-2 rounded-full bg-[#A66352]"></div>
              </div>
              <button 
                onClick={() => {
                  setIsLoggedIn(false);
                  setHasConfirmedRsvp(false);
                }}
                className="mt-16 text-slate-500 hover:text-slate-800 text-sm transition-colors uppercase tracking-widest"
              >
                Cerrar sesión
              </button>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
}
