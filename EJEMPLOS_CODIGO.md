# 💻 Ejemplos de Código para Party Land

Esta guía contiene ejemplos prácticos y listos para usar en tu mini app.

---

## 📋 Índice

1. [Acciones Básicas](#acciones-básicas)
2. [Interacción con Farcaster](#interacción-con-farcaster)
3. [Wallet y Transacciones](#wallet-y-transacciones)
4. [Notificaciones](#notificaciones)
5. [UI Components](#ui-components)
6. [Hooks Personalizados](#hooks-personalizados)

---

## 🎯 Acciones Básicas

### 1. Obtener información del usuario

```typescript
'use client';

import { useMiniApp } from '@neynar/react';
import { useNeynarUser } from '~/hooks/useNeynarUser';

export function UserInfo() {
  const { context } = useMiniApp();
  const { user } = useNeynarUser(context);

  if (!user) return <div>Cargando...</div>;

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <img 
        src={user.pfpUrl} 
        alt={user.displayName}
        className="w-16 h-16 rounded-full"
      />
      <h2 className="text-xl font-bold">{user.displayName}</h2>
      <p className="text-gray-600">@{user.username}</p>
      <p className="text-sm text-gray-500">FID: {user.fid}</p>
    </div>
  );
}
```

### 2. Cerrar la mini app con un mensaje

```typescript
import { useMiniApp } from '@neynar/react';

export function CloseButton() {
  const { sdk } = useMiniApp();

  const handleClose = async () => {
    await sdk.actions.close({
      toast: {
        message: "¡Gracias por usar Party Land! 🎉"
      }
    });
  };

  return (
    <button 
      onClick={handleClose}
      className="px-4 py-2 bg-red-500 text-white rounded"
    >
      Cerrar App
    </button>
  );
}
```

### 3. Abrir URL externa

```typescript
import { useMiniApp } from '@neynar/react';

export function ExternalLink() {
  const { sdk } = useMiniApp();

  const openLink = async () => {
    await sdk.actions.openUrl({ 
      url: "https://warpcast.com/~/channel/party" 
    });
  };

  return (
    <button onClick={openLink}>
      Abrir Canal de Party 🎉
    </button>
  );
}
```

### 4. Pedir al usuario que agregue la app

```typescript
import { useMiniApp } from '@neynar/react';
import { useState } from 'react';

export function AddAppButton() {
  const { sdk, context } = useMiniApp();
  const [isAdded, setIsAdded] = useState(context?.client.added || false);

  const handleAddApp = async () => {
    const result = await sdk.actions.addFrame();
    
    if (result.added) {
      setIsAdded(true);
      console.log('Notification details:', result.notificationDetails);
    } else {
      console.error('User rejected:', result.reason);
    }
  };

  if (isAdded) {
    return <div>✅ App agregada!</div>;
  }

  return (
    <button 
      onClick={handleAddApp}
      className="px-6 py-3 bg-purple-600 text-white rounded-lg"
    >
      ⭐ Agregar a mis apps
    </button>
  );
}
```

---

## 🎭 Interacción con Farcaster

### 1. Crear un cast (requiere SIWN)

```typescript
// src/app/api/create-cast/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { text, signerUuid } = await req.json();

  const response = await fetch('https://api.neynar.com/v2/farcaster/cast', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api_key': process.env.NEYNAR_API_KEY!,
    },
    body: JSON.stringify({
      signer_uuid: signerUuid,
      text: text,
    }),
  });

  const data = await response.json();
  return NextResponse.json(data);
}
```

```typescript
// En tu componente
import { useSession } from 'next-auth/react';

export function CreateCastButton() {
  const { data: session } = useSession();

  const createCast = async () => {
    if (!session?.user?.signerUuid) {
      alert('Necesitas iniciar sesión con Neynar');
      return;
    }

    const response = await fetch('/api/create-cast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: '¡Estoy de fiesta en Party Land! 🎉',
        signerUuid: session.user.signerUuid,
      }),
    });

    const data = await response.json();
    console.log('Cast creado:', data);
  };

  return (
    <button onClick={createCast}>
      📝 Crear Cast
    </button>
  );
}
```

### 2. Obtener casts de un usuario

```typescript
// src/app/api/user-casts/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const fid = req.nextUrl.searchParams.get('fid');

  const response = await fetch(
    `https://api.neynar.com/v2/farcaster/feed/user/${fid}/casts?limit=10`,
    {
      headers: {
        'api_key': process.env.NEYNAR_API_KEY!,
      },
    }
  );

  const data = await response.json();
  return NextResponse.json(data);
}
```

```typescript
// En tu componente
import { useEffect, useState } from 'react';
import { useMiniApp } from '@neynar/react';

export function UserCasts() {
  const { context } = useMiniApp();
  const [casts, setCasts] = useState([]);

  useEffect(() => {
    if (context?.user.fid) {
      fetch(`/api/user-casts?fid=${context.user.fid}`)
        .then(res => res.json())
        .then(data => setCasts(data.casts || []));
    }
  }, [context]);

  return (
    <div>
      {casts.map((cast: any) => (
        <div key={cast.hash} className="p-4 border-b">
          <p>{cast.text}</p>
        </div>
      ))}
    </div>
  );
}
```

### 3. Dar like a un cast

```typescript
// src/app/api/like-cast/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { castHash, signerUuid } = await req.json();

  const response = await fetch('https://api.neynar.com/v2/farcaster/reaction', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api_key': process.env.NEYNAR_API_KEY!,
    },
    body: JSON.stringify({
      signer_uuid: signerUuid,
      reaction_type: 'like',
      target: castHash,
    }),
  });

  const data = await response.json();
  return NextResponse.json(data);
}
```

---

## 💰 Wallet y Transacciones

### 1. Conectar wallet

```typescript
'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div className="p-4 bg-green-100 rounded">
        <p>Conectado: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
        <button onClick={() => disconnect()}>
          Desconectar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {connectors.map((connector) => (
        <button
          key={connector.id}
          onClick={() => connect({ connector })}
          className="px-4 py-2 bg-blue-500 text-white rounded w-full"
        >
          Conectar con {connector.name}
        </button>
      ))}
    </div>
  );
}
```

### 2. Enviar transacción

```typescript
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { useState } from 'react';

