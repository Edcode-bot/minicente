import type { SmsProvider } from "./types";

// Sim provider — logs the code server-side, no real SMS sent.
// Safe for local dev; never use in production.
export const smsSim: SmsProvider = {
  async sendOtp(phone: string, code: string): Promise<void> {
    console.log(`[OTP SIM] → ${phone}  code: ${code}`);
  },
};
