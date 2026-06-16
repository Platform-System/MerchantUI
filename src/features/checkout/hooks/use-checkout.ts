import React from "react"
import type { AxiosError } from "axios"
import { useCart } from "@/features/cart"
import { toast } from "sonner"
import { StoreOrder } from "@/types/store"
import { 
  CheckoutFormData, 
  DEFAULT_FORM_DATA, 
  DeliveryMethod, 
  PaymentMethod 
} from "../constants"
import { apiClient } from "@/shared/api/api-client"
import { Result } from "@/types/api"
import { useQuery } from "@tanstack/react-query"
import { fetchMyWallet } from "@/features/store/queries/wallet-queries"

interface CheckoutOrderAddressResponse {
  recipientName?: string | null
  phoneNumber?: string | null
  city?: string | null
  district?: string | null
  ward?: string | null
  streetAddress?: string | null
}

interface CheckoutOrderShipmentResponse {
  note?: string | null
  method?: string | null
  fee?: number | null
}

interface CheckoutOrderItemResponse {
  productId: string
  name: string
  price: number
  quantity: number
}

interface CheckoutOrderResponse {
  id: string
  orderCode?: string | null
  status: number
  expiredAt?: string | null
  totalAmount: number
  address?: CheckoutOrderAddressResponse | null
  shipment?: CheckoutOrderShipmentResponse | null
  items?: CheckoutOrderItemResponse[] | null
}

export function useCheckout() {
  const { cartItems, cartTotal, clearCart } = useCart()
  const [deliveryMethod, setDeliveryMethod] = React.useState<DeliveryMethod>("standard")
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>("payment")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [formData, setFormData] = React.useState<CheckoutFormData>(DEFAULT_FORM_DATA)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [orderSuccess, setOrderSuccess] = React.useState<StoreOrder | null>(null)

  const { data: wallet } = useQuery({
    queryKey: ["wallet", "me"],
    queryFn: fetchMyWallet,
    staleTime: 10 * 1000,
  })

  const shippingFee = deliveryMethod === "express" ? 12 : 0
  const taxAmount = Math.round(cartTotal * 0.08)
  const grandTotal = cartTotal + shippingFee + taxAmount

  const updateFormField = (field: keyof CheckoutFormData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }))
    setFormError(null)
  }

  const validateForm = () => {
    const requiredFields: Array<[keyof CheckoutFormData, string]> = [
      ["customerName", "Họ và tên"],
      ["phone", "Số điện thoại"],
      ["email", "Email"],
      ["city", "Tỉnh / Thành phố"],
      ["district", "Quận / Huyện"],
      ["ward", "Phường / Xã"],
      ["addressLine", "Địa chỉ chi tiết"],
    ]

    const missingField = requiredFields.find(([field]) => !formData[field].trim())
    if (missingField) {
      return `Vui lòng nhập ${missingField[1].toLowerCase()}.`
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(formData.email.trim())) {
      return "Email chưa đúng định dạng."
    }

    return null
  }

  const handlePlaceOrder = async () => {
    const validationError = validateForm()
    if (validationError) {
      setFormError(validationError)
      toast.error("Thông tin chưa đầy đủ", {
        description: validationError,
      })
      return
    }

    if (paymentMethod === "wallet") {
      if (!wallet) {
        toast.error("Không thể lấy thông tin ví. Vui lòng thử lại.")
        return
      }
      if (wallet.balance < grandTotal) {
        toast.error("Số dư ví không đủ để thanh toán đơn hàng này.")
        return
      }
    }

    setIsSubmitting(true)
    setFormError(null)

    const requestPayload = {
      recipientName: formData.customerName.trim(),
      phoneNumber: formData.phone.trim(),
      city: formData.city.trim(),
      district: formData.district.trim(),
      ward: formData.ward.trim(),
      streetAddress: formData.addressLine.trim(),
      shipmentMethod: deliveryMethod,
      shipmentFee: shippingFee,
      shipmentNote: formData.deliveryNote.trim(),
    }

    try {
      const response = await apiClient.post<Result<CheckoutOrderResponse>>("/api/ordering/carts/checkout", requestPayload)
      if (response.data && response.data.success && response.data.data) {
        const order = response.data.data

        // Gọi API thanh toán thực tế (Wallet trừ tiền ví, hoặc Cổng thanh toán tạo link)
        const checkoutResponse = await apiClient.post<Result<{ checkoutUrl?: string | null, status: number }>>(
          `/api/ordering/orders/${order.orderCode}/checkout`,
          {
            paymentMethod: paymentMethod, // "wallet" hoặc "payment"
            provider: "PayOS"
          }
        )

        let status: StoreOrder["status"] = "pending"
        let checkoutUrl: string | null = null

        if (checkoutResponse.data && checkoutResponse.data.success && checkoutResponse.data.data) {
          const checkoutData = checkoutResponse.data.data
          checkoutUrl = checkoutData.checkoutUrl || null
          if (checkoutData.status === 2 || paymentMethod === "wallet") {
            status = "processing"
          }
        }

        const expiredDate = order.expiredAt ? new Date(order.expiredAt) : new Date()
        const createdDate = new Date(expiredDate.getTime() - 15 * 60 * 1000)

        const orderPayload: StoreOrder = {
          id: order.orderCode ? `#${order.orderCode}` : order.id,
          createdAt: createdDate.toISOString(),
          customerName: order.address?.recipientName || formData.customerName.trim(),
          email: formData.email.trim(),
          phone: order.address?.phoneNumber || formData.phone.trim(),
          city: order.address?.city || formData.city.trim(),
          district: order.address?.district || formData.district.trim(),
          ward: order.address?.ward || formData.ward.trim(),
          addressLine: order.address?.streetAddress || formData.addressLine.trim(),
          deliveryNote: order.shipment?.note || formData.deliveryNote.trim(),
          deliveryMethod: order.shipment?.method === "express" ? "express" : "standard",
          paymentMethod: paymentMethod,
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
        }

        setOrderSuccess(orderPayload)
        clearCart()
        
        if (paymentMethod === "wallet") {
          toast.success("Thanh toán thành công", {
            description: `Đơn hàng ${orderPayload.id} đã thanh toán bằng ví.`,
          })
        } else if (checkoutUrl) {
          toast.success("Tạo đơn hàng thành công! Đang chuyển hướng...", {
            description: `Đang chuyển hướng sang cổng thanh toán.`,
          })
          window.location.href = checkoutUrl
        } else {
          toast.success("Đặt hàng thành công", {
            description: `Đơn hàng ${orderPayload.id} đã được tạo.`,
          })
        }
      } else {
        const errorMsg = response.data?.message || "Đặt hàng không thành công. Vui lòng kiểm tra lại."
        setFormError(errorMsg)
        toast.error("Lỗi đặt hàng", {
          description: errorMsg,
        })
      }
    } catch (err) {
      const apiError = err as AxiosError<{ message?: string }>
      console.error("Failed to place order:", apiError)
      const errorMsg = apiError.response?.data?.message || apiError.message || "Đã xảy ra lỗi khi đặt hàng."
      setFormError(errorMsg)
      toast.error("Lỗi kết nối", {
        description: errorMsg,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
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
  }
}
