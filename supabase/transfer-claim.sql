-- Сайттан iPhone колдонмосуна көчүрүү: бир сатып алуу (бир түзмөк ID'си) эң көп 3 колдонмого гана өтөт.
-- Supabase → SQL Editor → Run. Бир жолу иштетилет, кайра иштетсе да зыяны жок. Мурунку маалыматка тийбейт (DROP/DELETE жок).
-- Колдонмо: rpc("transfer_claim", {p_did, p_install}) → true (уруксат) же false (чек толду).
-- Бул файл иштетилгенге чейин функция жок болот: колдонмо 404 алат жана көчүрүүнү бөгөттөбөйт (мурдагыдай иштейт).
-- Колдонуучуга жардам керек болсо (мисалы, телефонун алмаштырса), админ бул сап менен тазалайт:
--   delete from transfer_claims where did = 'XXXX-XXXX';

create table if not exists public.transfer_claims (
  did      text not null check (did ~ '^[A-Z0-9]{4}-[A-Z0-9]{4}$'),   -- сайттагы түзмөк ID'си (адамга байланбайт)
  install  text not null check (length(install) between 8 and 64),    -- колдонмонун кокус орнотуу ID'си
  at       timestamptz not null default now(),
  primary key (did, install)
);
create index if not exists transfer_claims_at_idx on public.transfer_claims (at);
alter table public.transfer_claims enable row level security;          -- түз кирүү жабык, функция аркылуу гана
revoke all on table public.transfer_claims from anon, authenticated;

create or replace function public.transfer_claim(p_did text, p_install text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if coalesce(p_did, '') !~ '^[A-Z0-9]{4}-[A-Z0-9]{4}$' or coalesce(length(p_install), 0) not between 8 and 64 then return false; end if;
  if exists (select 1 from transfer_claims where did = p_did and install = p_install) then return true; end if;   -- ошол эле колдонмо кайра
  if (select count(*) from transfer_claims where did = p_did) >= 3 then return false; end if;                     -- чек: 3 колдонмо
  if (select count(*) from transfer_claims where at > now() - interval '1 hour') >= 500 then return false; end if; -- спамга жалпы чек
  insert into transfer_claims(did, install) values (p_did, p_install) on conflict do nothing;
  return true;
end $$;
revoke all on function public.transfer_claim(text, text) from public, anon, authenticated;
grant execute on function public.transfer_claim(text, text) to anon, authenticated;
