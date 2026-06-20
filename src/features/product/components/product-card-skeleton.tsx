"use client"

import { Skeleton, cn } from '@platform-system/design-ui';

interface ProductCardSkeletonProps {
  className?: string
}

export function ProductCardSkeleton({ className }: ProductCardSkeletonProps) {
  return (
    <div className={cn("group relative animate-in fade-in duration-500", className)}>
      {/* Khung ảnh Skeleton */}
      <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-muted/30">
        <Skeleton className="h-full w-full rounded-none" />
        
        {/* Skeleton cho hành động nhanh */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
        
        {/* Skeleton cho nút thêm vào giỏ */}
        <div className="absolute bottom-0 inset-x-0 p-3">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>

      {/* Thông tin sản phẩm Skeleton */}
      <div className="mt-4 space-y-2.5">
        {/* Seller Skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-3 rounded-full" />
        </div>

        {/* Tên sản phẩm Skeleton */}
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Đánh giá Skeleton */}
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-3 w-3 rounded-full" />
            ))}
          </div>
          <Skeleton className="h-3 w-8" />
        </div>

        {/* Giá Skeleton */}
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8", className)}>
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

