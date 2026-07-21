"use client"

import React, { useEffect } from "react"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"
import { CheckCircle2, ShoppingBag, ArrowRight, Package, Truck, Clock } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { BRAND_NAME, Button } from '@system/design-ui';
import { useTranslations } from "next-intl"
import { StoreOrder } from "@/types/store"

interface OrderSuccessScreenProps {
  order: StoreOrder
}

export function OrderSuccessScreen({ order }: OrderSuccessScreenProps) {
  const t = useTranslations("Checkout")
  const tc = useTranslations("Cart")

  useEffect(() => {
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

    const interval: ReturnType<typeof setInterval> = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background pt-12 pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="ds-glass-panel rounded-[40px] p-8 text-center shadow-[0_24px_64px_rgb(0_0_0/0.12)] sm:p-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 10 }}
            className="store-accent-soft mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full"
          >
            <CheckCircle2 className="store-accent-text h-12 w-12" />
          </motion.div>

          <h1 className="font-serif text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
            {t("orderPlacedTitle") || "Đặt hàng thành công!"}
          </h1>
          <p className="store-muted-text mt-4 text-base leading-7">
            {t("orderPlacedDesc") || `Cảm ơn bạn đã tin tưởng ${BRAND_NAME}. Đơn hàng của bạn đang được xử lý.`}
          </p>

          <div className="mt-10 rounded-3xl bg-muted/30 p-6 text-left sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Mã đơn hàng</p>
                <p className="mt-1 text-lg font-bold text-foreground">#{order.id}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Tổng cộng</p>
                <p className="mt-1 text-lg font-bold store-accent-text">${order.total.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid gap-6 pt-6 sm:grid-cols-3">
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-background p-2 shadow-sm">
                  <Package className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Xác nhận</p>
                  <p className="mt-1 text-xs text-muted-foreground">Đơn hàng đã nhận</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-background p-2 shadow-sm">
                  <Truck className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Vận chuyển</p>
                  <p className="mt-1 text-xs text-muted-foreground">{order.deliveryMethod === "express" ? "Hỏa tốc (1-2 ngày)" : "Tiêu chuẩn (3-5 ngày)"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-background p-2 shadow-sm">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Dự kiến giao</p>
                  <p className="mt-1 text-xs text-muted-foreground">Thứ 5, 10/05</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild variant="brand" className="h-14 rounded-full px-8">
              <Link href="/marketplace">
                {tc("exploreProducts")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-14 rounded-full px-8">
              <Link href="/home">Quay lại trang chủ</Link>
            </Button>
          </div>
        </motion.div>

        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <ShoppingBag className="h-4 w-4" />
          <span>Tiếp tục mua sắm các sản phẩm cao cấp khác</span>
        </div>
      </div>
    </div>
  )
}

