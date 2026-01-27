# ✅ Checklist de Deploy a Vercel

## 📋 Antes de deployar

### 1. Verificar archivos importantes
- [ ] `.env.local` existe (NO se sube a Git)
- [ ] `public/icon.png` existe (200x200px)
- [ ] `public/splash.png` existe (200x200px)
- [ ] Código compila sin errores: `npm run build`

### 2. Preparar variables de entorno
Copia estos valores de tu `.env.local` porque los necesitarás en Vercel:

```bash
NEYNAR_API_KEY=
NEYNAR_CLIENT_ID=
NEXTAUTH_SECRET=
SEED_PHRASE=
```

---

## 🚀 Pasos para Deploy

### Opción A: Deploy automático desde GitHub (Recomendado)

1. **Ve a [vercel.com](https://vercel.com)**
2. **Click en "Add New Project"**
3. **Importa tu repo de GitHub**: `CamiloTribo/Party-Land`
4. **Configura las variables de entorno**:
   - Click en "Environment Variables"
   - Agrega TODAS las variables de tu `.env.local`
   - ⚠️ **IMPORTANTE**: Deja `NEXT_PUBLIC_URL` vacía por ahora
5. **Click en "Deploy"**
6. **Espera 2-3 minutos** ⏳

### Opción B: Deploy desde la terminal

```bash
# Instala Vercel CLI
npm i -g vercel

# Deploy
vercel

# Sigue las instrucciones en pantalla
```

---

## 🔧 Después del primer deploy

### 1. Obtener tu URL de Vercel
Vercel te dará una URL como:
```
https://party-land-xxx.vercel.app
```

### 2. Actualizar `NEXT_PUBLIC_URL`

**En Vercel Dashboard:**
1. Ve a tu proyecto → Settings → Environment Variables
2. Agrega/edita `NEXT_PUBLIC_URL`:
   ```
   NEXT_PUBLIC_URL=https://party-land-xxx.vercel.app
   ```
3. **Redeploy**: Ve a Deployments → Click en los 3 puntos → "Redeploy"

### 3. Verificar que funciona

Abre estas URLs y verifica:

✅ **App principal**: `https://party-land-xxx.vercel.app`
- Debería cargar tu mini app

✅ **Manifest**: `https://party-land-xxx.vercel.app/.well-known/farcaster.json/route`
- Debería devolver JSON válido

✅ **OG Image**: `https://party-land-xxx.vercel.app/api/opengraph-image`
- Debería mostrar una imagen

---

## 🎯 Probar la Mini App en Warpcast

### 1. Crear un cast con tu mini app

En Warpcast, crea un cast con tu URL:
```
https://party-land-xxx.vercel.app
```

### 2. Verificar que aparece el embed

Deberías ver:
- ✅ Imagen del OG
- ✅ Botón "Launch Mini App"
- ✅ Al hacer click, se abre tu app

### 3. Si NO aparece el embed

**Posibles problemas:**

❌ **Manifest no encontrado**
```bash
# Verifica que devuelve JSON:
curl https://party-land-xxx.vercel.app/.well-known/farcaster.json/route
```

❌ **NEXT_PUBLIC_URL incorrecta**
- Revisa que sea exactamente tu URL de Vercel
- Sin `/` al final

❌ **Imágenes no encontradas**
- Verifica que `icon.png` y `splash.png` existan en `/public`

---

## 🐛 Troubleshooting

### Error: "Failed to load manifest"
```bash
# 1. Verifica el manifest
curl https://TU-URL.vercel.app/.well-known/farcaster.json/route

# 2. Debe devolver algo como:
{
  "accountAssociation": {...},
  "frame": {
    "version": "1",
    "name": "Party Land",
    ...
  }
}
```

### Error: "Image failed to load"
- Asegúrate de que `icon.png` y `splash.png` estén en `/public`
- Deben ser exactamente 200x200px
- Formato PNG

### Error: Build failed
```bash
# Prueba el build localmente primero:
npm run build

# Si falla, revisa los errores y corrígelos
```

### Error: Environment variables not working
- Ve a Vercel Dashboard → Settings → Environment Variables
- Verifica que TODAS estén configuradas
- Redeploy después de cambiarlas

---

## 📝 Comandos útiles

```bash
# Ver logs en tiempo real
vercel logs

# Ver deployments
vercel ls

# Eliminar deployment
vercel rm party-land

# Abrir dashboard
vercel open
```

---

## 🎉 ¡Listo!

Una vez que tengas tu URL de Vercel funcionando:

1. ✅ Comparte tu mini app en Warpcast
2. ✅ Prueba todas las funcionalidades
3. ✅ Empieza a desarrollar nuevas features

---

## 🔗 Links importantes

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Tu repo**: https://github.com/CamiloTribo/Party-Land
- **Neynar Dev Portal**: https://dev.neynar.com/app
- **Warpcast**: https://warpcast.com

---

## 💡 Próximos pasos después del deploy

1. **Configura un dominio custom** (opcional)
   - Vercel Settings → Domains
   - Agrega tu dominio (ej: `partyland.xyz`)

2. **Monitorea analytics**
   - Ve a Neynar Dev Portal
   - Revisa las métricas de tu mini app

3. **Itera y mejora**
   - Cada push a `main` se deployará automáticamente
   - Prueba en staging antes de mergear

---

**¿Problemas?** Avísame y te ayudo a resolverlos! 🚀
