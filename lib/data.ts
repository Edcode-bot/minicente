// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  name: string;
  initials: string;
  phone: string;
  kyc: {
    tier: 1 | 2 | 3;
    completed: number;
    total: number;
    label: string;
  };
}

export interface Balance {
  usd: number;
  local: number;
  localCurrency: string;
  localSymbol: string;
  chains: number;
}

export type TxnType = "send" | "receive" | "swap" | "savings" | "loan";
export type TxnStatus = "completed" | "pending" | "failed";

export interface Transaction {
  id: string;
  type: TxnType;
  title: string;
  subtitle: string;
  amount: number;
  currency: string;
  date: string;
  status: TxnStatus;
  icon: string;
}

export type FeatureLayer = "Core" | "Growth" | "Vision";

export interface Feature {
  id: string;
  icon: string;
  title: string;
  desc: string;
  metric: string;
  layer: FeatureLayer;
  chains: string[];
}

export type SavingsType = "flexi" | "goal" | "fixed" | "micro";

export interface SavingsProduct {
  id: string;
  name: string;
  apy: number;
  type: SavingsType;
  balance: number;
  target?: number;
  description: string;
  minDeposit: number;
  tenor?: string;
  accent: string;
}

export type ChamaRole = "admin" | "member";

export interface Chama {
  id: string;
  name: string;
  members: number;
  balance: number;
  target: number;
  nextContribution: string;
  role: ChamaRole;
  emoji: string;
}

export type LoanType = "personal" | "business" | "bnpl";
export type LoanStatus = "active" | "available" | "pending";

export interface Loan {
  id: string;
  type: LoanType;
  name: string;
  apr: number;
  limit: number;
  outstanding?: number;
  status: LoanStatus;
  features: string[];
  term: string;
}

export type MarketplaceCategory =
  | "bills"
  | "airtime"
  | "insurance"
  | "merchant"
  | "pro";

export interface MarketplaceItem {
  id: string;
  category: MarketplaceCategory;
  name: string;
  desc: string;
  icon: string;
  badge?: string;
}

export interface RemittanceRoute {
  id: string;
  from: string;
  to: string;
  rate: number;
  fee: number;
  time: string;
  rail: string;
  accent: string;
}

