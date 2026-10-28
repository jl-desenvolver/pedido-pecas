-- Pedido de Peças Embritech - estrutura do banco (Supabase)
-- Cole tudo no SQL Editor do Supabase e clique em Run.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text, nome text,
  papel text not null default 'tecnico' check (papel in ('admin','almoxarifado','tecnico')),
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, nome)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'nome', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.profiles (id, email, nome)
  select id, email, split_part(email,'@',1) from auth.users on conflict (id) do nothing;

create or replace function public.meu_papel() returns text
language sql stable security definer set search_path = public as $$
  select papel from public.profiles where id = auth.uid() and ativo
$$;

create table if not exists public.clientes (
  id text primary key, dados jsonb not null,
  criado_por uuid default auth.uid(), atualizado_em timestamptz default now()
);
create table if not exists public.pedidos (
  id uuid primary key default gen_random_uuid(),
  n bigint generated always as identity,
  criado_por uuid not null default auth.uid(),
  criado_em timestamptz not null default now(),
  status text not null default 'pendente',
  dados jsonb not null
);
create table if not exists public.config (
  chave text primary key, valor jsonb not null,
  atualizado_por uuid default auth.uid(), atualizado_em timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.clientes enable row level security;
alter table public.pedidos  enable row level security;
alter table public.config   enable row level security;
revoke all on public.profiles, public.clientes, public.pedidos, public.config from anon;

-- perfis
create policy perfis_ler on public.profiles for select to authenticated
  using (meu_papel() is not null or id = auth.uid());
create policy perfis_admin on public.profiles for update to authenticated
  using (meu_papel() = 'admin') with check (meu_papel() = 'admin');
-- clientes: qualquer usuario ativo le/cria/edita; so admin exclui
create policy cli_ler on public.clientes for select to authenticated using (meu_papel() is not null);
create policy cli_ins on public.clientes for insert to authenticated with check (meu_papel() is not null);
create policy cli_upd on public.clientes for update to authenticated using (meu_papel() is not null) with check (meu_papel() is not null);
create policy cli_del on public.clientes for delete to authenticated using (meu_papel() = 'admin');
-- pedidos: tecnico ve so os seus; almoxarifado/admin veem todos
create policy ped_ler on public.pedidos for select to authenticated
  using (meu_papel() in ('admin','almoxarifado') or (criado_por = auth.uid() and meu_papel() is not null));
create policy ped_ins on public.pedidos for insert to authenticated
  with check (meu_papel() is not null and criado_por = auth.uid());
create policy ped_upd on public.pedidos for update to authenticated
  using (meu_papel() in ('admin','almoxarifado')) with check (meu_papel() in ('admin','almoxarifado'));
create policy ped_del on public.pedidos for delete to authenticated using (meu_papel() = 'admin');
-- configuracoes do catalogo (categorias, edicoes, fotos)
create policy cfg_ler on public.config for select to authenticated using (meu_papel() is not null);
create policy cfg_ins on public.config for insert to authenticated with check (meu_papel() in ('admin','almoxarifado'));
create policy cfg_upd on public.config for update to authenticated
  using (meu_papel() in ('admin','almoxarifado')) with check (meu_papel() in ('admin','almoxarifado'));

-- DEPOIS de criar o seu usuario em Authentication > Users, torne-se administrador
-- (troque pelo seu e-mail e rode so esta linha):
-- update public.profiles set papel = 'admin' where email = 'SEU@EMAIL.COM';
