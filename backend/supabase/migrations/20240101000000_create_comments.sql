-- Tabla de comentarios del muro comunitario
CREATE TABLE IF NOT EXISTS public.comentarios (
  id             uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre         text        NOT NULL CHECK (char_length(nombre) <= 100),
  municipio      text        NOT NULL CHECK (char_length(municipio) <= 100),
  numero_contacto text       NOT NULL CHECK (char_length(numero_contacto) <= 50),
  mensaje        text        NOT NULL CHECK (char_length(mensaje) <= 500),
  created_at     timestamptz DEFAULT now() NOT NULL
);

-- RLS: habilitar seguridad a nivel de fila
ALTER TABLE public.comentarios ENABLE ROW LEVEL SECURITY;

-- Cualquier visitante puede leer los comentarios aprobados
CREATE POLICY "lectura_publica" ON public.comentarios
  FOR SELECT TO anon, authenticated USING (true);

-- Solo service_role (Edge Function) puede insertar — no hay política INSERT para anon
-- service_role omite RLS por defecto, así que la validación ocurre solo en la función

-- Índice para ordenar por fecha de creación (la consulta más común)
CREATE INDEX IF NOT EXISTS comentarios_created_at_idx
  ON public.comentarios (created_at DESC);

-- Habilitar Realtime en esta tabla
ALTER PUBLICATION supabase_realtime ADD TABLE public.comentarios;
