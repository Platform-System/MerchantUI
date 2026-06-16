import React from "react"
import { useQuery } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import { useSearchParams } from "next/navigation"
import { StoreOrder, StoreProfile } from "@/types/store"
import { DEFAULT_PROFILE } from "../constants"
import { useWishlist } from "@/features/wishlist"
import { useCart } from "@/features/cart"
import { apiClient } from "@/shared/api/api-client"
import { Result } from "@/types/api"
import { fetchMyWallet, fetchMyWalletTransactions, fetchMyWalletStatement, walletQueryKeys } from "@/features/store/queries/wallet-queries"

interface AccountProfileResponse {
  userName?: string | null
  email?: string | null
}

interface OrderAddressResponse {
  recipientName?: string | null
  phoneNumber?: string | null
  city?: string | null
  district?: string | null
  ward?: string | null
  streetAddress?: string | null
}

interface OrderShipmentResponse {
  note?: string | null
  method?: string | null
  fee?: number | null
}

interface OrderItemResponse {
  productId: string
  name: string
  price: number
  quantity: number
}

interface OrderSummaryResponse {
  id: string
  orderCode?: string | null
  status: number
  expiredAt?: string | null
  totalAmount: number
  address?: OrderAddressResponse | null
  shipment?: OrderShipmentResponse | null
  items?: OrderItemResponse[] | null
}

interface OrdersListResponse {
  items?: OrderSummaryResponse[] | null
}

