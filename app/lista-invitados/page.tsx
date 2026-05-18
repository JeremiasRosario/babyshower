'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Gift, Guest } from '@/lib/types';
import { normalizePhone } from '@/lib/db';
import { AdminModal } from '@/components/AdminModal';

export default function AdminGuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [giftNames, setGiftNames] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    let unsubGuests: (() => void) | null = null;
    let unsubGifts: (() => void) | null = null;
    try {
      unsubGifts = onSnapshot(collection(db(), 'gifts'), (snap) => {
        const map = new Map<string, string>();
        snap.docs.forEach((d) => {
          const data = d.data() as Omit<Gift, 'id'>;
          map.set(d.id, data.name);
        });
        setGiftNames(map);
      });
      unsubGuests = onSnapshot(
        collection(db(), 'guests'),
        (snap) => {
          const list = snap.docs.map((d) => ({
            phone: d.id,
            ...(d.data() as Omit<Guest, 'phone'>),
          })) as Guest[];
          list.sort((a, b) =>
            `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
          );
          setGuests(list);
          setLoading(false);
        },
        (e) => {
          setError(e.message);
          setLoading(false);
        }
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al conectar con Firestore.');
      setLoading(false);
    }
    return () => {
      unsubGuests?.();
      unsubGifts?.();
    };
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return guests;
    const q = search.toLowerCase();
    return guests.filter(
      (g) =>
        `${g.firstName} ${g.lastName}`.toLowerCase().includes(q) ||
        g.phone.includes(q.replace(/\D/g, ''))
    );
  }, [guests, search]);

  const stats = useMemo(() => {
    let confirmed = 0;
    let declined = 0;
    let pending = 0;
    let totalAdults = 0;
    let totalChildren = 0;
    let totalReserved = 0;
    for (const g of guests) {
      if (g.rsvp === 'yes') {
        confirmed += 1;
        totalAdults += g.adultsCount ?? 0;
        totalChildren += g.childrenCount ?? 0;
      } else if (g.rsvp === 'no') {
        declined += 1;
      } else {
        pending += 1;
      }
      totalReserved += g.reservedGifts?.length ?? 0;
    }
    return {
      total: guests.length,
      confirmed,
      declined,
      pending,
      totalAdults,
      totalChildren,
      totalReserved,
    };
  }, [guests]);

  const handleDelete = async (g: Guest) => {
    if (!confirm(`¿Eliminar a ${g.firstName} ${g.lastName} de la lista?`)) return;
    try {
      await deleteDoc(doc(db(), 'guests', g.phone));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'No se pudo eliminar.');
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 sm:py-16">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 text-center">
          <p className="text-ink-soft tracking-[0.3em] uppercase text-[10px] font-bold mb-1">
            Panel privado
          </p>
          <h1 className="font-cursive text-5xl text-ink">Invitados de Olivia</h1>
          <div className="w-20 h-px bg-gold/60 mx-auto mt-4" />
          <p className="text-ink-soft text-xs mt-4">
            <a href="/lista-regalos" className="underline hover:text-ink transition-colors">
              Ver lista de regalos →
            </a>
          </p>
        </header>

        {error && (
          <div className="bg-rose/10 border border-rose/30 text-rose-deep p-4 rounded-2xl mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="Confirmados" value={stats.confirmed} tone="sage" />
          <StatCard label="No asisten" value={stats.declined} tone="rose" />
          <StatCard label="Sin responder" value={stats.pending} tone="gold" />
          <StatCard label="Total invitados" value={stats.total} tone="ink" />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <StatCard label="Adultos" value={stats.totalAdults} tone="ink" small />
          <StatCard label="Niños" value={stats.totalChildren} tone="ink" small />
          <StatCard label="Regalos apartados" value={stats.totalReserved} tone="ink" small />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o teléfono..."
            className="flex-1 px-5 py-3 rounded-full border-2 border-cream-deep focus:border-rose focus:outline-none transition-all text-sm text-ink placeholder:text-ink-soft/50 bg-white"
          />
          <button
            onClick={() => setAddOpen(true)}
            className="px-6 py-3 rounded-full bg-rose hover:bg-rose-deep text-white font-bold uppercase tracking-widest text-xs transition-colors whitespace-nowrap"
          >
            + Agregar invitado
          </button>
        </div>

        <div className="bg-white rounded-3xl card-shadow border border-cream-deep overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream-deep/30 text-ink-soft uppercase text-[10px] tracking-widest">
                  <th className="px-4 py-3 text-left font-bold">Invitado</th>
                  <th className="px-4 py-3 text-left font-bold">Teléfono</th>
                  <th className="px-4 py-3 text-left font-bold">Estado</th>
                  <th className="px-4 py-3 text-center font-bold">Adultos</th>
                  <th className="px-4 py-3 text-center font-bold">Niños</th>
                  <th className="px-4 py-3 text-left font-bold">Regalos apartados</th>
                  <th className="px-4 py-3 text-right font-bold w-12"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-ink-soft">
                      Cargando invitados...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-ink-soft">
                      {guests.length === 0
                        ? 'No hay invitados aún. Usa el botón "Agregar invitado" para comenzar.'
                        : 'Sin resultados para tu búsqueda.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((g) => (
                    <tr key={g.phone} className="border-t border-cream-deep/60 hover:bg-cream/30 group">
                      <td className="px-4 py-3 text-ink font-medium">
                        {g.firstName} {g.lastName}
                      </td>
                      <td className="px-4 py-3 text-ink-soft font-mono text-xs">{g.phone}</td>
                      <td className="px-4 py-3">
                        <RsvpBadge status={g.rsvp} />
                      </td>
                      <td className="px-4 py-3 text-center text-ink">
                        {g.rsvp === 'yes' ? (g.adultsCount ?? 0) : '—'}
                      </td>
                      <td className="px-4 py-3 text-center text-ink">
                        {g.rsvp === 'yes' ? (g.childrenCount ?? 0) : '—'}
                      </td>
                      <td className="px-4 py-3 text-ink-soft">
                        {g.reservedGifts && g.reservedGifts.length > 0 ? (
                          <ul className="space-y-1">
                            {g.reservedGifts.map((id) => (
                              <li key={id} className="text-xs">
                                · {giftNames.get(id) ?? id}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-ink-soft/50 text-xs italic">Ninguno</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(g)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-rose-deep hover:bg-rose/10 w-8 h-8 rounded-full text-sm"
                          aria-label="Eliminar"
                          title="Eliminar invitado"
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-center text-ink-soft/60 text-xs mt-6">
          Los datos se actualizan en tiempo real.
        </p>
      </div>

      <AdminModal open={addOpen} title="Agregar invitado" onClose={() => setAddOpen(false)}>
        <GuestForm onClose={() => setAddOpen(false)} />
      </AdminModal>
    </div>
  );
}

function GuestForm({ onClose }: { onClose: () => void }) {
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const normalized = normalizePhone(phone);
      if (normalized.length < 7) throw new Error('Teléfono inválido. Debe tener al menos 7 dígitos.');
      if (!firstName.trim() || !lastName.trim()) throw new Error('Nombre y apellido son obligatorios.');
      await setDoc(doc(db(), 'guests', normalized), {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        rsvp: null,
        adultsCount: 0,
        childrenCount: 0,
        reservedGifts: [],
        updatedAt: Date.now(),
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Teléfono">
        <input
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 15))}
          placeholder="8295551234"
          className="w-full px-4 py-3 rounded-2xl border-2 border-cream-deep focus:border-rose focus:outline-none text-ink"
          required
        />
      </Field>
      <Field label="Nombre">
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Ana"
          className="w-full px-4 py-3 rounded-2xl border-2 border-cream-deep focus:border-rose focus:outline-none text-ink"
          required
        />
      </Field>
      <Field label="Apellido">
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Rodríguez"
          className="w-full px-4 py-3 rounded-2xl border-2 border-cream-deep focus:border-rose focus:outline-none text-ink"
          required
        />
      </Field>

      {error && (
        <p className="bg-rose/10 border border-rose/30 text-rose-deep p-3 rounded-xl text-sm">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-3 rounded-full border-2 border-cream-deep text-ink-soft font-bold uppercase tracking-widest text-xs hover:bg-cream-deep transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 px-4 py-3 rounded-full bg-rose hover:bg-rose-deep text-white font-bold uppercase tracking-widest text-xs disabled:opacity-50 transition-colors"
        >
          {submitting ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-ink-soft text-[10px] uppercase tracking-[0.3em] font-bold mb-2">
        {label}
      </span>
      {children}
    </label>
  );
}

function StatCard({
  label,
  value,
  tone,
  small,
}: {
  label: string;
  value: number;
  tone: 'sage' | 'rose' | 'gold' | 'ink';
  small?: boolean;
}) {
  const toneClasses: Record<typeof tone, string> = {
    sage: 'bg-sage/20 text-sage-deep border-sage/30',
    rose: 'bg-rose/15 text-rose-deep border-rose/30',
    gold: 'bg-gold/15 text-gold border-gold/30',
    ink: 'bg-white text-ink border-cream-deep',
  };
  return (
    <div
      className={`rounded-2xl border px-4 py-3 ${toneClasses[tone]} ${small ? '' : 'card-shadow'}`}
    >
      <p className="text-[10px] uppercase tracking-widest font-bold opacity-70">{label}</p>
      <p className={`font-bold ${small ? 'text-2xl' : 'text-3xl'} mt-1`}>{value}</p>
    </div>
  );
}

function RsvpBadge({ status }: { status: Guest['rsvp'] }) {
  if (status === 'yes') {
    return (
      <span className="inline-block px-3 py-1 rounded-full bg-sage/30 text-sage-deep text-[10px] font-bold uppercase tracking-widest">
        ✓ Asistirá
      </span>
    );
  }
  if (status === 'no') {
    return (
      <span className="inline-block px-3 py-1 rounded-full bg-rose/20 text-rose-deep text-[10px] font-bold uppercase tracking-widest">
        ✗ No asistirá
      </span>
    );
  }
  return (
    <span className="inline-block px-3 py-1 rounded-full bg-cream-deep text-ink-soft text-[10px] font-bold uppercase tracking-widest">
      · Pendiente
    </span>
  );
}
