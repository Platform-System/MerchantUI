import * as React from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import {
  acceptStoreInvitation,
  fetchMyStoreInvitations,
} from "../queries/store-manage-queries"

export interface UseStoreInvitationsProps {
  hasStoreFromToken: boolean | null
  refreshStore: () => Promise<void>
}

export function useStoreInvitations({
  hasStoreFromToken,
  refreshStore,
}: UseStoreInvitationsProps) {
  const t = useTranslations("Account.store")

  const [acceptInviteStoreId, setAcceptInviteStoreId] = React.useState("")

  const { data: invitationsData, isLoading: isLoadingInvitations, refetch: refetchInvitations } = useQuery({
    queryKey: ["store-manage", "my-invitations"],
    queryFn: () => fetchMyStoreInvitations(1, 100),
    enabled: hasStoreFromToken !== null,
    staleTime: 30 * 1000,
  })

  const invitations = invitationsData?.items || []

  const acceptInviteMutation = useMutation({
    mutationFn: acceptStoreInvitation,
    onSuccess: async (result) => {
      if (result.success) {
        toast.success(t("inviteAccepted"))
        await refreshStore()
      } else {
        toast.error(result.message || t("requestFailed"))
      }
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || t("requestFailed"))
    },
  })

  const acceptInvitation = (storeId?: string) => {
    const targetStoreId = typeof storeId === "string" ? storeId : acceptInviteStoreId.trim()
    if (targetStoreId) {
      acceptInviteMutation.mutate(targetStoreId)
    }
  }

  return {
    acceptInviteStoreId,
    setAcceptInviteStoreId,
    invitations,
    isLoadingInvitations,
    refetchInvitations,
    acceptInvitation,
    isAcceptingInvitation: acceptInviteMutation.isPending,
  }
}
