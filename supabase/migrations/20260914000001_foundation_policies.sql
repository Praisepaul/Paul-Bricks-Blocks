create or replace function public.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid() and is_active = true;
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() = 'owner'::public.app_role;
$$;

create policy "users can read their own profile"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_owner());

create policy "owners can manage profiles"
on public.profiles for all
to authenticated
using (public.is_owner())
with check (public.is_owner());

create policy "authenticated users can read audit events"
on public.audit_events for select
to authenticated
using (true);

create policy "authenticated users can create audit events"
on public.audit_events for insert
to authenticated
with check (actor_user_id = auth.uid());
