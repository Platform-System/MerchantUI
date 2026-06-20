"use client"

import React, { useState, useEffect } from "react"
import { Plus, Minus, Trash2, ShoppingBag, Truck } from "lucide-react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, Button, Empty, EmptyMedia, EmptyTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Sheet, SheetContent, SheetTitle } from '@platform-system/design-ui';
import { useCart } from "../context/CartContext"
import type { CartItem } from "../store/cart-store"
import { Link } from "@/i18n/navigation"
import { CART_COLOR_OPTIONS, CART_SIZE_OPTIONS } from "../constants"

// Optimized CartItem component with memoization to prevent unnecessary re-renders
const CartItemRow = React.memo(({ 
  item, 
  updateQuantity, 
  updateItemVariant, 
  removeFromCart
}: { 
  item: CartItem; 
  updateQuantity: (id: string | number, quantity: number, color?: string, size?: string) => void; 
  updateItemVariant: (id: string | number, currentColor: string | undefined, currentSize: string | undefined, updates: { color?: string; size?: string }) => void; 
  removeFromCart: (id: string | number, color?: string, size?: string) => void;
}) => (
  <div className="flex items-center gap-4 pb-6 last:border-none">
    <div className="store-surface-soft relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl">
      <Image
        src={item.image}
        alt={item.name}
        fill
        sizes="80px"
        className="object-cover"
      />
    </div>
    <div className="flex-1 flex flex-col justify-between h-20">
      <div>
        <h3 className="line-clamp-1 text-sm font-medium tracking-wide text-foreground">{item.name}</h3>
        <div className="mt-1 flex gap-2">
          <Select
            value={item.color ?? "Đen"}
            onValueChange={(value: string) =>
              updateItemVariant(item.id, item.color, item.size, { color: value })
            }
          >
            <SelectTrigger
              size="sm"
              className="h-7 min-w-[88px] rounded-md px-2.5 text-[11px] shadow-none"
            >
              <SelectValue placeholder="Màu" />
            </SelectTrigger>
            <SelectContent className="shadow-xl">
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
            <SelectTrigger
              size="sm"
              className="h-7 min-w-[92px] rounded-md px-2.5 text-[11px] shadow-none"
            >
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent className="shadow-xl">
              {CART_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="store-surface-soft flex items-center rounded-lg">
          <button
            onClick={() => updateQuantity(item.id, item.quantity - 1, item.color, item.size)}
            className="store-muted-text p-1 transition-colors hover:text-foreground"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="px-3 text-xs font-medium text-foreground">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.id, item.quantity + 1, item.color, item.size)}
            className="store-muted-text p-1 transition-colors hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground">${(item.price * item.quantity).toLocaleString()}</span>
          <button
            onClick={() => removeFromCart(item.id, item.color, item.size)}
            className="store-muted-text transition-colors hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
))

CartItemRow.displayName = "CartItemRow"

