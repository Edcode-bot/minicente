export interface SmsProvider {
  /** Send a one-time code to the given phone number (E.164 or local digits). */
  sendOtp(phone: string, code: string): Promise<void>;
}
