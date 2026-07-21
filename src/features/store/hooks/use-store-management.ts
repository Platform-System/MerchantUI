import * as React from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  fetchMyPendingStoreUpdates,
  storeManageQueryKeys,
} from "../queries/store-manage-queries"
import { useStoreMetadata } from "./use-store-metadata"
import { useStoreProfile } from "./use-store-profile"
import { useStorePolicies } from "./use-store-policies"
import { useStoreMembers } from "./use-store-members"
import { useStoreInvitations } from "./use-store-invitations"

export const SHIPPING_POLICY_TEMPLATE = "- Phạm vi giao: \n- Thời gian nhận: \n- Phí vận chuyển: \n- Đồng kiểm: "
export const RETURN_POLICY_TEMPLATE = "- Thời hạn đổi trả: \n- Điều kiện đổi trả: \n- Phí ship đổi trả: "
export const WARRANTY_POLICY_TEMPLATE = "- Thời hạn bảo hành: \n- Địa điểm bảo hành: \n- Hình thức bảo hành: "

export function useStoreManagement() {
  const queryClient = useQueryClient()

  // 1. Core Metadata
  const metadata = useStoreMetadata()
  const {
    selectedStoreId,
    setSelectedStoreId,
    myStores,
    isLoadingMyStores,
    myStore,
    isLoading,
    isFetching,
    normalizedStatus,
    isActiveStore,
    isOwner,
    activationRequests,
    latestRejectionReason,
    hasStoreFromToken,
  } = metadata

  // Invalidation helper
  const refreshStore = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: storeManageQueryKeys.myStores }),
      selectedStoreId && queryClient.invalidateQueries({ queryKey: storeManageQueryKeys.store(selectedStoreId) }),
      selectedStoreId && queryClient.invalidateQueries({ queryKey: storeManageQueryKeys.pendingUpdate(selectedStoreId) }),
      selectedStoreId && queryClient.invalidateQueries({ queryKey: storeManageQueryKeys.members(selectedStoreId) }),
      queryClient.invalidateQueries({ queryKey: ["store-manage", "my-invitations"] }),
    ].filter(Boolean))
  }

  // 2. Pending updates queries
  const { data: pendingUpdates = [], isLoading: isLoadingPendingUpdate } = useQuery({
    queryKey: selectedStoreId ? storeManageQueryKeys.pendingUpdate(selectedStoreId) : ["store-manage", "none", "pending-update"],
    queryFn: () => selectedStoreId ? fetchMyPendingStoreUpdates(selectedStoreId) : Promise.resolve([]),
    enabled: !!selectedStoreId && isActiveStore,
    staleTime: 30 * 1000,
  })

  const pendingProfileUpdate = React.useMemo(() => pendingUpdates.find(u => u.requestType === "Profile"), [pendingUpdates])
  const pendingPolicyUpdate = React.useMemo(() => pendingUpdates.find(u => u.requestType === "Policy"), [pendingUpdates])

  const hasPendingProfileUpdate = Boolean(pendingProfileUpdate)
  const hasPendingPolicyUpdate = Boolean(pendingPolicyUpdate)

  // 3. Sub-hooks delegation
  const profileProps = useStoreProfile({
    selectedStoreId,
    myStore: myStore || null,
    isActiveStore,
    pendingProfileUpdate: pendingProfileUpdate ?? null,
    refreshStore,
  })

  const policyProps = useStorePolicies({
    selectedStoreId,
    myStore: myStore || null,
    isActiveStore,
    pendingPolicyUpdate: pendingPolicyUpdate ?? null,
    refreshStore,
  })

  const membersProps = useStoreMembers({
    selectedStoreId,
    myStore: myStore || null,
    isActiveStore,
  })

  const invitationsProps = useStoreInvitations({
    hasStoreFromToken,
    refreshStore,
  })

  // Coordination actions
  const requestActivation = async () => {
    if (selectedStoreId) {
      try {
        const profilePromise = profileProps.updateProfileMutation.mutateAsync({
          storeId: selectedStoreId,
          payload: profileProps.profileForm
        })
        const policyPromise = policyProps.updatePolicyMutation.mutateAsync({
          storeId: selectedStoreId,
          payload: policyProps.policyForm
        })

        const [profileResult, policyResult] = await Promise.all([profilePromise, policyPromise])

        if (profileResult.success && policyResult.success) {
          await policyProps.requestActivationMutation.mutateAsync(selectedStoreId)
        }
      } catch {
        // Errors are handled by mutations' onError toast
      }
    }
  }

  return {
    // Metadata / core
    myStores,
    selectedStoreId,
    setSelectedStoreId,
    isLoadingMyStores,
    myStore,
    hasStore: Boolean(myStore),
    isOwner,
    isLoading,
    isFetching,

    // Profile Props
    profileForm: profileProps.profileForm,
    setProfileForm: profileProps.setProfileForm,
    avatarForm: profileProps.avatarForm,
    setAvatarForm: profileProps.setAvatarForm,
    coverForm: profileProps.coverForm,
    setCoverForm: profileProps.setCoverForm,
    saveProfile: profileProps.saveProfile,
    saveAvatar: profileProps.saveAvatar,
    saveCover: profileProps.saveCover,
    uploadImage: profileProps.uploadImage,
    isSavingProfile: profileProps.isSavingProfile,
    isSavingAvatar: profileProps.isSavingAvatar,
    isSavingCover: profileProps.isSavingCover,
    isUploadingImage: profileProps.isUploadingImage,
    isUploadingAvatar: profileProps.isUploadingAvatar,
    isUploadingCover: profileProps.isUploadingCover,

    // Policy Props
    policyForm: policyProps.policyForm,
    setPolicyForm: policyProps.setPolicyForm,
    savePolicy: policyProps.savePolicy,
    isSavingPolicy: policyProps.updatePolicyMutation.isPending,
    isRequestingActivation:
      policyProps.requestActivationMutation.isPending ||
      profileProps.updateProfileMutation.isPending ||
      policyProps.updatePolicyMutation.isPending,

    // Member Props
    inviteForm: membersProps.inviteForm,
    setInviteForm: membersProps.setInviteForm,
    inviteMember: membersProps.inviteMember,
    isInvitingMember: membersProps.isInvitingMember,
    members: membersProps.members,
    isLoadingMembers: membersProps.isLoadingMembers,
    savePublishPermission: membersProps.savePublishPermission,
    isSavingPublishPermission: membersProps.isSavingPublishPermission,
    storeRoles: membersProps.storeRoles,
    storeSentInvitations: membersProps.storeSentInvitations,
    isLoadingSentInvitations: membersProps.isLoadingSentInvitations,
    cancelSentInvitation: membersProps.cancelSentInvitation,
    isCancelingInvitation: membersProps.isCancelingInvitation,

    // Invitations Props
    acceptInviteStoreId: invitationsProps.acceptInviteStoreId,
    setAcceptInviteStoreId: invitationsProps.setAcceptInviteStoreId,
    invitations: invitationsProps.invitations,
    isLoadingInvitations: invitationsProps.isLoadingInvitations,
    refetchInvitations: invitationsProps.refetchInvitations,
    acceptInvitation: invitationsProps.acceptInvitation,
    isAcceptingInvitation: invitationsProps.isAcceptingInvitation,

    // Derived states
    normalizedStatus,
    isActiveStore,
    isPendingActive: normalizedStatus === "pendingactive",
    canRequestActivation: Boolean(
      selectedStoreId &&
      normalizedStatus !== "active" &&
      normalizedStatus !== "pendingactive"
    ),
    isProfileLocked: normalizedStatus === "pendingactive" || hasPendingProfileUpdate,
    isPolicyLocked: normalizedStatus === "pendingactive" || hasPendingPolicyUpdate,
    pendingProfileUpdate,
    pendingPolicyUpdate,
    hasPendingProfileUpdate,
    hasPendingPolicyUpdate,
    isLoadingPendingUpdate,
    activationRequests,
    isLoadingActivationRequests: metadata.isLoadingActivationRequests,

    // Coordination
    requestActivation,
  }
}
