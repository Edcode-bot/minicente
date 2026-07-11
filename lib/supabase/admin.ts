import { createClient } from "@supabase/supabase-js";

// Service-role client — bypasses RLS. SERVER-SIDE ONLY.
// Never import this in client components or expose the key to the browser.
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY not set");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
