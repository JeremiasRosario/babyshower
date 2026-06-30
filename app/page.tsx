'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { EVENT } from '@/lib/constants';
import { Gift, Guest, RSVPStatus } from '@/lib/types';
import {
  findGuestByPhone,
  normalizePhone,
  releaseGift,
  reserveGift,
  setGuestRSVP,
  subscribeToGifts,
  subscribeToGuest,
} from '@/lib/db';
import { FloatingShapes } from '@/components/FloatingShapes';
import { GiftListItem } from '@/components/GiftListItem';
import { RSVPSection } from '@/components/RSVPSection';

export default function Home() {
  const [phoneInput, setPhoneInput] = useState('');
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [pendingRsvp, setPendingRsvp] = useState<RSVPStatus>(null);
  const [pendingAdults, setPendingAdults] = useState(1);
  const [pendingChildren, setPendingChildren] = useState(0);
  const [isSubmittingRsvp, setIsSubmittingRsvp] = useState(false);
  // Always show the RSVP card after login; flip after confirm in current session.
  const [hasConfirmedThisSession, setHasConfirmedThisSession] = useState(false);

  const [gifts, setGifts] = useState<Gift[]>([]);
  const [giftsLoading, setGiftsLoading] = useState(true);

  // Subscribe to gifts only after login
  useEffect(() => {
    if (!guest) return;
    setGiftsLoading(true);
    const unsub = subscribeToGifts((next) => {
      setGifts(next);
      setGiftsLoading(false);
    });
    return () => unsub();
  }, [guest]);

  // Subscribe to live guest doc to reflect reservedGifts in real time
  useEffect(() => {
    if (!guest?.phone) return;
    const unsub = subscribeToGuest(guest.phone, (next) => {
      if (next) setGuest(next);
    });
    return () => unsub();
  }, [guest?.phone]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');
    try {
      const found = await findGuestByPhone(phoneInput);
      if (!found) {
        setLoginError(
          'No encontramos tu número en la lista de invitados. Verifica que esté correcto o contáctanos.'
        );
        return;
      }
      setGuest(found);
      setPendingRsvp(found.rsvp);
      setPendingAdults(found.adultsCount && found.adultsCount > 0 ? found.adultsCount : 1);
      setPendingChildren(found.childrenCount ?? 0);
      setHasConfirmedThisSession(false);
    } catch (e) {
      setLoginError(
        e instanceof Error ? e.message : 'No pudimos conectar. Intenta de nuevo en un momento.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmRSVP = async () => {
    if (!guest || !pendingRsvp) return;
    setIsSubmittingRsvp(true);
    try {
      await setGuestRSVP(guest.phone, pendingRsvp, pendingAdults, pendingChildren);
      setGuest({
        ...guest,
        rsvp: pendingRsvp,
        adultsCount: pendingRsvp === 'yes' ? pendingAdults : 0,
        childrenCount: pendingRsvp === 'yes' ? pendingChildren : 0,
      });
      setHasConfirmedThisSession(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingRsvp(false);
    }
  };

  const handleReserve = async (giftId: string) => {
    if (!guest) return;
    await reserveGift(giftId, guest.phone);
  };

  const handleRelease = async (giftId: string) => {
    if (!guest) return;
    await releaseGift(giftId, guest.phone);
  };

  const groupedGifts = useMemo(() => {
    const groups = new Map<string, Gift[]>();
    for (const g of gifts) {
      if (!groups.has(g.category)) groups.set(g.category, []);
      groups.get(g.category)!.push(g);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [gifts]);

  const reservedIds = new Set(guest?.reservedGifts ?? []);
  const hasPreviousResponse = guest?.rsvp != null;

  return (
    <div className="min-h-screen relative selection:bg-rose-soft/40">
      <FloatingShapes />

      <div className="relative z-10 container mx-auto px-4 py-10 sm:py-16 flex flex-col items-center">
        {!guest ? (
          <LoginCard
            phoneInput={phoneInput}
            setPhoneInput={setPhoneInput}
            onSubmit={handleLogin}
            error={loginError}
            isLoading={isLoading}
          />
        ) : !hasConfirmedThisSession ? (
          <div className="animate-in fade-in zoom-in duration-700 w-full max-w-2xl">
            <HeroIntro guestName={`${guest.firstName} ${guest.lastName}`} />
            <RSVPSection
              status={pendingRsvp}
              onSelect={setPendingRsvp}
              adultsCount={pendingAdults}
              onAdultsChange={setPendingAdults}
              childrenCount={pendingChildren}
              onChildrenChange={setPendingChildren}
              onSubmit={handleConfirmRSVP}
              isSubmitting={isSubmittingRsvp}
              hasPreviousResponse={hasPreviousResponse}
            />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-top-4 duration-700 w-full max-w-6xl">
            <HeroBanner guest={guest} />

            {guest.rsvp === 'no' ? (
              <div className="max-w-xl mx-auto text-center bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-10 card-shadow border border-cream-deep mb-16">
                <p className="font-cursive text-3xl text-ink mb-4">¡Te extrañaremos!</p>
                <p className="text-ink-soft">
                  Gracias por avisarnos. Si cambias de planes, escríbenos y actualizamos tu confirmación.
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mb-10">
                  <h2 className="text-4xl sm:text-5xl font-cursive text-ink mb-3">Lista de regalos</h2>
                  <p className="max-w-2xl mx-auto text-ink-soft text-sm sm:text-base font-light">
                    Si deseas hacernos un detalle, aquí está nuestra selección. Las cantidades se
                    actualizan en tiempo real cuando alguien aparta un regalo.
                  </p>
                  <a
                    href={EVENT.bebemundoRegistryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-6 px-6 py-3 rounded-full bg-ink text-cream font-bold uppercase tracking-widest text-xs hover:bg-ink/90 transition-colors"
                  >
                    Ver lista Bebemundo completa →
                  </a>
                </div>

                {giftsLoading ? (
                  <p className="text-center text-ink-soft py-20">Cargando regalos...</p>
                ) : (
                  <div className="space-y-6 max-w-3xl mx-auto">
                    {groupedGifts.map(([category, items]) => (
                      <section key={category}>
                        <div className="flex items-center gap-3 mb-2 px-1">
                          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink-soft">
                            {category}
                          </span>
                          <div className="h-px flex-1 bg-cream-deep" />
                          <span className="text-[10px] text-ink-soft/50">
                            {items.filter(g => g.availableQuantity > 0).length}/{items.length}
                          </span>
                        </div>
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-cream-deep overflow-hidden card-shadow divide-y divide-cream-deep/70">
                          {items.map((gift) => (
                            <GiftListItem
                              key={gift.id}
                              gift={gift}
                              alreadyReserved={reservedIds.has(gift.id)}
                              onReserve={handleReserve}
                              onRelease={handleRelease}
                            />
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                )}
              </>
            )}

            <footer className="mt-16 text-center pb-20">
              <p className="font-cursive text-3xl text-ink mb-3">¡Gracias por estar con nosotros!</p>
              <div className="flex justify-center gap-3 opacity-60 mb-8">
                <div className="w-2 h-2 rounded-full bg-rose" />
                <div className="w-2 h-2 rounded-full bg-gold" />
                <div className="w-2 h-2 rounded-full bg-sage" />
              </div>
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() => setHasConfirmedThisSession(false)}
                  className="text-ink-soft hover:text-ink text-xs transition-colors uppercase tracking-widest"
                >
                  Modificar respuesta
                </button>
                <span className="text-ink-soft/40">·</span>
                <button
                  onClick={() => {
                    setGuest(null);
                    setPhoneInput('');
                    setPendingRsvp(null);
                    setPendingAdults(1);
                    setPendingChildren(0);
                    setHasConfirmedThisSession(false);
                  }}
                  className="text-ink-soft hover:text-ink text-xs transition-colors uppercase tracking-widest"
                >
                  Cerrar sesión
                </button>
              </div>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
}

function LoginCard({
  phoneInput,
  setPhoneInput,
  onSubmit,
  error,
  isLoading,
}: {
  phoneInput: string;
  setPhoneInput: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string;
  isLoading: boolean;
}) {
  return (
    <div className="max-w-md w-full mt-6 sm:mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex justify-center mb-2">
        <div className="w-44 sm:w-56 animate-float">
          <Image src="/images/bunny-eggs.png" alt="Conejito" width={400} height={400} priority />
        </div>
      </div>

      <div className="text-center mb-6">
        <p className="text-ink-soft tracking-[0.3em] uppercase text-[10px] font-bold mb-1">Baby Shower</p>
        <h1 className="text-6xl sm:text-7xl font-cursive text-ink leading-none">{EVENT.babyName}</h1>
        <p className="text-ink-soft mt-3 italic text-sm">
          Te invitamos a celebrar la llegada de nuestra dulzura.
        </p>
        <a
          href={EVENT.location.addressLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink-soft text-xs mt-2 tracking-widest uppercase"
        >
          {EVENT.date} · {EVENT.location.name}
        </a>
      </div>

      <form
        onSubmit={onSubmit}
        className="bg-white/90 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] card-shadow-lg border border-cream-deep"
      >
        <label className="block text-ink-soft font-bold mb-3 text-[10px] uppercase tracking-[0.3em]">
          Número de teléfono
        </label>
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          value={phoneInput}
          onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 15))}
          placeholder="Ej. 8095551234"
          className="w-full px-6 py-4 rounded-full border-2 border-cream-deep focus:border-rose focus:outline-none transition-all text-center text-lg tracking-widest text-ink placeholder:text-ink-soft/40 bg-white"
          required
        />
        <p className="text-[11px] text-ink-soft mt-3 text-center">
          Solo dígitos. Puedes copiar y pegar — limpiamos cualquier formato automáticamente.
        </p>

        {error && (
          <p className="text-rose-deep text-sm text-center mt-5 font-medium bg-rose/10 py-3 px-4 rounded-2xl border border-rose/20">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading || !phoneInput || normalizePhone(phoneInput).length < 7}
          className="w-full mt-6 bg-rose hover:bg-rose-deep text-white font-bold py-4 rounded-full transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-[0.3em]"
        >
          {isLoading ? 'Entrando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}

function HeroIntro({ guestName }: { guestName: string }) {
  return (
    <div className="text-center mb-10">
      <div className="flex justify-center mb-2">
        <div className="w-32 sm:w-40 animate-float">
          <Image src="/images/bunny-flowers.png" alt="" width={300} height={300} />
        </div>
      </div>
      <p className="text-ink-soft uppercase tracking-[0.3em] text-[10px] mb-3 font-bold">
        Para nuestro invitado especial
      </p>
      <h1 className="text-4xl sm:text-5xl font-cursive text-ink mb-2">{guestName}</h1>
      <div className="w-20 h-px bg-gold/60 mx-auto mt-4" />
    </div>
  );
}

function HeroBanner({ guest }: { guest: Guest }) {
  return (
    <header className="text-center mb-12 sm:mb-16">
      <div className="flex justify-center mb-2">
        <div className="w-32 sm:w-40">
          <Image src="/images/bunny-eggs.png" alt="" width={300} height={300} priority />
        </div>
      </div>
      <p className="text-ink-soft tracking-[0.3em] uppercase text-[10px] font-bold mb-1">
        Baby Shower
      </p>
      <h1 className="text-6xl sm:text-7xl font-cursive text-ink leading-none mb-3">{EVENT.babyName}</h1>
      <p className="text-ink-soft text-xs tracking-widest uppercase">
        {EVENT.date} · {EVENT.location.name}
      </p>
      <button className="mt-4 px-6 py-3 rounded-full bg-ink text-cream font-bold uppercase tracking-widest text-xs hover:bg-ink/90 transition-colors">
    <a
        href={EVENT.location.addressLink}
        target="_blank"
        rel="noopener noreferrer"
        className="text-white text-xs mt-2 tracking-widest uppercase"
      >
        Ver en el mapa  
      </a>
      </button>
      
      <p className="mt-6 text-ink-soft text-sm sm:text-base">
        Gracias por confirmar, <strong className="text-ink">{guest.firstName}</strong>. 🌸
      </p>
    </header>
  );
}
