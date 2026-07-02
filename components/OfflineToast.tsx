"use client";

import { useEffect, useState } from "react";

export function OfflineToast() {
  const [offline, setOffline] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onOffline = () => { setOffline(true); setVisible(true); };
    const onOnline = () => {
      setOffline(false);
      setTimeout(() => setVisible(false), 2000);
    };
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[999] px-4 py-3 rounded-card shadow-elevated text-[13px] font-medium flex items-center gap-2 transition-all max-w-[320px] w-[90vw] ${
        offline
          ? "bg-amber-50 border border-amber-200 text-amber-800"
          : "bg-accent/10 border border-accent/30 text-accent"
      }`}
    >
      <span className="text-base flex-shrink-0">{offline ? "📶" : "✓"}</span>
      <span>
        {offline
          ? "You're offline — we'll retry when you're back."
          : "Back online. Syncing…"}
      </span>
    </div>
  );
}
