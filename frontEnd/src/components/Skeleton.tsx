interface SkeletonProps {
  className?: string;
  count?: number;
}

export default function Skeleton({ className = "", count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`skeleton-shimmer rounded-xl ${className}`} />
      ))}
    </>
  );
}

export function SkeletonSummaryBar({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-${count} gap-3 mb-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-2.5">
          <div className="skeleton-shimmer h-7 w-16 rounded-lg" />
          <div className="skeleton-shimmer h-3.5 w-24 rounded" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 8, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Header row */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3.5 flex items-center justify-between gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={i}
            className={`skeleton-shimmer h-3.5 rounded ${
              i === 0 ? "w-12" : i === 1 ? "w-28" : i === 2 ? "w-36" : "w-20"
            }`}
          />
        ))}
      </div>
      {/* Table rows */}
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-4 py-3.5 flex items-center justify-between gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <div
                key={c}
                className={`skeleton-shimmer h-4 rounded ${
                  c === 0
                    ? "w-8"
                    : c === 1
                    ? "w-24"
                    : c === 2
                    ? "w-40"
                    : c === 3
                    ? "w-24"
                    : c === cols - 1
                    ? "w-16"
                    : "w-20"
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonCardGrid({ count = 7 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl skeleton-shimmer shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 skeleton-shimmer rounded w-3/4" />
              <div className="h-3 skeleton-shimmer rounded w-1/2" />
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-2 skeleton-shimmer rounded-full w-full" />
            <div className="flex justify-between">
              <div className="h-3 skeleton-shimmer rounded w-16" />
              <div className="h-3 skeleton-shimmer rounded w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      <SkeletonSummaryBar count={4} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <div className="h-4 skeleton-shimmer rounded w-1/3" />
          <div className="h-24 skeleton-shimmer rounded-lg" />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 md:col-span-2">
          <div className="h-4 skeleton-shimmer rounded w-1/4" />
          <div className="h-24 skeleton-shimmer rounded-lg" />
        </div>
      </div>
      <SkeletonTable rows={4} cols={5} />
    </div>
  );
}
