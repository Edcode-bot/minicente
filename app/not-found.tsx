import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-bg">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5">
        <span className="text-3xl">🗺</span>
      </div>
      <h1 className="font-display text-[22px] font-bold text-ink leading-tight mb-2">
        Page not found
      </h1>
      <p className="text-[14px] text-ink3 leading-relaxed mb-6 max-w-[280px]">
        That page doesn&apos;t exist — but your money is exactly where you left it.
      </p>
      <Link
        href="/"
        className="rounded-button bg-primary text-white font-semibold text-[15px] px-8 py-3.5 hover:bg-primaryPress transition-colors"
      >
        Back home
      </Link>
    </div>
  );
}
