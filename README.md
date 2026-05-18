# Baby Shower · Olivia

Invitación web con login por teléfono, RSVP y lista de regalos con reservas en tiempo real (Firebase Firestore).

## Configuración inicial

### 1. Crear proyecto Firebase

1. Entra a https://console.firebase.google.com/ y crea un proyecto nuevo (ej. `baby-shower-olivia`).
2. En el menú lateral abre **Build → Firestore Database** y pulsa **Create database**. Selecciona **Production mode** (lo abrimos con reglas más abajo) y elige la región más cercana (`us-east1` o similar).
3. En **Project Overview** pulsa el ícono `</>` para **Agregar app web**. Dale un nombre, NO actives Hosting todavía.
4. Copia los valores del objeto `firebaseConfig` que aparece.

### 2. Variables de entorno

Copia `.env.example` a `.env.local` y pega los valores que copiaste de Firebase:

```bash
cp .env.example .env.local
```

### 3. Reglas de Firestore

En la consola Firebase → Firestore → pestaña **Rules** pega esto:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Cualquiera puede leer regalos e invitados (para login + lista).
    match /gifts/{giftId} {
      allow read: if true;
      allow update: if request.resource.data.diff(resource.data).affectedKeys()
                       .hasOnly(['availableQuantity']);
    }
    match /guests/{phone} {
      allow read: if true;
      allow update: if request.resource.data.diff(resource.data).affectedKeys()
                       .hasOnly(['rsvp', 'reservedGifts', 'updatedAt']);
    }
  }
}
```

> Esto es suficiente para un baby shower con invitados de confianza. Para producción real conviene añadir App Check o autenticación.

### 4. Sembrar datos

Edita `scripts/guests.example.json` con la lista real de invitados (teléfono, nombre, apellido) y guárdalo como `scripts/guests.json`. Luego:

```bash
pnpm seed              # carga regalos + invitados
pnpm seed -- --gifts   # solo regalos
pnpm seed -- --guests  # solo invitados
```

El teléfono se normaliza a sólo dígitos, así que `(809) 555-1234` y `8095551234` son equivalentes.

### 5. Correr la app

```bash
pnpm dev
```

Abre http://localhost:3000.

## Estructura del proyecto

- `app/page.tsx` — flujo principal: login → RSVP → lista de regalos
- `components/GiftCard.tsx` — tarjeta de regalo con botón "Apartar"
- `components/RSVPSection.tsx` — sí/no
- `components/FloatingShapes.tsx` — decoración acuarela
- `lib/firebase.ts` — inicialización del SDK
- `lib/db.ts` — helpers: login, reservas atómicas, suscripciones en tiempo real
- `lib/constants.ts` — datos del evento + lista inicial de regalos
- `lib/types.ts` — interfaces Guest, Gift
- `scripts/seed.ts` — script de carga inicial
- `public/images/` — assets de la invitación (conejitos, flores, fondo)

## Cómo funciona el "Apartar"

Cada vez que un invitado pulsa **Apartar** se ejecuta una transacción Firestore que:

1. Lee el regalo y el invitado.
2. Verifica que `availableQuantity > 0` y que el invitado no lo tenga ya apartado.
3. Decrementa `availableQuantity` en 1 y añade el `giftId` a `guest.reservedGifts`.

Si dos personas tocan "Apartar" al mismo tiempo Firestore garantiza que solo una gane. La otra recibirá un error y verá la cantidad actualizada.

## Deploy

Vercel detecta Next.js automáticamente. Configura las mismas variables `NEXT_PUBLIC_FIREBASE_*` en el dashboard de Vercel.
