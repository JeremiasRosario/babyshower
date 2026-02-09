
export interface Guest {
  id: string;
  name: string;
  hasRsvp: boolean;
  isAttending?: boolean;
}

export interface Gift {
  id: string;
  name: string;
  description: string;
  link: string;
  imageUrl: string;
  category: string;
}

export type RSVPStatus = 'yes' | 'no' | null;
