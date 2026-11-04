-- Esquema de D Bonita para Supabase (SQL Editor → New query → Run).
-- Se puede ejecutar sobre una base existente: no borra datos.
--
-- Modelo de seguridad: TODO el acceso pasa por las rutas API del servidor con la
-- service role key (que se salta RLS). Las claves anon/authenticated no tienen
-- ningún permiso sobre estas tablas, así que los datos de las clientas no son
-- accesibles desde el navegador.

create extension if not exists pgcrypto;

-- ── Tablas ─────────────────────────────────────────────────

create table if not exists public.reservas (
  id                       uuid primary key default gen_random_uuid(),
  nombre                   text not null,
  telefono                 text not null default '',
  email                    text,
  servicio                 text not null,            -- JSON array de IDs de servicio
  fecha                    date not null,
  hora                     text not null,            -- HH:MM
  estado                   text not null default 'confirmada'
                           check (estado in ('pendiente', 'confirmada', 'cancelada', 'completada')),
  notas                    text,
  duracion_minutos         integer,
  importe_pagado           numeric(10, 2),
  pagado                   boolean default false,
  cancelado_en             timestamptz,
  stripe_payment_intent_id text,
  created_at               timestamptz not null default now()
);

create table if not exists public.bloqueos (
  id          uuid primary key default gen_random_uuid(),
  fecha       date not null,
  hora_inicio text not null,                         -- HH:MM o 'todo-el-dia'
  hora_fin    text not null,
  motivo      text,
  afecta      text default 'negocio' check (afecta in ('negocio', 'trabajadora')),
  created_at  timestamptz not null default now()
);

-- Columnas añadidas en versiones posteriores (por si la tabla ya existía)
alter table public.reservas add column if not exists duracion_minutos integer;
alter table public.reservas add column if not exists importe_pagado numeric(10, 2);
alter table public.reservas add column if not exists pagado boolean default false;
alter table public.reservas add column if not exists cancelado_en timestamptz;
alter table public.reservas add column if not exists stripe_payment_intent_id text;
alter table public.bloqueos add column if not exists afecta text default 'negocio';

-- ── Índices ────────────────────────────────────────────────

-- Un pago = una reserva. Evita duplicados entre el webhook y la vuelta del pago.
-- Si falla por duplicados ya existentes, revisarlos antes con:
--   select stripe_payment_intent_id, count(*) from reservas
--   where stripe_payment_intent_id is not null group by 1 having count(*) > 1;
create unique index if not exists reservas_stripe_pi_unico
  on public.reservas (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

create index if not exists reservas_fecha_idx on public.reservas (fecha);
create index if not exists bloqueos_fecha_idx on public.bloqueos (fecha);

-- ── Seguridad ──────────────────────────────────────────────

alter table public.reservas enable row level security;
alter table public.bloqueos enable row level security;

-- Elimina cualquier política previa que diera acceso público
do $$
declare pol record;
begin
  for pol in
    select policyname, tablename from pg_policies
    where schemaname = 'public' and tablename in ('reservas', 'bloqueos')
  loop
    execute format('drop policy if exists %I on public.%I', pol.policyname, pol.tablename);
  end loop;
end $$;

revoke all on public.reservas from anon, authenticated;
revoke all on public.bloqueos from anon, authenticated;
