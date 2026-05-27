-- huyhk.dev — Market v2: full feature set
--
-- Adds to v1 (0003_market.sql):
--   - market_products: stock_count, demo_url, preview_files, download_files
--   - market_fx_rates: cached FX rates for display-time conversion (single base price)
--   - market_orders + market_order_items: order lifecycle
--   - market_refunds: self-service + admin
--   - market_discount_codes + market_discount_uses: coupons
--   - market_affiliates + market_affiliate_clicks + market_affiliate_payouts
--   - market_product_reviews: 1-5 rating + body, gated by ownership
--
-- Single base-price strategy: each product has ONE price + currency. UI
-- converts to display currency on the fly using the latest fx_rates row.

-- ─────────────────────────────────────────────────────────────────
-- Extend market_products
-- ─────────────────────────────────────────────────────────────────

alter table market_products
  add column if not exists stock_count    integer not null default 999,
  add column if not exists demo_url       text,
  add column if not exists preview_files  jsonb   not null default '[]'::jsonb,
  add column if not exists download_files jsonb   not null default '[]'::jsonb;

-- preview_files / download_files shape:
--   [{ name: "Chapter 1.pdf", r2_key: "products/<id>/preview/ch1.pdf",
--      size: 1234567, mime: "application/pdf" }]

-- Out-of-stock guard helper: counters can never go negative.
create or replace function market_decrement_stock(p_product_id uuid, p_qty int default 1)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update market_products
     set stock_count = stock_count - p_qty,
         purchase_count = purchase_count + p_qty
   where id = p_product_id
     and stock_count >= p_qty;
  if not found then
    raise exception 'out_of_stock' using errcode = 'P0001';
  end if;
end;
$$;


-- ─────────────────────────────────────────────────────────────────
-- FX rates (refreshed by cron, used at display time)
-- ─────────────────────────────────────────────────────────────────

create table if not exists market_fx_rates (
  base_currency  text not null,
  quote_currency text not null,
  rate           numeric(18, 8) not null,
  fetched_at     timestamptz not null default now(),
  primary key (base_currency, quote_currency)
);

-- Seed: USD as base, current approximate rates. Cron refreshes from
-- exchangerate.host (or similar) daily.
insert into market_fx_rates (base_currency, quote_currency, rate) values
  ('USD', 'USD',  1.0),
  ('USD', 'VND',  25000.0),
  ('USD', 'EUR',  0.92),
  ('USD', 'GBP',  0.79),
  ('USD', 'JPY',  155.0)
on conflict (base_currency, quote_currency) do nothing;

alter table market_fx_rates enable row level security;
grant select on market_fx_rates to anon, authenticated;
drop policy if exists "public_read_fx" on market_fx_rates;
create policy "public_read_fx"
  on market_fx_rates for select to anon, authenticated using (true);


-- ─────────────────────────────────────────────────────────────────
-- Orders
-- ─────────────────────────────────────────────────────────────────

create table if not exists market_orders (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid references auth.users(id) on delete set null,
  email                 text not null,
  status                text not null default 'pending'
                          check (status in ('pending','paid','failed','refunded','partially_refunded','cancelled')),

  -- Pricing snapshot in base currency (always USD)
  subtotal_cents        integer not null,
  discount_cents        integer not null default 0,
  total_cents           integer not null,
  currency              text not null default 'USD',

  -- Buyer-facing display currency + locked rate at checkout
  display_currency      text not null default 'USD',
  display_rate          numeric(18, 8) not null default 1.0,

  -- Payment routing
  payment_provider      text not null check (payment_provider in ('stripe','wise','vnpay','momo','manual')),
  payment_intent_id     text,            -- Stripe PI / VNPay txn / Momo orderId
  payment_session_id    text unique,     -- Stripe Checkout session, VNPay request id, etc.

  -- Marketing attribution (set at order create)
  discount_code         text,            -- snapshot — even if code is later deleted
  affiliate_slug        text,            -- snapshot

  metadata              jsonb not null default '{}'::jsonb,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  paid_at               timestamptz,
  refunded_at           timestamptz
);

