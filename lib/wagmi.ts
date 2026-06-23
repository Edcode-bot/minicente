import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base, arbitrum, optimism, polygon, mainnet } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "Minicente",
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "MINICENTE_DEMO",
  chains: [base, arbitrum, optimism, polygon, mainnet],
  ssr: true,
});

export const SUPPORTED_CHAINS = [
  { id: base.id, name: "Base", tag: "BASE", accent: "#0052ff" },
  { id: arbitrum.id, name: "Arbitrum", tag: "ARB", accent: "#12aaff" },
  { id: optimism.id, name: "Optimism", tag: "OP", accent: "#ff0420" },
  { id: polygon.id, name: "Polygon", tag: "MATIC", accent: "#8247e5" },
  { id: mainnet.id, name: "Ethereum", tag: "ETH", accent: "#627eea" },
] as const;
