"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Button } from "@platform-system/design-ui"
import { useOrderDetails } from "../hooks/use-account"

export interface OrderDetailDialogProps {
  selectedOrderId: string | null
  setSelectedOrderId: (id: string | null) => void
}

export function OrderDetailDialog({
  selectedOrderId,
  setSelectedOrderId,
}: OrderDetailDialogProps) {
  const { data: orderDetails, isLoading: isLoadingOrderDetails } = useOrderDetails(selectedOrderId)

  return (
    <Dialog open={selectedOrderId !== null} onOpenChange={(open) => { if (!open) setSelectedOrderId(null) }}>
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[85vh] ds-glass-panel border border-[rgb(var(--store-border-rgb)/0.7)] rounded-3xl p-6 sm:p-8">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-semibold text-foreground">
            Chi tiết đơn hàng {orderDetails?.orderCode ? `#${orderDetails.orderCode}` : ""}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Thông tin chi tiết về trạng thái đơn hàng và các mặt hàng đã mua.
          </DialogDescription>
        </DialogHeader>

        {isLoadingOrderDetails ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : orderDetails ? (
          <div className="space-y-6 text-sm text-foreground">
            {/* 1. Trạng thái đơn hàng */}
            <div className="flex justify-between items-center p-4 rounded-2xl store-surface-soft border border-[rgb(var(--store-border-rgb)/0.5)]">
              <div>
                <p className="font-medium text-foreground">Trạng thái thanh toán</p>
                <p className="text-xs text-muted-foreground">
                  Hạn thanh toán: {new Date(orderDetails.expiredAt).toLocaleString("vi-VN")}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                orderDetails.status === 2 ? "bg-emerald-500/10 text-emerald-700" :
                orderDetails.status === 1 ? "bg-amber-500/10 text-amber-700" : "bg-rose-500/10 text-rose-700"
              }`}>
                {orderDetails.status === 1 ? "Chờ thanh toán" :
                 orderDetails.status === 2 ? "Đã thanh toán" :
                 orderDetails.status === 3 ? "Thanh toán thất bại" : "Đã hủy"}
              </span>
            </div>

            {/* 2. Địa chỉ giao hàng & Shipment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl store-surface-soft border border-[rgb(var(--store-border-rgb)/0.5)]">
                <h4 className="font-semibold text-foreground mb-2">Thông tin người nhận</h4>
                {orderDetails.address ? (
                  <div className="space-y-1 text-muted-foreground text-xs">
                    <p className="font-medium text-foreground">{orderDetails.address.recipientName}</p>
                    <p>{orderDetails.address.phoneNumber}</p>
                    <p>{`${orderDetails.address.streetAddress}, ${orderDetails.address.ward}, ${orderDetails.address.district}, ${orderDetails.address.city}`}</p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Không có địa chỉ giao hàng.</p>
                )}
              </div>

              <div className="p-4 rounded-2xl store-surface-soft border border-[rgb(var(--store-border-rgb)/0.5)]">
                <h4 className="font-semibold text-foreground mb-2">Vận chuyển</h4>
                {orderDetails.shipment ? (
                  <div className="space-y-1 text-muted-foreground text-xs">
                    <p>Phương thức: <span className="font-medium text-foreground capitalize">{orderDetails.shipment.method}</span></p>
                    <p>Phí vận chuyển: <span className="font-medium text-foreground">${orderDetails.shipment.fee.toLocaleString()}</span></p>
                    {orderDetails.shipment.note && (
                      <p className="italic">Ghi chú: {orderDetails.shipment.note}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Không có thông tin vận chuyển.</p>
                )}
              </div>
            </div>

            {/* 3. Danh sách sản phẩm */}
            <div className="border border-[rgb(var(--store-border-rgb)/0.5)] rounded-2xl overflow-hidden">
              <div className="bg-[rgb(var(--store-accent-rgb)/0.04)] px-4 py-3 border-b border-[rgb(var(--store-border-rgb)/0.5)]">
                <h4 className="font-semibold text-foreground">Sản phẩm đã chọn</h4>
              </div>
              <div className="divide-y divide-[rgb(var(--store-border-rgb)/0.3)]">
                {orderDetails.items.map((item: any) => (
                  <div key={item.productId} className="flex justify-between items-center p-4">
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Số lượng: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-foreground">
                      ${(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Tổng cộng */}
            <div className="flex justify-between items-center pt-2 border-t border-[rgb(var(--store-border-rgb)/0.5)] text-base font-bold">
              <span>Tổng số tiền:</span>
              <span className="store-accent-text">${orderDetails.totalAmount.toLocaleString()}</span>
            </div>

            {/* 5. Nút thanh toán lại nếu đơn hàng đang Pending và có link thanh toán */}
            {orderDetails.status === 1 && orderDetails.checkoutUrl && (
              <Button 
                asChild 
                className="w-full store-accent-button store-accent-button-strong rounded-xl py-3 font-semibold text-center block mt-6"
              >
                <a href={orderDetails.checkoutUrl} target="_blank" rel="noopener noreferrer">
                  Thanh toán ngay qua Cổng Thanh Toán
                </a>
              </Button>
            )}
          </div>
        ) : (
          <p className="text-center py-8 text-muted-foreground">Không tìm thấy thông tin đơn hàng.</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
