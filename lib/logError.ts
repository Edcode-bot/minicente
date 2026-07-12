"use client";

// Required SQL (run in Supabase SQL editor):
//
// CREATE TABLE IF NOT EXISTS error_log (
//   id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
//   message    text NOT NULL,
//   context    jsonb NOT NULL DEFAULT '{}',
//   user_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
//   created_at timestamptz NOT NULL DEFAULT now()
// );
// CREATE INDEX ON error_log (created_at DESC);
//
// ALTER TABLE error_log ENABLE ROW LEVEL SECURITY;
// -- Anyone (including anon) can INSERT; nobody can SELECT from the client.
// CREATE POLICY "error_log_insert" ON error_log FOR INSERT TO anon, authenticated WITH CHECK (true);

import { createClient } from "@/lib/supabase/client";

export function logError(
  message: string,
  context: Record<string, unknown> = {},
  userId?: string
): void {
  // Fire-and-forget — never throws, never blocks the UI.
  void (async () => {
    try {
      const supabase = createClient();
      await supabase.from("error_log").insert({
        message: message.slice(0, 500),
        context,
        user_id: userId ?? null,
      });
    } catch {
      // Logging must never crash the app
    }
  })();
}
