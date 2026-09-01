-- ============================================================
-- Fluxo — Etapa 1: fundação (perfis, organizações, membros)
-- Rode este script no SQL Editor do seu projeto Supabase.
-- Idempotente: pode ser executado novamente com segurança.
-- ============================================================

-- ------------------------------------------------------------
-- 0. Limpeza das políticas abertas da versão anterior (inseguras)
-- ------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['clientes', 'receitas', 'despesas', 'cobrancas'] loop
    if to_regclass('public.' || t) is not null then
      execute format('drop policy if exists "acesso total anon" on public.%I', t);
      execute format('revoke all on public.%I from anon', t);
      execute format('alter table public.%I enable row level security', t);
    end if;
  end loop;
end $$;

-- ------------------------------------------------------------
-- 1. Tipos
-- ------------------------------------------------------------
do $$ begin
  create type public.org_role as enum ('owner', 'admin', 'member');
exception when duplicate_object then null; end $$;

-- ------------------------------------------------------------
-- 2. Utilitário: updated_at
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ------------------------------------------------------------
-- 3. Perfis (1:1 com auth.users)
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Cria o perfil automaticamente no cadastro
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- 4. Organizações (workspaces)
-- ------------------------------------------------------------
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 120),
  currency text not null default 'BRL' check (currency in ('BRL', 'USD', 'EUR')),
  timezone text not null default 'America/Sao_Paulo',
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update on public.organizations to authenticated;
grant all on public.organizations to service_role;
alter table public.organizations enable row level security;

drop trigger if exists organizations_set_updated_at on public.organizations;
create trigger organizations_set_updated_at before update on public.organizations
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- 5. Membros da organização
-- ------------------------------------------------------------
create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.org_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index if not exists organization_members_user_idx on public.organization_members(user_id);

grant select, insert on public.organization_members to authenticated;
grant all on public.organization_members to service_role;
alter table public.organization_members enable row level security;

-- ------------------------------------------------------------
-- 6. Funções de autorização (security definer, evitam recursão de RLS)
-- ------------------------------------------------------------
create or replace function public.is_org_member(_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = _org_id and m.user_id = auth.uid()
  );
$$;

create or replace function public.has_org_role(_org_id uuid, _roles public.org_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = _org_id
      and m.user_id = auth.uid()
      and m.role = any(_roles)
  );
$$;

-- ------------------------------------------------------------
-- 7. Políticas de organizações e membros
-- ------------------------------------------------------------
drop policy if exists "orgs_select_member" on public.organizations;
create policy "orgs_select_member" on public.organizations
  for select to authenticated using (public.is_org_member(id));

drop policy if exists "orgs_insert_own" on public.organizations;
create policy "orgs_insert_own" on public.organizations
  for insert to authenticated with check (created_by = auth.uid());

drop policy if exists "orgs_update_admin" on public.organizations;
create policy "orgs_update_admin" on public.organizations
  for update to authenticated
  using (public.has_org_role(id, array['owner', 'admin']::public.org_role[]))
  with check (public.has_org_role(id, array['owner', 'admin']::public.org_role[]));

drop policy if exists "members_select_same_org" on public.organization_members;
create policy "members_select_same_org" on public.organization_members
  for select to authenticated using (public.is_org_member(organization_id));

-- Um usuário só pode se inserir como owner de uma organização que ele criou
-- (demais convites virão em etapas futuras, via backend confiável).
drop policy if exists "members_insert_self_owner" on public.organization_members;
create policy "members_insert_self_owner" on public.organization_members
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and role = 'owner'
    and exists (
      select 1 from public.organizations o
      where o.id = organization_id and o.created_by = auth.uid()
    )
  );

-- ------------------------------------------------------------
-- 8. Criação atômica da organização + vínculo do owner
-- ------------------------------------------------------------
create or replace function public.create_organization(_name text, _currency text default 'BRL')
returns public.organizations
language plpgsql
security definer
set search_path = public
as $$
declare
  _uid uuid := auth.uid();
  _org public.organizations;
begin
  if _uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  insert into public.organizations (name, currency, created_by)
  values (trim(_name), coalesce(nullif(_currency, ''), 'BRL'), _uid)
  returning * into _org;

  insert into public.organization_members (organization_id, user_id, role)
  values (_org.id, _uid, 'owner');

  return _org;
end;
$$;

revoke all on function public.create_organization(text, text) from public;
grant execute on function public.create_organization(text, text) to authenticated;

-- ============================================================
-- 9. Módulos financeiros (multi-tenant por organização)
-- ATENÇÃO: remove as tabelas de demonstração da primeira versão
-- (clientes/receitas/despesas/cobrancas sem organization_id).
-- ============================================================
do $$
begin
  if to_regclass('public.clientes') is not null
     and not exists (
       select 1 from information_schema.columns
       where table_schema = 'public' and table_name = 'clientes'
         and column_name = 'organization_id'
     ) then
    drop table if exists public.cobrancas cascade;
    drop table if exists public.receitas cascade;
    drop table if exists public.despesas cascade;
    drop table if exists public.clientes cascade;
  end if;
