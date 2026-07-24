"use client"

import React, { Suspense } from "react"
import { AccountScreen } from "@/features/account"

export default function SpacePage() {
  return (
    <Suspense fallback={null}>
      <AccountScreen />
    </Suspense>
  )
}
