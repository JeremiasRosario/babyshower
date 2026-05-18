/**
 * Seed script — pobla las colecciones `gifts` y `guests` en Firestore.
 *
 * Uso:
 *   1) Asegúrate de tener .env.local configurado con NEXT_PUBLIC_FIREBASE_*.
 *   2) Crea scripts/guests.json a partir de scripts/guests.example.json con
 *      los teléfonos, nombres y apellidos reales de tus invitados.
 *   3) Ejecuta:
 *        pnpm seed              # carga regalos + invitados (si guests.json existe)
 *        pnpm seed -- --gifts   # solo regalos
 *        pnpm seed -- --guests  # solo invitados
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from 'dotenv';

config({ path: resolve(process.cwd(), '.env.local') });

import { INITIAL_GIFTS } from '../lib/constants';
import { seedGifts, seedGuests, normalizePhone } from '../lib/db';
import type { Guest } from '../lib/types';

const flags = process.argv.slice(2);
const onlyGifts = flags.includes('--gifts');
const onlyGuests = flags.includes('--guests');
const doGifts = !onlyGuests;
const doGuests = !onlyGifts;

async function main() {
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    console.error('❌ Falta NEXT_PUBLIC_FIREBASE_PROJECT_ID. Configura .env.local primero.');
    process.exit(1);
  }

  if (doGifts) {
    console.log(`📦 Sembrando ${INITIAL_GIFTS.length} regalos...`);
    await seedGifts(INITIAL_GIFTS);
    console.log('✅ Regalos cargados.');
  }

  if (doGuests) {
    const guestsPath = resolve(process.cwd(), 'scripts/guests.json');
    if (!existsSync(guestsPath)) {
      console.log('⚠️  scripts/guests.json no existe — saltando invitados.');
      console.log('    Copia scripts/guests.example.json a scripts/guests.json y edítalo.');
    } else {
      const raw = JSON.parse(readFileSync(guestsPath, 'utf-8')) as Array<{
        phone: string;
        firstName: string;
        lastName: string;
      }>;
      const guests: Guest[] = raw.map((g) => ({
        phone: normalizePhone(g.phone),
        firstName: g.firstName,
        lastName: g.lastName,
        rsvp: null,
        reservedGifts: [],
      }));
      console.log(`👥 Sembrando ${guests.length} invitados...`);
      await seedGuests(guests);
      console.log('✅ Invitados cargados.');
    }
  }

  console.log('🎉 Listo.');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
