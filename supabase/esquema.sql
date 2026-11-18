-- =====================================================================
-- GESTIÓN DE VEHÍCULOS · Esquema de base de datos (Supabase / PostgreSQL)
-- Versión en castellano.
-- Ejecutar completo en: Supabase > SQL Editor > New query > Run
-- =====================================================================

-- ---------- 0) LIMPIEZA DE LA VERSIÓN ANTERIOR (en inglés) ----------
-- ATENCIÓN: borra las tablas antiguas y sus datos. Úsalo solo si todavía
-- no has guardado datos reales.

drop view if exists v_fuel_consumption;
drop table if exists attachments, documents, expenses, maintenances,
                     repairs, odometer_logs, fuel_logs, vehicles cascade;
drop function if exists sync_expense() cascade;
drop function if exists bump_vehicle_km() cascade;

-- Limpieza por si se vuelve a ejecutar esta versión:
drop view if exists v_consumo;
drop table if exists adjuntos, documentos, gastos, mantenimientos,
                     reparaciones, registros_km, repostajes, vehiculos cascade;
drop function if exists sincronizar_gasto() cascade;
drop function if exists actualizar_km_vehiculo() cascade;

-- ---------- 1) TABLAS ----------

create table vehiculos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  nombre text not null,
  marca text,
  modelo text,
  version text,
  matricula text,
  anio_matriculacion int check (anio_matriculacion between 1900 and 2100),
  fecha_compra date,
  km_actuales int not null default 0 check (km_actuales >= 0),
  combustible text not null default 'gasoil',
  capacidad_deposito numeric(5,1),
  potencia text,
  observaciones text,
  foto_ruta text,
  creado_en timestamptz not null default now()
);

create table repostajes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  vehiculo_id uuid not null references vehiculos(id) on delete cascade,
  fecha date not null default current_date,
  km int not null check (km >= 0),
  litros numeric(7,2) not null check (litros > 0),
  precio_litro numeric(6,3) not null check (precio_litro > 0),
  importe_total numeric(8,2) not null check (importe_total >= 0),
  gasolinera text,
  es_lleno boolean not null default true,   -- true = depósito lleno, false = parcial
  observaciones text,
  creado_en timestamptz not null default now()
);

create table registros_km (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  vehiculo_id uuid not null references vehiculos(id) on delete cascade,
  fecha date not null default current_date,
  km int not null check (km >= 0),
  motivo text not null default 'manual'
    check (motivo in ('manual','repostaje','reparacion','mantenimiento','itv')),
  observaciones text,
  creado_en timestamptz not null default now()
);

create table reparaciones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  vehiculo_id uuid not null references vehiculos(id) on delete cascade,
  fecha date not null default current_date,
  km int check (km >= 0),
  descripcion text not null,
  taller text,
  piezas_sustituidas text,
  mano_obra numeric(9,2) not null default 0,
  precio_piezas numeric(9,2) not null default 0,
  coste_total numeric(9,2) not null default 0,
  observaciones text,
  creado_en timestamptz not null default now()
);

create table mantenimientos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  vehiculo_id uuid not null references vehiculos(id) on delete cascade,
  tipo text not null,
  fecha date not null default current_date,
  km int check (km >= 0),
  coste numeric(9,2) not null default 0,
  taller text,
  descripcion text,
  proxima_fecha date,
  proximo_km int,
  creado_en timestamptz not null default now()
);

create table gastos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  vehiculo_id uuid not null references vehiculos(id) on delete cascade,
  fecha date not null default current_date,
  concepto text not null,
  categoria text not null default 'otros'
    check (categoria in ('combustible','reparaciones','mantenimiento','seguro','itv',
                         'impuestos','neumaticos','lavado','aparcamiento','peajes','otros')),
  importe numeric(9,2) not null check (importe >= 0),
  km int check (km >= 0),
  observaciones text,
  -- Si lo genera automáticamente un repostaje, reparación o mantenimiento:
  origen_tabla text,
  origen_id uuid,
  creado_en timestamptz not null default now()
);

create table documentos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  vehiculo_id uuid not null references vehiculos(id) on delete cascade,
  tipo text not null
    check (tipo in ('seguro','itv','impuesto_circulacion','permiso_circulacion','ficha_tecnica','otro')),
  titulo text,
  fecha_vencimiento date,
  observaciones text,
  creado_en timestamptz not null default now()
);

-- Archivos adjuntos (fotos / PDF) de reparaciones, mantenimientos y documentos
create table adjuntos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  vehiculo_id uuid not null references vehiculos(id) on delete cascade,
  tabla_origen text not null check (tabla_origen in ('reparaciones','mantenimientos','documentos')),
  id_origen uuid not null,
  archivo_ruta text not null,
  archivo_nombre text,
  creado_en timestamptz not null default now()
);

-- ---------- 2) ÍNDICES ----------

create index idx_repostajes_vehiculo_km on repostajes(vehiculo_id, km);
create index idx_registros_km_vehiculo_fecha on registros_km(vehiculo_id, fecha);
create index idx_reparaciones_vehiculo_fecha on reparaciones(vehiculo_id, fecha);
create index idx_mantenimientos_vehiculo_fecha on mantenimientos(vehiculo_id, fecha);
create index idx_gastos_vehiculo_fecha on gastos(vehiculo_id, fecha);
create index idx_gastos_origen on gastos(origen_tabla, origen_id);
create index idx_documentos_vencimiento on documentos(vehiculo_id, fecha_vencimiento);

