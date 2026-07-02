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

## What's mocked vs real (P13–P15 roadmap)

| Feature | Current state | P13–P15 plan |
|---------|--------------|-------------|
| KYC review | Auto-approved after 2s delay | Real human review queue + webhook |
| YAKA/water payment | ~10% random fail, real DB write | Live UMEME / NWSC API |
| Airtime | Simulated | Africa's Talking or Yo! Uganda |
| Agent distance | Seed-estimated (`~Xm`) | Real GPS from `agents.lat/lng` |
| Platform stats | Manual row in `platform_stats` | Computed view / realtime |
| Loan disbursement | DB record only | Mobile Money disbursal API |
| PIN storage | `pin_set` flag only | Hashed PIN in secure column |
| Push notifications | Toggle UI only | FCM / Expo push |
| USSD | Footer copy only | Africa's Talking USSD gateway |

---

## Key design decisions

- **Amounts in minor units** — all `*_minor` columns store whole UGX (no paise subdivision). `formatUGX(n)` renders `UGX 1,000` directly.
- **Offline-tolerant writes** — `lib/offline.ts` queues Supabase writes when `navigator.onLine === false` and drains on reconnect.
- **Optimistic UI** — pot deposits and agent CICO update state before DB confirmation; rolled back on hard error.
- **No stack traces to users** — `app/error.tsx` + `ErrorBoundary` show "Something hiccuped — your money is safe."
- **Trust-first** — every screen that touches money shows a shield + refund guarantee. Safety page at `/safety`.
