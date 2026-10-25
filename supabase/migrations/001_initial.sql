-- Run in Supabase with pgvector available. All data in this demonstration must be synthetic.
create extension if not exists vector with schema extensions;
create table if not exists public.clinics (id uuid primary key default gen_random_uuid(), name text not null);
create table if not exists public.clinic_members (clinic_id uuid not null references public.clinics(id), user_id uuid not null references auth.users(id), role text not null check (role in ('admin','staff')), primary key(clinic_id,user_id));
create table if not exists public.knowledge_chunks (id uuid primary key default gen_random_uuid(), clinic_id uuid not null references public.clinics(id), source_id text not null, content text not null, embedding extensions.vector(1536), created_at timestamptz not null default now());
create index if not exists knowledge_chunks_clinic_idx on public.knowledge_chunks(clinic_id);
alter table public.clinics enable row level security;
alter table public.clinic_members enable row level security;
alter table public.knowledge_chunks enable row level security;
create policy "clinic member reads clinics" on public.clinics for select to authenticated using (exists(select 1 from public.clinic_members m where m.clinic_id=id and m.user_id=(select auth.uid())));
create policy "member reads own membership" on public.clinic_members for select to authenticated using (user_id=(select auth.uid()));
create policy "member reads own chunks" on public.knowledge_chunks for select to authenticated using (exists(select 1 from public.clinic_members m where m.clinic_id=knowledge_chunks.clinic_id and m.user_id=(select auth.uid())));
-- Writes should be mediated by trusted server-side endpoints with explicit authorization checks.