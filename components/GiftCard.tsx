'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Gift } from '@/lib/types';

interface GiftCardProps {
  gift: Gift;
  alreadyReserved: boolean;
  onReserve: (giftId: string) => Promise<void>;
  onRelease: (giftId: string) => Promise<void>;
}

export const GiftCard: React.FC<GiftCardProps> = ({ gift, alreadyReserved, onReserve, onRelease }) => {
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const soldOut = gift.availableQuantity <= 0 && !alreadyReserved;

  const handleClick = async () => {
    setIsWorking(true);
    setError(null);
    try {
      if (alreadyReserved) {
        await onRelease(gift.id);
      } else {
        await onReserve(gift.id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo completar la acción.');
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <div className="card-shadow bg-white rounded-3xl overflow-hidden border border-cream-deep flex flex-col transition-all hover:-translate-y-1 hover:card-shadow-lg">
      <div className="relative aspect-square bg-cream-deep/30">
        <Image
          src={gift.imageUrl}
          alt={gift.name}
          fill
          unoptimized
          className="object-contain p-4"
        />
        <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 text-ink-soft text-[10px] font-bold rounded-full uppercase tracking-widest">
          {gift.category}
        </span>
        <span
          className={`absolute top-3 right-3 px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-widest ${
            soldOut
              ? 'bg-ink-soft/20 text-ink-soft'
              : 'bg-sage/30 text-sage-deep'
          }`}
        >
          {soldOut
            ? 'No disponible'
            : `${gift.availableQuantity} disponible${gift.availableQuantity === 1 ? '' : 's'}`}
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-cursive text-2xl text-ink leading-tight mb-1">{gift.name}</h3>
        {gift.size && (
          <p className="text-xs text-ink-soft mb-1">
            <span className="font-bold uppercase tracking-wider">Talla:</span> {gift.size}
          </p>
        )}
        {gift.description && (
          <p className="text-sm text-ink-soft font-light mb-4 leading-relaxed">{gift.description}</p>
        )}

        <div className="mt-auto flex flex-col gap-2">
          <a
            href={gift.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-center py-3 rounded-full text-xs font-bold uppercase tracking-widest border-2 border-rose text-rose-deep bg-white hover:bg-rose/10 transition-colors"
          >
            Ver Tienda
          </a>
          <button
            onClick={handleClick}
            disabled={isWorking || (soldOut && !alreadyReserved)}
            className={`py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              alreadyReserved
                ? 'bg-sage-deep text-white hover:bg-sage-deep/90'
                : 'bg-rose-soft text-white hover:bg-rose'
            }`}
          >
            {isWorking
              ? 'Procesando...'
              : alreadyReserved
              ? 'Apartado · Liberar'
              : soldOut
              ? 'No disponible'
              : 'Apartar'}
          </button>
          {error && (
            <p className="text-xs text-rose-deep text-center mt-1 font-medium">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
};