create index if not exists market_orders_user_status_idx     on market_orders (user_id, status, created_at desc);
create index if not exists market_orders_status_paid_idx     on market_orders (status, paid_at desc);
create index if not exists market_orders_email_idx           on market_orders (email);
create index if not exists market_orders_affiliate_slug_idx  on market_orders (affiliate_slug) where affiliate_slug is not null;

drop trigger if exists market_orders_set_updated_at on market_orders;
create trigger market_orders_set_updated_at
  before update on market_orders
  for each row execute procedure set_updated_at();


-- ─────────────────────────────────────────────────────────────────
-- Order items (line items)
-- ─────────────────────────────────────────────────────────────────

create table if not exists market_order_items (
  id                     uuid primary key default uuid_generate_v4(),
  order_id               uuid not null references market_orders(id) on delete cascade,
  product_id             uuid not null references market_products(id) on delete restrict,

  -- Snapshot at purchase time
  product_title          text not null,
  product_slug           text not null,
  category_slug          text not null,
  unit_price_cents       integer not null,
  quantity               integer not null default 1,

  -- Download bookkeeping
  download_count         integer not null default 0,
  last_downloaded_at     timestamptz,

  -- Optional per-item license
  license_key            text,

  created_at             timestamptz not null default now()
);

create index if not exists market_order_items_order_idx   on market_order_items (order_id);
create index if not exists market_order_items_product_idx on market_order_items (product_id);


-- ─────────────────────────────────────────────────────────────────
-- Refunds
-- ─────────────────────────────────────────────────────────────────

create table if not exists market_refunds (
  id                  uuid primary key default uuid_generate_v4(),
  order_id            uuid not null references market_orders(id) on delete cascade,
  amount_cents        integer not null,
  currency            text not null,
  reason              text,
  -- 'self_service' = user clicked refund within 14 days
  -- 'admin'        = admin issued
  -- 'fraud'        = chargeback / dispute
  source              text not null check (source in ('self_service','admin','fraud')),
  status              text not null default 'pending' check (status in ('pending','succeeded','failed')),
  provider_refund_id  text,             -- Stripe refund id, etc.
  initiated_by        uuid references auth.users(id) on delete set null,
  created_at          timestamptz not null default now(),
  completed_at        timestamptz
);

create index if not exists market_refunds_order_idx on market_refunds (order_id);


-- ─────────────────────────────────────────────────────────────────
-- Discount codes
-- ─────────────────────────────────────────────────────────────────

create table if not exists market_discount_codes (
  id                 uuid primary key default uuid_generate_v4(),
  code               text not null unique,           -- 'LAUNCH50', case-insensitive in app
  type               text not null check (type in ('percent','flat')),
  -- For percent: integer 0-100. For flat: cents in base currency (USD).
  amount             integer not null,
  -- Optional scoping
  applies_to_product_id  uuid references market_products(id) on delete cascade,
  applies_to_category_id uuid references market_categories(id) on delete cascade,
  -- Usage caps
  max_uses           integer,            -- null = unlimited
  uses_count         integer not null default 0,
  per_user_limit     integer not null default 1,
  -- Window
  starts_at          timestamptz not null default now(),
  expires_at         timestamptz,
  -- State
  is_active          boolean not null default true,
  created_at         timestamptz not null default now()
);

create index if not exists market_discount_active_idx on market_discount_codes (is_active, expires_at);

create table if not exists market_discount_uses (
  id              uuid primary key default uuid_generate_v4(),
  discount_id     uuid not null references market_discount_codes(id) on delete cascade,
  order_id        uuid not null references market_orders(id) on delete cascade,
  user_id         uuid references auth.users(id) on delete set null,
  applied_cents   integer not null,
  used_at         timestamptz not null default now()
);

create index if not exists market_discount_uses_discount_idx on market_discount_uses (discount_id);
create index if not exists market_discount_uses_user_idx     on market_discount_uses (user_id);