export function SendTransaction() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  
  const { sendTransaction, data: hash } = useSendTransaction();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleSend = async () => {
    sendTransaction({
      to: recipient as `0x${string}`,
      value: parseEther(amount),
    });
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Dirección del destinatario"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        placeholder="Cantidad en ETH"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <button
        onClick={handleSend}
        disabled={isLoading}
        className="w-full px-4 py-2 bg-purple-600 text-white rounded"
      >
        {isLoading ? 'Enviando...' : 'Enviar ETH'}
      </button>
      {isSuccess && <p>✅ Transacción exitosa!</p>}
    </div>
  );
}
```

### 3. Firmar mensaje

```typescript
import { useSignMessage } from 'wagmi';
import { useState } from 'react';

export function SignMessage() {
  const [message, setMessage] = useState('');
  const { signMessage, data: signature } = useSignMessage();

  const handleSign = () => {
    signMessage({ message });
  };

  return (
    <div className="space-y-4">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Mensaje a firmar"
        className="w-full p-2 border rounded"
      />
      <button onClick={handleSign}>
        ✍️ Firmar Mensaje
      </button>
      {signature && (
        <div className="p-2 bg-gray-100 rounded text-xs break-all">
          <strong>Firma:</strong> {signature}
        </div>
      )}
    </div>
  );
}
```

### 4. Leer balance

```typescript
import { useBalance } from 'wagmi';
import { useAccount } from 'wagmi';

export function Balance() {
  const { address } = useAccount();
  const { data, isLoading } = useBalance({
    address: address,
  });

  if (isLoading) return <div>Cargando balance...</div>;

  return (
    <div className="p-4 bg-blue-100 rounded">
      <p className="text-2xl font-bold">
        {data?.formatted} {data?.symbol}
      </p>
    </div>
  );
}
```

---

## 🔔 Notificaciones

### 1. Enviar notificación a un usuario

```typescript
// src/app/api/send-notification/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { notificationUrl, token, title, body, targetUrl } = await req.json();

  const response = await fetch(notificationUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      notificationId: `party-${Date.now()}`,
      title: title,
      body: body,
      targetUrl: targetUrl,
      tokens: [token],
    }),
  });

  const data = await response.json();
  return NextResponse.json(data);
}
```

```typescript
// En tu componente
import { useMiniApp } from '@neynar/react';

