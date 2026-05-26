-- huyhk.dev — blog posts schema
-- Run this in the Supabase SQL editor: https://supabase.com/dashboard/project/<ref>/sql/new

create extension if not exists "uuid-ossp";

create table if not exists posts (
  id              uuid primary key default uuid_generate_v4(),
  slug            text not null,
  locale          text not null default 'en' check (locale in ('en','vi')),
  title           text not null,
  excerpt         text,
  body            text not null,
  tags            text[] not null default '{}',
  status          text not null default 'draft' check (status in ('draft','published','archived')),
  date            timestamptz,
  word_count      integer,
  reading_minutes integer,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  published_at    timestamptz,
  unique (slug, locale)
);

create index if not exists posts_status_published_at_idx
  on posts (status, published_at desc);

create index if not exists posts_tags_gin_idx
  on posts using gin (tags);

-- updated_at trigger
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists posts_set_updated_at on posts;
create trigger posts_set_updated_at
  before update on posts
  for each row execute procedure set_updated_at();

-- Row Level Security: required because posts lives in the `public` schema,
-- which is exposed via the Data (REST) API.
alter table posts enable row level security;

-- Expose to the Data API for the anon + authenticated roles. Newer Supabase
-- projects don't auto-grant when a table is created via SQL editor, so be
-- explicit. RLS still scopes which rows each role can see.
grant select on posts to anon, authenticated;

-- Public can read only published posts.
drop policy if exists "public_read_published" on posts;
create policy "public_read_published"
  on posts
  for select
  to anon, authenticated
  using (status = 'published');

-- Writes (insert / update / delete) happen only via the secret key on the
-- server, which bypasses RLS. No anon/authenticated write policy by design.

-- Tell PostgREST to refresh its schema cache so the new table is visible to
-- the Data API immediately. Harmless if the dashboard would have done it.
notify pgrst, 'reload schema';
