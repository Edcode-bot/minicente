import type { SmsProvider } from "./types";
import { smsSim } from "./sms-sim";
import { africastalkingSms } from "./africastalking";

export function getSmsProvider(): SmsProvider {
  const mode = process.env.OTP_MODE ?? "sim";
  return mode === "live" ? africastalkingSms : smsSim;
}

export type { SmsProvider } from "./types";
