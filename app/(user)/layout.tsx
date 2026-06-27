import { TopBar } from "@/components/TopBar";
import { UserBottomNav } from "@/components/UserBottomNav";
import { LanguageProvider } from "@/lib/i18n";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
