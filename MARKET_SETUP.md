# Market — manual setup checklist

Everything in this list is configuration outside the codebase. Code is already
deployed and falls back gracefully when a provider isn't configured (the
checkout dropdown only shows providers whose env vars are set).

---

## 1. Cloudflare R2 (digital file storage) — REQUIRED for selling digital products

R2 hosts product cover images, gallery, preview files, and the paid download
files. Cheaper than Vercel Blob and S3 because **egress is free** — buyers
re-downloading a 50MB PDF costs nothing.

**Setup:**

1. Sign in at https://dash.cloudflare.com
2. **R2 → Create bucket** → name: `huyhk-market` → region near your audience
3. **R2 → Manage R2 API Tokens → Create API token**
   - Permission: **Object Read & Write**
   - Bucket scope: `huyhk-market` (so the token only sees this bucket)
   - TTL: leave indefinite (rotate yearly)
   - **Copy now — Cloudflare shows the secret once**
4. Add to `.env.local`:
   ```bash
   R2_ACCOUNT_ID=<account id from R2 overview>
   R2_ACCESS_KEY_ID=<from token modal>
   R2_SECRET_ACCESS_KEY=<from token modal>
   R2_BUCKET=huyhk-market
   ```
5. (Recommended) Bind a custom domain so cover images load fast:
   - R2 → bucket → **Settings → Custom Domains → Connect Domain**
   - e.g. `cdn.huyhk.dev`
   - Set `R2_PUBLIC_BASE_URL=https://cdn.huyhk.dev` in `.env.local`
   - Without this, cover/gallery URLs use signed URLs (24h expiry) which is
     still functional but less cacheable.
6. Add the same vars to **Vercel project settings → Environment Variables**
   for production.

After this, `/admin/market/new` can upload files. The `cover`/`gallery`/`preview`
uploads land in public-readable R2 keys; `download` files are private and
served only via signed URLs gated by `/api/account/downloads`.

---

## 2. Stripe (international card payment) — REQUIRED

**Setup:**

1. Sign in at https://dashboard.stripe.com (create account if needed; choose VN as country)
2. Switch to **Test mode** (toggle top-right) — develop with test keys first
3. **Developers → API keys**:
   - Copy the **Secret key** (`sk_test_...`) → `STRIPE_SECRET_KEY`
   - Copy the **Publishable key** (`pk_test_...`) → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
