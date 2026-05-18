export type RSVPStatus = 'yes' | 'no' | null;

export interface Guest {
  phone: string;
  firstName: string;
  lastName: string;
  rsvp: RSVPStatus;
  reservedGifts: string[];
  updatedAt?: number;
}

export type GiftStore = 'amazon' | 'bebemundo' | 'other';

export interface Gift {
  id: string;
  name: string;
  description?: string;
  link: string;
  imageUrl: string;
  category: string;
  store: GiftStore;
  totalQuantity: number;
  availableQuantity: number;
  size?: string;
}

export interface GiftReservation {
  giftId: string;
  guestPhone: string;
  guestName: string;
  reservedAt: number;
}
