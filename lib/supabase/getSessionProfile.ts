import { createClient } from "./server";
import type { Profile } from "@/lib/types";

export async function getSessionProfile(): Promise<{
  user: { id: string } | null;
  profile: Profile | null;
}> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null };

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { user, profile: data as Profile | null };
}
