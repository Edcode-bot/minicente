export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-lg bg-line/60 animate-pulse ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard({ rows = 2 }: { rows?: number }) {
  return (
    <div className="rounded-card border border-line bg-card p-4 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className={`h-4 ${i === 0 ? "w-3/4" : "w-1/2"}`} />
      ))}
    </div>
  );
}

export function BalanceSkeleton() {
  return (
    <div className="mx-4 mt-3 rounded-big bg-primary/20 animate-pulse p-6 h-[88px]" />
  );
}

export function TxnRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-line last:border-0">
      <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-2.5 w-1/3" />
      </div>
      <Skeleton className="h-3.5 w-16 flex-shrink-0" />
    </div>
  );
}
