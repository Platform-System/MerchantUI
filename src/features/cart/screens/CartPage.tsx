"use client"

import React from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { Button, EmptyStatePanel, InfoPanel, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@platform-system/design-ui';
import { Link } from "@/i18n/navigation"
import { useCart } from "../context/CartContext"
import { CART_COLOR_OPTIONS, CART_SIZE_OPTIONS } from "../constants"

export function CartPage() {
  const t = useTranslations("Cart")
  const { cartItems, removeFromCart, updateQuantity, updateItemVariant, cartTotal, clearCart } = useCart()

  React.useLayoutEffect(() => {
    const container = document.getElementById("store-scroll-container")
    if (container) {
      container.scrollTo({ top: 0, behavior: "instant" })
    }
  }, [])

  return (
    <div className="min-h-screen bg-background pt-12 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/marketplace"
              className="store-muted-text mb-4 inline-flex items-center gap-2 text-sm transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("backToStore")}
            </Link>
            <h1 className="font-serif text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
              {t("title")}
            </h1>
            <p className="store-muted-text mt-3 max-w-2xl text-sm leading-7">
              {t("reviewDesc")}
            </p>
          </div>

          {cartItems.length > 0 && (
            <Button
              variant="outline"
              onClick={clearCart}
              className="store-surface-soft self-start rounded-full border-none hover:bg-destructive/10 hover:text-destructive lg:self-auto"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t("clearAll")}
            </Button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <EmptyStatePanel
            icon={<ShoppingBag className="h-10 w-10" />}
            title={t("empty")}
            description={t("emptyDescAction")}
            primaryActionNode={
              <Button asChild variant="brand" className="rounded-full px-8">
                <Link href="/marketplace">{t("exploreProducts")}</Link>
              </Button>
            }
            descriptionClassName="max-w-sm leading-7"
          />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="space-y-5">
              {cartItems.map((item) => (
                <article
                  key={`${item.id}-${item.color}-${item.size}`}
                  className="ds-glass-panel grid gap-5 rounded-[28px] p-5 shadow-[0_14px_36px_rgb(0_0_0/0.08)] sm:grid-cols-[140px_minmax(0,1fr)]"
                >
                  <div className="store-surface-soft relative aspect-square overflow-hidden rounded-2xl">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>

                  <div className="flex min-w-0 flex-col gap-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <Link
                          href={`/product/${item.id}`}
                          className="line-clamp-2 text-lg font-semibold tracking-[-0.02em] text-foreground transition-colors hover:store-accent-text"
                        >
                          {item.name}
                        </Link>
                        <p className="store-muted-text mt-2 text-sm">
                          {t("unitPrice")}: ${item.price.toLocaleString()}
                        </p>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id, item.color, item.size)}
                        className="store-muted-text inline-flex items-center gap-2 text-sm transition-colors hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        {t("remove")}
                      </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <Select
                        value={item.color ?? "Đen"}
                        onValueChange={(value: string) =>
                          updateItemVariant(item.id, item.color, item.size, { color: value })
                        }
                      >
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue placeholder={t("color")} />
                        </SelectTrigger>
                        <SelectContent>
                          {CART_COLOR_OPTIONS.map((color) => (
                            <SelectItem key={color} value={color}>
                              {color}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={item.size ?? "Vừa"}
                        onValueChange={(value: string) =>
                          updateItemVariant(item.id, item.color, item.size, { size: value })
                        }
                      >
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue placeholder={t("size")} />
                        </SelectTrigger>
                        <SelectContent>
                          {CART_SIZE_OPTIONS.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="store-surface-soft inline-flex w-fit items-center rounded-xl">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.color, item.size)}
                          className="store-muted-text p-3 transition-colors hover:text-foreground"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-5 text-sm font-semibold text-foreground">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.color, item.size)}
                          className="store-muted-text p-3 transition-colors hover:text-foreground"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <p className="text-lg font-semibold text-foreground">
                        ${(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <aside className="ds-glass-panel h-fit rounded-[30px] p-6 shadow-[0_18px_44px_rgb(0_0_0/0.1)] lg:sticky lg:top-28">
              <p className="store-muted-text text-[11px] uppercase tracking-[0.18em]">
                {t("orderSummary")}
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-foreground">
                {t("readyToCheckout")}
              </h2>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="store-muted-text">{t("subtotal")}</span>
                  <span className="font-medium text-foreground">${cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="store-muted-text">{t("shipping")}</span>
                  <span className="font-medium text-foreground">{t("calculatedLater")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="store-muted-text">Thuế</span>
                  <span className="font-medium text-foreground">{t("calculatedLater")}</span>
                </div>
              </div>

              <div className="my-6 h-px bg-[rgb(var(--store-border-rgb)/0.7)]" />

              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-foreground">Tổng tạm tính</span>
                <span className="store-total-value text-2xl">${cartTotal.toLocaleString()}</span>
              </div>

              <InfoPanel subtle className="mt-4 rounded-2xl px-4 py-3">
                <p className="store-muted-text text-sm leading-7">
                  {t("demoNote")}
                </p>
              </InfoPanel>

              <div className="mt-6 space-y-3">
                <Button asChild variant="brand" className="h-12 w-full rounded-full">
                  <Link href="/checkout">{t("proceedToCheckout")}</Link>
                </Button>
                <Button asChild variant="outline" className="h-12 w-full rounded-full">
                  <Link href="/marketplace">{t("continueShopping")}</Link>
                </Button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}

