'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Gift, GiftStore } from '@/lib/types';
import { AdminModal } from '@/components/AdminModal';

export default function AdminGiftsPage() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStore, setFilterStore] = useState<'all' | GiftStore>('all');
  const [editing, setEditing] = useState<Gift | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db(), 'gifts'),
        (snap) => {
          const list = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Gift, 'id'>),
          })) as Gift[];
          list.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
          setGifts(list);
          setLoading(false);
        },
        (e) => {
          setError(e.message);
          setLoading(false);
        }
      );
      return () => unsub();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al conectar.');
      setLoading(false);
    }
  }, []);

  const filtered = useMemo(() => {
    return gifts.filter((g) => {
      if (filterStore !== 'all' && g.store !== filterStore) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        g.name.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q) ||
        g.id.toLowerCase().includes(q)
      );
    });
  }, [gifts, search, filterStore]);

  const stats = useMemo(() => {
    const totalUnits = gifts.reduce((sum, g) => sum + g.totalQuantity, 0);
    const reservedUnits = gifts.reduce((sum, g) => sum + (g.totalQuantity - g.availableQuantity), 0);
    const categories = new Set(gifts.map((g) => g.category)).size;
    return {
      total: gifts.length,
      totalUnits,
      reservedUnits,
      categories,
    };
  }, [gifts]);

  const handleDelete = async (g: Gift) => {
    if (!confirm(`¿Eliminar "${g.name}"?`)) return;
    try {
      await deleteDoc(doc(db(), 'gifts', g.id));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'No se pudo eliminar.');
    }
  };

  const categoriesList = useMemo(
    () => Array.from(new Set(gifts.map((g) => g.category))).sort(),
    [gifts]
  );

  return (
    <div className="min-h-screen px-4 py-10 sm:py-16">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 text-center">
          <p className="text-ink-soft tracking-[0.3em] uppercase text-[10px] font-bold mb-1">
            Panel privado
          </p>
          <h1 className="font-cursive text-5xl text-ink">Regalos de Olivia</h1>
          <div className="w-20 h-px bg-gold/60 mx-auto mt-4" />
          <p className="text-ink-soft text-xs mt-4">
            <a href="/lista-invitados" className="underline hover:text-ink transition-colors">
              ← Ver lista de invitados
            </a>
          </p>
        </header>

        {error && (
          <div className="bg-rose/10 border border-rose/30 text-rose-deep p-4 rounded-2xl mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard label="Regalos" value={stats.total} tone="ink" />
          <StatCard label="Unidades totales" value={stats.totalUnits} tone="sage" />
          <StatCard label="Apartadas" value={stats.reservedUnits} tone="rose" />
          <StatCard label="Categorías" value={stats.categories} tone="gold" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, categoría o ID..."
            className="flex-1 px-5 py-3 rounded-full border-2 border-cream-deep focus:border-rose focus:outline-none text-sm text-ink placeholder:text-ink-soft/50 bg-white"
          />
          <select
            value={filterStore}
            onChange={(e) => setFilterStore(e.target.value as 'all' | GiftStore)}
            className="px-5 py-3 rounded-full border-2 border-cream-deep focus:border-rose focus:outline-none text-sm text-ink bg-white"
          >
            <option value="all">Todas las tiendas</option>
            <option value="amazon">Amazon</option>
            <option value="bebemundo">Bebemundo</option>
            <option value="other">Otra</option>
          </select>
          <button
            onClick={() => setAddOpen(true)}
            className="px-6 py-3 rounded-full bg-rose hover:bg-rose-deep text-white font-bold uppercase tracking-widest text-xs whitespace-nowrap transition-colors"
          >
            + Agregar regalo
          </button>
        </div>

        <div className="bg-white rounded-3xl card-shadow border border-cream-deep overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream-deep/30 text-ink-soft uppercase text-[10px] tracking-widest">
                  <th className="px-3 py-3 text-left font-bold w-16">Img</th>
                  <th className="px-3 py-3 text-left font-bold">Nombre</th>
                  <th className="px-3 py-3 text-left font-bold">Categoría</th>
                  <th className="px-3 py-3 text-left font-bold">Tienda</th>
                  <th className="px-3 py-3 text-center font-bold">Total</th>
                  <th className="px-3 py-3 text-center font-bold">Disponible</th>
                  <th className="px-3 py-3 text-right font-bold w-24"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-ink-soft">
                      Cargando regalos...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-ink-soft">
                      {gifts.length === 0
                        ? 'Sin regalos. Usa "Agregar regalo" o corre `pnpm seed -- --gifts`.'
                        : 'Sin resultados.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((g) => (
                    <tr key={g.id} className="border-t border-cream-deep/60 hover:bg-cream/30 group">
                      <td className="px-3 py-2">
                        {g.imageUrl ? (
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-cream-deep/40 relative">
                            <Image
                              src={g.imageUrl}
                              alt=""
                              fill
                              unoptimized
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-cream-deep/40 flex items-center justify-center text-ink-soft/40 text-xs">
                            —
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 text-ink">
                        <p className="font-medium">{g.name}</p>
                        <p className="text-[10px] text-ink-soft/60 font-mono">{g.id}</p>
                      </td>
                      <td className="px-3 py-3 text-ink-soft text-xs">{g.category}</td>
                      <td className="px-3 py-3">
                        <span className="px-2 py-1 bg-ink/10 text-ink rounded-full text-[10px] uppercase tracking-wider font-bold">
                          {g.store}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center text-ink font-medium">
                        {g.totalQuantity}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                            g.availableQuantity <= 0
                              ? 'bg-rose/15 text-rose-deep'
                              : 'bg-sage/20 text-sage-deep'
                          }`}
                        >
                          {g.availableQuantity}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => setEditing(g)}
                          className="text-ink-soft hover:text-ink text-xs px-2 py-1"
                          title="Editar"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => handleDelete(g)}
                          className="text-rose-deep hover:bg-rose/10 w-8 h-8 rounded-full text-sm"
                          title="Eliminar"
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

      <AdminModal open={addOpen} title="Agregar regalo" onClose={() => setAddOpen(false)}>
        <GiftForm
          existingCategories={categoriesList}
          onClose={() => setAddOpen(false)}
        />
      </AdminModal>

      <AdminModal
        open={editing !== null}
        title="Editar regalo"
        onClose={() => setEditing(null)}
      >
        {editing && (
          <GiftForm
            existingCategories={categoriesList}
            initial={editing}
            onClose={() => setEditing(null)}
          />
        )}
      </AdminModal>
    </div>
  );
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

function GiftForm({
  initial,
  existingCategories,
  onClose,
}: {
  initial?: Gift;
  existingCategories: string[];
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [link, setLink] = useState(initial?.link ?? '');
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [store, setStore] = useState<GiftStore>(initial?.store ?? 'bebemundo');
  const [totalQuantity, setTotalQuantity] = useState(initial?.totalQuantity ?? 1);
  const [size, setSize] = useState(initial?.size ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(initial);
  const datalistId = 'gift-categories';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (!name.trim() || !link.trim() || !category.trim()) {
        throw new Error('Nombre, link y categoría son obligatorios.');
      }
      if (totalQuantity < 1) throw new Error('La cantidad debe ser al menos 1.');

      const id = isEdit && initial ? initial.id : `${slugify(name)}-${Date.now().toString(36)}`;
      const reserved = isEdit && initial ? initial.totalQuantity - initial.availableQuantity : 0;
      const newAvailable = Math.max(0, totalQuantity - reserved);

      const payload: Omit<Gift, 'id'> = {
        name: name.trim(),
        description: description.trim() || undefined,
        link: link.trim(),
        imageUrl: imageUrl.trim(),
        category: category.trim(),
        store,
        totalQuantity,
        availableQuantity: newAvailable,
        ...(size.trim() ? { size: size.trim() } : {}),
      };
      // Strip undefined values (Firestore rejects them)
      const data = Object.fromEntries(
        Object.entries(payload).filter(([, v]) => v !== undefined)
      );

      await setDoc(doc(db(), 'gifts', id), data);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <datalist id={datalistId}>
        {existingCategories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      <Field label="Nombre">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2.5 rounded-2xl border-2 border-cream-deep focus:border-rose focus:outline-none text-ink"
          required
        />
      </Field>

      <Field label="Descripción (opcional)">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-4 py-2.5 rounded-2xl border-2 border-cream-deep focus:border-rose focus:outline-none text-ink resize-none"
        />
      </Field>

      <Field label="Link de la tienda">
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://..."
          className="w-full px-4 py-2.5 rounded-2xl border-2 border-cream-deep focus:border-rose focus:outline-none text-ink"
          required
        />
      </Field>

      <Field label="URL de imagen (opcional)">
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
          className="w-full px-4 py-2.5 rounded-2xl border-2 border-cream-deep focus:border-rose focus:outline-none text-ink"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Categoría">
          <input
            type="text"
            list={datalistId}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Ropa, Baño..."
            className="w-full px-4 py-2.5 rounded-2xl border-2 border-cream-deep focus:border-rose focus:outline-none text-ink"
            required
          />
        </Field>
        <Field label="Tienda">
          <select
            value={store}
            onChange={(e) => setStore(e.target.value as GiftStore)}
            className="w-full px-4 py-2.5 rounded-2xl border-2 border-cream-deep focus:border-rose focus:outline-none text-ink bg-white"
          >
            <option value="bebemundo">Bebemundo</option>
            <option value="amazon">Amazon</option>
            <option value="other">Otra</option>
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Cantidad total">
          <input
            type="number"
            min={1}
            value={totalQuantity}
            onChange={(e) => setTotalQuantity(parseInt(e.target.value) || 1)}
            className="w-full px-4 py-2.5 rounded-2xl border-2 border-cream-deep focus:border-rose focus:outline-none text-ink"
            required
          />
        </Field>
        <Field label="Talla (opcional)">
          <input
            type="text"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="3 a 6 meses"
            className="w-full px-4 py-2.5 rounded-2xl border-2 border-cream-deep focus:border-rose focus:outline-none text-ink"
          />
        </Field>
      </div>

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
          {submitting ? 'Guardando...' : isEdit ? 'Actualizar' : 'Agregar'}
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
}: {
  label: string;
  value: number;
  tone: 'sage' | 'rose' | 'gold' | 'ink';
}) {
  const toneClasses: Record<typeof tone, string> = {
    sage: 'bg-sage/20 text-sage-deep border-sage/30',
    rose: 'bg-rose/15 text-rose-deep border-rose/30',
    gold: 'bg-gold/15 text-gold border-gold/30',
    ink: 'bg-white text-ink border-cream-deep',
  };
  return (
    <div className={`rounded-2xl border px-4 py-3 ${toneClasses[tone]} card-shadow`}>
      <p className="text-[10px] uppercase tracking-widest font-bold opacity-70">{label}</p>
      <p className="font-bold text-3xl mt-1">{value}</p>
    </div>
  );
}
