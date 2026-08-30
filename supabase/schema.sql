-- Meu Fluxo de Caixa — schema inicial
-- Rode este script no SQL Editor do seu projeto Supabase.

create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  iniciais text,
  created_at timestamptz not null default now()
);

create table if not exists public.receitas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references public.clientes(id) on delete set null,
  descricao text not null,
  valor numeric(12,2) not null,
  data date not null default current_date,
  status text not null default 'recebida',
  created_at timestamptz not null default now()
);

create table if not exists public.despesas (
  id uuid primary key default gen_random_uuid(),
  fornecedor text not null,
  descricao text not null,
  valor numeric(12,2) not null,
  data date not null default current_date,
  status text not null default 'paga',
  created_at timestamptz not null default now()
);

create table if not exists public.cobrancas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references public.clientes(id) on delete set null,
  descricao text not null,
  valor numeric(12,2) not null,
  vencimento date not null,
  status text not null default 'pendente',
  created_at timestamptz not null default now()
);

alter table public.clientes enable row level security;
alter table public.receitas enable row level security;
alter table public.despesas enable row level security;
alter table public.cobrancas enable row level security;

-- Acesso público de leitura/escrita por enquanto (sem auth ainda).
-- Quando adicionarmos login, trocamos por políticas por usuário.
create policy "acesso total anon" on public.clientes for all to anon using (true) with check (true);
create policy "acesso total anon" on public.receitas for all to anon using (true) with check (true);
create policy "acesso total anon" on public.despesas for all to anon using (true) with check (true);
create policy "acesso total anon" on public.cobrancas for all to anon using (true) with check (true);
