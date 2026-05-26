-- huyhk.dev — user profiles + role
-- Run after 0001_posts.sql.
-- Per Supabase security guidance: roles MUST live in a server-controlled
-- table or in app_metadata, NEVER in user_metadata (user-editable).

create table if not exists profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text not null,
  display_name  text,
  role          text not null default 'customer' check (role in ('customer','author','admin')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists profiles_role_idx on profiles (role);

-- updated_at trigger (reuse function from 0001_posts.sql)
drop trigger if exists profiles_set_updated_at on profiles;
create trigger profiles_set_updated_at
  before update on profiles
  for each row execute procedure set_updated_at();

-- Auto-create profile row on signup
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- RLS
alter table profiles enable row level security;

-- Public read: hide email + role from anonymous. Only show display_name.
-- We do this by exposing a view (not enabling anon select on profiles directly).
drop view if exists public_profiles;
create view public_profiles
  with (security_invoker = true)
  as
  select id, display_name, created_at
  from profiles;

grant select on public_profiles to anon, authenticated;

-- Authenticated user: see their own full row
grant select, update on profiles to authenticated;

drop policy if exists "profile_self_read" on profiles;
create policy "profile_self_read"
  on profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "profile_self_update" on profiles;
create policy "profile_self_update"
  on profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Prevent self-promotion via column-level grant. The role column can only be
-- changed by the service-role key (which bypasses RLS and column grants).
revoke update on profiles from authenticated;
grant update (display_name) on profiles to authenticated;

-- Helper: is the current user admin? Used in policies for posts.
create or replace function is_admin()
returns boolean
language sql
stable
security invoker
set search_path = public, auth
as $$
  select exists (
    select 1 from profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- Posts: extend RLS so admins can write through the Data API (not just
-- through the secret key on the server). Keeps the public_read_published
-- policy from 0001 intact.
drop policy if exists "admin_write_posts" on posts;
create policy "admin_write_posts"
  on posts
  for all
  to authenticated
  using (is_admin())
  with check (is_admin());

grant insert, update, delete on posts to authenticated;

notify pgrst, 'reload schema';