-- ─────────────────────────────────────────────────────────────────
-- Affiliates
-- ─────────────────────────────────────────────────────────────────

create table if not exists market_affiliates (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid references auth.users(id) on delete set null,
  slug               text not null unique,          -- ?ref=<slug>
  display_name       text not null,
  email              text not null,
  commission_pct     numeric(5, 2) not null default 20.00,
  total_earned_cents integer not null default 0,
  total_paid_cents   integer not null default 0,
  is_active          boolean not null default true,
  created_at         timestamptz not null default now()
);

create table if not exists market_affiliate_clicks (
  id            uuid primary key default uuid_generate_v4(),
  affiliate_id  uuid not null references market_affiliates(id) on delete cascade,
  product_id    uuid references market_products(id) on delete set null,
  visitor_id    text,             -- cookie id
  user_agent    text,
  referrer      text,
  ip_hash       text,             -- sha256(ip + salt) for privacy
  clicked_at    timestamptz not null default now()
);

create index if not exists market_affiliate_clicks_affiliate_idx on market_affiliate_clicks (affiliate_id, clicked_at desc);

create table if not exists market_affiliate_payouts (
  id            uuid primary key default uuid_generate_v4(),
  affiliate_id  uuid not null references market_affiliates(id) on delete cascade,
  amount_cents  integer not null,
  currency      text not null default 'USD',
  status        text not null default 'pending' check (status in ('pending','paid','cancelled')),
  method        text,             -- 'wise', 'bank', 'paypal'
  notes         text,
  created_at    timestamptz not null default now(),
  paid_at       timestamptz
);


-- ─────────────────────────────────────────────────────────────────
-- Product reviews — gated by ownership of a paid order_item
-- ─────────────────────────────────────────────────────────────────

