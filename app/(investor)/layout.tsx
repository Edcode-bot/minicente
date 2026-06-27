import { TopNav } from "@/components/TopNav";
import { BottomNav } from "@/components/BottomNav";

export default function InvestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[480px] min-h-screen bg-inv-bg border-x border-inv-line relative">
      <TopNav />
      <main className="pb-[88px]">{children}</main>
      <BottomNav />
    </div>
  );
}
