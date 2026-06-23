# Minicente

Mobile-first fintech web app for emerging markets — stablecoins, savings, remittance, agency banking, and DeFi on Base, Arbitrum, Optimism, Polygon, and Ethereum.

## Local development

```bash
# 1. Install dependencies
npm install

# 2. Copy env and fill in your WalletConnect project ID
#    Get one free at https://cloud.walletconnect.com
cp .env.example .env.local

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app is optimised for a 390px-wide mobile viewport.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Yes (prod) | WalletConnect Cloud project ID. Falls back to `MINICENTE_DEMO` in dev. |

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set the env var in the Vercel dashboard or via CLI
vercel env add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
```

Or use the one-click button:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## Tech stack

- **Next.js 14** — App Router, TypeScript
- **Tailwind CSS** — design tokens, dark theme
- **wagmi v2 + viem v2** — EVM chain abstraction
- **RainbowKit v2** — wallet connection UI
- **@tanstack/react-query v5** — async state

## Swapping mock data for Supabase

All screens read from `lib/data.ts`. Replace the exported constants with Supabase queries (or any async source) and update the page components to `async` server components as needed.
