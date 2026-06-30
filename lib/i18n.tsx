"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

type Lang = "en" | "lug";

// ─── English base ─────────────────────────────────────────────────────────────

const en = {
  // App shell
  greeting_morning: "Good morning",
  greeting_webale: "Webale, good morning",
  home: "Home",
  grow: "Grow",
  cash: "Cash",
  me: "Me",
  coming_soon: "Coming in the next step",
  safety_tagline: "Your money is safe",
  trust_ribbon:
    "Your money is safe — held at a licensed bank, refunded if a payment fails",
  success_rate: "99.4% success",
  notifications: "Notifications",
  safety: "Safety",
  send: "Send",
  receive: "Receive",
  balance: "Balance",
  transactions: "Transactions",
  see_all: "See all",
  switch_lang: "Luganda",

  // Common onboarding
  trust_line: "🛡 Licensed by Bank of Uganda · money held at a licensed bank",
  continue: "Continue",
  back: "Back",

  // Step 0 – Language
  onb_headline: "Money that always works.",
  onb_subtext: "Simple, safe, instant — pay, save, and send from your phone.",

  // Step 1 – Phone
  phone_title: "What's your phone number?",
  phone_reassurance:
    "This is your account — like Mobile Money. No forms, no bank account needed.",
  phone_ussd_hint: "No smartphone? You can also use Minicente on *384#",

  // Step 2 – OTP
  otp_title: "Enter the code",
  otp_sent: "We sent a 5-digit code by SMS to",
  otp_resend: "Resend in",
  otp_resend_now: "Resend code",
  otp_demo: "demo: 12345",

  // Step 3 – PIN
  pin_title: "Create a PIN to lock your money.",
  pin_warning: "Keep it secret — Minicente staff will never ask for it.",
  pin_confirm_title: "Confirm your PIN",
  pin_mismatch: "PINs don't match. Try again.",
  pin_biometric: "Also unlock with fingerprint — faster, and just as safe",

  // Step 4 – Gift
  gift_title: "Welcome gift",
  gift_amount: "UGX 1,000",
  gift_on_balance: "is on your Minicente balance.",
  gift_subtext:
    "Try it now — make one real payment, free, and see how fast it is. No ID needed yet.",
  gift_cta: "Try my first payment",

  // Step 5 – First win
  firstwin_title: "Your first win — pick one.",
  firstwin_subtext: "It uses your UGX 1,000 gift, costs you nothing.",
  firstwin_yaka: "Buy UGX 1,000 YAKA — electricity tokens to your meter",
  firstwin_airtime: "Send yourself UGX 1,000 airtime — to this number",
  firstwin_protection: "Protected — refunded automatically if it ever fails.",

  // Step 6 – Processing
  processing_title: "Sending…",
  processing_sub: "securing it with the bank.",

  // Step 7 – Success
  success_title: "It works. 🎉",
  success_sub_yaka: "YAKA top-up done in 4 seconds — that's your first win.",
  success_sub_airtime: "Airtime sent in 2 seconds — that's your first win.",
  success_paid: "Paid",
  success_fee: "Fee",
  success_time: "Time",
  success_ref: "Reference",
  success_cta: "Continue",

  // Step 8 – Unlock
  unlock_title: "Unlock the rest",
  unlock_sub:
    "Verify your ID once to send bigger amounts, save, and borrow. Takes about a minute.",
  unlock_perk1: "Send up to UGX 5,000,000",
  unlock_perk2: "Save with goals",
  unlock_perk3: "Qualify for small loans",
  unlock_cta: "Get started",
  unlock_skip: "I'll verify later",

  // OTP email-magic-link note
  otp_email_note: "Click the link we emailed to",
  otp_check_inbox: "Then come back and tap the button below",
  otp_dev_btn: "I clicked the link → Continue",

  // Home screen
  recent_activity: "Recent",
  no_transactions: "No payments yet",
  no_transactions_sub: "Your first payment will appear here",
  kind_bill: "Bill payment",
  kind_airtime: "Airtime",
  kind_send: "Sent",
  kind_receive: "Received",
  kind_savings: "Savings",

  // Grow — pots
  grow_headline: "Grow your money",
  grow_sub: "Small steps, on your terms. Withdraw anytime, no penalty.",
  grow_trust: "Your savings earn 9% a year — held at a licensed bank.",
  pot_section: "Savings goals",
  pot_add: "Add money",
  pot_new: "+ New goal",
  pot_empty_title: "Start your first goal",
  pot_empty_sub: "Even UGX 1,000 a week adds up",
  pot_empty_cta: "Create a goal",
  pot_of_goal: "of {goal} goal",
  pot_earning: "Earning 9% a year",
  pot_autosave_line: "Auto-saves {amount} each {cadence}",
  new_pot_title: "New savings goal",
  new_pot_name: "Goal name",
  new_pot_target: "Target amount (UGX)",
  new_pot_autosave: "Auto-save amount (optional)",
  new_pot_cadence: "How often",
  cadence_none: "One-off",
  cadence_weekly: "Friday · weekly",
  cadence_monthly: "Monthly",
  add_money_title: "Add to {name}",
  add_money_btn: "Add {amount}",
  sheet_cancel: "Cancel",
  sheet_save: "Save",

  // Grow — chama
  chama_section: "Chama — group savings",
  chama_explain:
    "A chama is a savings group — everyone contributes, and each round one member receives the pot.",
  chama_contribute: "Contribute",
  chama_join_start: "Join or start a chama",
  chama_empty_title: "No chama yet",
  chama_empty_sub: "Join or start one with friends and family",
  chama_turn_now: "Your turn to receive this round ✓",
  chama_turn_in: "Your turn to receive in {n} weeks",
  chama_members: "{n} members",
  chama_per_week: "UGX {amount}/week",
  chama_per_month: "UGX {amount}/month",
  new_chama_title: "Join or start a chama",
  chama_name_label: "Chama name",
  chama_contrib_label: "Contribution amount",
  chama_cadence_label: "Frequency",
  chama_start_btn: "Start new chama",
  chama_join_btn: "Join",
  chama_existing: "Existing chamas you can join",

  // Me screen
  sign_out: "Sign out",
  referral_code: "Referral code",
  share: "Share",
  account: "Account",
  level: "Level",
  verified: "Verified",
  kyc_unverified: "Unverified",

  // Home jobs
  job_yaka: "Pay YAKA",
  job_water: "Water",
  job_send: "Send",
  job_cash: "Get cash",
  job_airtime: "Airtime",
  what_to_do: "What do you want to do?",
  nudge_topup_title: "Your YAKA is usually low about now — top up?",
  nudge_topup_cta: "Top up",
  nudge_save_title: "You've got a little extra this month — save some?",
  nudge_save_cta: "Save it",
  fees_saved_title: "Fees saved vs other apps",
  fees_saved_cta: "Save it",
  social_proof: "{count} people in {city} paid a bill on Minicente today",
  ussd_footer: "No data or smartphone? Dial *384# on any phone",
  last_refund_line: "Last failed payment · refunded in {seconds}s ↩",

  // Pay flow — generic
  pay_field_meter: "Meter number",
  pay_field_account: "Account number",
  pay_field_phone: "Phone number",
  pay_field_recipient: "Recipient phone (+256)",
  pay_field_note: "Note (optional)",
  pay_amount: "Amount",
  pay_fee_line: "Fee UGX 0",
  pay_protected: "🛡 Protected — refunded automatically if it fails",
  pay_not_enough: "Not enough balance — add money",
  pay_continue: "Continue",
  pay_confirm_title: "Confirm payment",
  pay_confirm_paying_for: "Paying for",
  pay_confirm_to: "To",
  pay_confirm_amount: "Amount",
  pay_confirm_fee: "Fee",
  pay_confirm_total: "Total",
  pay_confirm_cta: "Pay {amount}",
  pay_processing_title: "Sending…",
  pay_processing_sub: "securing it with the bank",
  pay_label_yaka: "Pay YAKA",
  pay_label_water: "Pay water (NWSC)",
  pay_label_airtime: "Buy airtime",
  pay_label_send: "Send money",

  // Result — success
  result_done_seconds: "Done in {seconds} seconds",
  result_paid: "Paid",
  result_fee: "Fee",
  result_time: "Time",
  result_reference: "Reference",
  result_done_btn: "Done",
  result_pay_another: "Pay another",

  // Result — failure / refund
  result_failed_title: "That payment didn't go through — so we're refunding you now.",
  result_refunding: "Refunding your money…",
  result_refunded_title: "Refunded {amount} in {seconds} seconds ✓",
  result_refund_ref: "Refund reference",
  how_refunds_work: "How refunds work",

  // Get cash / agents
  cash_header: "Get cash nearby",
  cash_sub:
    "Cash in or out at a shop you already know. We show only agents who have cash right now.",
  cash_nearby_count: "{count} agents within 500m",
  cash_status_ready: "Cash ready",
  cash_status_low: "Low — call first",
  cash_status_out: "No cash now",
  cash_verified: "Verified ✓ shows a Minicente sign",
  cash_in: "Cash in",
  cash_out: "Cash out",
  cash_call: "Call agent",
  no_agents: "No agents nearby right now",
} as const;

