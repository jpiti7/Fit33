-- v8: el perfil editable usa la tabla user_preferences existente.
-- No requiere columnas nuevas: todos los campos editables ya existen allí.
-- Esta migración deja constancia del contrato de datos de v8.
begin;
comment on table public.user_preferences is 'Preferencias y objetivos editables por el usuario desde Fit33.';
commit;
