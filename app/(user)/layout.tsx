import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/TopBar";
import { UserBottomNav } from "@/components/UserBottomNav";
import { LanguageProvider } from "@/lib/i18n";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/onboarding");

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarded")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarded) redirect("/onboarding");

  return (
    <LanguageProvider>
      <div className="mx-auto max-w-[460px] min-h-screen bg-bg border-x border-line relative">
        <TopBar />
        <main className="pb-[88px]">{children}</main>
        <UserBottomNav />
      </div>
    </LanguageProvider>
  );
}
