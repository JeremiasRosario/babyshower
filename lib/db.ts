import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  runTransaction,
  setDoc,
  updateDoc,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { Gift, Guest, RSVPStatus } from './types';

export function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, '');
}

export async function findGuestByPhone(rawPhone: string): Promise<Guest | null> {
  const phone = normalizePhone(rawPhone);
  if (!phone) return null;
  const snap = await getDoc(doc(db(), 'guests', phone));
  if (!snap.exists()) return null;
  return { phone, ...(snap.data() as Omit<Guest, 'phone'>) };
}

export async function setGuestRSVP(phone: string, rsvp: RSVPStatus): Promise<void> {
  await updateDoc(doc(db(), 'guests', normalizePhone(phone)), {
    rsvp,
    updatedAt: Date.now(),
  });
}

export function subscribeToGifts(callback: (gifts: Gift[]) => void): Unsubscribe {
  return onSnapshot(collection(db(), 'gifts'), (snap) => {
    const gifts = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Gift, 'id'>) }));
    callback(gifts);
  });
}

export function subscribeToGuest(phone: string, callback: (guest: Guest | null) => void): Unsubscribe {
  const normalized = normalizePhone(phone);
  return onSnapshot(doc(db(), 'guests', normalized), (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    callback({ phone: normalized, ...(snap.data() as Omit<Guest, 'phone'>) });
  });
}

/**
 * Atomically reserve a gift: decrements availableQuantity and adds the giftId
 * to the guest's reservedGifts array. Fails if no quantity remains.
 */
export async function reserveGift(giftId: string, guestPhone: string): Promise<void> {
  const phone = normalizePhone(guestPhone);
  await runTransaction(db(), async (tx) => {
    const giftRef = doc(db(), 'gifts', giftId);
    const guestRef = doc(db(), 'guests', phone);

    const [giftSnap, guestSnap] = await Promise.all([tx.get(giftRef), tx.get(guestRef)]);
    if (!giftSnap.exists()) throw new Error('Regalo no encontrado.');
    if (!guestSnap.exists()) throw new Error('Invitado no encontrado.');

    const gift = giftSnap.data() as Omit<Gift, 'id'>;
    const guest = guestSnap.data() as Omit<Guest, 'phone'>;

    if (gift.availableQuantity <= 0) {
      throw new Error('Este regalo ya no tiene unidades disponibles.');
    }
    if (guest.reservedGifts?.includes(giftId)) {
      throw new Error('Ya tienes este regalo apartado.');
    }

    tx.update(giftRef, { availableQuantity: gift.availableQuantity - 1 });
    tx.update(guestRef, {
      reservedGifts: [...(guest.reservedGifts ?? []), giftId],
      updatedAt: Date.now(),
    });
  });
}

/**
 * Release a previously-reserved gift: increments availableQuantity and removes
 * the giftId from the guest's reservedGifts.
 */
export async function releaseGift(giftId: string, guestPhone: string): Promise<void> {
  const phone = normalizePhone(guestPhone);
  await runTransaction(db(), async (tx) => {
    const giftRef = doc(db(), 'gifts', giftId);
    const guestRef = doc(db(), 'guests', phone);

    const [giftSnap, guestSnap] = await Promise.all([tx.get(giftRef), tx.get(guestRef)]);
    if (!giftSnap.exists() || !guestSnap.exists()) return;

    const gift = giftSnap.data() as Omit<Gift, 'id'>;
    const guest = guestSnap.data() as Omit<Guest, 'phone'>;

    if (!guest.reservedGifts?.includes(giftId)) return;

    tx.update(giftRef, {
      availableQuantity: Math.min(gift.totalQuantity, gift.availableQuantity + 1),
    });
    tx.update(guestRef, {
      reservedGifts: (guest.reservedGifts ?? []).filter((id) => id !== giftId),
      updatedAt: Date.now(),
    });
  });
}

// --- Seeding helpers (used by scripts/seed.ts) -----------------------------
export async function seedGifts(gifts: Gift[]): Promise<void> {
  for (const gift of gifts) {
    const { id, ...data } = gift;
    await setDoc(doc(db(), 'gifts', id), data);
  }
}

export async function seedGuests(guests: Guest[]): Promise<void> {
  for (const g of guests) {
    const phone = normalizePhone(g.phone);
    await setDoc(doc(db(), 'guests', phone), {
      firstName: g.firstName,
      lastName: g.lastName,
      rsvp: g.rsvp ?? null,
      reservedGifts: g.reservedGifts ?? [],
      updatedAt: Date.now(),
    });
  }
}

export async function listAllGifts(): Promise<Gift[]> {
  const snap = await getDocs(collection(db(), 'gifts'));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Gift, 'id'>) }));
}
