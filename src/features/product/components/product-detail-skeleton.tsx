"use client"

import { Skeleton } from '@platform-system/design-ui';

export function ProductDetailSkeleton() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="relative pt-12 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Skeleton */}
          <div className="mb-8 flex items-center gap-4">
            <Skeleton className="h-4 w-12 rounded-md" />
            <Skeleton className="h-4 w-16 rounded-md" />
            <Skeleton className="h-4 w-24 rounded-md" />
          </div>

          <div className="grid gap-8 lg:grid-cols-10 lg:gap-12">
            {/* Left: Image Gallery Skeleton */}
            <div className="lg:col-span-3">
              <Skeleton className="aspect-[4/5] w-full rounded-2xl mb-4" />
              <div className="flex gap-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-20 rounded-xl flex-shrink-0" />
                ))}
              </div>
            </div>

            {/* Right: Product Info Skeleton */}
            <div className="lg:col-span-7 space-y-6">
              {/* Seller Info */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>

              {/* Title */}
              <div className="space-y-3">
                <Skeleton className="h-10 w-3/4 sm:w-1/2" />
                <Skeleton className="h-10 w-1/2 sm:w-1/3" />
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-5 w-5 rounded-full" />
                  ))}
                </div>
                <Skeleton className="h-5 w-8" />
                <Skeleton className="h-5 w-24" />
              </div>

              {/* Price */}
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>

              {/* Variants */}
              <div className="space-y-4 pt-4">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-16" />
                  <div className="flex gap-3">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-10 w-10 rounded-full" />
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-16" />
                  <div className="flex gap-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-24 rounded-xl" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-3 pt-4">
                <Skeleton className="h-4 w-20" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-32 rounded-xl" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                <Skeleton className="h-14 col-span-1 rounded-xl" />
                <Skeleton className="h-14 col-span-1 rounded-xl" />
                <Skeleton className="h-14 w-14 rounded-xl" />
                <Skeleton className="h-14 w-14 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

