import { Gift } from './types';

export const VALID_GUESTS: Record<string, string> = {
  'GUEST123': 'Familia Rodríguez',
  'BABY2025': 'Tía Martha',
  'LOVE001': 'Juan y Ana',
  'FRIEND99': 'Mejor Amigo',
  'INVITADO': 'Invitado Especial'
};

export const GIFT_LIST: Gift[] = [
  {
    id: '1',
    name: 'Cuna de Madera Nórdica',
    description: 'Hermosa cuna de pino macizo con tres niveles de altura para la máxima comodidad del bebé.',
    link: 'https://www.amazon.com/dp/B07N9KW4W4',
    imageUrl: 'https://images.unsplash.com/photo-1544122159-39c2121092f5?auto=format&fit=crop&q=80&w=400',
    category: 'Muebles'
  },
  {
    id: '2',
    name: 'Set de Biberones Natural',
    description: 'Kit de inicio natural para recién nacidos, libre de BPA con sistema anticólicos.',
    link: 'https://bebemundo.com.do/products/set-biberones-natural',
    imageUrl: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&q=80&w=400',
    category: 'Alimentación'
  },
  {
    id: '3',
    name: 'Silla para Carro Ultra-Safe',
    description: 'Seguridad máxima para los viajes del pequeño con sistema ISOFIX de última generación.',
    link: 'https://www.amazon.com/dp/B08H1RW8XY',
    imageUrl: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=400',
    category: 'Viaje'
  },
  {
    id: '4',
    name: 'Monitor de Bebé HD Video',
    description: 'Cámara HD con visión nocturna, audio bidireccional y sensor de temperatura ambiente.',
    link: 'https://bebemundo.com.do/products/monitor-video',
    imageUrl: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&q=80&w=400',
    category: 'Tecnología'
  },
  {
    id: '5',
    name: 'Ropa Orgánica Set Especial',
    description: 'Algodón 100% orgánico certificado para la delicada piel del recién nacido.',
    link: 'https://www.amazon.com/dp/B0855G6B58',
    imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=400',
    category: 'Ropa'
  },
  {
    id: '6',
    name: 'Bañera Plegable Ergonómica',
    description: 'Compacta y segura, con termómetro integrado e indicador de nivel de agua.',
    link: 'https://bebemundo.com.do/products/banera-plegable',
    imageUrl: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?auto=format&fit=crop&q=80&w=400',
    category: 'Higiene'
  }
];
