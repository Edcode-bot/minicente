"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Wallet } from "@/lib/types";

export function useWallet(currency = "UGX") {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .eq("currency", currency)
        .single();
      setWallet(data as Wallet | null);
      setLoading(false);
    })();
  }, [currency]);

  return { wallet, loading };
}
