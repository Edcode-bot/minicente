import type { SmsProvider } from "./types";

// Africa's Talking SMS — interface-complete stub.
// To go live:
//   1. Set OTP_MODE=live in .env.local
//   2. Set AT_API_KEY, AT_USERNAME, AT_SENDER_ID
//   3. Replace the throw below with the actual AT SMS API call:
//      POST https://api.africastalking.com/version1/messaging
//      Headers: apiKey, Accept: application/json, Content-Type: application/x-www-form-urlencoded
//      Body: username, to, message, from (sender_id)
export const africastalkingSms: SmsProvider = {
  async sendOtp(_phone: string, _code: string): Promise<void> {
    throw new Error(
      "Africa's Talking SMS not configured — set AT_API_KEY, AT_USERNAME, AT_SENDER_ID and OTP_MODE=live"
    );
  },
};