-- ---------- 3) SEGURIDAD (Row Level Security) ----------
-- Cada usuario solo puede ver y modificar sus propias filas.

do $$
declare t text;
begin
  foreach t in array array['vehiculos','repostajes','registros_km','reparaciones',
                           'mantenimientos','gastos','documentos','adjuntos']
  loop
    execute format('alter table %I enable row level security', t);
    execute format(
      'create policy "propietario" on %I for all
         using (usuario_id = auth.uid()) with check (usuario_id = auth.uid())', t);
  end loop;
end $$;

-- ---------- 4) AUTOMATISMOS ----------

-- Repostajes, reparaciones y mantenimientos generan su gasto automáticamente
-- (así el total de gastos nunca se duplica ni se olvida).
create or replace function sincronizar_gasto() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  j jsonb; v_cat text; v_concepto text; v_importe numeric;
begin
  if tg_op = 'DELETE' then
    delete from gastos where origen_tabla = tg_table_name and origen_id = old.id;
    return old;
  end if;

  j := to_jsonb(new);
  if tg_table_name = 'repostajes' then
    v_cat := 'combustible';
    v_concepto := 'Repostaje' || coalesce(' · ' || nullif(j->>'gasolinera',''), '');
    v_importe := (j->>'importe_total')::numeric;
  elsif tg_table_name = 'reparaciones' then
    v_cat := 'reparaciones';
    v_concepto := j->>'descripcion';
    v_importe := (j->>'coste_total')::numeric;
  else
    v_cat := 'mantenimiento';
    v_concepto := j->>'tipo';
    v_importe := (j->>'coste')::numeric;
  end if;

  delete from gastos where origen_tabla = tg_table_name and origen_id = new.id;
  insert into gastos (usuario_id, vehiculo_id, fecha, concepto, categoria, importe, km,
                      origen_tabla, origen_id)
  values (new.usuario_id, new.vehiculo_id, (j->>'fecha')::date, v_concepto, v_cat,
          v_importe, nullif(j->>'km','')::int, tg_table_name, new.id);
  return new;
end $$;

create trigger trg_gasto_repostaje after insert or update or delete on repostajes
  for each row execute function sincronizar_gasto();
create trigger trg_gasto_reparacion after insert or update or delete on reparaciones
  for each row execute function sincronizar_gasto();
create trigger trg_gasto_mantenimiento after insert or update or delete on mantenimientos
  for each row execute function sincronizar_gasto();

-- Los km actuales del vehículo se actualizan solos con el mayor kilometraje
-- registrado en cualquier apartado.
create or replace function actualizar_km_vehiculo() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.km is not null then
    update vehiculos set km_actuales = greatest(km_actuales, new.km)
    where id = new.vehiculo_id;
  end if;
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['repostajes','registros_km','reparaciones','mantenimientos']
  loop
    execute format('create trigger trg_actualizar_km after insert or update on %I
                    for each row execute function actualizar_km_vehiculo()', t);
  end loop;
end $$;

-- ---------- 5) CÁLCULO DE CONSUMO ----------
-- El consumo se calcula SOLO entre dos repostajes completos consecutivos:
-- litros = suma de los litros de todos los repostajes del tramo (incluidos los
-- parciales intermedios y el completo final) / km del tramo * 100.
-- Así los repostajes parciales se registran sin falsear el resultado.

create view v_consumo
with (security_invoker = true) as
with llenos as (
  select r.*,
         lag(r.km) over (partition by r.vehiculo_id order by r.km, r.fecha) as km_lleno_anterior
  from repostajes r
  where r.es_lleno
)
select
  l.id, l.vehiculo_id, l.fecha, l.km,
  l.km_lleno_anterior,
  (l.km - l.km_lleno_anterior) as km_tramo,
  s.litros_tramo,
  round(s.litros_tramo / nullif(l.km - l.km_lleno_anterior, 0) * 100, 2) as l_100km,
  round(s.coste_tramo  / nullif(l.km - l.km_lleno_anterior, 0), 4)       as coste_km
from llenos l
cross join lateral (
  select sum(x.litros) as litros_tramo, sum(x.importe_total) as coste_tramo
  from repostajes x
  where x.vehiculo_id = l.vehiculo_id
    and x.km >  l.km_lleno_anterior
    and x.km <= l.km
) s
where l.km_lleno_anterior is not null
  and l.km > l.km_lleno_anterior;

-- ---------- 6) ALMACENAMIENTO DE ARCHIVOS ----------
-- Bucket privado. Cada usuario solo accede a su carpeta: <usuario_id>/...

insert into storage.buckets (id, name, public)
values ('adjuntos', 'adjuntos', false)
on conflict (id) do nothing;

drop policy if exists "adjuntos_propietario" on storage.objects;
create policy "adjuntos_propietario" on storage.objects for all
  using (bucket_id = 'adjuntos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'adjuntos' and (storage.foldername(name))[1] = auth.uid()::text);
