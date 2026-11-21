-- Айдоочулар лигасы: «Даттануу» (Apple 1.2 талабы).
-- Supabase → SQL Editor → ушул файлдын ичин коюп, Run. Бир жолу эле иштетилет. Кайра иштетсе да зыяны жок.
-- Мурунку таблицаларга жана маалыматтарга тийбейт: DROP / DELETE / TRUNCATE жок, жаңы объекттер гана түзүлөт.
-- Колдонмо: rpc("league_report", {p_id, p_name}). Даттанылган ат ошол адамдын телефонунда дароо бөгөттөлөт,
-- серверде бул жерге жазылат. Карап чыгуу (админ, Supabase Dashboard'дон): select * from league_reported_names;

create table if not exists public.league_reports (
  id        bigserial primary key,
  at        timestamptz not null default now(),
  reporter  text not null check (length(reporter) between 4 and 64),   -- даттанган оюнчунун кокус ID'си (адамга байланбайт)
  name      text not null check (length(name) between 1 and 40),       -- даттанылган ат
  reviewed  boolean not null default false
);
create index if not exists league_reports_at_idx on public.league_reports (at);
create index if not exists league_reports_reporter_idx on public.league_reports (reporter, at);

-- Түз кирүү жабык: RLS күйгүзүлгөн, саясат (policy) жок → anon/authenticated таблицаны окуй да, жаза да албайт.
alter table public.league_reports enable row level security;
revoke all on table public.league_reports from anon, authenticated;
revoke all on sequence public.league_reports_id_seq from anon, authenticated;

create or replace function public.league_report(p_id text, p_name text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_name text := btrim(coalesce(p_name, ''));
begin
  if coalesce(length(p_id), 0) not between 4 and 64 or length(v_name) not between 1 and 40 then return; end if;
  -- бир оюнчу суткасына 20дан ашык даттана албайт
  if (select count(*) from league_reports where reporter = p_id and at > now() - interval '1 day') >= 20 then return; end if;
  -- кокус ID'лерди алмаштырып спам кылууга жалпы чек: саатына 300дөн ашык эмес
  if (select count(*) from league_reports where at > now() - interval '1 hour') >= 300 then return; end if;
  -- бир эле адам бир эле атка бир гана жолу даттанат
  if exists (select 1 from league_reports where reporter = p_id and name = v_name) then return; end if;
  insert into league_reports(reporter, name) values (p_id, v_name);
end $$;
revoke all on function public.league_report(text, text) from public, anon, authenticated;
grant execute on function public.league_report(text, text) to anon, authenticated;

-- Админ үчүн: кайсы ат канча адамдан даттануу алды (24 саатта карап чыгуу үчүн).
-- security_invoker: көрүнүш аны окуган адамдын укугу менен иштейт, RLS'ти айланып өтпөйт; anon'го жабык.
create or replace view public.league_reported_names with (security_invoker = true) as
  select name, count(distinct reporter) as reporters, max(at) as last_at, bool_and(reviewed) as reviewed
  from league_reports group by name order by reporters desc, last_at desc;
revoke all on public.league_reported_names from public, anon, authenticated;
