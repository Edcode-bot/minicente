"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PlatformStats } from "@/lib/types";

export function usePlatformStats() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    void (async () => {
      const { data } = await supabase
        .from("platform_stats")
        .select("*")
        .limit(1)
        .single();
      setStats((data as PlatformStats | null) ?? null);
      setLoading(false);
    })();
  }, []);

  return { stats, loading };
}
