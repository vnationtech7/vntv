// @ts-nocheck
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[--panel]",
        className
      )}
      {...props}
    />
  );
}

// Specific skeleton components for content types
export function ArticleCardSkeleton() {
  return (
    <div className="bg-[--panel] border border-[--border] rounded-lg overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-3.5">
        <Skeleton className="h-3 w-20 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-3" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

export function VideoCardSkeleton() {
  return (
    <div className="bg-[--panel] border border-[--border] rounded-lg overflow-hidden">
      <Skeleton className="aspect-[16/10] w-full" />
      <div className="p-3">
        <Skeleton className="h-3 w-20 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

export function TrendingItemSkeleton() {
  return (
    <div className="flex gap-3.5 p-4 border-b border-[--border] last:border-0">
      <Skeleton className="w-7 h-7 flex-shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
      {/* Main hero */}
      <div className="relative rounded-lg overflow-hidden bg-[--panel] min-h-[440px]">
        <Skeleton className="absolute inset-0" />
      </div>
      
      {/* Side cards */}
      <div className="flex flex-col gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[--panel] border border-[--border] rounded-lg overflow-hidden flex-1">
            <Skeleton className="aspect-video w-full" />
            <div className="p-4">
              <Skeleton className="h-3 w-20 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BreakingNewsTickerSkeleton() {
  return (
    <div className="bg-[--panel] border-b border-[--border]">
      <div className="max-w-[1280px] mx-auto px-6 flex items-center gap-4 py-2.5">
        <Skeleton className="w-24 h-6 rounded" />
        <Skeleton className="flex-1 h-4" />
        <Skeleton className="w-16 h-4" />
        <div className="flex gap-2">
          <Skeleton className="w-6 h-6" />
          <Skeleton className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
