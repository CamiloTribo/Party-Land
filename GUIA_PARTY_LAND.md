# 🎉 Guía Completa: Party Land Mini App

> **Tu Mini App de Farcaster está lista para despegar!** 🚀

## 📋 Índice

1. [¿Qué es esto?](#qué-es-esto)
2. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
3. [Cómo Funciona](#cómo-funciona)
4. [Primeros Pasos](#primeros-pasos)
5. [Desarrollo Local](#desarrollo-local)
6. [Deployment](#deployment)
7. [Personalización](#personalización)
8. [Recursos y Documentación](#recursos-y-documentación)

---

## 🎯 ¿Qué es esto?

**Party Land** es una **Farcaster Mini App** (anteriormente conocida como Frames v2). Es una aplicación web completa que se ejecuta **dentro de Warpcast** y otras apps de Farcaster.

### Diferencias clave:

| Característica | Frames v1 | Mini Apps (Frames v2) |
|----------------|-----------|----------------------|
| **UI** | Solo imágenes estáticas | Aplicación web completa |
| **Interactividad** | Botones limitados | Full JavaScript/React |
| **Tamaño** | Pequeño embed | Pantalla completa |
| **Capacidades** | Muy limitadas | Wallet, notificaciones, auth |

### ¿Por qué Neynar?

**Neynar** es el mejor backend para Mini Apps porque te da:

✅ **API simplificada** para interactuar con Farcaster  
✅ **Webhooks automáticos** (sin configuración)  
✅ **Analytics gratis** en tu dashboard  
✅ **Notificaciones push** a usuarios  
✅ **Rate limiting** incluido  
✅ **Documentación excelente**

---

## 🏗️ Arquitectura del Proyecto

```
party-land/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── .well-known/        # Farcaster manifest (IMPORTANTE!)
│   │   │   └── farcaster.json/ # Configuración de tu mini app
│   │   ├── api/                # API Routes
│   │   │   ├── opengraph-image/# Imagen para compartir
│   │   │   └── webhook/        # Recibe eventos de Farcaster
│   │   ├── app.tsx             # Wrapper del componente principal
│   │   ├── page.tsx            # Página principal
│   │   ├── layout.tsx          # Layout con providers
│   │   └── providers.tsx       # Context providers (Neynar, Wallet)
│   │
│   ├── components/
│   │   ├── App.tsx             # Componente principal de la app
│   │   └── ui/                 # Componentes de UI
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── tabs/           # Diferentes secciones
│   │           ├── HomeTab.tsx
│   │           ├── ActionsTab.tsx
│   │           ├── ContextTab.tsx
│   │           └── WalletTab.tsx
│   │
│   ├── hooks/                  # Custom React hooks
│   │   └── useNeynarUser.ts
│   │
│   ├── lib/
│   │   ├── constants.ts        # Configuración de la app
│   │   └── utils.ts            # Utilidades
│   │
│   └── auth.ts                 # Sign In With Neynar (SIWN)
│
├── public/                     # Assets estáticos
│   ├── icon.png               # Icono de la app (200x200px)
│   └── splash.png             # Splash screen (200x200px)
│
├── .env.local                  # Variables de entorno (NO SUBIR A GIT!)
├── package.json
└── next.config.ts
```

---

## ⚙️ Cómo Funciona

### 1. **Manifest de Farcaster** (`.well-known/farcaster.json`)

Este archivo es **CRÍTICO**. Le dice a Warpcast:
- Quién eres (account association)
- Cómo se llama tu app
- Qué URL abrir
- Qué imágenes mostrar
- Dónde enviar webhooks

### 2. **Frame SDK** (`@neynar/react`)

Tu app usa el SDK de Neynar que te da:

```typescript
import { useMiniApp } from '@neynar/react';

const { 
  isSDKLoaded,     // ¿SDK listo?
  context,         // Info del usuario y cliente
  setActiveTab,    // Cambiar de tab
  currentTab       // Tab actual
} = useMiniApp();
```

### 3. **Context del Usuario**

Cuando alguien abre tu mini app, recibes:

```typescript
context = {
  user: {
    fid: 12345,              // Farcaster ID
    username: "camilo",
    displayName: "Camilo",
    pfpUrl: "https://..."
  },
  client: {
    clientFid: 9152,         // 9152 = Warpcast
    added: false,            // ¿Usuario agregó la app?
    safeAreaInsets: {...},   // Márgenes seguros (móvil)
    notificationDetails: {   // Para enviar notificaciones
      url: "...",
      token: "..."
    }
  },
  location: {
    type: "cast_embed",      // Desde dónde se abrió
    cast: { ... }            // Info del cast
  }
}
```

### 4. **Wallet Integration**

Si habilitaste wallets (lo hiciste ✅), tienes:

```typescript
import { useAccount, useConnect } from 'wagmi';

const { address, isConnected } = useAccount();
const { connect } = useConnect();
```

### 5. **Sign In With Neynar (SIWN)**

Permite que tu app **escriba en Farcaster** por el usuario:
- Crear casts
- Dar likes
- Seguir usuarios
- etc.

---

## 🚀 Primeros Pasos

### 1. Instalar dependencias (ya hecho ✅)

```bash
cd party-land
npm install
```

### 2. Configurar variables de entorno

Abre `.env.local` y verifica:

```bash
# Neynar API (IMPORTANTE!)
NEYNAR_API_KEY=tu_api_key_aqui
NEYNAR_CLIENT_ID=tu_client_id_aqui

# NextAuth (para SIWN)
NEXTAUTH_SECRET=tu_secret_aqui
NEXTAUTH_URL=http://localhost:3000

# URL de tu app (cambiar en producción)
NEXT_PUBLIC_URL=http://localhost:3000

# Seed phrase (para SIWN)
SEED_PHRASE=tu_seed_phrase_aqui
```

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

Abre: `http://localhost:3000`

**⚠️ IMPORTANTE**: Para probar como mini app real, necesitas:
1. Deployar a un servidor público (Vercel, Railway, etc.)
2. Configurar el manifest con tu URL pública
3. Compartir el link en Warpcast

---

## 💻 Desarrollo Local

### Estructura de Tabs

Tu app tiene 4 tabs por defecto:

1. **Home** (`HomeTab.tsx`) - Página principal
2. **Actions** (`ActionsTab.tsx`) - Acciones de la mini app
3. **Context** (`ContextTab.tsx`) - Info del contexto (debug)
4. **Wallet** (`WalletTab.tsx`) - Conexión de wallet

### Editar el contenido principal

Abre `src/components/ui/tabs/HomeTab.tsx`:

```typescript
export function HomeTab() {
  return (
    <div className="space-y-4">
      <h2>¡Bienvenido a Party Land! 🎉</h2>
      {/* Tu contenido aquí */}
    </div>
  );
}
```

### Agregar una nueva funcionalidad

**Ejemplo: Botón para crear un cast**

```typescript
import { useNeynarUser } from '~/hooks/useNeynarUser';

export function HomeTab() {
  const { user } = useNeynarUser();
  
  const handleParty = async () => {
    // Lógica para crear un cast
    const response = await fetch('/api/create-cast', {
      method: 'POST',
      body: JSON.stringify({
        text: `¡${user?.displayName} está de fiesta! 🎉`,
      })
    });
  };

  return (
    <button onClick={handleParty}>
      🎉 ¡Empezar la fiesta!
    </button>
  );
}
```

---

## 🌐 Deployment

### Opción 1: Vercel (Recomendado)

```bash
npm run deploy:vercel
```

O manualmente:

1. Ve a [vercel.com](https://vercel.com)
2. Conecta tu repo de GitHub
3. Configura las variables de entorno
4. Deploy!

### Opción 2: Railway

1. Ve a [railway.app](https://railway.app)
2. "New Project" → "Deploy from GitHub"
3. Selecciona `Party-Land`
4. Agrega variables de entorno
5. Deploy!

### ⚠️ Después del deploy

1. **Actualiza `NEXT_PUBLIC_URL`** en las variables de entorno:
   ```
   NEXT_PUBLIC_URL=https://party-land.vercel.app
   ```

2. **Actualiza el manifest** en `src/lib/constants.ts`:
   ```typescript
   export const APP_URL = process.env.NEXT_PUBLIC_URL!;
   ```

3. **Verifica el manifest**:
   Visita: `https://tu-app.vercel.app/.well-known/farcaster.json/route`

---

## 🎨 Personalización

### Cambiar nombre y descripción

Edita `src/lib/constants.ts`:

```typescript
export const APP_NAME = 'Party Land';
export const APP_DESCRIPTION = 'Party with friends';
export const APP_BUTTON_TEXT = 'Launch Mini App';
export const APP_PRIMARY_CATEGORY = 'social';
export const APP_TAGS = ['Brutal', 'Party', 'Social'];
```

### Cambiar colores y estilos

Edita `src/app/globals.css`:

```css
:root {
  --background: #ffffff;
  --foreground: #000000;
  --primary: #8a63d2;  /* Tu color principal */
  --secondary: #ff6b9d;
}
```

### Cambiar iconos

Reemplaza en `public/`:
- `icon.png` (200x200px) - Icono de la app
- `splash.png` (200x200px) - Splash screen

### Agregar notificaciones

```typescript
// En tu API route o servidor
const response = await fetch(notificationDetails.url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${notificationDetails.token}`
  },
  body: JSON.stringify({
    notificationId: 'party-started-123',
    title: '🎉 ¡Fiesta!',
    body: 'Tu amigo empezó una fiesta',
    targetUrl: 'https://party-land.vercel.app/party/123',
    tokens: [notificationDetails.token]
  })
});
```

---

## 📚 Recursos y Documentación

### Documentación Oficial

- **Farcaster Mini Apps**: https://docs.farcaster.xyz/developers/frames/v2
- **Neynar Docs**: https://docs.neynar.com/
- **Neynar API Reference**: https://docs.neynar.com/reference
- **Frame SDK**: https://github.com/neynarxyz/farcaster-examples

### Dashboards Importantes

- **Neynar Dev Portal**: https://dev.neynar.com/app
  - Ver analytics
  - Enviar notificaciones manuales
  - Gestionar webhooks
  - Ver logs

### Comunidad

- **Farcaster Dev Chat**: https://warpcast.com/~/channel/fc-devs
- **Neynar Discord**: https://discord.gg/neynar
- **GitHub Issues**: https://github.com/neynarxyz/create-farcaster-mini-app/issues

### Ejemplos de Mini Apps

- **Yoink**: https://yoink.party
- **Higher**: https://higher.party
- **Perl**: https://perl.xyz

---

## 🔥 Próximos Pasos

### Nivel 1: Básico
- [ ] Cambiar el contenido del `HomeTab`
- [ ] Personalizar colores y estilos
- [ ] Cambiar iconos y splash screen
- [ ] Deploy a Vercel

### Nivel 2: Intermedio
- [ ] Agregar una nueva tab personalizada
- [ ] Implementar notificaciones
- [ ] Conectar con una API externa
- [ ] Agregar animaciones

### Nivel 3: Avanzado
- [ ] Implementar transacciones onchain
- [ ] Crear un sistema de puntos/rewards
- [ ] Integrar con otros protocolos (Lens, etc.)
- [ ] Agregar triggers personalizados

---

## 💡 Tips y Mejores Prácticas

### 1. **Siempre usa `safeAreaInsets`**
```typescript
<div style={{
  paddingTop: context?.client.safeAreaInsets?.top ?? 0,
  paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
}}>
  {/* Tu contenido */}
</div>
```

### 2. **Llama a `sdk.actions.ready()` cuando cargues**
```typescript
useEffect(() => {
  if (isSDKLoaded) {
    sdk.actions.ready();
  }
}, [isSDKLoaded]);
```

### 3. **Maneja errores de wallet**
```typescript
try {
  await connect();
} catch (error) {
  console.error('Error conectando wallet:', error);
  // Mostrar mensaje al usuario
}
```

### 4. **Usa dynamic imports para el SDK**
```typescript
const Component = dynamic(() => import('./Component'), {
  ssr: false  // El SDK solo funciona en el cliente
});
```

### 5. **Verifica el manifest antes de deployar**
```bash
# Debe devolver JSON válido
curl https://tu-app.vercel.app/.well-known/farcaster.json/route
```

---

## 🐛 Troubleshooting

### "Could not find a client ID for this API key"
- Verifica que tu API key sea correcta
- Asegúrate de tener un proyecto creado en dev.neynar.com

### "SDK not loading"
- Verifica que estés usando `dynamic import` con `ssr: false`
- Revisa la consola del navegador

### "Manifest not found"
- Verifica que `.well-known/farcaster.json/route.ts` exista
- Asegúrate de que `APP_URL` esté configurado correctamente

### "Notifications not working"
- Verifica que el usuario haya agregado la app (`context.client.added`)
- Revisa que tengas `notificationDetails` en el context
- Verifica el webhook URL en el manifest

---

## 🎉 ¡Estás listo!

Ahora tienes todo lo que necesitas para construir **Party Land**. 

**Recuerda:**
1. ✅ Ya tienes el template configurado
2. ✅ Neynar está integrado
3. ✅ Wallet y SIWN funcionando
4. ✅ Repo en GitHub conectado

**Siguiente paso:** ¡Empieza a construir tu idea! 🚀

---

**¿Preguntas?** Pregúntame lo que necesites. Estoy aquí para ayudarte a construir la mejor mini app de Farcaster. 💜
