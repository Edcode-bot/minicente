# Minicente

**Trust-first mobile money for Uganda.** Pay bills, save with goals, send money, and get cash — in seconds, from any phone.

> "Money that always works." — Simple, safe, instant. No bank account needed.

---

## What is Minicente?

Minicente has two faces built into one Next.js 14 app:

| Face | Route prefix | Who it's for |
|------|-------------|--------------|
| **Consumer app** | `/` `/pay` `/grow` `/cash` `/me` `/verify` `/settings` `/agent` | Ugandan users paying bills, saving, sending money |
| **Investor dashboard** | `/investor` | Operators / backers monitoring float, loans, and stats |

The consumer app is a PWA — installable on Android and iOS via "Add to Home Screen", works offline (USSD fallback: `*384#`).

---

## Tech stack

- **Next.js 14** App Router, TypeScript strict, Tailwind CSS custom tokens
- **Supabase** — auth (email+password, deterministic from phone), Postgres, Storage (`kyc` bucket for ID photos)
- **i18n** — bilingual English / Luganda via `useT()` hook; all strings in `lib/i18n.tsx`
- **No crypto vocabulary** anywhere in the consumer app (the `/investor` face uses WalletConnect for operator flows only)

---

## Local development

```bash
# 1. Install
npm install

# 2. Set env vars (see below)
cp .env.example .env.local

# 3. Run
npm run dev          # http://localhost:3000
npm run build        # production build check
```

---

## Environment variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# WalletConnect (investor face only — leave blank for consumer-only dev)
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=
```

Create the following in your Supabase project:

### Tables

| Table | Key columns |
|-------|------------|
| `profiles` | `id`, `full_name`, `phone`, `language`, `kyc_tier`, `level`, `pin_set`, `onboarded`, `referral_code` |
| `wallets` | `user_id`, `currency`, `balance_minor` |
| `transactions` | `user_id`, `kind`, `status`, `amount_minor`, `fee_minor`, `reference`, `meta` |
| `savings_pots` | `user_id`, `name`, `saved_minor`, `target_minor`, `apy`, `auto_cadence` |
| `chamas` | `name`, `contribution_minor`, `cadence`, `member_count`, `created_by` |
| `chama_members` | `chama_id`, `user_id`, `position` |
| `agents` | `shop_name`, `area`, `phone`, `cash_status`, `verified` |
| `agent_accounts` | `user_id`, `agent_code`, `tier`, `float_minor`, `float_limit_minor`, `earnings_minor` |
| `agent_transactions` | `agent_id`, `kind`, `amount_minor`, `commission_minor`, `customer_phone` |
| `platform_stats` | `success_rate`, `bills_today`, `city` |
| `levels` | `name`, `min_txns`, `perks` |
| `kyc_submissions` | `user_id`, `tier`, `id_number`, `file_path`, `status` |
| `otp_codes` | `phone`, `code` (sha256 hash), `expires_at`, `consumed` |
| `settlements` | `txn_id`, `asset`, `amount_minor`, `chain`, `provider_ref`, `status` |

### Storage

- Bucket **`kyc`** — stores ID photo uploads (private; RLS: owner read/write only)

### Auth

Email confirmation **disabled** in Supabase dashboard (dev mode).
Login email format: `mc-<9digits>@example.com` / password `MC-<9digits>-dev`

---

## Vercel deploy

```bash
vercel --prod
```

Set the same env vars in Vercel project settings → Environment Variables.

---

## Sim → Live: every layer is built and live-ready

All backend layers are fully implemented in simulation mode. Flip each layer to live with a single env-var change.

| Layer | Env var | Default | To go live |
|-------|---------|---------|-----------|
| **Payment rails** (MoMo collect/disburse) | `NEXT_PUBLIC_RAILS_MODE` | `sim` | Set to `live` + add MTN or Airtel credentials |
| **MoMo provider** | `NEXT_PUBLIC_RAILS_PROVIDER` | `mtn` | `mtn` or `airtel` |
| **OTP / SMS** | `OTP_MODE` | `sim` | Set to `live` + add Africa's Talking credentials |
| **Settlement** (multichain reconciliation) | `SETTLEMENT_MODE` | `sim` | Set to `live` + add `TREASURY_ADDRESS` + RPC endpoints |

### Full live-launch env-var list

```env
# Supabase (required always)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # USSD, ops dashboard, settlement recording

# Flip to live (all default to 'sim')
NEXT_PUBLIC_RAILS_MODE=live
NEXT_PUBLIC_RAILS_PROVIDER=mtn   # or airtel
OTP_MODE=live
SETTLEMENT_MODE=live

# Security
RAILS_WEBHOOK_SECRET=            # shared secret on provider → /api/rails/webhook

# MTN MoMo (when RAILS_PROVIDER=mtn)
MTN_SUBSCRIPTION_KEY=
MTN_API_USER=
MTN_API_KEY=
MTN_TARGET_ENV=mtnuganda          # or sandbox

# Airtel Money (when RAILS_PROVIDER=airtel)
AIRTEL_CLIENT_ID=
AIRTEL_CLIENT_SECRET=

# Africa's Talking (OTP + USSD)
AT_API_KEY=
AT_USERNAME=
AT_SENDER_ID=

# EVM settlement treasury
TREASURY_ADDRESS=0x...
RPC_URL_BASE=
RPC_URL_ARBITRUM=
RPC_URL_OPTIMISM=
RPC_URL_POLYGON=

# Investor face (optional)
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=
```

### Readiness check

`GET /api/health` — returns a JSON report of which layers are sim vs live, which env vars are missing, and Supabase connectivity. HTTP 200 = ready, 503 = degraded.

### What still needs human work before launch

| Item | Notes |
|------|-------|
| KYC review queue | Auto-approved now; add human review + webhook to update `kyc_submissions.status` |
| Agent GPS | `agents.lat/lng` columns + device GPS → real distance |
| PIN hashing | `pin_set` flag → hashed PIN in a secure Supabase column |
| Push notifications | FCM / Expo — toggle UI is wired, backend not connected |
| Loan disbursement | DB record created; needs MoMo disburse call on approval |
| Platform stats | Manual `platform_stats` row → computed Supabase view |

---

## Key design decisions

- **Amounts in minor units** — all `*_minor` columns store whole UGX (no paise subdivision). `formatUGX(n)` renders `UGX 1,000` directly.
- **Offline-tolerant writes** — `lib/offline.ts` queues Supabase writes when `navigator.onLine === false` and drains on reconnect.
- **Optimistic UI** — pot deposits and agent CICO update state before DB confirmation; rolled back on hard error.
- **No stack traces to users** — `app/error.tsx` + `ErrorBoundary` show "Something hiccuped — your money is safe."
- **Trust-first** — every screen that touches money shows a shield + refund guarantee. Safety page at `/safety`.
