-- Айдоочулар лигасы: «Даттануу» (Apple 1.2 талабы).
-- Supabase → SQL Editor → ушул файлдын ичин коюп, Run. Бир жолу эле иштетилет. Мурунку таблицаларга тийбейт.
-- Колдонмо: rpc("league_report", {p_id, p_name}). Даттанылган ат ошол адамдын телефонунда дароо бөгөттөлөт;
-- серверде бул жерге жазылат. Карап чыгуу: select * from league_reported_names;

create table if not exists public.league_reports (
  id        bigserial primary key,
  at        timestamptz not null default now(),
  reporter  text not null,          -- даттанган оюнчунун кокус ID'си (адамга байланбайт)
  name      text not null,          -- даттанылган ат
  reviewed  boolean not null default false
);
alter table public.league_reports enable row level security;   -- түз окуу/жазуу жабык, функция аркылуу гана

create or replace function public.league_report(p_id text, p_name text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if coalesce(length(p_id),0) not between 4 and 64 or coalesce(length(p_name),0) not between 1 and 40 then return; end if;
  -- бир оюнчу суткасына 20дан ашык даттана албайт (спам)
  if (select count(*) from league_reports where reporter = p_id and at > now() - interval '1 day') >= 20 then return; end if;
  insert into league_reports(reporter, name) values (p_id, p_name);
end $$;
revoke all on function public.league_report(text, text) from public;
grant execute on function public.league_report(text, text) to anon;

-- Админ үчүн: кайсы ат канча адамдан даттануу алды (24 саатта карап чыгуу үчүн)
create or replace view public.league_reported_names as
  select name, count(distinct reporter) as reporters, max(at) as last_at, bool_and(reviewed) as reviewed
  from league_reports group by name order by reporters desc, last_at desc;
revoke all on public.league_reported_names from anon, authenticated;
