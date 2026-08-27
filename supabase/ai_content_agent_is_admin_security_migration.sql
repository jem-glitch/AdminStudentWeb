-- SECURITY: is_admin only needs to inspect the caller's own profile.
-- The existing SELECT RLS policy permits that inspection, so SECURITY INVOKER
-- removes unnecessary SECURITY DEFINER exposure from the public RPC schema.
create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles
    where user_id = auth.uid() and role = 'admin'
  );
$$;
