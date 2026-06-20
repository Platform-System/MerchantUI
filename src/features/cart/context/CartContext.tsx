"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { useQuery } from "@tanstack/react-query"
import { useCartStore, CartItem } from "../store/cart-store"
import { apiClient } from "@/shared/api/apiClient"
import { Result } from "@/types/api"
import { fetchAllProducts, productQueryKeys } from "@/features/product/queries/product-queries"
import { useAuth } from "@/core/providers/AuthProvider"

interface CartItemVariantUpdate {
  color?: string
  size?: string
}

interface ProductSummary {
  id: string
  image?: string
}

interface BackendCartItem {
  productId: string
  name: string
  price: number
  quantity: number
}

interface BackendCartResponse {
  items?: BackendCartItem[] | null
}

const EMPTY_PRODUCTS: ProductSummary[] = []

export function useCart() {
  const t = useTranslations("Cart")
  const { isAuthenticated } = useAuth()
  const { 
    items, 
    isOpen,
    setIsOpen,
    setItems,
    addItem, 
    removeItem, 
    updateQuantity: storeUpdateQuantity, 
    updateItemVariant: storeUpdateItemVariant, 
    clearItems,
    getTotal,
    getCount
  } = useCartStore()
  
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsHydrated(true)
  }, [])

  // Load products to map image URLs
  const { data: products = EMPTY_PRODUCTS } = useQuery({
    queryKey: productQueryKeys.all,
    queryFn: fetchAllProducts,
    staleTime: 5 * 60 * 1000,
  })

  // Query backend cart - only enable if hydrated and user is authenticated
  const { data: backendCart, refetch: refetchCart } = useQuery({
    queryKey: ["backendCart"],
    queryFn: async (): Promise<BackendCartResponse | null> => {
      try {
        const response = await apiClient.get<Result<BackendCartResponse>>("/api/ordering/carts")
        if (response.data && response.data.success && response.data.data) {
          return response.data.data
        }
      } catch (err) {
        console.error("Failed to load backend cart:", err)
      }
      return null
    },
    enabled: isHydrated && isAuthenticated,
    staleTime: 10 * 1000,
  })

  // Sync backend cart with Zustand store when backend cart loads
  useEffect(() => {
    if (backendCart && backendCart.items && isHydrated) {
      const mappedItems: CartItem[] = backendCart.items.map((item) => {
        const prod = products.find((p) => p.id === item.productId)
        return {
          id: item.productId,
          name: item.name,
          price: item.price,
          image: prod?.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200",
          quantity: item.quantity,
          color: "Đen",
          size: "Thường",
        }
      })
      
      // Compare current items in store with the mapped items
      const isDifferent =
        mappedItems.length !== items.length ||
        mappedItems.some((item, index) => {
          const current = items[index]
          return (
            !current ||
            current.id !== item.id ||
            current.name !== item.name ||
            current.price !== item.price ||
            current.image !== item.image ||
            current.quantity !== item.quantity ||
            current.color !== item.color ||
            current.size !== item.size
          )
        })

      if (isDifferent) {
        setItems(mappedItems)
      }
    }
  }, [backendCart, products, setItems, isHydrated, items])


  const addToCart = useCallback(async (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    const nextQuantity = Math.max(1, item.quantity ?? 1)

    toast.success(t("toastTitle"), {
      description:
        nextQuantity > 1
          ? t("addedToCart", { quantity: nextQuantity, name: item.name })
          : t("addedToCartSingle", { name: item.name }),
    })

    // Optimistic local update
    addItem(item)

    // Sync to backend if authenticated
    if (isAuthenticated) {
      try {
        await apiClient.post("/api/ordering/carts/items", {
          productId: item.id,
          quantity: nextQuantity,
        })
        refetchCart()
      } catch (err) {
        console.error("Failed to sync add cart item to backend:", err)
      }
    }
  }, [addItem, t, refetchCart, isAuthenticated])

  const removeFromCart = useCallback(async (id: string | number, color?: string, size?: string) => {
    // Optimistic local update
    removeItem(id, color, size)

    // Sync to backend if authenticated
    if (isAuthenticated) {
      try {
        await apiClient.delete(`/api/ordering/carts/items/${id}`)
        refetchCart()
      } catch (err) {
        console.error("Failed to sync remove cart item from backend:", err)
      }
    }
  }, [removeItem, refetchCart, isAuthenticated])

  const updateQuantity = useCallback(async (id: string | number, quantity: number, color?: string, size?: string) => {
    // Optimistic local update
    storeUpdateQuantity(id, quantity, color, size)

    // Sync to backend if authenticated
    if (isAuthenticated) {
      try {
        if (quantity <= 0) {
          await apiClient.delete(`/api/ordering/carts/items/${id}`)
        } else {
          await apiClient.put(`/api/ordering/carts/items/${id}`, {
            productId: id,
            newQuantity: quantity,
          })
        }
        refetchCart()
      } catch (err) {
        console.error("Failed to sync update quantity to backend:", err)
      }
    }
  }, [storeUpdateQuantity, refetchCart, isAuthenticated])

  const updateItemVariant = useCallback((
    id: string | number,
    currentColor: string | undefined,
    currentSize: string | undefined,
    updates: CartItemVariantUpdate
  ) => {
    storeUpdateItemVariant(id, currentColor, currentSize, updates)
  }, [storeUpdateItemVariant])

  const clearCart = useCallback(() => {
    clearItems()
  }, [clearItems])

  const cartTotal = isHydrated ? getTotal() : 0
  const cartCount = isHydrated ? getCount() : 0

  return {
    cartItems: isHydrated ? items : [],
    isOpen,
    setIsOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateItemVariant,
    clearCart,
    cartTotal,
    cartCount,
  }
}
