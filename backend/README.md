# Backend — Manuel Correa Web

Backend del muro comunitario construido sobre **Supabase** (PostgreSQL + Realtime + Edge Functions).

## Estructura

```
backend/
├── supabase/
│   ├── config.toml                          # Configuración del proyecto Supabase
│   ├── migrations/
│   │   └── 20240101000000_create_comments.sql  # Tabla comentarios + RLS + Realtime
│   └── functions/
│       └── submit-comment/
│           └── index.ts                     # Edge Function: validación y guardado
├── .env.example                             # Variables de entorno requeridas
└── README.md
```

## Requisitos previos

- [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started)  
  ```bash
  npm install -g supabase
  # o en macOS
  brew install supabase/tap/supabase
  ```
- Acceso al proyecto `upopumlywcybfbnevjrq` en [supabase.com](https://supabase.com)

---

## Configuración inicial

### 1. Login y enlace del proyecto

```bash
supabase login
supabase init          # solo si aún no existe supabase/config.toml
supabase link --project-ref upopumlywcybfbnevjrq
```

### 2. Variables de entorno

Copiar `.env.example` y completar los valores secretos:

```bash
cp .env.example .env
```

Los valores `SUPABASE_URL` y `SUPABASE_ANON_KEY` ya están prellenados (son públicos).  
Completar `SUPABASE_SERVICE_ROLE_KEY` con la clave encontrada en:  
**Dashboard → Project Settings → API → service_role (secret)**

> ⚠️ Nunca subas `.env` a git. Solo `.env.example`.

---

## Base de datos

### Aplicar la migración

```bash
supabase db push
```

Esto crea la tabla `comentarios` con Row Level Security habilitado y Realtime activado.

### Estructura de la tabla

| Campo            | Tipo        | Restricción            |
|------------------|-------------|------------------------|
| `id`             | uuid        | PK, auto-generado      |
| `nombre`         | text        | requerido, max 100     |
| `municipio`      | text        | requerido, max 100     |
| `numero_contacto`| text        | requerido, max 50      |
| `mensaje`        | text        | requerido, max 500     |
| `created_at`     | timestamptz | auto, ahora()          |

### Políticas RLS

- **SELECT**: público (anon y authenticated pueden leer).  
- **INSERT**: solo `service_role` (la Edge Function). El frontend no puede insertar directamente.

---

## Edge Function — `submit-comment`

Valida y guarda comentarios. El frontend llama a esta función; nunca inserta en la DB directamente.

### Desplegar

```bash
supabase functions deploy submit-comment
```

### Endpoint

```
POST https://upopumlywcybfbnevjrq.supabase.co/functions/v1/submit-comment
```

### Cuerpo (JSON)

```json
{
  "nombre": "Carlos García",
  "municipio": "Manizales",
  "numero_contacto": "3001234567",
  "mensaje": "Propongo mejorar el transporte rural."
}
```

### Respuestas

| Código | Significado                                  |
|--------|----------------------------------------------|
| 201    | Comentario guardado. Devuelve `{ success, data }` |
| 400    | Campos faltantes o demasiado largos          |
| 422    | Contenido no permitido (moderación)          |
| 500    | Error interno                                |

### Moderación

La función filtra automáticamente:
- Insultos y groserías en español
- Lenguaje discriminatorio (raza, género, cuerpo)
- Amenazas y contenido violento
- Evasiones con caracteres numéricos (leet speak)

Si el mensaje no pasa el filtro, responde con:
```json
{ "error": "Tu comentario contiene contenido no permitido.", "code": "CONTENIDO_PROHIBIDO" }
```

---

## Realtime

El frontend se suscribe a inserciones en `comentarios` usando el cliente de Supabase:

```js
db.channel('comentarios-channel')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comentarios' }, handler)
  .subscribe()
```

Los comentarios nuevos aparecen en el muro de todos los visitantes sin recargar la página.

---

## Flujo completo

```
Usuario escribe comentario
        ↓
Frontend valida campos (vacíos, longitud)
        ↓
POST → Edge Function submit-comment
        ↓
Edge Function filtra contenido prohibido
        ↓     ↘ contenido prohibido → 422
Inserta en BD (service_role)
        ↓
Realtime broadcast → todos los clientes
        ↓
Muro actualizado en tiempo real
```

---

## Comandos de referencia rápida

```bash
# Ver logs de la Edge Function en tiempo real
supabase functions logs submit-comment --tail

# Reiniciar DB local (desarrollo)
supabase db reset

# Generar tipos TypeScript desde el esquema
supabase gen types typescript --linked > supabase/types.ts
```