export function CartDrawer() {
  const t = useTranslations("Cart")
  const { isOpen, setIsOpen, cartItems, removeFromCart, updateQuantity, updateItemVariant, cartTotal, cartCount, clearCart } = useCart()

  // Optimization: Progressive rendering to prevent animation stutter when opening with many items
  const [renderedItemCount, setRenderedItemCount] = useState(8);

  useEffect(() => {
    if (isOpen) {
      // Instantly render only enough items to fill the viewport
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRenderedItemCount(8);
      // Wait for the slide-in animation to begin before mounting the rest
      const timer = setTimeout(() => {
        setRenderedItemCount(cartItems.length);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, cartItems.length]);

  return (
    <>
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent 
        side="right" 
        className="bg-[rgb(var(--store-surface-rgb))] z-[1000] flex w-full max-w-[392px] flex-col gap-0 p-0 text-foreground shadow-[-20px_0_60px_rgba(0,0,0,0.15)] [&>button]:hidden rounded-l-[32px] overflow-hidden"
      >
        <SheetTitle className="sr-only">{t("title")}</SheetTitle>
            {/* Header */}
            <div className="flex items-center justify-between bg-transparent px-4 pt-4 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="store-accent-text h-5 w-5" />
                <h2 className="text-xs text-foreground">{t("title")} ({cartCount})</h2>
              </div>
              <div className="flex items-center gap-3">
              {cartItems.length > 0 && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="store-surface-soft mr-1 flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-normal text-foreground transition-colors hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {t("clearAll")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="ds-glass-card max-w-sm rounded-2xl text-foreground shadow-[0_24px_48px_rgb(0_0_0/0.16)]">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-serif text-lg text-foreground">{t("confirmClear")}</AlertDialogTitle>
                        <AlertDialogDescription className="store-muted-text text-sm">
                          {t("confirmClearDesc")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="mt-4 flex gap-2">
                        <AlertDialogCancel className="store-surface-soft flex-1 h-10 rounded-full text-xs text-foreground hover:bg-[rgb(var(--store-accent-rgb)/0.1)]">
                          {t("cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={clearCart}
                          className="flex-1 bg-destructive text-white hover:bg-destructive/90 rounded-full h-10 text-xs font-semibold"
                        >
                          {t("deleteNow")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>

            {/* Free Shipping Progress */}
            {cartItems.length > 0 && (
              <div className="bg-muted/30 px-6 py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    {cartTotal >= 200 ? "Chúc mừng! Bạn đã được Freeship" : `Mua thêm $${(200 - cartTotal).toLocaleString()} để được Freeship`}
                  </span>
                  <span className="text-[11px] font-bold text-foreground">
                    {Math.min(100, Math.round((cartTotal / 200) * 100))}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-border/40 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-700 ease-out"
                    style={{ width: `${Math.min(100, (cartTotal / 200) * 100)}%` }}
                  />
                </div>
                {cartTotal >= 200 && (
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] text-primary font-medium">
                    <Truck className="h-3 w-3" />
                    <span>Đã áp dụng ưu đãi vận chuyển cao cấp</span>
                  </div>
                )}
              </div>
            )}

            {/* List items */}
            <div className="no-scrollbar flex-1 space-y-6 overflow-y-auto bg-transparent px-6 pt-2 pb-6">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <Empty className="bg-transparent border-none">
                    <EmptyMedia variant="icon" className="store-surface-soft store-muted-text h-16 w-16 rounded-full shadow-[0_8px_24px_rgb(0_0_0/0.08)]">
                      <ShoppingBag className="h-8 w-8" />
                    </EmptyMedia>
                    <EmptyTitle className="store-muted-text text-sm font-medium">{t("empty")}</EmptyTitle>
                  </Empty>
                  <Button
                    onClick={() => setIsOpen(false)}
                    className="store-accent-button rounded-full px-6 font-medium"
                  >
                    {t("continueShopping")}
                  </Button>
                </div>
              ) : (
                cartItems.slice(0, renderedItemCount).map((item) => (
                  <CartItemRow 
                    key={`${item.id}-${item.color}-${item.size}`} 
                    item={item}
                    updateQuantity={updateQuantity}
                    updateItemVariant={updateItemVariant}
                    removeFromCart={removeFromCart}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="store-surface-soft p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="store-muted-text text-sm font-medium">{t("total")}</span>
                  <span className="store-total-value text-xl">${cartTotal.toLocaleString()}</span>
                </div>
                <p className="store-muted-text mb-3 text-xs leading-relaxed">{t("shippingNote")}</p>
                <div className="flex gap-2">
                  <Link
                    href="/cart"
                    onClick={() => setIsOpen(false)}
                    className="store-accent-button flex h-10 flex-1 items-center justify-center rounded-full text-xs font-semibold"
                  >
                    {t("viewCart")}
                  </Link>
                  <Button
                    variant="outline"
                    className="store-surface-soft h-10 flex-1 rounded-full text-xs text-foreground transition-all hover:bg-[rgb(var(--store-accent-rgb)/0.1)]"
                    onClick={() => setIsOpen(false)}
                  >
                    {t("continueShopping")}
                  </Button>
                </div>
              </div>
            )}
      </SheetContent>
    </Sheet>
    </>
  )
}

