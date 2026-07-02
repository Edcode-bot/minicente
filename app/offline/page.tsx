export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-bg">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5">
        <span className="text-3xl">📶</span>
      </div>
      <h1 className="font-display text-[22px] font-bold text-ink leading-tight mb-2">
        You&apos;re offline
      </h1>
      <p className="text-[14px] text-ink3 leading-relaxed mb-6 max-w-[280px]">
        Your money is safe. Check your connection and we&apos;ll pick up right where you left off.
      </p>
      <p className="text-[12px] text-ink3">
        No data? Dial <span className="font-mono font-bold text-ink">*384#</span> on any phone.
      </p>
    </div>
  );
}
