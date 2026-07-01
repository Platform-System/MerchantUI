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

  const [policyForm, setPolicyForm] = React.useState({
    shippingPolicy: SHIPPING_POLICY_TEMPLATE,
    returnPolicy: RETURN_POLICY_TEMPLATE,
    warrantyPolicy: WARRANTY_POLICY_TEMPLATE,
  })

  const [prevStoreAndPending, setPrevStoreAndPending] = React.useState({ myStore, pendingPolicyUpdate })
  if (prevStoreAndPending.myStore !== myStore || prevStoreAndPending.pendingPolicyUpdate !== pendingPolicyUpdate) {
    setPrevStoreAndPending({ myStore, pendingPolicyUpdate })
    if (myStore) {
      const getPolicyValue = (val: string | null | undefined, template: string) => {
        if (val === undefined || val === null || !val.trim()) {
          return template
        }
        return val
      }

      setPolicyForm({
        shippingPolicy: (pendingPolicyUpdate?.shippingPolicy !== undefined && pendingPolicyUpdate?.shippingPolicy !== null) ? pendingPolicyUpdate.shippingPolicy : getPolicyValue(myStore.policy?.shippingPolicy, SHIPPING_POLICY_TEMPLATE),
        returnPolicy: (pendingPolicyUpdate?.returnPolicy !== undefined && pendingPolicyUpdate?.returnPolicy !== null) ? pendingPolicyUpdate.returnPolicy : getPolicyValue(myStore.policy?.returnPolicy, RETURN_POLICY_TEMPLATE),
        warrantyPolicy: (pendingPolicyUpdate?.warrantyPolicy !== undefined && pendingPolicyUpdate?.warrantyPolicy !== null) ? pendingPolicyUpdate.warrantyPolicy : getPolicyValue(myStore.policy?.warrantyPolicy, WARRANTY_POLICY_TEMPLATE),
      })
    }
  }

  const updatePolicyMutation = useMutation({
    mutationFn: ({ storeId, payload }: { storeId: string; payload: typeof policyForm }) =>
      isActiveStore ? submitStorePolicyUpdateRequest(storeId, payload) : updateMyStorePolicy(storeId, payload),
    onSuccess: async (result) => {
      if (result.success) {
        toast.success(isActiveStore ? t("policyUpdateRequested") || "Yêu cầu thay đổi chính sách đã được gửi." : t("policySaved"))
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