export type I18nKey = keyof typeof en;

// ─── Luganda ─────────────────────────────────────────────────────────────────

const lug: Record<I18nKey, string> = {
  greeting_morning: "Wasuze otya nno",
  greeting_webale: "Webale, wasuze otya nno",
  home: "Awaka",
  grow: "Kulungi",
  cash: "Sente",
  me: "Nze",
  coming_soon: "Ekijja mu nkola ennamba",
  safety_tagline: "Ssente zo zirinzikira",
  trust_ribbon:
    "Ssente zo zirinzikira — zisinziirizibwa mu bank eyateekebwawo, osubulwa sente zo singa okusaasaana kufaayo",
  success_rate: "Njukizo 99.4%",
  notifications: "Obubaka",
  safety: "Obukuumi",
  send: "Waŋdissa",
  receive: "Nkwata",
  balance: "Omuwendo",
  transactions: "Emikolere",
  see_all: "Laba byonna",
  switch_lang: "English",

  trust_line:
    "🛡 Waakiririzibwa Banki ya Uganda · ssente zisinziirizibwa mu banki eyateekebwawo",
  continue: "Endeera",
  back: "Zaamuuka",

  onb_headline: "Ssente ezikolera bulijjo.",
  onb_subtext:
    "Yosegeke, sirinzikira, mangu — seereza, tereka, weerezereza okuva ku ssimu yo.",

  phone_title: "Ennamba ya ssimu yo?",
  phone_reassurance:
    "Kino kye akawunti yo — ng'eMobile Money. Teefuna bikapu, neera bank.",
  phone_ussd_hint: "Tolina smartphone? Osobola okozesa Minicente ku *384#",

  otp_title: "Yingiza koodi",
  otp_sent: "Tuweereza koodi ez'ebinumerro 5 ku SMS eri",
  otp_resend: "Wereza nate mu",
  otp_resend_now: "Wereza koodi nate",
  otp_demo: "demo: 12345",

  pin_title: "Kola PIN okukuuma ssente zo.",
  pin_warning: "Kikuume nga esiri — abaana ba Minicente tabaakubuuza.",
  pin_confirm_title: "Kakasa PIN yo",
  pin_mismatch: "PIN ezitawagana. Gezaako nate.",
  pin_biometric:
    "Nnyonnyola n'olupapula lw'engalo — mangu, era sirinzika bwekityo",

  gift_title: "Wammwanyi",
  gift_amount: "UGX 1,000",
  gift_on_balance: "eri ku ssente zo ez'e Minicente.",
  gift_subtext:
    "Gezaako kaakano — seereza essente emu, bwerere, laba mangu. Teefuna kitambulizo.",
  gift_cta: "Gezaako okuseereza okusookerwamu",

  firstwin_title: "Kulembera kwo — londa kimu.",
  firstwin_subtext: "Kigozesa UGX 1,000 wammwanyi wo, tekutwala kimu.",
  firstwin_yaka: "Gula UGX 1,000 YAKA — amaanyi ag'amasannyalaze ku meter yo",
  firstwin_airtime: "Weeweereza UGX 1,000 airtime — ku nnamba eno",
  firstwin_protection:
    "Sirinzikira — osubulibwa ssente zo amangu singa kizikirira.",

  processing_title: "Tuseereza…",
  processing_sub: "tukikuuma n'omulamwa.",

  success_title: "Kikoze. 🎉",
  success_sub_yaka:
    "YAKA ezimala mu ssekunde 4 — ekyo kulembera kwo okusookerwamu.",
  success_sub_airtime:
    "Airtime eweereddwa mu ssekunde 2 — ekyo kulembera kwo okusookerwamu.",
  success_paid: "Waseereza",
  success_fee: "Omusaasaane",
  success_time: "Ekiseera",
  success_ref: "Olukalala",
  success_cta: "Endeera",

  unlock_title: "Ggulawo ebirala",
  unlock_sub:
    "Kakasa kitambulizo kyo omu kyakuuma okuwereza ssente nnyingi, okutereka, n'okuguza. Bigula eddakiika emu.",
  unlock_perk1: "Wereza okutuuka ku UGX 5,000,000",
  unlock_perk2: "Tereka n'ebisuubirizo",
  unlock_perk3: "Ndirizibwa okuguza ssente ntono",
  unlock_cta: "Tandika",
  unlock_skip: "Ndikakilanga nyuma",

  otp_email_note: "Nyiga omukutu gwe tuweereza eri",
  otp_check_inbox: "Naddamu ejja onasiibe buto wansi",
  otp_dev_btn: "Nyiga omukutu → Endeera",

  recent_activity: "Emikolere",
  no_transactions: "Tewali ssente eziseerezeddwa",
  no_transactions_sub: "Okuseereza kwo okusookerwamu kunaaboneka wano",
  kind_bill: "Okusaasaana",
  kind_airtime: "Airtime",
  kind_send: "Waseereza",
  kind_receive: "Wagezaako",
  kind_savings: "Okutereka",

  grow_headline: "Kulungia ssente zo",
  grow_sub: "Amagezi manootono, ku ngeri yo. Ggya buli kiseera, tewali mulango.",
  grow_trust: "Ssente zo ziziika ku 9% ku mwaka — zisinziirizibwa mu banki eyateekebwawo.",
  pot_section: "Ebisuubirizo by'okutereka",
  pot_add: "Yongeza ssente",
  pot_new: "+ Esuubirizo eddya",
  pot_empty_title: "Tandika esuubirizo lyo okusookerwamu",
  pot_empty_sub: "Ne UGX 1,000 emu buli wiiki egatta",
  pot_empty_cta: "Kola esuubirizo",
  pot_of_goal: "ku {goal} esuubirizo",
  pot_earning: "Oziika ku 9% ku mwaka",
  pot_autosave_line: "Etereka {amount} buli {cadence} wenyini",
  new_pot_title: "Esuubirizo eddya ly'okutereka",
  new_pot_name: "Erinnya ly'esuubirizo",
  new_pot_target: "Omuwendo ogw'esuubirizo (UGX)",
  new_pot_autosave: "Omuwendo ogw'okutereka wenyini (si bya lwatu)",
  new_pot_cadence: "Emirundi emeka",
  cadence_none: "Omu",
  cadence_weekly: "Olwokutaano · buli wiiki",
  cadence_monthly: "Buli mwezi",
  add_money_title: "Yongeza ku {name}",
  add_money_btn: "Yongeza {amount}",
  sheet_cancel: "Sazaamu",
  sheet_save: "Tereka",

  chama_section: "Chama — okutereka ku kibiina",
  chama_explain:
    "Chama ye kibiina ky'okutereka — buli omu atera, era buli ekitundu omu wa kibiina afuna ebitereka byonna.",
  chama_contribute: "Tera",
  chama_join_start: "Yingira oba tandika chama",
  chama_empty_title: "Tewali chama gya",
  chama_empty_sub: "Yingira oba tandika n'abooluganda n'emikwano",
  chama_turn_now: "Ekitundu kyo okufuna kati ✓",
  chama_turn_in: "Okufuna mu wiiki {n}",
  chama_members: "Abantu {n}",
  chama_per_week: "UGX {amount}/wiiki",
  chama_per_month: "UGX {amount}/mwezi",
  new_chama_title: "Yingira oba tandika chama",
  chama_name_label: "Erinnya lya chama",
  chama_contrib_label: "Omuwendo ogw'okutera",
  chama_cadence_label: "Emirundi",
  chama_start_btn: "Tandika chama empya",
  chama_join_btn: "Yingira",
  chama_existing: "Echama ez'osobola okuyingira",

  sign_out: "Fuluma",
  referral_code: "Koodi y'okusindika",
  share: "Gawana",
  account: "Akawunti",
  level: "Entikko",
  verified: "Kakasiddwa",
  kyc_unverified: "Tekakasiddwa",

  job_yaka: "Sasula YAKA",
  job_water: "Amazzi",
  job_send: "Weereza",
  job_cash: "Funa ssente",
  job_airtime: "Airtime",
  what_to_do: "Oyagala kukola ki?",
  nudge_topup_title: "YAKA yo etera okuba ntono mu kiseera kino — wewunyemu?",
  nudge_topup_cta: "Wewunyemu",
  nudge_save_title: "Olina otufaali ku mwezi guno — tereka?",
  nudge_save_cta: "Tereka",
  fees_saved_title: "Omusaasaane gwoterekeddwa",
  fees_saved_cta: "Tereka",
  social_proof: "Abantu {count} mu {city} basasudde bbiili ku Minicente leero",
  ussd_footer: "Tolina data oba smartphone? Koona *384# ku ssimu yonna",
  last_refund_line: "Okusasula okwasoose okugaana · wasubuziddwa mu {seconds}s ↩",

  pay_field_meter: "Ennamba ya meter",
  pay_field_account: "Ennamba y'akawunti",
  pay_field_phone: "Ennamba ya ssimu",
  pay_field_recipient: "Ennamba ya ssimu y'oafuna (+256)",
  pay_field_note: "Obubaka (si bya lwatu)",
  pay_amount: "Omuwendo",
  pay_fee_line: "Omusaasaane UGX 0",
  pay_protected: "🛡 Sirinzikira — osubulibwa amangu singa kigaanye",
  pay_not_enough: "Ssente tezimala — yongeza ssente",
  pay_continue: "Endeera",
  pay_confirm_title: "Kakasa okusasula",
  pay_confirm_paying_for: "Osasulira",
  pay_confirm_to: "Eri",
  pay_confirm_amount: "Omuwendo",
  pay_confirm_fee: "Omusaasaane",
  pay_confirm_total: "Bigatte",
  pay_confirm_cta: "Sasula {amount}",
  pay_processing_title: "Tuseereza…",
  pay_processing_sub: "tukikuuma n'omulamwa",
  pay_label_yaka: "Sasula YAKA",
  pay_label_water: "Sasula amazzi (NWSC)",
  pay_label_airtime: "Gula airtime",
  pay_label_send: "Weereza ssente",

  result_done_seconds: "Kikoze mu ssekunde {seconds}",
  result_paid: "Wasasudde",
  result_fee: "Omusaasaane",
  result_time: "Ekiseera",
  result_reference: "Olukalala",
  result_done_btn: "Kikoze",
  result_pay_another: "Sasula endala",

  result_failed_title: "Okusasula tekugenze bulungi — kati tukusubuliza ssente zo.",
  result_refunding: "Tukusubuliza ssente zo…",
  result_refunded_title: "Wasubuziddwa {amount} mu ssekunde {seconds} ✓",
  result_refund_ref: "Olukalala lw'okusubuza",
  how_refunds_work: "Engeri okusubuza gye kukolamu",

  cash_header: "Funa ssente okumpi",
  cash_sub:
    "Teeka oba ggya ssente mu ssaaja gy'omanyi. Tulaga bobeera abalina ssente mu kiseera kino.",
  cash_nearby_count: "Bateekateeka {count} mu mita 500",
  cash_status_ready: "Ssente weziri",
  cash_status_low: "Ntono — koona olubereberye",
  cash_status_out: "Tewali ssente kati",
  cash_verified: "Kakasiddwa ✓ alaga akabonero ka Minicente",
  cash_in: "Teeka ssente",
  cash_out: "Ggya ssente",
  cash_call: "Koona ateekateeka",
  no_agents: "Tewali bateekateeka okumpi kati",
};

// ─── Context & provider ───────────────────────────────────────────────────────

export const dict = { en, lug } as const;

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: I18nKey) => string;
}

const I18nContext = createContext<I18nCtx>({
  lang: "en",
  setLang: () => {},
  t: (key) => en[key],
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mc_lang");
      if (saved === "en" || saved === "lug") setLangState(saved);
    } catch {}
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("mc_lang", l);
    } catch {}
  };

  const t = (key: I18nKey): string =>
    (lang === "en" ? (en as Record<string, string>) : lug)[key] ?? en[key];

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useT() {
  return useContext(I18nContext);
}