export function NotifyButton() {
  const { context } = useMiniApp();

  const sendNotification = async () => {
    const notificationDetails = context?.client.notificationDetails;
    
    if (!notificationDetails) {
      alert('Usuario no tiene notificaciones habilitadas');
      return;
    }

    await fetch('/api/send-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notificationUrl: notificationDetails.url,
        token: notificationDetails.token,
        title: '🎉 ¡Fiesta!',
        body: 'Tu amigo te invitó a una fiesta',
        targetUrl: `${process.env.NEXT_PUBLIC_URL}/party/123`,
      }),
    });
  };

  return (
    <button onClick={sendNotification}>
      🔔 Enviar Notificación
    </button>
  );
}
```

### 2. Manejar webhooks de eventos

```typescript
// src/app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const event = await req.json();

  console.log('Evento recibido:', event);

  // Verificar la firma (importante en producción!)
  // const isValid = verifySignature(event);
  // if (!isValid) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });

  switch (event.payload.event) {
    case 'frame_added':
      console.log('Usuario agregó la app:', event.payload.notificationDetails);
      // Guardar el token de notificación en tu DB
      break;

    case 'frame_removed':
      console.log('Usuario removió la app');
      // Eliminar el token de notificación de tu DB
      break;

    case 'notifications_enabled':
      console.log('Usuario habilitó notificaciones');
      break;

    case 'notifications_disabled':
      console.log('Usuario deshabilitó notificaciones');
      break;
  }

  return NextResponse.json({ success: true });
}
```

---

## 🎨 UI Components

### 1. Card de usuario

```typescript
interface UserCardProps {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  bio?: string;
}

export function UserCard({ fid, username, displayName, pfpUrl, bio }: UserCardProps) {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition">
      <div className="flex items-center space-x-4">
        <img 
          src={pfpUrl} 
          alt={displayName}
          className="w-16 h-16 rounded-full"
        />
        <div className="flex-1">
          <h3 className="text-lg font-bold">{displayName}</h3>
          <p className="text-gray-600">@{username}</p>
          <p className="text-xs text-gray-400">FID: {fid}</p>
        </div>
      </div>
      {bio && (
        <p className="mt-3 text-sm text-gray-700">{bio}</p>
      )}
    </div>
  );
}
```

### 2. Loading spinner

```typescript
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
    </div>
  );
}
```

### 3. Toast notification

```typescript
import { useState, useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
}

export function Toast({ message, type = 'info', duration = 3000 }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className={`fixed bottom-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg`}>
      {message}
    </div>
  );
}
```

### 4. Modal

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
```

---

## 🪝 Hooks Personalizados

### 1. useLocalStorage

```typescript
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}
```

### 2. useDebounce

```typescript
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

### 3. useFarcasterUser

```typescript
import { useState, useEffect } from 'react';

export function useFarcasterUser(fid: number) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/user?fid=${fid}`);
        const data = await response.json();
        setUser(data.user);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (fid) fetchUser();
  }, [fid]);

  return { user, loading, error };
}
```

---

## 🎯 Ejemplo Completo: Sistema de Puntos

```typescript
// src/app/api/points/route.ts
import { NextRequest, NextResponse } from 'next/server';

// En producción, usa una DB real (Supabase, Postgres, etc.)
const userPoints = new Map<number, number>();

export async function GET(req: NextRequest) {
  const fid = req.nextUrl.searchParams.get('fid');
  const points = userPoints.get(Number(fid)) || 0;
  
  return NextResponse.json({ points });
}

export async function POST(req: NextRequest) {
  const { fid, action } = await req.json();
  
  const pointsMap: Record<string, number> = {
    'party_created': 10,
    'party_joined': 5,
    'invite_sent': 3,
  };
  
  const currentPoints = userPoints.get(fid) || 0;
  const newPoints = currentPoints + (pointsMap[action] || 0);
  userPoints.set(fid, newPoints);
  
  return NextResponse.json({ points: newPoints });
}
```

```typescript
// src/components/PointsSystem.tsx
'use client';

import { useState, useEffect } from 'react';
import { useMiniApp } from '@neynar/react';

export function PointsSystem() {
  const { context } = useMiniApp();
  const [points, setPoints] = useState(0);

  useEffect(() => {
    if (context?.user.fid) {
      fetch(`/api/points?fid=${context.user.fid}`)
        .then(res => res.json())
        .then(data => setPoints(data.points));
    }
  }, [context]);

  const earnPoints = async (action: string) => {
    const response = await fetch('/api/points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fid: context?.user.fid,
        action: action,
      }),
    });
    
    const data = await response.json();
    setPoints(data.points);
  };

  return (
    <div className="space-y-4">
      <div className="text-center p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg">
        <h2 className="text-4xl font-bold">{points}</h2>
        <p className="text-sm">Puntos de Fiesta</p>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => earnPoints('party_created')}
          className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg"
        >
          🎉 Crear Fiesta (+10 puntos)
        </button>
        <button
          onClick={() => earnPoints('party_joined')}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg"
        >
          🎊 Unirse a Fiesta (+5 puntos)
        </button>
        <button
          onClick={() => earnPoints('invite_sent')}
          className="w-full px-4 py-3 bg-green-600 text-white rounded-lg"
        >
          📨 Invitar Amigo (+3 puntos)
        </button>
      </div>
    </div>
  );
}
```

---

¡Ahora tienes ejemplos listos para copiar y pegar en tu proyecto! 🚀
