/**
 * Market schema — mirrors supabase/migrations/0003_market.sql + 0004_market_v2.sql.
 * Type-safe Drizzle definitions; SQL is source of truth (run via Supabase).
 */

import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  timestamp,
  boolean,
  jsonb,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ─────────────────────────────────────────────────────────────────
// Categories
// ─────────────────────────────────────────────────────────────────

export const marketCategories = pgTable(
  "market_categories",
  {
    id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    icon: text("icon"),
    accentColor: text("accent_color"),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    activeSort: index("market_categories_active_sort_idx").on(t.isActive, t.sortOrder),
  }),
);

export type MarketCategory = typeof marketCategories.$inferSelect;
export type NewMarketCategory = typeof marketCategories.$inferInsert;

// ─────────────────────────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────────────────────────

export const marketProducts = pgTable(
  "market_products",
  {
    id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
    slug: text("slug").notNull(),
    categoryId: uuid("category_id").notNull(),

    title: text("title").notNull(),
    subtitle: text("subtitle"),
    shortDescription: text("short_description"),
    description: text("description").notNull(),
    coverUrl: text("cover_url"),
    gallery: jsonb("gallery").$type<string[]>().notNull().default(sql`'[]'::jsonb`),

    priceCents: integer("price_cents").notNull(),
    compareAtPriceCents: integer("compare_at_price_cents"),
    currency: text("currency").notNull().default("USD"),

    productType: text("product_type")
      .$type<"digital" | "physical" | "service">()
      .notNull()
      .default("digital"),

    downloadUrl: text("download_url"),
    licenseTemplate: text("license_template"),

    status: text("status")
      .$type<"draft" | "published" | "archived">()
      .notNull()
      .default("draft"),
    featured: boolean("featured").notNull().default(false),
    tags: text("tags").array().notNull().default(sql`'{}'::text[]`),

    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),

    // v2 additions
    stockCount: integer("stock_count").notNull().default(999),
    demoUrl: text("demo_url"),
    previewFiles: jsonb("preview_files")
      .$type<ProductFile[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    downloadFiles: jsonb("download_files")
      .$type<ProductFile[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),

    stripeProductId: text("stripe_product_id"),
    stripePriceId: text("stripe_price_id"),

    viewCount: integer("view_count").notNull().default(0),
    purchaseCount: integer("purchase_count").notNull().default(0),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
  },
  (t) => ({
    slugCategory: uniqueIndex("market_products_slug_category_unique").on(t.slug, t.categoryId),
    statusPublished: index("market_products_status_published_idx").on(t.status, t.publishedAt),
    categoryStatus: index("market_products_category_status_idx").on(t.categoryId, t.status, t.publishedAt),
  }),
);

export type MarketProduct = typeof marketProducts.$inferSelect;
export type NewMarketProduct = typeof marketProducts.$inferInsert;

export type ProductFile = {
  name: string;
  r2_key: string;
  size: number;
  mime: string;
};

// ─────────────────────────────────────────────────────────────────
// FX rates (display-time conversion)
// ─────────────────────────────────────────────────────────────────

export const marketFxRates = pgTable(
  "market_fx_rates",
  {
    baseCurrency: text("base_currency").notNull(),
    quoteCurrency: text("quote_currency").notNull(),
    rate: numeric("rate", { precision: 18, scale: 8 }).notNull(),
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.baseCurrency, t.quoteCurrency] }),
  }),
);

// ─────────────────────────────────────────────────────────────────
// Orders
// ─────────────────────────────────────────────────────────────────

export const marketOrders = pgTable(
  "market_orders",
  {
    id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
    userId: uuid("user_id"),
    email: text("email").notNull(),
    status: text("status")
      .$type<"pending" | "paid" | "failed" | "refunded" | "partially_refunded" | "cancelled">()
      .notNull()
      .default("pending"),

    subtotalCents: integer("subtotal_cents").notNull(),
    discountCents: integer("discount_cents").notNull().default(0),
    totalCents: integer("total_cents").notNull(),
    currency: text("currency").notNull().default("USD"),

    displayCurrency: text("display_currency").notNull().default("USD"),
    displayRate: numeric("display_rate", { precision: 18, scale: 8 }).notNull().default("1.0"),

    paymentProvider: text("payment_provider")
      .$type<"stripe" | "wise" | "vnpay" | "momo" | "manual">()
      .notNull(),
    paymentIntentId: text("payment_intent_id"),
    paymentSessionId: text("payment_session_id").unique(),

    discountCode: text("discount_code"),
    affiliateSlug: text("affiliate_slug"),

    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    refundedAt: timestamp("refunded_at", { withTimezone: true }),
  },
  (t) => ({
    userStatus: index("market_orders_user_status_idx").on(t.userId, t.status, t.createdAt),
    statusPaid: index("market_orders_status_paid_idx").on(t.status, t.paidAt),
    email: index("market_orders_email_idx").on(t.email),
  }),
);

