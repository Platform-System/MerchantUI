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
  lookupUser,
  fetchStoreRoles,
  StoreRoleResponse,
  InviteStoreMemberRequest,
  fetchStoreSentInvitations,
  StoreSentInvitationResponse,
  cancelStoreInvitation,
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
    roleId: "",
  })

  const { data: storeRoles = [] } = useQuery({
    queryKey: ["store-manage", selectedStoreId, "roles"],
    queryFn: () => selectedStoreId ? fetchStoreRoles(selectedStoreId) : [],
    enabled: !!selectedStoreId && Boolean(myStore?.profile.id),
    staleTime: 5 * 60 * 1000,
  })

  const rolesToSelect = React.useMemo(() => {
    return storeRoles.filter(r => r.name.toLowerCase() !== "owner")
  }, [storeRoles])

  const resolvedInviteForm = React.useMemo(() => ({
    ...inviteForm,
    roleId: inviteForm.roleId || rolesToSelect[0]?.id || "",
  }), [inviteForm, rolesToSelect])
  const [isLookingUpUser, setIsLookingUpUser] = React.useState(false)

  const { data: storeSentInvitationsData, isLoading: isLoadingSentInvitations } = useQuery({
    queryKey: ["store-manage", selectedStoreId, "sent-invitations"],
    queryFn: () => selectedStoreId ? fetchStoreSentInvitations(selectedStoreId, 1, 100) : null,
    enabled: !!selectedStoreId && Boolean(myStore?.profile.id) && isActiveStore,
    staleTime: 30 * 1000,
  })

  const storeSentInvitations = storeSentInvitationsData?.items || []

  const cancelInviteMutation = useMutation({
    mutationFn: ({ storeId, userId }: { storeId: string; userId: string }) => cancelStoreInvitation(storeId, userId),
    onSuccess: async (result) => {
      if (result.success) {
        toast.success("Đã hủy lời mời thành công.")
        if (selectedStoreId) {
          await queryClient.invalidateQueries({ queryKey: ["store-manage", selectedStoreId, "sent-invitations"] })
        }
      } else {
        toast.error(result.message || t("requestFailed"))
      }
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || t("requestFailed"))
    },
  })

  const cancelSentInvitation = (userId: string) => {
    if (selectedStoreId) {
      cancelInviteMutation.mutate({ storeId: selectedStoreId, userId })
    }
  }

  const { data: members = [], isLoading: isLoadingMembers } = useQuery({
    queryKey: selectedStoreId ? storeManageQueryKeys.members(selectedStoreId) : ["store-manage", "none", "members"],
    queryFn: () => selectedStoreId ? fetchMyStoreMembers(selectedStoreId) : [],
    enabled: !!selectedStoreId && Boolean(myStore?.profile.id),
    staleTime: 60 * 1000,
  })

  const inviteMemberMutation = useMutation({
    mutationFn: ({ storeId, payload }: { storeId: string; payload: InviteStoreMemberRequest }) => inviteStoreMember(storeId, payload),
    onSuccess: async (result) => {
      if (result.success) {
        toast.success(t("inviteSent"))
        setInviteForm({
          userId: "",
          roleId: rolesToSelect[0]?.id || "",
        })
        if (selectedStoreId) {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: storeManageQueryKeys.members(selectedStoreId) }),
            queryClient.invalidateQueries({ queryKey: ["store-manage", selectedStoreId, "sent-invitations"] })
          ])
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

  const inviteMember = async (resolvedUserId?: string) => {
    if (!selectedStoreId) return

    const inputVal = inviteForm.userId.trim()
    if (!inputVal) return

    let targetUserId = resolvedUserId || inputVal

    if (!resolvedUserId) {
      const isGuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(inputVal)

      if (!isGuid) {
        setIsLookingUpUser(true)
        try {
          const user = await lookupUser(inputVal)
          if (!user) {
            toast.error("Không tìm thấy thành viên với Email hoặc Username đã nhập.")
            setIsLookingUpUser(false)
            return
          }
          targetUserId = user.identityId
        } catch (error) {
          toast.error("Có lỗi xảy ra khi kiểm tra thông tin thành viên.")
          setIsLookingUpUser(false)
          return
        }
        setIsLookingUpUser(false)
      }
    }

    inviteMemberMutation.mutate({
        storeId: selectedStoreId,
        payload: {
          userId: targetUserId,
          roleId: resolvedInviteForm.roleId,
        },
      })
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
    inviteForm: resolvedInviteForm,
    setInviteForm,
    members,
    isLoadingMembers,
    inviteMember,
    savePublishPermission,
    isInvitingMember: inviteMemberMutation.isPending || isLookingUpUser,
    isSavingPublishPermission: publishPermissionMutation.isPending,
    storeRoles,
    storeSentInvitations,
    isLoadingSentInvitations,
    cancelSentInvitation,
    isCancelingInvitation: cancelInviteMutation.isPending,
  }
}
