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

  // Agent surface
  agent_row: "Agent",
  agent_join_headline: "Earn with Minicente",
  agent_join_sub:
    "Turn your shop into a cash point. Earn a commission on every deposit and withdrawal.",
  agent_join_cta: "Become an agent",
  agent_joining: "Setting up your agent account…",
  agent_code_label: "Agent code",
  agent_tier_label: "Tier",
  agent_earnings_today: "Earned today",
  agent_earnings_lifetime: "Lifetime earnings",
  agent_float_available: "Float available",
  agent_txns_today: "Transactions today",
  agent_float_section: "Your float",
  agent_float_topup: "Top up float",
  agent_float_repay: "Repay float",
  agent_float_topup_title: "Top up your float",
  agent_float_topup_sub:
    "Float credit at 2% monthly, repaid automatically from your commissions.",
  agent_float_repay_title: "Repay float",
  agent_float_low: "Not enough float — top up your float first",
  agent_cashin: "Cash In",
  agent_cashout: "Cash Out",
  agent_open_account: "Open Account",
  agent_pay_bill: "Pay Bill",
  agent_cashin_title: "Cash In — customer deposits",
  agent_cashout_title: "Cash Out — customer withdraws",
  agent_customer_phone: "Customer phone",
  agent_amount_label: "Amount (UGX)",
  agent_commission_label: "Your commission",
  agent_done: "Done",
  agent_open_stub:
    "Account opening for walk-in customers is coming soon — direct them to download Minicente.",
  agent_calc_title: "See what you could earn",
  agent_calc_txns: "CICO transactions per day",
  agent_calc_avg: "Average transaction size",
  agent_calc_monthly: "Projected monthly earnings",
  agent_calc_note: "Based on 0.5% commission × 26 working days",
  agent_tier_strip_title: "Tier milestones",
  tier_bronze: "Bronze",
  tier_silver: "Silver",
  tier_gold: "Gold",
  agent_tier_perk_bronze: "0–50 txns · 0.5% commission · UGX 2M float",
  agent_tier_perk_silver: "51–200 txns · 0.6% commission · UGX 3.5M float",
  agent_tier_perk_gold: "200+ txns · 0.7% commission · UGX 5M float + branded signage",
  agent_next_tier_bronze: "50 more transactions → Silver → 0.6% commission",
  agent_next_tier_silver: "150 more transactions → Gold → 0.7% + UGX 5M float",
  agent_top_tier: "You're at Gold — the highest tier. Well done!",

  // Level system
  level_card_title: "Your Minicente Level",
  level_starter: "Starter",
  level_silver: "Silver",
  level_gold: "Gold",
  level_platinum: "Platinum",
  level_progress: "{n} more payments to unlock {level}",
  level_unlock_hint: "Unlocks at {level} — {perks}",
  level_maxed: "You've reached the top level!",

  // Loan
  loan_card_title: "You qualify for a small loan",
  loan_card_sub: "small loan, repay over 30 days",
  loan_card_view: "View",
  loan_not_eligible: "Pay {n} more bills to unlock a small loan",
  loan_not_eligible_sub: "Keep using Minicente to build your eligibility",
  loan_terms_title: "Small loan",
  loan_amount_label: "Amount",
  loan_term_label: "Repay in",
  loan_term_value: "30 days",
  loan_fee_label: "Fee",
  loan_fee_value: "UGX 5,000 flat",
  loan_how: "Repaid automatically from your balance when due",
  loan_apply: "Apply",
  loan_applied_title: "Application received",
  loan_applied_sub:
    "We'll review and credit your balance — usually within 24 hours. We'll notify you.",
  loan_apply_note:
    "No surprises — you'll see the exact repayment before we release anything.",

  // Nudges
  nudge_pot_title: "Add to your {name} — you're {pct}% there",
  nudge_pot_cta: "Add now",
  nudge_loan_title: "You qualify for a small loan — {amount}",
  nudge_loan_cta: "View",
  nudge_fees_title: "You've saved {amount} on fees this month — move it to savings?",
  nudge_fees_cta: "Save it",
  nudge_chama_title: "Chama contribution due — {name}",
  nudge_chama_cta: "Contribute",

  // Safety page
  safety_title: "Why Minicente is safe",
  safety_licensed_title: "Your money is held at a licensed bank",
  safety_licensed_body:
    "Kept in a regulated trust account — never lent out without your say.",
  safety_refund_title: "Automatic refunds",
  safety_refund_body:
    "If a payment doesn't go through, it reverses to you in under 30 seconds — no calls needed.",
  safety_bou_title: "Licensed by Bank of Uganda",
  safety_bou_body:
    "PSP Licence [000-000]. Verify us on the BoU public register at bou.or.ug.",
  safety_support_title: "A person always answers",
  safety_support_body:
    "Call 0800-XXX-XXX free, in Luganda or English, 7 days a week. No bots for urgent issues.",
  safety_how_refunds: "How refunds work",
  safety_step1: "Payment is attempted and secured with the bank",
  safety_step2: "If it fails, we detect it within seconds",
  safety_step3: "Your money is back in your balance automatically",
  safety_rate_label: "Payment success rate (last 30 days)",
  safety_guarantee: "Every payment is guaranteed — or your money back.",

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

  // Edit profile
  edit_profile: "Edit profile",
  edit_profile_name: "Full name",
  edit_profile_save: "Save changes",
  edit_profile_saving: "Saving…",

  // KYC / Verify
  verify_title: "Verify your identity",
  verify_sub: "Verify once to unlock bigger limits. Takes about a minute.",
  kyc_tier_done: "Verified ✓",
  kyc_tier_pending: "Under review",
  kyc_tier_action: "Verify now",
  tier1_title: "Phone verified",
  tier1_body: "Your phone number is confirmed — you already have Tier 1.",
  tier1_limit: "Send up to UGX 500,000 / day",
  tier2_title: "National ID",
  tier2_body: "Verify your national ID to send bigger amounts and qualify for small loans.",
  tier2_limit: "Send up to UGX 5,000,000 / day",
  tier2_id_label: "National ID number",
  tier2_photo_label: "Photo of ID (front)",
  tier2_upload: "Choose photo",
  tier2_cta: "Submit for review",
  tier2_reviewing: "Reviewing your ID — usually a few minutes",
  tier2_done: "National ID verified ✓",
  tier3_title: "Business registration",
  tier3_body: "Register your business to receive merchant payments and higher daily limits.",
  tier3_limit: "Send up to UGX 20,000,000 / day",
  tier3_biz_name: "Business name",
  tier3_biz_type: "Business type",
  tier3_cta: "Register business",
  tier3_reviewing: "Reviewing your registration",
  tier3_done: "Business registered ✓",
  kyc_why: "Why verify?",
  kyc_why_body: "Your phone is already your account. Verifying your ID is only needed to raise limits — your money is safe either way.",

  // Settings
  settings_title: "Settings",
  settings_language: "Language",
  settings_notifications: "Payment notifications",
  settings_notifications_sub: "Get notified when payments succeed or fail",
  settings_pin_change: "Change PIN",
  settings_pin_current: "Enter your current PIN",
  settings_pin_new: "Create new PIN",
  settings_pin_confirm: "Confirm new PIN",
  settings_pin_changed: "PIN changed ✓",
  settings_support: "Call support — free",
  settings_support_sub: "0800-XXX-XXX · Luganda or English · 7 days",
  settings_version: "App version",
  settings_safety_link: "Why Minicente is safe",

  // OTP real flow
  otp_dev_hint: "Dev code:",
  otp_sending: "Sending code…",
  otp_verifying: "Verifying…",
  otp_code_error: "That code isn't right — try again",
  otp_send_error: "Couldn't send code — try again",

  // Biller validate step (yaka / water)
  validate_checking: "Checking account…",
  validate_ok: "Account confirmed ✓",
  validate_fail: "Account not found — check the number",
  validate_customer: "Customer",
  validate_meter_label: "Meter / Account",
  validate_provider_ref: "Provider ref",

  // Pilot mode — honest test-money labelling
  pilot_badge: "Pilot — test funds, not real money yet",
  pilot_confirm: "Pilot payment — no real money will move",
  pilot_receipt: "This is a pilot payment — no real money moved.",

  // Pilot feedback sheet
  feedback_btn: "Feedback",
  feedback_title: "Tell us what happened",
  feedback_placeholder: "What worked well — or what didn't?",
  feedback_submit: "Send",
  feedback_sending: "Sending…",
  feedback_thanks: "Thank you — we read every message.",
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

  agent_row: "Kolera ne Minicente",
  agent_join_headline: "Funa ssente okukola naffe",
  agent_join_sub:
    "Tiitiira okusasula era okufuna ssente — wewu n'omwoyo oguggwa.",
  agent_join_cta: "Banga omukozi",
  agent_joining: "Okwegatta...",
  agent_code_label: "Koodi yo",
  agent_tier_label: "Entikko",
  agent_earnings_today: "Funa ennaku eno",
  agent_earnings_lifetime: "Funa yonna",
  agent_float_available: "Float eyabaawo",
  agent_txns_today: "Okusasula kw'ennaku eno",
  agent_float_section: "Float yo",
  agent_float_topup: "Yongeza Float",
  agent_float_repay: "Ddiza Float",
  agent_float_topup_title: "Yongeza float yo",
  agent_float_topup_sub: "Sendi ssente okuva ku ssente zo z'ebintu",
  agent_float_repay_title: "Ddiza float",
  agent_float_low: "⚠️ Float ntono — yongeza kati",
  agent_cashin: "Sendi Ssente",
  agent_cashout: "Funa Ssente",
  agent_open_account: "Malaŋi Akawunti",
  agent_pay_bill: "Sasula Bbiili",
  agent_cashin_title: "Sendi ssente ku mulimu",
  agent_cashout_title: "Funa ssente ze mulimu",
  agent_customer_phone: "Simu ya mulimu",
  agent_amount_label: "Omuwendo (UGX)",
  agent_commission_label: "Komisayo yo",
  agent_done: "Wayisibwa",
  agent_open_stub: "Ekikola kino kijja mu kiseera ekiddako",
  agent_calc_title: "Funa mmeka buli mwezi?",
  agent_calc_txns: "Okusasula buli lunaku",
  agent_calc_avg: "Omuwendo omugguza",
  agent_calc_monthly: "Funa omuwaka",
  agent_calc_note: "Enteebereza. Funa yo ey'amazima gikuuma ku nteekateeka yo.",
  agent_tier_strip_title: "Entikko z'omukozi",
  tier_bronze: "Braunzi",
  tier_silver: "Fedha",
  tier_gold: "Zaabu",
  agent_tier_perk_bronze: "Komisayo 0.8% + simu w'obujja",
  agent_tier_perk_silver: "Komisayo 1.0% + float yongezebwa",
  agent_tier_perk_gold: "Komisayo 1.2% + ogendererwa bwewu",
  agent_next_tier_bronze: "Sasula {n} nate okuggula Fedha",
  agent_next_tier_silver: "Sasula {n} nate okuggula Zaabu",
  agent_top_tier: "Ogezaako entikko ey'okumaliriza! 🎉",

  level_card_title: "Entikko yo y'e Minicente",
  level_starter: "Omutandisi",
  level_silver: "Fedha",
  level_gold: "Zaabu",
  level_platinum: "Platinum",
  level_progress: "Ssasula {n} nate okuggula {level}",
  level_unlock_hint: "Egulawo ku {level} — {perks}",
  level_maxed: "Ogezaako entikko ey'okumaliriza!",

  loan_card_title: "Oyetegese okuguza ssente ntono",
  loan_card_sub: "guza ssente ntono, ozireeta mu nnaku 30",
  loan_card_view: "Laba",
  loan_not_eligible: "Sasula bbiili {n} nate okuggula nguzi entono",
  loan_not_eligible_sub: "Endeera okozesa Minicente okuzimba obuyinza bwo",
  loan_terms_title: "Nguzi ntono",
  loan_amount_label: "Omuwendo",
  loan_term_label: "Oreeta mu",
  loan_term_value: "Nnaku 30",
  loan_fee_label: "Omusaasaane",
  loan_fee_value: "UGX 5,000 wamu",
  loan_how: "Esubulwa wenyini okuva ku ssente zo mu kiseera ekiteeka",
  loan_apply: "Saba",
  loan_applied_title: "Okusaba kwagezaako",
  loan_applied_sub:
    "Tuliddamu era tubaliriza ssente zo — bulijjo mu saawa 24. Tunaakubulira.",
  loan_apply_note:
    "Tewali bitali biragwa — olilaba okuzireeta nga teri ekinaakuzirisibwa.",

  nudge_pot_title: "Yongeza ku {name} — oli ku {pct}% gy'ogenda",
  nudge_pot_cta: "Yongeza kati",
  nudge_loan_title: "Oyetegese okuguza ssente ntono — {amount}",
  nudge_loan_cta: "Laba",
  nudge_fees_title: "Wotereka {amount} ku biwereza buno mwezi — tereka?",
  nudge_fees_cta: "Tereka",
  nudge_chama_title: "Ekiseera ky'okutera mu chama — {name}",
  nudge_chama_cta: "Tera",

  safety_title: "Lwaki Minicente esirinzika",
  safety_licensed_title: "Ssente zo zisinziirizibwa mu banki eyateekebwawo",
  safety_licensed_body:
    "Zisinziirizibwa mu akawunti akeera — teziwereddwako wewutyo nga tokkiriza.",
  safety_refund_title: "Okusubula kwennyini",
  safety_refund_body:
    "Singa okusasula tekugenze bulungi, osubulibwa mu ssekunde 30 — tewali kukoona.",
  safety_bou_title: "Waakiririzibwa Banki ya Uganda",
  safety_bou_body:
    "Laisiisi ya PSP [000-000]. Kakasa ku rejista ya BoU ku bou.or.ug.",
  safety_support_title: "Omu bulijjo addamu",
  safety_support_body:
    "Koona 0800-XXX-XXX bwerere, mu Luganda oba Olungereza, ennaku 7 mu wiiki.",
  safety_how_refunds: "Engeri okusubula gye kukolamu",
  safety_step1: "Okusasula kukozesebwa era kukuumibwa n'omulamwa",
  safety_step2: "Singa kigaana, tukiraba mu ssekunde ntono",
  safety_step3: "Ssente zo zisubulibwa ku ssente zo wenyini",
  safety_rate_label: "Enteekateeka y'okusasula (ennaku 30 eziyise)",
  safety_guarantee: "Buli okusasula kusirinzikizibwa — oba ssente zo zisubulibwa.",

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

  // Edit profile
  edit_profile: "Kyusa simu yo",
  edit_profile_name: "Erinnya lyo lyonna",
  edit_profile_save: "Zachitwa",
  edit_profile_saving: "Kuzachitwa…",

  // KYC / Verify
  verify_title: "Kakasa obwangaazi bwo",
  verify_sub: "Kakasa omulundi omu okufungula obungi. Bikwata omuli nkumi.",
  kyc_tier_done: "Wakakasibwa ✓",
  kyc_tier_pending: "Tulinnoonya",
  kyc_tier_action: "Kakasa kati",
  tier1_title: "Ssimu yakakasibwa",
  tier1_body: "Ennamba ya ssimu yo yakakasibwa — olina Entikko 1 naawe.",
  tier1_limit: "Weerezereza okutuuka ku UGX 500,000 / lunaku",
  tier2_title: "Kasulu y'eggwanga",
  tier2_body: "Kakasa kasulu yo okukola emirimo mingi ne okwetaba mu nguzi entono.",
  tier2_limit: "Weerezereza okutuuka ku UGX 5,000,000 / lunaku",
  tier2_id_label: "Ennamba ya kasulu y'eggwanga",
  tier2_photo_label: "Kifaananyi kya kasulu (mu maaso)",
  tier2_upload: "Londa kifaananyi",
  tier2_cta: "Wereza okukebera",
  tier2_reviewing: "Tulinoonya kasulu yo — bulijjo mu minzaana mingi",
  tier2_done: "Kasulu y'eggwanga yakakasibwa ✓",
  tier3_title: "Okuwolereza bizinensi",
  tier3_body: "Wolereza bizinensi yo okuweebwa ssente z'obugula era n'emigrabu emikubafu.",
  tier3_limit: "Weerezereza okutuuka ku UGX 20,000,000 / lunaku",
  tier3_biz_name: "Erinnya lya bizinensi",
  tier3_biz_type: "Engeri ya bizinensi",
  tier3_cta: "Wolereza bizinensi",
  tier3_reviewing: "Tulinoonya okuwolereza kwo",
  tier3_done: "Bizinensi yawolereza ✓",
  kyc_why: "Lwaki okakasa?",
  kyc_why_body: "Ssimu yo ye akawunti yo. Okukakasa kasulu yo kufiirirwa okukulaakulanya emigrabu — ssente zo zirinzikira mu ngeri yonna.",

  // Settings
  settings_title: "Ebisobanuro",
  settings_language: "Olulimi",
  settings_notifications: "Obubaka bw'okusasula",
  settings_notifications_sub: "Obuulirwa nga okusasula kugenze bulungi oba tekugenze",
  settings_pin_change: "Kyusa PIN",
  settings_pin_current: "Yingiza PIN yo egiawo",
  settings_pin_new: "Kola PIN eddya",
  settings_pin_confirm: "Kakasa PIN eddya",
  settings_pin_changed: "PIN yakyusibwa ✓",
  settings_support: "Koona obujjanjabi — bwerere",
  settings_support_sub: "0800-XXX-XXX · Luganda oba Olungereza · Ennaku 7",
  settings_version: "Ekiteeso kya app",
  settings_safety_link: "Lwaki Minicente esirinzika",

  // OTP real flow
  otp_dev_hint: "Koodi ya dev:",
  otp_sending: "Tuweereza koodi…",
  otp_verifying: "Tukakasa…",
  otp_code_error: "Koodi etoonye — gezaako nate",
  otp_send_error: "Tetwayinza kujjira koodi — gezaako nate",

  // Biller validate step (yaka / water)
  validate_checking: "Tulinnoonya akawunti…",
  validate_ok: "Akawunti yagundibwa ✓",
  validate_fail: "Akawunti etayitibwa — kakasa ennamba",
  validate_customer: "Omulimu",
  validate_meter_label: "Meter / Akawunti",
  validate_provider_ref: "Olukalala lwa omuwereza",

  // Pilot mode
  pilot_badge: "Pilot — sente ez'okugerezaganya, si sente nzimbu",
  pilot_confirm: "Okusaasaanya kwa pilot — sente nzimbu tezizze",
  pilot_receipt: "Kino kye kusaasaanya kwa pilot — sente nzimbu tezaava.",

  // Pilot feedback sheet
  feedback_btn: "Ebiteeko",
  feedback_title: "Tubuulire ekibaddewo",
  feedback_placeholder: "Ekikoze bulungi — oba ekitakoze?",
  feedback_submit: "Weereza",
  feedback_sending: "Ebirumba…",
  feedback_thanks: "Webale — tusome buli obubaka.",
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