export type MarketOrder = typeof marketOrders.$inferSelect;
export type NewMarketOrder = typeof marketOrders.$inferInsert;

// ─────────────────────────────────────────────────────────────────
// Order items
// ─────────────────────────────────────────────────────────────────

export const marketOrderItems = pgTable(
  "market_order_items",
  {
    id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
    orderId: uuid("order_id").notNull(),
    productId: uuid("product_id").notNull(),

    productTitle: text("product_title").notNull(),
    productSlug: text("product_slug").notNull(),
    categorySlug: text("category_slug").notNull(),
    unitPriceCents: integer("unit_price_cents").notNull(),
    quantity: integer("quantity").notNull().default(1),

    downloadCount: integer("download_count").notNull().default(0),
    lastDownloadedAt: timestamp("last_downloaded_at", { withTimezone: true }),

    licenseKey: text("license_key"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    order: index("market_order_items_order_idx").on(t.orderId),
    product: index("market_order_items_product_idx").on(t.productId),
  }),
);

export type MarketOrderItem = typeof marketOrderItems.$inferSelect;
export type NewMarketOrderItem = typeof marketOrderItems.$inferInsert;

// ─────────────────────────────────────────────────────────────────
// Refunds
// ─────────────────────────────────────────────────────────────────

export const marketRefunds = pgTable(
  "market_refunds",
  {
    id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
    orderId: uuid("order_id").notNull(),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull(),
    reason: text("reason"),
    source: text("source").$type<"self_service" | "admin" | "fraud">().notNull(),
    status: text("status").$type<"pending" | "succeeded" | "failed">().notNull().default("pending"),
    providerRefundId: text("provider_refund_id"),
    initiatedBy: uuid("initiated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => ({
    order: index("market_refunds_order_idx").on(t.orderId),
  }),
);

// ─────────────────────────────────────────────────────────────────
// Discount codes
// ─────────────────────────────────────────────────────────────────

export const marketDiscountCodes = pgTable("market_discount_codes", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  code: text("code").notNull().unique(),
  type: text("type").$type<"percent" | "flat">().notNull(),
  amount: integer("amount").notNull(),
  appliesToProductId: uuid("applies_to_product_id"),
  appliesToCategoryId: uuid("applies_to_category_id"),
  maxUses: integer("max_uses"),
  usesCount: integer("uses_count").notNull().default(0),
  perUserLimit: integer("per_user_limit").notNull().default(1),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const marketDiscountUses = pgTable("market_discount_uses", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  discountId: uuid("discount_id").notNull(),
  orderId: uuid("order_id").notNull(),
  userId: uuid("user_id"),
  appliedCents: integer("applied_cents").notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────────────
// Affiliates
// ─────────────────────────────────────────────────────────────────

export const marketAffiliates = pgTable("market_affiliates", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  userId: uuid("user_id"),
  slug: text("slug").notNull().unique(),
  displayName: text("display_name").notNull(),
  email: text("email").notNull(),
  commissionPct: numeric("commission_pct", { precision: 5, scale: 2 }).notNull().default("20.00"),
  totalEarnedCents: integer("total_earned_cents").notNull().default(0),
  totalPaidCents: integer("total_paid_cents").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const marketAffiliateClicks = pgTable(
  "market_affiliate_clicks",
  {
    id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
    affiliateId: uuid("affiliate_id").notNull(),
    productId: uuid("product_id"),
    visitorId: text("visitor_id"),
    userAgent: text("user_agent"),
    referrer: text("referrer"),
    ipHash: text("ip_hash"),
    clickedAt: timestamp("clicked_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    affiliateClicked: index("market_affiliate_clicks_affiliate_idx").on(t.affiliateId, t.clickedAt),
  }),
);

export const marketAffiliatePayouts = pgTable("market_affiliate_payouts", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  affiliateId: uuid("affiliate_id").notNull(),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("USD"),
  status: text("status").$type<"pending" | "paid" | "cancelled">().notNull().default("pending"),
  method: text("method"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
});

// ─────────────────────────────────────────────────────────────────
// Product reviews
// ─────────────────────────────────────────────────────────────────

export const marketProductReviews = pgTable(
  "market_product_reviews",
  {
    id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
    productId: uuid("product_id").notNull(),
    userId: uuid("user_id").notNull(),
    orderItemId: uuid("order_item_id").notNull(),
    rating: integer("rating").notNull(),
    title: text("title"),
    body: text("body"),
    status: text("status").$type<"pending" | "approved" | "rejected">().notNull().default("pending"),
    helpfulCount: integer("helpful_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    productStatus: index("market_reviews_product_status_idx").on(t.productId, t.status, t.createdAt),
    userProduct: uniqueIndex("market_reviews_user_product_unique").on(t.productId, t.userId),
  }),
);

export type MarketReview = typeof marketProductReviews.$inferSelect;
