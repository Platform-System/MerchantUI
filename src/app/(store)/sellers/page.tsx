"use client"

import React, { Suspense } from "react"
import { SellersScreen } from "@/features/seller"

export default function SellersListingPage() {
  return (
    <Suspense fallback={null}>
      <SellersScreen />
    </Suspense>
  )
}
