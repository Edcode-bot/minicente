"use client";

// Required SQL (run in Supabase SQL editor):
//
// CREATE TABLE IF NOT EXISTS feedback (
//   id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
//   user_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
//   message    text NOT NULL,
//   screen     text NOT NULL DEFAULT 'unknown',
//   mood       text,
//   created_at timestamptz NOT NULL DEFAULT now()
// );
// CREATE INDEX ON feedback (created_at DESC);
//
// ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "feedback_insert" ON feedback FOR INSERT TO authenticated WITH CHECK (true);

import { useState, useEffect, useCallback } from "react";
import { useT } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

type Mood = "bad" | "ok" | "good" | null;

export function FeedbackSheet({ screen }: { screen: string }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [mood, setMood] = useState<Mood>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
    })();
  }, []);

  const handleOpen = useCallback(() => {
    setOpen(true);
    setSubmitted(false);
    setMessage("");
    setMood(null);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    const trimmed = message.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      const supabase = createClient();
      await supabase.from("feedback").insert({
        user_id: userId,
        message: trimmed.slice(0, 1000),
        screen,
        mood,
      });
      setSubmitted(true);
      setTimeout(() => setOpen(false), 2000);
    } catch {
      // Best-effort — close anyway
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }, [message, submitting, userId, screen, mood]);

  const moods: { key: Mood & string; emoji: string }[] = [
    { key: "bad", emoji: t("feedback_mood_bad") },
    { key: "ok",  emoji: t("feedback_mood_ok") },
    { key: "good", emoji: t("feedback_mood_good") },
  ];

  return (
    <>
      {/* Floating pill button — above the bottom nav */}
      <button
        onClick={handleOpen}
        aria-label={t("feedback_btn")}
        className="fixed bottom-24 right-4 z-40 flex items-center gap-1.5 bg-card border border-line shadow-elevated rounded-full px-3 py-2 text-[12px] font-medium text-ink3 hover:text-ink hover:border-ink3 transition-colors"
      >
        <span className="text-base leading-none">💬</span>
        {t("feedback_btn")}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          {/* Sheet */}
          <div className="w-full max-w-[460px] bg-bg rounded-t-[20px] px-5 pt-5 pb-10 shadow-elevated">
            {/* Handle */}
            <div className="w-10 h-1 rounded-full bg-line mx-auto mb-5" />

            {submitted ? (
              <div className="py-8 text-center">
                <p className="text-3xl mb-3">🙏</p>
                <p className="font-display text-[17px] font-bold text-ink">
                  {t("feedback_thanks")}
                </p>
              </div>
            ) : (
              <>
                <h2 className="font-display text-[18px] font-bold text-ink mb-4">
                  {t("feedback_title")}
                </h2>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("feedback_placeholder")}
                  rows={4}
                  className="w-full rounded-card border border-line bg-soft px-4 py-3 text-[14px] text-ink placeholder:text-ink3 outline-none focus:border-ink3 resize-none leading-relaxed"
                  autoFocus
                />

                {/* Mood picker */}
                <div className="mt-4">
                  <p className="text-[11px] text-ink3 mb-2">{t("feedback_mood_label")}</p>
                  <div className="flex gap-3">
                    {moods.map(({ key, emoji }) => (
                      <button
                        key={key}
                        onClick={() => setMood(mood === key ? null : key)}
                        className={`flex-1 h-11 rounded-card border text-2xl transition-colors ${
                          mood === key
                            ? "border-primary bg-primary/10"
                            : "border-line bg-soft"
                        }`}
                        aria-pressed={mood === key}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => void handleSubmit()}
                  disabled={!message.trim() || submitting}
                  className="w-full mt-4 h-12 rounded-button bg-primary text-white font-semibold text-[15px] disabled:opacity-40 transition-opacity"
                >
                  {submitting ? t("feedback_sending") : t("feedback_submit")}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
