import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";

// POST /api/otp/verify
// Auth bridge: anon signUp/signIn with mc-<digits>@minicente.dev (no service role needed).
// Falls back to admin generateLink if SUPABASE_SERVICE_ROLE_KEY is present.
// Code is marked consumed only after successful auth.

function hashCode(code: string, phone: string): string {
  return createHash("sha256").update(`${code}:${phone}`).digest("hex");
}

function anonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function adminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function clientError(status: number, error: string) {
  return NextResponse.json({ ok: false, error }, { status });
}

// Best-effort server-side error log — uses anon key, never throws.
async function dbLogError(
  anon: ReturnType<typeof anonClient>,
  message: string,
  context: Record<string, unknown>
) {
  try {
    await anon.from("error_log").insert({ message: message.slice(0, 500), context });
  } catch {
    // Never let logging crash the auth flow
  }
}

export async function POST(req: NextRequest) {
  console.log("[OTP verify] --- request received ---");

  let body: { phone?: string; code?: string };
  try {
    body = await req.json();
  } catch (e) {
    console.error("[OTP verify] parse error:", String(e));
    return clientError(400, "Invalid JSON");
  }

  const digits = String(body.phone ?? "").replace(/\D/g, "");
  const codeInput = String(body.code ?? "").trim();
  console.log(`[OTP verify] phone=${digits} codeLen=${codeInput.length}`);

  if (!digits || !codeInput || codeInput.length !== 5) {
    return clientError(400, "phone and 5-digit code required");
  }

  const submittedHash = hashCode(codeInput, digits);
  const now = new Date().toISOString();

  // ── DB lookup ────────────────────────────────────────────────────────────
  console.log("[OTP verify] step=db-lookup");
  const anon = anonClient();
  let record: { id: string; code: string } | null = null;

  try {
    const { data, error: lookupError } = await anon
      .from("otp_codes")
      .select("id, code")
      .eq("phone", digits)
      .eq("consumed", false)
      .gt("expires_at", now)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lookupError) {
      console.error("[OTP verify] db-lookup error:", lookupError.message, lookupError.code);
      return clientError(500, "Verification failed");
    }
    record = data as { id: string; code: string } | null;
    console.log(`[OTP verify] db-lookup: ${record ? "found id=" + record.id : "NOT FOUND"}`);
  } catch (e) {
    console.error("[OTP verify] db-lookup threw:", String(e));
    return clientError(500, "Verification failed");
  }

  if (!record) {
    // Diagnostic only — never reaches client
    const { data: rawRows } = await anon
      .from("otp_codes")
      .select("id, phone, consumed, expires_at, created_at")
      .eq("phone", digits)
      .order("created_at", { ascending: false })
      .limit(5);
    console.warn("[OTP verify] no valid record; recent rows:", JSON.stringify(rawRows));
    return clientError(401, "Invalid or expired code");
  }

  // ── Hash comparison ──────────────────────────────────────────────────────
  console.log(`[OTP verify] step=hash-compare storedHash=${record.code} submittedHash=${submittedHash}`);
  if (record.code !== submittedHash) {
    console.warn("[OTP verify] hash mismatch");
    return clientError(401, "Invalid or expired code");
  }
  console.log("[OTP verify] hash-compare: MATCH");

  // ── Auth bridge ──────────────────────────────────────────────────────────
  const email = `mc-${digits}@minicente.dev`;
  const password = `MC-${digits}-auth`;
  const admin = adminClient();
  console.log(`[OTP verify] step=auth-bridge email=${email} hasAdmin=${!!admin}`);

  let accessToken: string | null = null;
  let refreshToken: string | null = null;
  let identityMethod = "";

  // Path A: admin generateLink → verifyOtp
  if (admin) {
    console.log("[OTP verify] trying path=admin-generateLink");
    try {
      const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: { data: { phone: `+256${digits}` } },
      });
      console.log(`[OTP verify] generateLink: error=${linkError?.message ?? "none"} hasToken=${!!linkData?.properties?.hashed_token}`);

      if (!linkError && linkData?.properties?.hashed_token) {
        const { data: vd, error: ve } = await anon.auth.verifyOtp({
          token_hash: linkData.properties.hashed_token,
          type: "magiclink",
        });
        console.log(`[OTP verify] verifyOtp: error=${ve?.message ?? "none"} hasSession=${!!vd?.session}`);
        if (!ve && vd?.session) {
          accessToken = vd.session.access_token;
          refreshToken = vd.session.refresh_token;
          identityMethod = "admin-generateLink";
        }
      }
    } catch (e) {
      console.error("[OTP verify] admin-generateLink threw:", String(e));
    }
  }

  // Path B: anon signUp
  if (!accessToken) {
    console.log("[OTP verify] trying path=anon-signUp");
    try {
      const { data: signUpData, error: signUpError } = await anon.auth.signUp({
        email,
        password,
        options: { data: { phone: `+256${digits}` } },
      });
      console.log(`[OTP verify] signUp: error=${signUpError?.message ?? "none"} hasSession=${!!signUpData?.session}`);

      if (signUpError && !signUpError.message.toLowerCase().includes("already registered")) {
        console.error("[OTP verify] signUp hard error:", signUpError.message);
        void dbLogError(anon, signUpError.message, { step: "signUp", email });
        return clientError(500, "Verification failed");
      }
      if (signUpData?.session) {
        accessToken = signUpData.session.access_token;
        refreshToken = signUpData.session.refresh_token;
        identityMethod = "anon-signUp";
      }
    } catch (e) {
      console.error("[OTP verify] signUp threw:", String(e));
      return clientError(500, "Verification failed");
    }
  }

  // Path C: anon signIn (returning user / signUp returned no session)
  if (!accessToken) {
    console.log("[OTP verify] trying path=anon-signIn");
    try {
      const { data: siData, error: siError } = await anon.auth.signInWithPassword({ email, password });
      console.log(`[OTP verify] signIn: error=${siError?.message ?? "none"} hasSession=${!!siData?.session}`);

      if (siError || !siData?.session) {
        // Stale password — reset via admin if available
        if (admin) {
          console.log("[OTP verify] trying path=admin-pw-reset");
          try {
            const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
            const existing = list?.users?.find((u) => u.email === email);
            console.log(`[OTP verify] listUsers found=${!!existing}`);
            if (existing) {
              await admin.auth.admin.updateUserById(existing.id, { password, email_confirm: true });
              const { data: si2, error: si2Error } = await anon.auth.signInWithPassword({ email, password });
              console.log(`[OTP verify] signIn-after-reset: error=${si2Error?.message ?? "none"} hasSession=${!!si2?.session}`);
              if (!si2Error && si2?.session) {
                accessToken = si2.session.access_token;
                refreshToken = si2.session.refresh_token;
                identityMethod = "anon-signIn-pw-reset";
              }
            }
          } catch (e) {
            console.error("[OTP verify] admin-pw-reset threw:", String(e));
          }
        }

        if (!accessToken) {
          console.error("[OTP verify] all auth paths exhausted");
          void dbLogError(anon, "OTP auth: all paths exhausted", { step: "signIn", email, siError: siError?.message });
          return clientError(500, "Verification failed");
        }
      } else {
        accessToken = siData.session.access_token;
        refreshToken = siData.session.refresh_token;
        identityMethod = "anon-signIn";
      }
    } catch (e) {
      console.error("[OTP verify] signIn threw:", String(e));
      return clientError(500, "Verification failed");
    }
  }

  // ── Mark consumed (after successful auth only) ───────────────────────────
  console.log("[OTP verify] step=mark-consumed");
  await anon.from("otp_codes").update({ consumed: true }).eq("id", record.id);

  console.log(`[OTP verify] SUCCESS identity=${identityMethod}`);
  return NextResponse.json({ ok: true, accessToken, refreshToken, identity: identityMethod });
}
