"use client"

import React, { Suspense } from "react"
import { MarketplaceScreen } from "@/features/marketplace"

export default function MarketplacePage() {
  return (
    <Suspense fallback={null}>
      <MarketplaceScreen />
    </Suspense>
  )
}