export interface AgentStat {
  label: string;
  value: string;
  delta?: string;
  accent: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

export const USER: User = {
  name: "Amara Osei",
  initials: "AO",
  phone: "+233 24 123 4567",
  kyc: {
    tier: 2,
    completed: 4,
    total: 6,
    label: "KYC Tier 2",
  },
};

export const BALANCE: Balance = {
  usd: 4218.5,
  local: 63277.5,
  localCurrency: "GHS",
  localSymbol: "₵",
  chains: 5,
};

export const TXNS: Transaction[] = [
  {
    id: "t1",
    type: "receive",
    title: "Received from Kwame A.",
    subtitle: "Mobile Money",
    amount: 150.0,
    currency: "USD",
    date: "Today, 14:32",
    status: "completed",
    icon: "↓",
  },
  {
    id: "t2",
    type: "send",
    title: "Sent to Fatima B.",
    subtitle: "USDC · Base",
    amount: 75.5,
    currency: "USD",
    date: "Today, 11:15",
    status: "completed",
    icon: "↑",
  },
  {
    id: "t3",
    type: "swap",
    title: "USDC → USDT",
    subtitle: "Stablecoin Swap",
    amount: 500.0,
    currency: "USD",
    date: "Yesterday, 18:04",
    status: "completed",
    icon: "⇄",
  },
  {
    id: "t4",
    type: "savings",
    title: "Flexi Yield Deposit",
    subtitle: "Auto-save",
    amount: 100.0,
    currency: "USD",
    date: "Yesterday, 09:00",
    status: "completed",
    icon: "⊕",
  },
  {
    id: "t5",
    type: "send",
    title: "MTN Airtime",
    subtitle: "Bill Payment",
    amount: 10.0,
    currency: "USD",
    date: "Jun 18, 20:47",
    status: "completed",
    icon: "↑",
  },
  {
    id: "t6",
    type: "receive",
    title: "Loan Disbursement",
    subtitle: "Personal Loan",
    amount: 500.0,
    currency: "USD",
    date: "Jun 17, 13:22",
    status: "completed",
    icon: "↓",
  },
  {
    id: "t7",
    type: "send",
    title: "Electricity Bill",
    subtitle: "ECG · Bill",
    amount: 28.0,
    currency: "USD",
    date: "Jun 16, 08:01",
    status: "pending",
    icon: "↑",
  },
  {
    id: "t8",
    type: "swap",
    title: "USDT → MATIC",
    subtitle: "Cross-chain Swap",
    amount: 200.0,
    currency: "USD",
    date: "Jun 15, 22:15",
    status: "failed",
    icon: "⇄",
  },
];

export const FEATURES: Feature[] = [
  // Core
  {
    id: "f1",
    icon: "🪙",
    title: "Stablecoin Wallet",
    desc: "Store and manage USDC, USDT with no slippage risk",
    metric: "4 stablecoins",
    layer: "Core",
    chains: ["Base", "Polygon"],
  },
  {
    id: "f2",
    icon: "⚡",
    title: "Send & Receive",
    desc: "Instant peer-to-peer transfers confirmed in seconds",
    metric: "< 2s settlement",
    layer: "Core",
    chains: ["Base", "Arbitrum"],
  },
  {
    id: "f3",
    icon: "📈",
    title: "Savings Vault",
    desc: "Earn yield on stablecoins automatically, no lock-in",
    metric: "Up to 11% APY",
    layer: "Core",
    chains: ["Optimism", "Arbitrum"],
  },
  {
    id: "f4",
    icon: "🔀",
    title: "DeFi Yield",
    desc: "Access top DeFi protocols aggregated in one tap",
    metric: "$2.1B TVL",
    layer: "Core",
    chains: ["Arbitrum", "Base"],
  },
  {
    id: "f5",
    icon: "🌍",
    title: "Cross-border Remittance",
    desc: "Send money globally at a fraction of traditional fees",
    metric: "0.5% avg fee",
    layer: "Core",
    chains: ["Base", "Polygon"],
  },
  {
    id: "f6",
    icon: "📱",
    title: "Mobile Money Bridge",
    desc: "Seamlessly link your MoMo wallet to Web3 rails",
    metric: "12 networks",
    layer: "Core",
    chains: ["Polygon"],
  },
  {
    id: "f7",
    icon: "🧾",
    title: "Bill Payments",
    desc: "Pay utilities, subscriptions, and TV on-chain",
    metric: "200+ billers",
    layer: "Core",
    chains: ["Base"],
  },
  {
    id: "f8",
    icon: "🏪",
    title: "Agency Banking",
    desc: "Become a Minicente agent and earn commissions",
    metric: "2.5% commission",
    layer: "Core",
    chains: ["Polygon", "Base"],
  },
  // Growth
  {
    id: "f9",
    icon: "💸",
    title: "Micro-loans",
    desc: "Collateral-free on-chain credit starting from $10",
    metric: "From $10",
    layer: "Growth",
    chains: ["Base", "Arbitrum"],
  },
  {
    id: "f10",
    icon: "🛒",
    title: "BNPL",
    desc: "Buy now, pay in 4 interest-free installments",
    metric: "0% interest",
    layer: "Growth",
    chains: ["Optimism"],
  },
  {
    id: "f11",
    icon: "👥",
    title: "Chama Groups",
    desc: "Pool savings with family and community on-chain",
    metric: "5,000+ groups",
    layer: "Growth",
    chains: ["Base"],
  },
  {
    id: "f12",
    icon: "⭐",
    title: "On-chain Credit Score",
    desc: "Build a portable credit history on the blockchain",
    metric: "712/850 avg",
    layer: "Growth",
    chains: ["Mainnet", "Base"],
  },
  {
    id: "f13",
    icon: "🏷️",
    title: "Merchant Payments",
    desc: "Accept crypto at your business via QR or NFC tap",
    metric: "QR + NFC",
    layer: "Growth",
    chains: ["Base", "Polygon"],
  },
  {
    id: "f14",
    icon: "📡",
    title: "Airtime Top-up",
    desc: "Recharge any mobile network in three taps",
    metric: "150+ operators",
    layer: "Growth",
    chains: ["Polygon"],
  },
  // Vision
  {
    id: "f15",
    icon: "🤖",
    title: "AI Financial Advisor",
    desc: "Personalised financial insights powered by on-chain AI",
    metric: "Beta",
    layer: "Vision",
    chains: ["Base"],
  },
  {
    id: "f16",
    icon: "🌱",
    title: "Carbon Credits",
    desc: "Offset carbon footprint and earn green rewards",
    metric: "Q2 2025",
    layer: "Vision",
    chains: ["Base", "Mainnet"],
  },
  {
    id: "f17",
    icon: "🛡️",
    title: "DeFi Insurance",
    desc: "Decentralised coverage for wallets and positions",
    metric: "Coming Q3",
    layer: "Vision",
    chains: ["Arbitrum"],
  },
  {
    id: "f18",
    icon: "🏦",
    title: "Tokenised Assets",
    desc: "Invest in tokenised real-world assets from $1",
    metric: "RWA pilot",
    layer: "Vision",
    chains: ["Mainnet"],
  },
];

export const SAVINGS_PRODUCTS: SavingsProduct[] = [
  {
    id: "sp1",
    name: "Flexi Yield",
    apy: 7.2,
    type: "flexi",
    balance: 620.0,
    description: "Deposit and withdraw anytime while earning daily yield",
    minDeposit: 1,
    accent: "#2dd4a0",
  },
  {
    id: "sp2",
    name: "Goal Pot",
    apy: 6.5,
    type: "goal",
    balance: 340.0,
    target: 1000.0,
    description: "Set a savings goal and track progress with boosted APY",
    minDeposit: 5,
    accent: "#4a9eff",
  },
  {
    id: "sp3",
    name: "Fixed Term",
    apy: 11.0,
    type: "fixed",
    balance: 280.0,
    description: "Lock funds for 90 days to earn the highest available yield",
    minDeposit: 50,
    tenor: "90 days",
    accent: "#c8f045",
  },
  {
    id: "sp4",
    name: "Micro-Loan Vault",
    apy: 5.0,
    type: "micro",
    balance: 0,
    description: "Earn yield while providing liquidity for micro-loans",
    minDeposit: 10,
    accent: "#a78bfa",
  },
];

export const CHAMAS: Chama[] = [
  {
    id: "c1",
    name: "Accra Hustlers",
    members: 12,
    balance: 3600.0,
    target: 6000.0,
    nextContribution: "Jul 1",
    role: "admin",
    emoji: "🦁",
  },
  {
    id: "c2",
    name: "Family Savings Circle",
    members: 6,
    balance: 1800.0,
    target: 3000.0,
    nextContribution: "Jun 25",
    role: "member",
    emoji: "👨‍👩‍👧‍👦",
  },
  {
    id: "c3",
    name: "Market Traders Assoc.",
    members: 30,
    balance: 15000.0,
    target: 20000.0,
    nextContribution: "Jun 30",
    role: "member",
    emoji: "🏪",
  },
];

export const LOANS: Loan[] = [
  {
    id: "l1",
    type: "personal",
    name: "Personal Loan",
    apr: 18,
    limit: 2000,
    outstanding: 500,
    status: "active",
    features: ["Instant", "No collateral", "Flexible repayment"],
    term: "3–12 months",
  },
  {
    id: "l2",
    type: "business",
    name: "Business Credit",
    apr: 22,
    limit: 10000,
    status: "available",
    features: ["Higher limits", "Working capital", "Trade finance"],
    term: "6–24 months",
  },
  {
    id: "l3",
    type: "bnpl",
    name: "Buy Now Pay Later",
    apr: 0,
    limit: 500,
    status: "available",
    features: ["0% interest", "4 installments", "Instant approval"],
    term: "6 weeks",
  },
];

export const MARKETPLACE: MarketplaceItem[] = [
  {
    id: "m1",
    category: "bills",
    name: "Utility Bills",
    desc: "Electricity, water, and waste",
    icon: "⚡",
  },
  {
    id: "m2",
    category: "airtime",
    name: "Airtime & Data",
    desc: "150+ mobile operators worldwide",
    icon: "📡",
    badge: "Popular",
  },
  {
    id: "m3",
    category: "insurance",
    name: "Insurance",
    desc: "Health, life, and device cover",
    icon: "🛡️",
    badge: "New",
  },
  {
    id: "m4",
    category: "merchant",
    name: "Merchant Tools",
    desc: "QR codes, POS, and invoicing",
    icon: "🏷️",
  },
  {
    id: "m5",
    category: "pro",
    name: "Minicente Pro",
    desc: "Lower fees, higher limits, priority support",
    icon: "⭐",
    badge: "Upgrade",
  },
];

export const REMITTANCE: RemittanceRoute[] = [
  {
    id: "r1",
    from: "GH",
    to: "UK",
    rate: 0.065,
    fee: 0.5,
    time: "< 30 min",
    rail: "USDC · Base",
    accent: "#2dd4a0",
  },
  {
    id: "r2",
    from: "GH",
    to: "US",
    rate: 0.062,
    fee: 0.8,
    time: "< 1 hr",
    rail: "USDC · Arbitrum",
    accent: "#4a9eff",
  },
  {
    id: "r3",
    from: "GH",
    to: "NG",
    rate: 1520,
    fee: 0.3,
    time: "Instant",
    rail: "USDT · Polygon",
    accent: "#c8f045",
  },
];

export const AGENT_STATS: AgentStat[] = [
  { label: "Today's Earnings", value: "$24.80", delta: "+12%", accent: "#c8f045" },
  { label: "Transactions", value: "17", delta: "+5", accent: "#2dd4a0" },
  { label: "Float Balance", value: "$1,420", accent: "#4a9eff" },
];