create table if not exists market_product_reviews (
  id           uuid primary key default uuid_generate_v4(),
  product_id   uuid not null references market_products(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  order_item_id uuid not null references market_order_items(id) on delete cascade,
  rating       integer not null check (rating between 1 and 5),
  title        text,
  body         text,
  -- Moderation: 'pending' until admin approves; 'rejected' hidden
  status       text not null default 'pending' check (status in ('pending','approved','rejected')),
  helpful_count integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (product_id, user_id)   -- one review per user per product
);

create index if not exists market_reviews_product_status_idx
  on market_product_reviews (product_id, status, created_at desc);

drop trigger if exists market_reviews_set_updated_at on market_product_reviews;
create trigger market_reviews_set_updated_at
  before update on market_product_reviews
  for each row execute procedure set_updated_at();


-- ─────────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────────

alter table market_orders             enable row level security;
alter table market_order_items        enable row level security;
alter table market_refunds            enable row level security;
alter table market_discount_codes     enable row level security;
alter table market_discount_uses      enable row level security;
alter table market_affiliates         enable row level security;
alter table market_affiliate_clicks   enable row level security;
alter table market_affiliate_payouts  enable row level security;
alter table market_product_reviews    enable row level security;

-- Orders: user reads own orders, admin reads all
grant select on market_orders to authenticated;
drop policy if exists "owner_or_admin_read_orders" on market_orders;
create policy "owner_or_admin_read_orders"
  on market_orders for select to authenticated
  using ((select auth.uid()) = user_id or is_admin());

-- Order items: same as parent order
grant select on market_order_items to authenticated;
drop policy if exists "owner_or_admin_read_items" on market_order_items;
create policy "owner_or_admin_read_items"
  on market_order_items for select to authenticated
  using (
    exists (
      select 1 from market_orders o
      where o.id = market_order_items.order_id
        and (o.user_id = (select auth.uid()) or is_admin())
    )
  );

-- Refunds: owner of order can insert (self_service) + read; admin all
grant select, insert on market_refunds to authenticated;
drop policy if exists "owner_or_admin_read_refunds" on market_refunds;
create policy "owner_or_admin_read_refunds"
  on market_refunds for select to authenticated
  using (
    exists (
      select 1 from market_orders o
      where o.id = market_refunds.order_id
        and (o.user_id = (select auth.uid()) or is_admin())
    )
  );

drop policy if exists "owner_self_service_refund_insert" on market_refunds;
create policy "owner_self_service_refund_insert"
  on market_refunds for insert to authenticated
  with check (
    source = 'self_service'
    and exists (
      select 1 from market_orders o
      where o.id = market_refunds.order_id
        and o.user_id = (select auth.uid())
        and o.status = 'paid'
        and o.paid_at > now() - interval '14 days'
    )
  );

-- Discount codes: anon can read active codes (to validate input); admin manages
grant select on market_discount_codes to anon, authenticated;
drop policy if exists "public_read_active_codes" on market_discount_codes;
create policy "public_read_active_codes"
  on market_discount_codes for select to anon, authenticated
  using (is_active = true and (expires_at is null or expires_at > now()));

grant insert, update, delete on market_discount_codes to authenticated;
drop policy if exists "admin_write_codes" on market_discount_codes;
create policy "admin_write_codes"
  on market_discount_codes for all to authenticated
  using (is_admin()) with check (is_admin());

-- Discount uses: read own + admin
grant select on market_discount_uses to authenticated;
drop policy if exists "owner_or_admin_read_uses" on market_discount_uses;
create policy "owner_or_admin_read_uses"
  on market_discount_uses for select to authenticated
  using (user_id = (select auth.uid()) or is_admin());

-- Affiliates: self + admin
grant select on market_affiliates to authenticated;
drop policy if exists "self_or_admin_read_affiliate" on market_affiliates;
create policy "self_or_admin_read_affiliate"
  on market_affiliates for select to authenticated
  using (user_id = (select auth.uid()) or is_admin());

grant insert, update, delete on market_affiliates to authenticated;
drop policy if exists "admin_write_affiliates" on market_affiliates;
create policy "admin_write_affiliates"
  on market_affiliates for all to authenticated
  using (is_admin()) with check (is_admin());

-- Affiliate clicks: insert from anon (cookie tracking), admin reads
grant insert on market_affiliate_clicks to anon, authenticated;
grant select on market_affiliate_clicks to authenticated;
drop policy if exists "anyone_track_clicks" on market_affiliate_clicks;
create policy "anyone_track_clicks"
  on market_affiliate_clicks for insert to anon, authenticated
  with check (true);
drop policy if exists "admin_read_clicks" on market_affiliate_clicks;
create policy "admin_read_clicks"
  on market_affiliate_clicks for select to authenticated
  using (is_admin());

-- Affiliate payouts: self + admin
grant select on market_affiliate_payouts to authenticated;
drop policy if exists "self_or_admin_payouts" on market_affiliate_payouts;
create policy "self_or_admin_payouts"
  on market_affiliate_payouts for select to authenticated
  using (
    exists (select 1 from market_affiliates a
            where a.id = market_affiliate_payouts.affiliate_id
              and (a.user_id = (select auth.uid()) or is_admin()))
  );

-- Reviews: public reads approved; user inserts own; admin moderates
grant select on market_product_reviews to anon, authenticated;
drop policy if exists "public_read_approved_reviews" on market_product_reviews;
create policy "public_read_approved_reviews"
  on market_product_reviews for select to anon, authenticated
  using (status = 'approved');

grant insert on market_product_reviews to authenticated;
drop policy if exists "owner_insert_review" on market_product_reviews;
create policy "owner_insert_review"
  on market_product_reviews for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "owner_read_own_review" on market_product_reviews;
create policy "owner_read_own_review"
  on market_product_reviews for select to authenticated
  using (user_id = (select auth.uid()) or is_admin());

grant update, delete on market_product_reviews to authenticated;
drop policy if exists "admin_moderate_reviews" on market_product_reviews;
create policy "admin_moderate_reviews"
  on market_product_reviews for update to authenticated
  using (is_admin()) with check (is_admin());

notify pgrst, 'reload schema';
