"use client"

import * as React from "react"
import { Info } from "lucide-react"
import { Textarea, Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@platform-system/design-ui"
import { SHIPPING_POLICY_TEMPLATE, RETURN_POLICY_TEMPLATE, WARRANTY_POLICY_TEMPLATE } from "@/features/store/hooks/use-store-management"

export interface StorePoliciesSubTabProps {
  isActiveStore: boolean
  policyForm: {
    shippingPolicy: string
    returnPolicy: string
    warrantyPolicy: string
  }
  setPolicyForm: React.Dispatch<React.SetStateAction<{
    shippingPolicy: string
    returnPolicy: string
    warrantyPolicy: string
  }>>
  isPolicyLocked: boolean
  isSavingPolicy: boolean
  isPendingActive: boolean
  hasPendingPolicyUpdate: boolean
  canRequestActivation: boolean
  isRequestingActivation: boolean
  policyErrors: {
    shippingPolicy: boolean
    returnPolicy: boolean
    warrantyPolicy: boolean
  }
  setPolicyErrors: React.Dispatch<React.SetStateAction<{
    shippingPolicy: boolean
    returnPolicy: boolean
    warrantyPolicy: boolean
  }>>
  shippingPolicyRef: React.RefObject<HTMLTextAreaElement>
  returnPolicyRef: React.RefObject<HTMLTextAreaElement>
  warrantyPolicyRef: React.RefObject<HTMLTextAreaElement>
  handlePolicyKeyDown: (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
    fieldName: "shippingPolicy" | "returnPolicy" | "warrantyPolicy"
  ) => void
  handleSavePolicy: () => void
  handleRequestActivation: () => void
  ts: (key: string) => string
}

export function StorePoliciesSubTab({
  isActiveStore,
  policyForm,
  setPolicyForm,
  isPolicyLocked,
  isSavingPolicy,
  isPendingActive,
  hasPendingPolicyUpdate,
  canRequestActivation,
  isRequestingActivation,
  policyErrors,
  setPolicyErrors,
  shippingPolicyRef,
  returnPolicyRef,
  warrantyPolicyRef,
  handlePolicyKeyDown,
  handleSavePolicy,
  handleRequestActivation,
  ts,
}: StorePoliciesSubTabProps) {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false)

  const handleCancel = () => {
    setIsUpdateModalOpen(false)
  }

  const renderPolicyText = (text: string) => {
    if (!text) return "—"
    return text.split("\n").map((line, index) => {
      const match = line.match(/^([-\s•*]*)([^:]+):(.*)$/)
      if (match) {
        const prefix = match[1]
        const label = match[2]
        const value = match[3]
        return (
          <span key={index} className="block">
            {prefix}
            <strong className="font-semibold text-foreground">{label}</strong>:
            {value}
          </span>
        )
      }
      return (
        <span key={index} className="block">
          {line}
        </span>
      )
    })
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {hasPendingPolicyUpdate && (
        <div className="flex items-start gap-3 rounded-2xl border border-sky-500/20 bg-sky-500/5 text-sky-700 dark:text-sky-400 p-4 text-sm">
          <Info className="h-5 w-5 shrink-0 mt-0" />
          <div className="flex-1">
            <p className="font-semibold text-foreground">
              {ts("pendingPolicyUpdateAlertTitle")}
            </p>
            <p className="mt-1 opacity-90 leading-relaxed">
              {ts("pendingPolicyUpdateAlertDesc")}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4 rounded-2xl border border-[rgb(var(--store-border-rgb)/0.7)] p-5">
        <div>
          <h4 className="text-lg font-semibold text-foreground">{ts("policySection")}</h4>
          <p className="text-sm text-muted-foreground">{ts("policySectionDesc")}</p>
        </div>

        {isActiveStore ? (
          <div className="space-y-6 p-1">
            <div className="space-y-2 pb-4 border-b border-[rgb(var(--store-border-rgb)/0.5)]">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{ts("shippingPolicy")}</span>
              <div className="text-sm text-foreground space-y-1 mt-1 leading-relaxed">
                {renderPolicyText(policyForm.shippingPolicy)}
              </div>
            </div>
            <div className="space-y-2 pb-4 border-b border-[rgb(var(--store-border-rgb)/0.5)]">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{ts("returnPolicy")}</span>
              <div className="text-sm text-foreground space-y-1 mt-1 leading-relaxed">
                {renderPolicyText(policyForm.returnPolicy)}
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{ts("warrantyPolicy")}</span>
              <div className="text-sm text-foreground space-y-1 mt-1 leading-relaxed">
                {renderPolicyText(policyForm.warrantyPolicy)}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-xs text-muted-foreground">{ts("shippingPolicy")}</span>
              <Textarea
                ref={shippingPolicyRef}
                aria-invalid={policyErrors.shippingPolicy}
                placeholder={SHIPPING_POLICY_TEMPLATE}
                className="min-h-32 rounded-xl"
                value={policyForm.shippingPolicy}
                onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) =>
                  handlePolicyKeyDown(e, "shippingPolicy")
                }
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setPolicyForm((current) => ({ ...current, shippingPolicy: event.target.value }))
                  if (event.target.value.trim()) {
                    setPolicyErrors((current) => ({ ...current, shippingPolicy: false }))
                  }
                }}
                disabled={isPolicyLocked}
              />
            </div>

            <div className="space-y-2">
              <span className="text-xs text-muted-foreground">{ts("returnPolicy")}</span>
              <Textarea
                ref={returnPolicyRef}
                aria-invalid={policyErrors.returnPolicy}
                placeholder={RETURN_POLICY_TEMPLATE}
                className="min-h-32 rounded-xl"
                value={policyForm.returnPolicy}
                onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) =>
                  handlePolicyKeyDown(e, "returnPolicy")
                }
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setPolicyForm((current) => ({ ...current, returnPolicy: event.target.value }))
                  if (event.target.value.trim()) {
                    setPolicyErrors((current) => ({ ...current, returnPolicy: false }))
                  }
                }}
                disabled={isPolicyLocked}
              />
            </div>

            <div className="space-y-2">
              <span className="text-xs text-muted-foreground">{ts("warrantyPolicy")}</span>
              <Textarea
                ref={warrantyPolicyRef}
                aria-invalid={policyErrors.warrantyPolicy}
                placeholder={WARRANTY_POLICY_TEMPLATE}
                className="min-h-32 rounded-xl"
                value={policyForm.warrantyPolicy}
                onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) =>
                  handlePolicyKeyDown(e, "warrantyPolicy")
                }
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setPolicyForm((current) => ({ ...current, warrantyPolicy: event.target.value }))
                  if (event.target.value.trim()) {
                    setPolicyErrors((current) => ({ ...current, warrantyPolicy: false }))
                  }
                }}
                disabled={isPolicyLocked}
              />
            </div>
          </div>
        )}

        {!isPendingActive && isPolicyLocked && !isActiveStore && (
          <p className="text-sm text-muted-foreground">{ts("policyLocked")}</p>
        )}
      </div>

      {!isPendingActive && (
        <div className="flex flex-col items-start gap-1">
          <Button
            className="store-accent-button store-accent-button-strong rounded-xl"
            onClick={isActiveStore ? () => setIsUpdateModalOpen(true) : handleSavePolicy}
            disabled={isSavingPolicy || isPolicyLocked}
          >
            {isSavingPolicy
              ? ts("saving")
              : isActiveStore
                ? "Gửi yêu cầu thay đổi"
                : ts("savePolicy")}
          </Button>
          {isActiveStore && (
            <p className="text-xs text-muted-foreground leading-normal mt-1">
              * Vì gian hàng đã hoạt động, mọi thay đổi chính sách sẽ cần được phê duyệt bởi Ban quản trị trước khi chính thức áp dụng.
            </p>
          )}
        </div>
      )}



      {/* Policy Update Request Modal */}
      {isActiveStore && (
        <Dialog open={isUpdateModalOpen} onOpenChange={(open) => { if (!open) handleCancel() }}>
          <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh] ds-glass-panel border border-[rgb(var(--store-border-rgb)/0.7)] rounded-3xl p-6 sm:p-8">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl font-semibold text-foreground">
                Yêu cầu thay đổi chính sách bán hàng
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs">
                Chỉnh sửa các điều khoản chính sách bên dưới. Nhấn gửi để gửi yêu cầu phê duyệt lên Ban quản trị.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <span className="text-xs font-medium text-foreground">{ts("shippingPolicy")}</span>
                <Textarea
                  aria-invalid={policyErrors.shippingPolicy}
                  placeholder={SHIPPING_POLICY_TEMPLATE}
                  className="min-h-32 rounded-xl"
                  value={policyForm.shippingPolicy}
                  onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) =>
                    handlePolicyKeyDown(e, "shippingPolicy")
                  }
                  onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                    setPolicyForm((current) => ({ ...current, shippingPolicy: event.target.value }))
                    if (event.target.value.trim()) {
                      setPolicyErrors((current) => ({ ...current, shippingPolicy: false }))
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-medium text-foreground">{ts("returnPolicy")}</span>
                <Textarea
                  aria-invalid={policyErrors.returnPolicy}
                  placeholder={RETURN_POLICY_TEMPLATE}
                  className="min-h-32 rounded-xl"
                  value={policyForm.returnPolicy}
                  onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) =>
                    handlePolicyKeyDown(e, "returnPolicy")
                  }
                  onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                    setPolicyForm((current) => ({ ...current, returnPolicy: event.target.value }))
                    if (event.target.value.trim()) {
                      setPolicyErrors((current) => ({ ...current, returnPolicy: false }))
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-medium text-foreground">{ts("warrantyPolicy")}</span>
                <Textarea
                  aria-invalid={policyErrors.warrantyPolicy}
                  placeholder={WARRANTY_POLICY_TEMPLATE}
                  className="min-h-32 rounded-xl"
                  value={policyForm.warrantyPolicy}
                  onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) =>
                    handlePolicyKeyDown(e, "warrantyPolicy")
                  }
                  onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                    setPolicyForm((current) => ({ ...current, warrantyPolicy: event.target.value }))
                    if (event.target.value.trim()) {
                      setPolicyErrors((current) => ({ ...current, warrantyPolicy: false }))
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={handleCancel} className="rounded-xl px-5">
                Hủy
              </Button>
              <Button
                onClick={() => {
                  handleSavePolicy()
                  setIsUpdateModalOpen(false)
                }}
                disabled={isSavingPolicy}
                className="store-accent-button store-accent-button-strong rounded-xl px-5"
              >
                Gửi yêu cầu
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
