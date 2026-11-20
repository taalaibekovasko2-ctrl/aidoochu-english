-- «Жол Эсеп» AI: daily request counter (hashed IP only). Run once in Supabase → SQL Editor.
create table if not exists public.ai_usage (ip text not null, day date not null default current_date, n int not null default 0, primary key (ip, day));
alter table public.ai_usage enable row level security; -- no public policies: only the function (service role) can touch it
create or replace function public.ai_hit(p_ip text, p_limit int) returns boolean language plpgsql security definer set search_path = public as $$
declare c int;
begin
  insert into ai_usage(ip, day, n) values (p_ip, current_date, 1)
  on conflict (ip, day) do update set n = ai_usage.n + 1 returning n into c;
  delete from ai_usage where day < current_date - 7;
  return c <= p_limit;
end $$;
revoke all on function public.ai_hit(text, int) from public, anon, authenticated;
