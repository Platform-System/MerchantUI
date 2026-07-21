"use client"

import * as React from "react"
import { Package } from "lucide-react"
import { Button, Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@system/design-ui"
import { StoreOrder } from "@/types/store"

export interface OrdersTabProps {
  orders: StoreOrder[]
  ordersData: Array<{ id: string; orderCode?: string | number | null }> | undefined
  statusClassName: (status: StoreOrder["status"]) => string
  setSelectedOrderId: (id: string | null) => void
  t: (key: string) => string
  tc: (key: string, values?: Record<string, string | number | Date>) => string
}

export function OrdersTab({
  orders,
  ordersData,
  statusClassName,
  setSelectedOrderId,
  t,
  tc,
}: OrdersTabProps) {
  const getTranslatedStatus = (status: StoreOrder["status"]) => {
    switch (status) {
      case "pending": return t("statusPending")
      case "processing": return t("statusProcessing")
      case "shipped": return t("statusShipped")
      case "delivered": return t("statusDelivered")
      default: return t("statusProcessing")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h3 className="font-serif text-2xl font-semibold text-foreground">{t("orderHistory")}</h3>
        <p className="text-sm text-muted-foreground">{t("orderHistoryDesc")}</p>
      </div>

      {orders.length > 0 ? (
        <div className="flex flex-col gap-4">
          {orders.map((order: StoreOrder) => (
            <div
              key={order.id}
              className="store-surface-soft rounded-2xl border p-4 transition-all hover:bg-[rgb(var(--store-accent-rgb)/0.08)]"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-foreground">{order.id}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")} • {order.items.length} {tc("itemCount", { count: order.items.length })}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {order.customerName} • {order.phone}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="store-accent-text font-semibold">
                    ${order.total.toLocaleString()}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClassName(order.status)}`}>
                    {getTranslatedStatus(order.status)}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="rounded-xl border-[rgb(var(--store-accent-rgb)/0.3)] text-foreground hover:bg-[rgb(var(--store-accent-rgb)/0.08)]"
                    onClick={() => {
                      const cleanId = order.id.startsWith("#") ? order.id.slice(1) : order.id
                      const rawOrder = ordersData?.find(o => o.orderCode?.toString() === cleanId || o.id === cleanId)
                      if (rawOrder) {
                        setSelectedOrderId(rawOrder.id)
                      }
                    }}
                  >
                    Xem chi tiết
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Empty className="border-none bg-transparent px-0 py-10">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="store-surface-soft store-muted-text flex h-16 w-16 items-center justify-center rounded-full">
              <Package className="h-8 w-8" />
            </EmptyMedia>
            <EmptyTitle>{t("noOrders")}</EmptyTitle>
            <EmptyDescription className="max-w-md">
              {t("noOrdersDesc")}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  )
}
