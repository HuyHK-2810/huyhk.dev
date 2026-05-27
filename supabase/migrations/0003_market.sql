-- huyhk.dev — Market: categories + products (Phase 1)
-- Phase 2 (orders / cart / checkout) lives in a future migration.

-- ─────────────────────────────────────────────────────────────────
-- Categories — Books, Themes, AI Workflows, Tools, ...
-- ─────────────────────────────────────────────────────────────────

create table if not exists market_categories (
  id            uuid primary key default uuid_generate_v4(),
  slug          text not null unique,
  name          text not null,
  description   text,
  icon          text,                    -- lucide icon name, e.g. 'book', 'palette', 'workflow'
  accent_color  text,                    -- hex, optional category accent (defaults to ember)
  sort_order    integer not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists market_categories_active_sort_idx
  on market_categories (is_active, sort_order);

drop trigger if exists market_categories_set_updated_at on market_categories;
create trigger market_categories_set_updated_at
  before update on market_categories
  for each row execute procedure set_updated_at();

-- Seed: the four launch categories. Slugs are stable — products reference by slug.
insert into market_categories (slug, name, description, icon, sort_order) values
  ('books',         'Books',          'Long-form essays and field reports from 9 years of shipping.', 'book-open',  10),
  ('themes',        'Themes',         'Next.js + Tailwind themes you can ship in an afternoon.',    'palette',    20),
  ('ai-workflows',  'AI Workflows',   'Claude / Vercel / agent workflows ready to drop into your stack.', 'workflow', 30),
  ('tools',         'Tools',          'CLIs and small utilities for engineers.',                    'wrench',     40)
on conflict (slug) do nothing;


-- ─────────────────────────────────────────────────────────────────
-- Products
-- ─────────────────────────────────────────────────────────────────

create table if not exists market_products (
  id                       uuid primary key default uuid_generate_v4(),
  slug                     text not null,
  category_id              uuid not null references market_categories(id) on delete restrict,

  -- Display
  title                    text not null,
  subtitle                 text,
  short_description        text,                -- card display, ≤ 200 chars
  description              text not null,       -- long-form markdown
  cover_url                text,                -- hero / card image
  gallery                  jsonb not null default '[]'::jsonb, -- additional image URLs

  -- Pricing
  price_cents              integer not null,    -- in smallest currency unit (e.g. 4900 = $49)
  compare_at_price_cents   integer,             -- for "was $X" display
  currency                 text not null default 'USD',

  -- Product nature
  product_type             text not null default 'digital' check (product_type in ('digital','physical','service')),

  -- Digital fulfillment placeholders (used in Phase 2)
  download_url             text,                -- private file URL or signed URL template
  license_template         text,                -- license terms shown at purchase

  -- Lifecycle
  status                   text not null default 'draft' check (status in ('draft','published','archived')),
  featured                 boolean not null default false,
  tags                     text[] not null default '{}',

  -- Category-specific fields go here. Examples:
  --   books:       { pages: 220, format: ["pdf","epub"], isbn: "..." }
  --   themes:      { demo_url: "https://demo.huyhk.dev/x", framework: "nextjs", lighthouse: 98 }
  --   ai-workflows:{ platform: "claude-code", trigger: "webhook", runtime: "node" }
  --   tools:       { binary: "github-release", platforms: ["macos","linux"] }
  metadata                 jsonb not null default '{}'::jsonb,

  -- Stripe linkage (populated when Phase 2 lands)
  stripe_product_id        text,
  stripe_price_id          text,

  -- Counters (cheap, used for sorting)
  view_count               integer not null default 0,
  purchase_count           integer not null default 0,

  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  published_at             timestamptz,

  unique (slug, category_id)
);

create index if not exists market_products_status_published_idx
  on market_products (status, published_at desc);

create index if not exists market_products_category_status_idx
  on market_products (category_id, status, published_at desc);

create index if not exists market_products_featured_idx
  on market_products (featured, published_at desc)
  where featured = true and status = 'published';

create index if not exists market_products_tags_gin_idx
  on market_products using gin (tags);

drop trigger if exists market_products_set_updated_at on market_products;
create trigger market_products_set_updated_at
  before update on market_products
  for each row execute procedure set_updated_at();


-- ─────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────

alter table market_categories enable row level security;
alter table market_products   enable row level security;

-- Categories: everyone reads active categories (RLS still gates inactive ones)
grant select on market_categories to anon, authenticated;
drop policy if exists "public_read_active_categories" on market_categories;
create policy "public_read_active_categories"
  on market_categories
  for select
  to anon, authenticated
  using (is_active = true);

-- Products: everyone reads published products
grant select on market_products to anon, authenticated;
drop policy if exists "public_read_published_products" on market_products;
create policy "public_read_published_products"
  on market_products
  for select
  to anon, authenticated
  using (status = 'published');

-- Admin writes go through the service-role key — bypass RLS.
-- We additionally grant authenticated admins (role='admin' in profiles)
-- to write through the Data API so /admin can use the same auth flow as posts.
grant insert, update, delete on market_categories to authenticated;
grant insert, update, delete on market_products   to authenticated;

drop policy if exists "admin_write_categories" on market_categories;
create policy "admin_write_categories"
  on market_categories
  for all
  to authenticated
  using (is_admin())
  with check (is_admin());

drop policy if exists "admin_write_products" on market_products;
create policy "admin_write_products"
  on market_products
  for all
  to authenticated
  using (is_admin())
  with check (is_admin());

notify pgrst, 'reload schema';