export function useAccount() {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get("tab") || "orders"
  const [activeTab, setActiveTab] = React.useState(initialTab)
  const [profile, setProfile] = React.useState<StoreProfile>(DEFAULT_PROFILE)

  React.useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab(tab)
    }
  }, [searchParams])

  const { data: profileData, refetch: refetchProfile } = useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<AccountProfileResponse | null> => {
      try {
        const response = await apiClient.get<Result<AccountProfileResponse>>("/api/identity/users/me")
        if (response.data && response.data.success && response.data.data) {
          return response.data.data
        }
      } catch (error) {
        const apiError = error as AxiosError
        if (apiError.response?.status === 404) {
          try {
            // Tự động gọi API sync để đồng bộ tài khoản mới từ Keycloak và khởi tạo ví
            const syncResponse = await apiClient.post<Result<AccountProfileResponse>>("/api/identity/users/sync")
            if (syncResponse.data && syncResponse.data.success && syncResponse.data.data) {
              return syncResponse.data.data
            }
          } catch (syncError) {
            console.error("Loi khi sync session nguoi dung:", syncError)
          }
          return null
        }
        throw apiError
      }
      return null
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  const { data: ordersData = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: async (): Promise<OrderSummaryResponse[]> => {
      const response = await apiClient.get<Result<OrdersListResponse>>("/api/ordering/orders")
      if (response.data && response.data.success && response.data.data?.items) {
        return response.data.data.items
      }
      return []
    },
    staleTime: 1 * 60 * 1000,
    retry: false,
  })

  const { data: wallet, refetch: refetchWallet } = useQuery({
    queryKey: walletQueryKeys.me,
    queryFn: fetchMyWallet,
    staleTime: 30 * 1000,
    retry: false,
  })

  const { data: walletTransactionsData, refetch: refetchTransactions } = useQuery({
    queryKey: walletQueryKeys.transactions,
    queryFn: () => fetchMyWalletTransactions(1, 100),
    staleTime: 30 * 1000,
    retry: false,
  })

  const walletTransactions = walletTransactionsData?.items || []

  const [statementFrom, setStatementFrom] = React.useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().split("T")[0]
  })
  const [statementTo, setStatementTo] = React.useState(() => {
    return new Date().toISOString().split("T")[0]
  })

  const { data: walletStatement, refetch: refetchStatement, isFetching: isFetchingStatement } = useQuery({
    queryKey: walletQueryKeys.statement({
      createdAtFrom: statementFrom ? `${statementFrom}T00:00:00Z` : undefined,
      createdAtTo: statementTo ? `${statementTo}T23:59:59Z` : undefined,
    }),
    queryFn: () => fetchMyWalletStatement({
      createdAtFrom: statementFrom ? `${statementFrom}T00:00:00Z` : undefined,
      createdAtTo: statementTo ? `${statementTo}T23:59:59Z` : undefined,
    }),
    staleTime: 30 * 1000,
    retry: false,
  })

  React.useEffect(() => {
    if (profileData) {
      const nextProfile: StoreProfile = {
        name: profileData.userName || profileData.email || DEFAULT_PROFILE.name,
        email: profileData.email || DEFAULT_PROFILE.email,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${profileData.userName || "user"}`,
        joinedDate: "October 2024",
      }

      const timer = window.setTimeout(() => {
        setProfile(nextProfile)
        // Refetch thông tin ví khi profile đã được đồng bộ / tải thành công
        refetchWallet()
        refetchTransactions()
        refetchStatement()
      }, 0)

      return () => window.clearTimeout(timer)
    }
  }, [profileData])

  const [isEditingProfile, setIsEditingProfile] = React.useState(false)
  const { wishlistItems } = useWishlist()
  const { addToCart } = useCart()

  const updateProfileField = (field: keyof StoreProfile, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }))
  }

  const translateOrderStatus = (status: StoreOrder["status"]) => {
    switch (status) {
      case "pending": return "Chờ xác nhận"
      case "processing": return "Đang xử lý"
      case "shipped": return "Đang giao"
      case "delivered": return "Đã giao"
      default: return "Đang xử lý"
    }
  }

  const statusClassName = (status: StoreOrder["status"]) => {
    if (status === "delivered") return "bg-emerald-500/10 text-emerald-700"
    if (status === "shipped") return "bg-sky-500/10 text-sky-700"
    return "bg-[rgb(var(--store-accent-rgb)/0.08)] text-[rgb(var(--store-accent-rgb))]"
  }

  const orders = React.useMemo(() => {
    return ordersData.map((order) => {
      let status: StoreOrder["status"] = "pending"
      // Map OrderStatus enum to StoreOrder['status']
      // Pending = 1, Paid = 2, Failed = 3, Cancelled = 4
      switch (order.status) {
        case 1:
          status = "pending"
          break
        case 2:
          status = "processing"
          break
        case 3:
          status = "pending"
          break
        case 4:
          status = "pending"
          break
      }

      const expiredDate = order.expiredAt ? new Date(order.expiredAt) : new Date()
      const createdDate = new Date(expiredDate.getTime() - 15 * 60 * 1000)

      return {
        id: order.orderCode ? `#${order.orderCode}` : order.id,
        createdAt: createdDate.toISOString(),
        customerName: order.address?.recipientName || "Khách hàng",
        email: "",
        phone: order.address?.phoneNumber || "",
        city: order.address?.city || "",
        district: order.address?.district || "",
        ward: order.address?.ward || "",
        addressLine: order.address?.streetAddress || "",
        deliveryNote: order.shipment?.note || "",
        deliveryMethod: order.shipment?.method === "express" ? "express" : "standard",
        paymentMethod: "payment",
        items: (order.items || []).map((item) => ({
          id: item.productId,
          name: item.name,
          image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200",
          price: item.price,
          quantity: item.quantity,
          color: "Đen",
          size: "Thường",
        })),
        subtotal: order.totalAmount - (order.shipment?.fee || 0),
        shippingFee: order.shipment?.fee || 0,
        taxAmount: 0,
        total: order.totalAmount,
        status: status,
      } as StoreOrder
    })
  }, [ordersData])

  return {
    activeTab,
    setActiveTab,
    profile,
    orders,
    isEditingProfile,
    setIsEditingProfile,
    wishlistItems,
    addToCart,
    updateProfileField,
    translateOrderStatus,
    statusClassName,
    wallet,
    walletTransactions,
    refetchWallet,
    refetchTransactions,
    statementFrom,
    setStatementFrom,
    statementTo,
    setStatementTo,
    walletStatement,
    refetchStatement,
    isFetchingStatement,
  }
}
