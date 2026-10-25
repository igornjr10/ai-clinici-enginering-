-- Requires 001_initial.sql and pgvector. Execute with the authenticated user JWT.
-- This invoker function respects knowledge_chunks RLS. Never use service_role for user searches.
create index if not exists knowledge_chunks_fts_idx
on public.knowledge_chunks using gin (to_tsvector('portuguese', coalesce(content,'')));

create or replace function public.search_clinic_knowledge(
  p_clinic_id uuid,
  p_query text,
  p_embedding extensions.vector(1536),
  p_limit integer default 8
)
returns table (id uuid, clinic_id uuid, source_id text, content text, score double precision)
language sql stable security invoker
set search_path = ''
as $$
  with authorized as (
    select k.id,k.clinic_id,k.source_id,k.content,k.embedding
    from public.knowledge_chunks k
    where k.clinic_id = p_clinic_id
      and exists (select 1 from public.clinic_members m
                  where m.clinic_id = k.clinic_id and m.user_id = (select auth.uid()))
  ), semantic as (
    select id, row_number() over (order by embedding <=> p_embedding, id) as rank
    from authorized where embedding is not null and p_embedding is not null
    order by embedding <=> p_embedding, id limit 40
  ), lexical as (
    select id, row_number() over (order by ts_rank_cd(to_tsvector('portuguese', content), plainto_tsquery('portuguese',p_query)) desc, id) as rank
    from authorized
    where nullif(trim(p_query),'') is not null
      and to_tsvector('portuguese',content) @@ plainto_tsquery('portuguese',p_query)
    order by ts_rank_cd(to_tsvector('portuguese',content), plainto_tsquery('portuguese',p_query)) desc, id limit 40
  ), fused as (
    select id, sum(part) as score from (
      select id, 1.0/(60+rank) as part from semantic
      union all
      select id, 1.0/(60+rank) as part from lexical
    ) x group by id
  )
  select a.id,a.clinic_id,a.source_id,a.content,f.score
  from fused f join authorized a on a.id=f.id
  order by f.score desc,a.id limit least(greatest(p_limit,1),20);
$$;
revoke all on function public.search_clinic_knowledge(uuid,text,extensions.vector,integer) from public,anon;
grant execute on function public.search_clinic_knowledge(uuid,text,extensions.vector,integer) to authenticated;