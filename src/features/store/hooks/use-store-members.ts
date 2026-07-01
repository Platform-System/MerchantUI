import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import {
  fetchMyStoreMembers,
  inviteStoreMember,
  updateStoreMemberPublishPermission,
  storeManageQueryKeys,
} from "../queries/store-manage-queries"

import type { StoreDetailsResponse } from "@/shared/lib/storefront-normalizers"

export interface UseStoreMembersProps {
  selectedStoreId: string | null
  myStore: StoreDetailsResponse | null
  isActiveStore: boolean
}

export function useStoreMembers({
  selectedStoreId,
  myStore,
  isActiveStore,
}: UseStoreMembersProps) {
  const t = useTranslations("Account.store")
  const queryClient = useQueryClient()

  const [inviteForm, setInviteForm] = React.useState({
    userId: "",
    role: 1 as 1 | 2,
    canPublishProductDirectly: false,
  })

  const { data: members = [], isLoading: isLoadingMembers } = useQuery({
    queryKey: selectedStoreId ? storeManageQueryKeys.members(selectedStoreId) : ["store-manage", "none", "members"],
    queryFn: () => selectedStoreId ? fetchMyStoreMembers(selectedStoreId) : [],
    enabled: !!selectedStoreId && Boolean(myStore?.profile.id),
    staleTime: 60 * 1000,
  })

  const inviteMemberMutation = useMutation({
    mutationFn: ({ storeId, payload }: { storeId: string; payload: typeof inviteForm }) => inviteStoreMember(storeId, payload),
    onSuccess: async (result) => {
      if (result.success) {
        toast.success(t("inviteSent"))
        setInviteForm({
          userId: "",
          role: 1,
          canPublishProductDirectly: false,
        })
        if (selectedStoreId) {
          await queryClient.invalidateQueries({ queryKey: storeManageQueryKeys.members(selectedStoreId) })
        }
      } else {
        toast.error(result.message || t("requestFailed"))
      }
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || t("requestFailed"))
    },
  })

  const publishPermissionMutation = useMutation({
    mutationFn: ({ storeId, userId, canPublishProductDirectly }: { storeId: string; userId: string; canPublishProductDirectly: boolean }) =>
      updateStoreMemberPublishPermission(storeId, userId, { canPublishProductDirectly }),
    onSuccess: async (result) => {
      if (result.success) {
        toast.success(t("publishPermissionSaved"))
        if (selectedStoreId) {
          await queryClient.invalidateQueries({ queryKey: storeManageQueryKeys.members(selectedStoreId) })
        }
      } else {
        toast.error(result.message || t("requestFailed"))
      }
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || t("requestFailed"))
    },
  })

  const inviteMember = () => {
    if (selectedStoreId) {
      inviteMemberMutation.mutate({
        storeId: selectedStoreId,
        payload: inviteForm,
      })
    }
  }

  const savePublishPermission = (userId: string, canPublishProductDirectly: boolean) => {
    if (selectedStoreId) {
      publishPermissionMutation.mutate({
        storeId: selectedStoreId,
        userId,
        canPublishProductDirectly,
      })
    }
  }

  return {
    inviteForm,
    setInviteForm,
    members,
    isLoadingMembers,
    inviteMember,
    savePublishPermission,
    isInvitingMember: inviteMemberMutation.isPending,
    isSavingPublishPermission: publishPermissionMutation.isPending,
  }
}
