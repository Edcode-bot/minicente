"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";
import { USER } from "@/lib/data";

export function TopBar() {
  const { t } = useT();
  const firstName = USER.name.split(" ")[0];

  return (
    <header className="sticky top-0 z-50 bg-bg/95 backdrop-blur-md border-b border-line">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Greeting */}
        <div className="min-w-0">
          <p className="text-[11px] text-ink3 leading-none">
            {t("greeting_morning")}
          </p>
          <p className="text-[15px] font-semibold text-ink leading-snug truncate">
            {firstName}
          </p>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            aria-label={t("notifications")}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-soft transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-[22px] h-[22px] text-ink2"
            >
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
          </button>

          <Link
            href="/safety"
            aria-label={t("safety")}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-soft transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-[22px] h-[22px] text-primary"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
