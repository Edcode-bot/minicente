export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[460px] min-h-[100svh] bg-bg flex flex-col">
      {children}
    </div>
  );
}
