"use client"

import React, { Suspense } from "react"
import { SellerStorefrontScreen } from "@/features/seller"

export default function SellerStorefrontPage() {
  return (
    <Suspense fallback={null}>
      <SellerStorefrontScreen />
    </Suspense>
  )
}