4. **Developers → Webhooks → Add endpoint**:
   - URL: `https://huyhk.dev/api/webhooks/stripe` (prod) — for local dev use
     [Stripe CLI](https://stripe.com/docs/stripe-cli): `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
   - Listen for events: `checkout.session.completed`, `checkout.session.expired`,
     `checkout.session.async_payment_failed`, `charge.refunded`
   - After creating, copy **Signing secret** (`whsec_...`) → `STRIPE_WEBHOOK_SECRET`
5. Go live when ready: flip dashboard to Live, swap test keys for live, update
   webhook endpoint (test webhook stays for dev).

**Currency note:** Stripe accepts any currency. We use the buyer's display
currency at checkout (set by the currency picker / locale). The canonical
order total stays in USD in DB.

---

## 3. VNPay (Vietnamese bank cards) — OPTIONAL

Use this when you want to accept VND from Vietnamese buyers without
international card fees.

**Setup:**

1. Register at https://vnpay.vn → Merchant signup (requires Vietnamese business)
2. After approval, dashboard → API integration → copy:
   - `vnp_TmnCode` (terminal code)
   - `vnp_HashSecret` (HMAC-SHA512 key)
3. Add to `.env.local`:
   ```
   VNPAY_TMN_CODE=...
   VNPAY_HASH_SECRET=...
   VNPAY_PAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
   VNPAY_RETURN_URL=https://huyhk.dev/checkout/success
   VNPAY_IPN_URL=https://huyhk.dev/api/webhooks/vnpay
   ```
4. In VNPay dashboard → Cấu hình → register `VNPAY_IPN_URL` as the IPN callback.
5. When going live, change `VNPAY_PAY_URL` to the production URL VNPay provides.

VNPay only accepts VND. The provider hides itself from the checkout picker when
the buyer's display currency isn't VND.

---

## 4. MoMo (Vietnamese mobile wallet) — OPTIONAL

**Setup:**

1. Register at https://business.momo.vn → Partner account
2. Get from dashboard:
   - `partnerCode`
   - `accessKey`
   - `secretKey`
3. Add to `.env.local`:
   ```
   MOMO_PARTNER_CODE=...
   MOMO_ACCESS_KEY=...
   MOMO_SECRET_KEY=...
   MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
   MOMO_RETURN_URL=https://huyhk.dev/checkout/success
   MOMO_IPN_URL=https://huyhk.dev/api/webhooks/momo
   ```
4. In MoMo dashboard → register the IPN URL.
5. Production: swap `MOMO_ENDPOINT` to `https://payment.momo.vn/v2/gateway/api/create`.

MoMo only accepts VND. Provider hides itself when display currency isn't VND.

---

## 5. Wise (manual bank transfer) — OPTIONAL

Wise doesn't have a true customer-facing checkout API. The site presents your
Wise account details to the buyer; once they transfer, you manually mark the
order paid in `/admin/market/orders/[id]`.

**Setup:**

1. Confirm you have Wise Business (https://wise.com/business)
2. Note your account details (account number / IBAN / SWIFT)
3. Add to `.env.local` — only `WISE_RECIPIENT_NAME` is required; rest are
   shown to buyer:
   ```
   WISE_RECIPIENT_NAME=Ho Khac Huy
   WISE_RECIPIENT_EMAIL=hkhuy2810@gmail.com
   WISE_BANK_ACCOUNT=12345678
   WISE_BANK_NAME=Wise (Vietcombank)
   WISE_BANK_SWIFT=TRWIBEB1XXX
   WISE_INSTRUCTIONS=Include order ID in transfer reference. Payments verified within 24h.
   ```

---

## 6. Resend transactional email — REQUIRED

Already set up for the blog newsletter. Reused for order receipts + auto-create
account magic-link emails.

If you want a dedicated From address: register a domain in Resend, then set
`RESEND_FROM=huyHK <hi@huyhk.dev>`. Otherwise leave default and it sends from
`onboarding@resend.dev` (works for testing, not great for production deliverability).

---

## 7. Supabase Auth — configuration tweaks for auto-create flow

The order flow auto-creates a Supabase user when a buyer's email isn't in
`auth.users`. Two settings to confirm in Supabase dashboard:

1. **Authentication → Settings → URL Configuration**:
   - Site URL: `https://huyhk.dev`
   - Additional redirect URLs: `http://localhost:3000/auth/callback` and `https://huyhk.dev/auth/callback`
2. **Authentication → Email Templates → Magic Link**:
   - Customize if you want; default works. The buyer receives an email from
     **Supabase** with the login link, plus our own receipt email from Resend.

---

## 8. Affiliate program — OPTIONAL setup

Affiliates earn commission on purchases that land via `?ref=<their-slug>`.

**Onboarding flow** (manual for now):

1. Affiliate emails Huy asking to join
2. Huy goes to Supabase SQL editor:
   ```sql
   insert into market_affiliates (slug, display_name, email, commission_pct)
   values ('johndoe', 'John Doe', 'john@example.com', 20.00);
   ```
3. Affiliate shares links like `https://huyhk.dev/market?ref=johndoe`
4. Track clicks in `market_affiliate_clicks` (auto-populated)
5. View accrued commission in `market_affiliates.total_earned_cents`
6. Pay out manually via Wise/bank → record in `market_affiliate_payouts`

(A self-service affiliate signup page can be added later if traffic warrants it.)

---

## 9. Discount codes

Create in `/admin/market/coupons`. Two types:
- **Percent**: `LAUNCH50` → 50% off subtotal
- **Flat**: `WELCOME10` → $10 off in base currency

Optional knobs:
- `max_uses` — cap on total redemptions
- `expires_at` — auto-expire
- `applies_to_product_id` / `applies_to_category_id` — scope to one product or category
- `per_user_limit` — usage cap per signed-in user

---

## 10. Stock alerts (manual)

Products default to `stock_count = 999`. When stock hits 0:
- Public site shows "Sold out" badge
- Admin sees the count highlighted on `/admin/market`
- No automatic email — log into admin and reset stock when restocking

(A `stock_warn_threshold` + email job can be added later.)

---

## 11. Refund policy

Default: **14-day self-service refund** for Stripe orders.

- Buyer goes to `/account/orders/[id]` → "Request refund" button
- Server validates window + ownership, calls Stripe refund API
- Webhook `charge.refunded` flips status to `refunded`
- Other providers (VNPay/Momo/Wise) require manual refund through provider
  dashboard or bank transfer; user sees email-Huy fallback

To change the window, edit the policy in:
- `src/app/api/account/refund/route.ts` (server enforcement)
- `src/app/account/orders/[id]/page.tsx` (UI gate)
- Supabase RLS `owner_self_service_refund_insert` policy (DB enforcement)

---

## 12. Reviews moderation

Buyers can submit reviews from `/account/orders/[id]` within 14 days of paid_at.
Reviews land as `status='pending'`. Admin moderates at `/admin/market/reviews` —
**Approve** to show publicly, **Reject** to hide, **Delete** to remove entirely.

---

## 13. Smoke test checklist

After setting Stripe test keys + R2:

1. `npm run dev`
2. Sign in to `/admin/login` (existing flow)
3. `/admin/market/new` → create a test product:
   - Title, category=Books, price $1.00 (in test mode, you can run real card transactions for free)
   - Upload a small PDF as **Preview** + same/different PDF as **Download**
   - Status = published, save
4. Open `/market/books/<your-slug>` in incognito
5. Add to cart → /cart → enter email → pick Stripe → checkout
6. Use Stripe test card `4242 4242 4242 4242`, any future expiry, any CVC
7. Should redirect to `/checkout/success`
8. Check inbox for:
   - Supabase magic-link email (sign-in)
   - Resend receipt email (order details)
9. Click magic link → land on `/account/orders/[id]` → click Download → R2 signed URL serves the PDF
10. Order shows in `/admin/market/orders` with `paid` status

If any step fails, check:
- Vercel/Next dev console for the request that errored
- Supabase Logs for SQL/RLS issues
- Stripe Dashboard → Logs (with test webhook delivered)
