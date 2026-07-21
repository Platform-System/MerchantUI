import * as React from "react"
import { useMutation } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import {
  submitStorePolicyUpdateRequest,
  updateMyStorePolicy,
  requestMyStoreActivation,
} from "../queries/store-manage-queries"
import type { StoreUpdateRequestResponse } from "../queries/store-manage-queries"
import type { StoreDetailsResponse } from "@/shared/lib/storefront-normalizers"

const SHIPPING_POLICY_TEMPLATE = "- Phạm vi giao: \n- Thời gian nhận: \n- Phí vận chuyển: \n- Đồng kiểm: "
const RETURN_POLICY_TEMPLATE = "- Thời hạn đổi trả: \n- Điều kiện đổi trả: \n- Phí ship đổi trả: "
const WARRANTY_POLICY_TEMPLATE = "- Thời hạn bảo hành: \n- Địa điểm bảo hành: \n- Hình thức bảo hành: "

export interface UseStorePoliciesProps {
  selectedStoreId: string | null
  myStore: StoreDetailsResponse | null
  isActiveStore: boolean
  pendingPolicyUpdate: StoreUpdateRequestResponse | null
  refreshStore: () => Promise<void>
}

export function useStorePolicies({
  selectedStoreId,
  myStore,
  isActiveStore,
  pendingPolicyUpdate,
  refreshStore,
}: UseStorePoliciesProps) {
  const t = useTranslations("Account.store")

  const getPolicyValue = React.useCallback((value: string | null | undefined, template: string) => {
    if (value === undefined || value === null || !value.trim()) {
      return template
    }

    return value
  }, [])

  const basePolicyForm = React.useMemo(() => ({
    shippingPolicy: pendingPolicyUpdate?.shippingPolicy ?? getPolicyValue(myStore?.policy?.shippingPolicy, SHIPPING_POLICY_TEMPLATE),
    returnPolicy: pendingPolicyUpdate?.returnPolicy ?? getPolicyValue(myStore?.policy?.returnPolicy, RETURN_POLICY_TEMPLATE),
    warrantyPolicy: pendingPolicyUpdate?.warrantyPolicy ?? getPolicyValue(myStore?.policy?.warrantyPolicy, WARRANTY_POLICY_TEMPLATE),
  }), [getPolicyValue, myStore, pendingPolicyUpdate])

  const [policyDraft, setPolicyDraft] = React.useState<{
    storeId: string | null
    form: typeof basePolicyForm
  } | null>(null)

  const policyForm = policyDraft?.storeId === selectedStoreId
    ? policyDraft.form
    : basePolicyForm

  const setPolicyForm: React.Dispatch<React.SetStateAction<typeof basePolicyForm>> = React.useCallback((value) => {
    setPolicyDraft((current) => {
      const currentForm = current?.storeId === selectedStoreId ? current.form : basePolicyForm
      const nextForm = typeof value === "function" ? value(currentForm) : value

      return {
        storeId: selectedStoreId,
        form: nextForm,
      }
    })
  }, [basePolicyForm, selectedStoreId])

  const updatePolicyMutation = useMutation({
    mutationFn: ({ storeId, payload }: { storeId: string; payload: typeof policyForm }) =>
      isActiveStore ? submitStorePolicyUpdateRequest(storeId, payload) : updateMyStorePolicy(storeId, payload),
    onSuccess: async (result) => {
      if (result.success) {
        toast.success(isActiveStore ? t("policyUpdateRequested") || "Yêu cầu thay đổi chính sách đã được gửi." : t("policySaved"))
        setPolicyDraft(null)
        await refreshStore()
      } else {
        toast.error(result.message || t("requestFailed"))
      }
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || t("requestFailed"))
    },
  })

  const requestActivationMutation = useMutation({
    mutationFn: requestMyStoreActivation,
    onSuccess: async (result) => {
      if (result.success) {
        toast.success(t("activationRequested"))
        await refreshStore()
      } else {
        toast.error(result.message || t("requestFailed"))
      }
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || t("requestFailed"))
    },
  })

  const savePolicy = () => {
    if (selectedStoreId) {
      updatePolicyMutation.mutate({ storeId: selectedStoreId, payload: policyForm })
    }
  }

  return {
    policyForm,
    setPolicyForm,
    savePolicy,
    updatePolicyMutation,
    requestActivationMutation,
  }
}
