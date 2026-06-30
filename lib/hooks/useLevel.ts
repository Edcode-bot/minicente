"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export interface Level {
  id: string;
  name: string;
  unlock_txns: number;
  perks: string;
}

export interface LevelState {
  txnCount: number;
  currentLevel: Level | null;
  nextLevel: Level | null;
  toNextLevel: number;
  loading: boolean;
}

const FALLBACK_LEVELS: Level[] = [
  { id: "1", name: "Starter", unlock_txns: 0, perks: "Basic payments" },
  { id: "2", name: "Silver", unlock_txns: 5, perks: "Small loans & savings goals" },
  { id: "3", name: "Gold", unlock_txns: 15, perks: "Bigger limits & priority support" },
  { id: "4", name: "Platinum", unlock_txns: 30, perks: "Best rates & dedicated agent" },
];

function deriveLevel(levels: Level[], txnCount: number) {
  const sorted = [...levels].sort((a, b) => a.unlock_txns - b.unlock_txns);
  let current: Level | null = null;
  let next: Level | null = null;

  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].unlock_txns <= txnCount) {
      current = sorted[i];
    } else if (!next) {
      next = sorted[i];
    }
  }
  const toNextLevel = next ? next.unlock_txns - txnCount : 0;
  return { current, next, toNextLevel };
}

export function useLevel(): LevelState {
  const [state, setState] = useState<LevelState>({
    txnCount: 0,
    currentLevel: null,
    nextLevel: null,
    toNextLevel: 0,
    loading: true,
  });

  useEffect(() => {
    const supabase = createClient();
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setState((s) => ({ ...s, loading: false })); return; }

      const [{ data: txnData }, { data: levelsData }] = await Promise.all([
        supabase
          .from("transactions")
          .select("id", { count: "exact" })
          .eq("user_id", user.id)
          .eq("status", "success")
          .neq("kind", "refund"),
        supabase.from("levels").select("*"),
      ]);

      const txnCount = Array.isArray(txnData) ? txnData.length : 0;
      const levels: Level[] =
        levelsData && levelsData.length > 0
          ? (levelsData as Level[])
          : FALLBACK_LEVELS;

      const { current, next, toNextLevel } = deriveLevel(levels, txnCount);

      // Sync profile.level if it changed
      if (current && current.name) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("level")
          .eq("id", user.id)
          .single();
        if (profile && profile.level !== current.name) {
          await supabase.from("profiles").update({ level: current.name }).eq("id", user.id);
        }
      }

      setState({
        txnCount,
        currentLevel: current,
        nextLevel: next,
        toNextLevel,
        loading: false,
      });
    })();
  }, []);

  return state;
}
