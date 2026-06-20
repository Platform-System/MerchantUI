"use client"

import React from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { ArrowLeft, CheckCircle2, CreditCard, MapPin, ShieldCheck, Truck } from "lucide-react"
import { Button, EmptyStatePanel, InfoPanel, Input, SurfaceIcon, Textarea } from '@platform-system/design-ui';
import { Link } from "@/i18n/navigation"
import { useCheckout } from "../hooks/use-checkout"
import { OrderSuccessScreen } from "./OrderSuccessScreen"

export function CheckoutScreen() {
  const t = useTranslations("Checkout")
  const tc = useTranslations("Cart")
  const {
    cartItems,
    cartTotal,
    deliveryMethod,
    setDeliveryMethod,
    paymentMethod,
    setPaymentMethod,
    isSubmitting,
    formData,
    updateFormField,
    formError,
    shippingFee,
    taxAmount,
    grandTotal,
    handlePlaceOrder,
    orderSuccess,
    wallet,
  } = useCheckout()

  React.useLayoutEffect(() => {
    const container = document.getElementById("store-scroll-container")
    if (container) {
      container.scrollTo({ top: 0, behavior: "instant" })
    }
  }, [])

  if (orderSuccess) {
    return <OrderSuccessScreen order={orderSuccess} />
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <EmptyStatePanel
            icon={<CreditCard className="h-10 w-10" />}
            title={t("emptyOrder")}
            description={t("emptyOrderDesc")}
            primaryActionNode={
              <Button asChild variant="brand" className="rounded-full px-8">
                <Link href="/marketplace">{tc("exploreProducts")}</Link>
              </Button>
            }
            secondaryActionNode={
              <Button asChild variant="outline" className="rounded-full px-8">
                <Link href="/cart">{tc("backToStore")}</Link>
              </Button>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <Link
            href="/cart"
            className="store-muted-text mb-4 inline-flex items-center gap-2 text-sm transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {tc("backToStore")}
          </Link>
          <h1 className="font-serif text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
            {t("title")}
          </h1>
          <p className="store-muted-text mt-3 max-w-2xl text-sm leading-7">
            {t("description")}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="space-y-6">
            <div className="ds-glass-panel rounded-[28px] p-6 shadow-[0_14px_36px_rgb(0_0_0/0.08)]">
              <div className="mb-6 flex items-center gap-3">
                <MapPin className="store-accent-text h-5 w-5" />
                <h2 className="text-xl font-semibold text-foreground">{t("customerInfo")}</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input placeholder={t("fullName")} className="h-12 rounded-xl" value={formData.customerName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormField("customerName", e.target.value)} />
                <Input placeholder={t("phone")} className="h-12 rounded-xl" value={formData.phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormField("phone", e.target.value)} />
                <Input placeholder={t("email")} className="h-12 rounded-xl sm:col-span-2" value={formData.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormField("email", e.target.value)} />
                <Input placeholder={t("city")} className="h-12 rounded-xl" value={formData.city} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormField("city", e.target.value)} />
                <Input placeholder={t("district")} className="h-12 rounded-xl" value={formData.district} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormField("district", e.target.value)} />
                <Input placeholder={t("ward")} className="h-12 rounded-xl" value={formData.ward} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormField("ward", e.target.value)} />
                <Input placeholder={t("address")} className="h-12 rounded-xl sm:col-span-2" value={formData.addressLine} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormField("addressLine", e.target.value)} />
                <Textarea placeholder={t("note")} className="min-h-28 rounded-2xl sm:col-span-2" value={formData.deliveryNote} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateFormField("deliveryNote", e.target.value)} />
              </div>

              {formError && <p className="mt-4 text-sm font-medium text-destructive">{formError}</p>}
            </div>

            <div className="ds-glass-panel rounded-[28px] p-6 shadow-[0_14px_36px_rgb(0_0_0/0.08)]">
              <div className="mb-6 flex items-center gap-3">
                <Truck className="store-accent-text h-5 w-5" />
                <h2 className="text-xl font-semibold text-foreground">{t("deliveryMethod")}</h2>
              </div>

              <div className="grid gap-4">
                <button onClick={() => setDeliveryMethod("standard")} className={`rounded-2xl border p-4 text-left transition-all ${deliveryMethod === "standard" ? "store-accent-soft border-[rgb(var(--store-accent-rgb)/0.25)]" : "store-surface-soft border-[rgb(var(--store-border-rgb)/0.7)] hover:bg-[rgb(var(--store-accent-rgb)/0.06)]"}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-foreground">{t("standardShipping")}</p>
                      <p className="store-muted-text mt-1 text-sm">{t("standardShippingDesc")}</p>
                    </div>
                    <span className="font-semibold text-foreground">{t("free")}</span>
                  </div>
                </button>

                <button onClick={() => setDeliveryMethod("express")} className={`rounded-2xl border p-4 text-left transition-all ${deliveryMethod === "express" ? "store-accent-soft border-[rgb(var(--store-accent-rgb)/0.25)]" : "store-surface-soft border-[rgb(var(--store-border-rgb)/0.7)] hover:bg-[rgb(var(--store-accent-rgb)/0.06)]"}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-foreground">{t("expressShipping")}</p>
                      <p className="store-muted-text mt-1 text-sm">{t("expressShippingDesc")}</p>
                    </div>
                    <span className="font-semibold text-foreground">$12</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="ds-glass-panel rounded-[28px] p-6 shadow-[0_14px_36px_rgb(0_0_0/0.08)]">
              <div className="mb-6 flex items-center gap-3">
                <ShieldCheck className="store-accent-text h-5 w-5" />
                <h2 className="text-xl font-semibold text-foreground">{t("paymentMethod")}</h2>
              </div>

              <div className="grid gap-4">
                {[
                  { id: "wallet" as const, title: t("wallet"), description: t("walletDesc") },
                  { id: "payment" as const, title: t("payment"), description: t("paymentDesc") },
                ].map((method) => {
                  const isWallet = method.id === "wallet"
                  const isInsufficient = isWallet && wallet && wallet.balance < grandTotal
                  return (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        paymentMethod === method.id
                          ? "store-accent-soft border-[rgb(var(--store-accent-rgb)/0.25)]"
                          : "store-surface-soft border-[rgb(var(--store-border-rgb)/0.7)] hover:bg-[rgb(var(--store-accent-rgb)/0.06)]"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <p className="font-medium text-foreground">{method.title}</p>
                        {isWallet && wallet && (
                          <span className={`text-xs font-semibold ${isInsufficient ? "text-destructive" : "text-emerald-500"}`}>
                            Số dư: {wallet.balance.toLocaleString("vi-VN")} đ {isInsufficient && "(Không đủ số dư)"}
                          </span>
                        )}
                      </div>
                      <p className="store-muted-text mt-1 text-sm leading-6">{method.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          </section>

          <aside className="ds-glass-panel h-fit rounded-[30px] p-6 shadow-[0_18px_44px_rgb(0_0_0/0.1)] lg:sticky lg:top-28">
            <p className="store-muted-text text-[11px] uppercase tracking-[0.18em]">{t("paymentSummary")}</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-foreground">{t("yourOrder")}</h2>

            <div className="mt-6 space-y-4">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.color}-${item.size}`} className="flex items-start gap-3">
                  <div className="store-surface-soft relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium text-foreground">{item.name}</p>
                    <p className="store-muted-text mt-1 text-xs">
                      {item.color ?? "Mặc định"} / {item.size ?? "Tiêu chuẩn"} / SL {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">${(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="my-6 h-px bg-[rgb(var(--store-border-rgb)/0.7)]" />

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="store-muted-text">{tc("subtotal")}</span>
                <span className="font-medium text-foreground">${cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="store-muted-text">{tc("shipping")}</span>
                <span className="font-medium text-foreground">{shippingFee === 0 ? t("free") : `$${shippingFee.toLocaleString()}`}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="store-muted-text">{t("tax")}</span>
                <span className="font-medium text-foreground">${taxAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="my-6 h-px bg-[rgb(var(--store-border-rgb)/0.7)]" />

            <div className="flex items-center justify-between">
              <span className="text-base font-medium text-foreground">{t("total")}</span>
              <span className="store-total-value text-2xl">${grandTotal.toLocaleString()}</span>
            </div>

            <InfoPanel subtle className="mt-5 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <SurfaceIcon tone="tint" size="sm" className="h-10 w-10 rounded-xl">
                  <CheckCircle2 className="h-5 w-5" />
                </SurfaceIcon>
                <p className="store-muted-text text-sm leading-7">
                  {tc("demoNote")}
                </p>
              </div>
            </InfoPanel>

            <Button variant="brand" className="mt-6 h-12 w-full rounded-full" onClick={handlePlaceOrder} disabled={isSubmitting}>
              {isSubmitting ? t("processing") : t("confirmOrder")}
            </Button>

            <Button asChild variant="outline" className="mt-3 h-12 w-full rounded-full">
              <Link href="/cart">{tc("backToStore")}</Link>
            </Button>
          </aside>
        </div>
      </div>
    </div>
  )
}

