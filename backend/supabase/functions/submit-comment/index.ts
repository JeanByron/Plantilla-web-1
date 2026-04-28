import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Lista de palabras y frases prohibidas (español)
const PROHIBIDAS = [
  // Insultos directos
  'idiota', 'imbecil', 'imbécil', 'estupido', 'estúpido', 'pendejo', 'pendeja',
  'hijueputa', 'hijuepucha', 'hijo de puta', 'hdp',
  'mierda', 'gonorrea', 'malparido', 'malparida',
  'marica', 'maricon', 'maricón', 'verga', 'coño', 'cono',
  'culero', 'culera', 'cabron', 'cabrón', 'cabrona',
  'jodido', 'jodida', 'bastardo', 'bastarda',
  'tarado', 'tarada', 'inutil', 'inútil',
  'perra callejera', 'perro callejero',
  // Contenido sexual explícito — actos
  'me lo chup', 'te lo chup', 'se lo chup', 'le chup', 'chuparme', 'chuparte',
  'mamarsela', 'mamarmela', 'mamarmelo', 'mamame', 'me la mama', 'te la mama',
  'me lo mama', 'te lo mama',
  'me lo met', 'te lo met', 'se lo met', 'metermela', 'metertela',
  'cogerte', 'cogerme', 'cogerla', 'cogerlo', 'cogerse',
  'follarte', 'follarme', 'follarla', 'follarme',
  'sexo oral', 'felacion', 'felación', 'cunnilingus',
  'hacerle una', 'hacerme una mamada', 'hacerte una mamada',
  'masturbacion', 'masturbarse', 'pajear', 'hacerse una paja', 'hacerse la paja',
  'orgasmo', 'eyacular', 'correrse',
  // Contenido sexual explícito — partes del cuerpo en contexto obsceno
  'pene erecto', 'mi pene', 'tu pene', 'su pene',
  'pija', 'pirola', 'bicho', 'picha',
  'vagina mojada', 'mi vagina', 'tu vagina',
  'vulva',
  // Contenido sexual — material y contexto
  'pornografia', 'pornografico', 'pornográfico',
  'porno',
  'prostituir', 'puteria', 'putería',
  'abuso sexual', 'violacion sexual', 'violación sexual',
  // Odio y discriminación
  'negro de mierda', 'india sucia', 'indio sucio',
  'gay de mierda', 'lesbiana de mierda',
  'gordo de mierda', 'gorda de mierda',
  // Violencia y amenazas
  'te voy a matar', 'los voy a matar', 'muérete', 'muerete',
  'voy a matar', 'te mato', 'los mato',
  'terrorista', 'bomba',
  // Palabras separadas de alto impacto que solas son ofensivas
  'puta', 'puto', 'putas', 'putos',
  // Evasiones con números (leet speak)
  'p0ta', 'p3ndej0', 'h1jueputa', 'c0no', 'm13rda',
]

function esProhibido(texto: string): boolean {
  const normalizado = texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e')
    .replace(/4/g, 'a').replace(/5/g, 's')

  return PROHIBIDAS.some(p => {
    const pNorm = p.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    return normalizado.includes(pNorm)
  })
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'Método no permitido.' }, 405)

  let body: Record<string, string>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Cuerpo de solicitud inválido.' }, 400)
  }

  const { nombre, municipio, numero_contacto, mensaje } = body

  // Validar campos obligatorios
  if (!nombre?.trim() || !municipio?.trim() || !numero_contacto?.trim() || !mensaje?.trim()) {
    return json({ error: 'Todos los campos son requeridos.' }, 400)
  }

  // Validar longitudes máximas
  if (nombre.length > 100 || municipio.length > 100 || numero_contacto.length > 50 || mensaje.length > 500) {
    return json({ error: 'Uno o más campos exceden la longitud permitida.' }, 400)
  }

  // Moderación de contenido
  for (const campo of [nombre, municipio, mensaje]) {
    if (esProhibido(campo)) {
      return json(
        { error: 'Tu comentario contiene contenido no permitido.', code: 'CONTENIDO_PROHIBIDO' },
        422,
      )
    }
  }

  // Insertar en base de datos usando service_role (omite RLS)
  const db = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  const { data, error } = await db
    .from('comentarios')
    .insert({
      nombre: nombre.trim(),
      municipio: municipio.trim(),
      numero_contacto: numero_contacto.trim(),
      mensaje: mensaje.trim(),
    })
    .select()
    .single()

  if (error) {
    console.error('DB insert error:', error)
    return json({ error: 'Error al guardar el comentario. Intenta de nuevo.' }, 500)
  }

  return json({ success: true, data }, 201)
})