end $$;

do $$ begin
  create type public.tx_tipo as enum ('receita', 'despesa');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.tx_status as enum ('pendente', 'pago');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.cobranca_status as enum ('pendente', 'pago', 'cancelado');
exception when duplicate_object then null; end $$;

-- --------------------------- clientes ---------------------------
create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  nome text not null check (char_length(trim(nome)) between 2 and 160),
  email text,
  telefone text,
  documento text,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists clientes_org_idx on public.clientes(organization_id);

-- --------------------------- categorias ---------------------------
create table if not exists public.categorias (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  nome text not null check (char_length(trim(nome)) between 2 and 80),
  tipo public.tx_tipo not null,
  created_at timestamptz not null default now(),
  unique (organization_id, nome, tipo)
);
create index if not exists categorias_org_idx on public.categorias(organization_id);

-- --------------------------- contas ---------------------------
create table if not exists public.contas (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  nome text not null check (char_length(trim(nome)) between 2 and 80),
  saldo_inicial numeric(14,2) not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists contas_org_idx on public.contas(organization_id);

-- --------------------------- cobranças ---------------------------
create table if not exists public.cobrancas (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  cliente_id uuid references public.clientes(id) on delete set null,
  descricao text not null check (char_length(trim(descricao)) between 2 and 200),
  valor numeric(14,2) not null check (valor > 0),
  vencimento date not null,
  status public.cobranca_status not null default 'pendente',
  pago_em date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists cobrancas_org_idx on public.cobrancas(organization_id, vencimento);

-- --------------------------- transações ---------------------------
create table if not exists public.transacoes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  tipo public.tx_tipo not null,
  descricao text not null check (char_length(trim(descricao)) between 2 and 200),
  valor numeric(14,2) not null check (valor > 0),
  data date not null default current_date,
  status public.tx_status not null default 'pago',
  cliente_id uuid references public.clientes(id) on delete set null,
  categoria_id uuid references public.categorias(id) on delete set null,
  conta_id uuid references public.contas(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists transacoes_org_idx on public.transacoes(organization_id, data desc);

-- --------------------------- grants + RLS + triggers ---------------------------
do $$
declare t text;
begin
  foreach t in array array['clientes', 'categorias', 'contas', 'cobrancas', 'transacoes'] loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists "%1$s_select" on public.%1$I', t);
    execute format(
      'create policy "%1$s_select" on public.%1$I for select to authenticated using (public.is_org_member(organization_id))', t);

    execute format('drop policy if exists "%1$s_insert" on public.%1$I', t);
    execute format(
      'create policy "%1$s_insert" on public.%1$I for insert to authenticated with check (public.is_org_member(organization_id))', t);

    execute format('drop policy if exists "%1$s_update" on public.%1$I', t);
    execute format(
      'create policy "%1$s_update" on public.%1$I for update to authenticated using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id))', t);

    execute format('drop policy if exists "%1$s_delete" on public.%1$I', t);
    execute format(
      'create policy "%1$s_delete" on public.%1$I for delete to authenticated using (public.has_org_role(organization_id, array[''owner'',''admin'']::public.org_role[]))', t);

    if t <> 'categorias' and t <> 'contas' then
      execute format('drop trigger if exists %1$s_set_updated_at on public.%1$I', t);
      execute format(
        'create trigger %1$s_set_updated_at before update on public.%1$I for each row execute function public.set_updated_at()', t);
    end if;
  end loop;
end $$;

-- --------------------------- categorias padrão na criação da org ---------------------------
create or replace function public.seed_org_defaults()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.categorias (organization_id, nome, tipo) values
    (new.id, 'Serviços', 'receita'),
    (new.id, 'Produtos', 'receita'),
    (new.id, 'Outras receitas', 'receita'),
    (new.id, 'Software e assinaturas', 'despesa'),
    (new.id, 'Impostos e taxas', 'despesa'),
    (new.id, 'Marketing', 'despesa'),
    (new.id, 'Outras despesas', 'despesa')
  on conflict do nothing;

  insert into public.contas (organization_id, nome) values (new.id, 'Conta principal');
  return new;
end;
$$;

drop trigger if exists organizations_seed_defaults on public.organizations;
create trigger organizations_seed_defaults after insert on public.organizations
  for each row execute function public.seed_org_defaults();

-- ============================================================
-- Mercado Pago: colunas de integração em cobrancas
-- ============================================================
alter table public.cobrancas add column if not exists mp_preference_id text;
alter table public.cobrancas add column if not exists mp_payment_id text;
alter table public.cobrancas add column if not exists link_pagamento text;
create index if not exists cobrancas_mp_payment_idx on public.cobrancas(mp_payment_id);
