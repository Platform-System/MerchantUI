import { apiClient } from "@/shared/api/apiClient"
import type { AxiosError } from "axios"
import type { Result, PagedResult } from "@/types/api"
import type { StoreDetailsResponse } from "@/shared/lib/storefront-normalizers"

export interface UpdateStoreProfileRequest {
  name: string
  description?: string
  tagline?: string
  location?: string
  responseTime?: string
}

export interface UpdateStorePolicyRequest {
  shippingPolicy?: string
  returnPolicy?: string
  warrantyPolicy?: string
}

export interface InviteStoreMemberRequest {
  userId: string
  roleId: string
}

export interface SetStoreImageRequest {
  blobName: string
  containerName: string
  fileName: string
  contentType: string
  size: number
  altText?: string
  url: string
}

export interface UpdatePublishPermissionRequest {
  canPublishProductDirectly: boolean
}

export interface StoreMemberResponse {
  storeId: string
  userId: string
  role: string
  status: string
  canPublishProductDirectly: boolean
  joinedAt: string
}

export interface StoreProfileResponse {
  id: string
  name: string
  slug: string
  description?: string
  tagline?: string
  location?: string
  responseTime?: string
  avatar?: { url: string } | null
  cover?: { url: string } | null
  status: string
}

export const storeManageQueryKeys = {
  myStores: ["store-manage", "my-stores"] as const,
  store: (storeId: string) => ["store-manage", storeId] as const,
  members: (storeId: string) => ["store-manage", storeId, "members"] as const,
  pendingUpdate: (storeId: string) => ["store-manage", storeId, "pending-update"] as const,
}

interface StoreLookupResult extends Result<StoreDetailsResponse> {
  errors?: string[]
}

export async function fetchMyStores(): Promise<StoreProfileResponse[]> {
  const response = await apiClient.get<Result<StoreProfileResponse[]>>("/api/store/manage/stores/my-stores")
  if (response.data?.success && response.data.data) {
    return response.data.data
  }
  return []
}

export async function fetchMyStore(storeId: string): Promise<StoreDetailsResponse | null> {
  try {
    const response = await apiClient.get<StoreLookupResult>(`/api/store/manage/stores/${storeId}`, {
      validateStatus: (status) => status < 500,
    })

    if (response.status === 404) {
      const errors = response.data?.errors || []
      const isMissingStore = errors.some((error: string) => error.toLowerCase().includes("store not found"))
      if (isMissingStore) {
        return null
      }
    }

    if (response.data?.success && response.data.data) {
      return response.data.data
    }

    return null
  } catch (error) {
    const apiError = error as AxiosError
    if (apiError.response?.status === 404) {
      return null
    }
    throw apiError
  }
}

export async function updateMyStoreProfile(storeId: string, request: UpdateStoreProfileRequest) {
  const response = await apiClient.put<Result<unknown>>(`/api/store/manage/stores/${storeId}/profile`, request)
  return response.data
}

export async function updateMyStorePolicy(storeId: string, request: UpdateStorePolicyRequest) {
  const response = await apiClient.put<Result<unknown>>(`/api/store/manage/stores/${storeId}/policy`, request)
  return response.data
}

export async function fetchMyStoreMembers(storeId: string): Promise<StoreMemberResponse[]> {
  const response = await apiClient.get<Result<PagedResult<StoreMemberResponse>>>(`/api/store/manage/stores/${storeId}/members`)
  if (response.data?.success && response.data.data) {
    return response.data.data.items
  }

  return []
}

export async function requestMyStoreActivation(storeId: string) {
  const response = await apiClient.post<Result<unknown>>(`/api/store/manage/stores/${storeId}/activation-requests`)
  return response.data
}

export async function inviteStoreMember(storeId: string, request: InviteStoreMemberRequest) {
  const response = await apiClient.post<Result<unknown>>(`/api/store/manage/stores/${storeId}/members/invitations`, request)
  return response.data
}

export async function acceptStoreInvitation(storeId: string) {
  const response = await apiClient.post<Result<unknown>>(`/api/store/manage/stores/${storeId}/members/acceptance`)
  return response.data
}

export interface StoreInvitationResponse {
  storeId: string
  storeName: string
  role: string
  status: string
  invitedAt: string
  ownerId?: string | null
}

export async function fetchMyStoreInvitations(page = 1, pageSize = 100): Promise<PagedResult<StoreInvitationResponse>> {
  const response = await apiClient.get<Result<PagedResult<StoreInvitationResponse>>>("/api/store/manage/stores/my-invitations", {
    params: { page, pageSize }
  })
  if (response.data?.success && response.data.data) {
    return response.data.data
  }
  return { items: [], page, pageSize, totalCount: 0 }
}

export async function setMyStoreImage(storeId: string, type: "avatar" | "cover", request: SetStoreImageRequest) {
  const response = await apiClient.put<Result<unknown>>(`/api/store/manage/stores/${storeId}/images/${type}`, request)
  return response.data
}

export async function uploadMyStoreImage(storeId: string, type: "avatar" | "cover", file: File, altText: string) {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("altText", altText)

  const response = await apiClient.post<Result<unknown>>(`/api/store/manage/stores/${storeId}/images/${type}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
  return response.data
}

export async function updateStoreMemberPublishPermission(storeId: string, userId: string, request: UpdatePublishPermissionRequest) {
  const response = await apiClient.put<Result<unknown>>(`/api/store/manage/stores/${storeId}/members/${userId}/publish-permission`, request)
  return response.data
}

export interface UserProfileResponse {
  id: string
  identityId: string
  userName: string
  email: string
  firstName?: string | null
  lastName?: string | null
  createdAt: string
}

export async function fetchUserProfileById(userId: string): Promise<UserProfileResponse | null> {
  try {
    const response = await apiClient.get<Result<UserProfileResponse>>(`/api/identity/users/${userId}`)
    if (response.data?.success && response.data.data) {
      return response.data.data
    }
    return null
  } catch (error: unknown) {
    const apiError = error as AxiosError
    if (apiError.response?.status !== 404) {
      console.error(`Loi khi lay thong tin user ${userId}:`, error)
    }
    return null
  }
}

export async function lookupUser(query: string): Promise<UserProfileResponse | null> {
  try {
    const response = await apiClient.get<Result<UserProfileResponse>>(`/api/identity/users/lookup`, {
      params: { query }
    })
    if (response.data?.success && response.data.data) {
      return response.data.data
    }
    return null
  } catch (error: unknown) {
    const apiError = error as AxiosError
    if (apiError.response?.status !== 404) {
      console.error(`Loi khi lookup user:`, error)
    }
    return null
  }
}

export interface UserMediaResponse {
  type: string
  url: string
}

export async function fetchUserAvatarById(userId: string): Promise<string | null> {
  try {
    const response = await apiClient.get<Result<UserMediaResponse>>(`/api/identity/users/${userId}/images/avatar`)
    if (response.data?.success && response.data.data?.url) {
      return response.data.data.url
    }
    return null
  } catch (error) {
    console.error(`Loi khi lay avatar user ${userId}:`, error)
    return null
  }
}

export interface StoreUpdateRequestResponse {
  id: string
  storeId: string
  userId: string
  status: string
  requestType: string
  createdAt?: string
  updatedAt?: string
  name?: string
  tagline?: string
  description?: string
  location?: string
  responseTime?: string
  shippingPolicy?: string
  returnPolicy?: string
  warrantyPolicy?: string
  currentName?: string
  currentTagline?: string
  currentDescription?: string
  currentLocation?: string
  currentResponseTime?: string
  currentShippingPolicy?: string
  currentReturnPolicy?: string
  currentWarrantyPolicy?: string
}

export async function fetchMyPendingStoreUpdates(storeId: string): Promise<StoreUpdateRequestResponse[]> {
  const response = await apiClient.get<Result<StoreUpdateRequestResponse[]>>(`/api/store/manage/stores/${storeId}/update-requests/pending`)
  if (response.data?.success && response.data.data) {
    return response.data.data
  }
  return []
}

export async function submitStoreProfileUpdateRequest(storeId: string, request: UpdateStoreProfileRequest) {
  const response = await apiClient.post<Result<unknown>>(`/api/store/manage/stores/${storeId}/profile-update-requests`, request)
  return response.data
}

export async function submitStorePolicyUpdateRequest(storeId: string, request: UpdateStorePolicyRequest) {
  const response = await apiClient.post<Result<unknown>>(`/api/store/manage/stores/${storeId}/policy-update-requests`, request)
  return response.data
}

export interface StoreActivationRequestResponse {
  id: string
  storeId: string
  userId: string
  status: string
  rejectionReason?: string | null
  processedAt?: string | null
  processedBy?: string | null
  createdAt: string
}

export async function fetchStoreActivationRequests(storeId: string): Promise<StoreActivationRequestResponse[]> {
  const response = await apiClient.get<Result<StoreActivationRequestResponse[]>>(`/api/store/manage/stores/${storeId}/activation-requests`)
  if (response.data?.success && response.data.data) {
    return response.data.data
  }
  return []
}

export interface StoreRoleResponse {
  id: string
  name: string
  description: string
  isSystem: boolean
}

export async function fetchStoreRoles(storeId: string): Promise<StoreRoleResponse[]> {
  const response = await apiClient.get<Result<StoreRoleResponse[]>>(`/api/store/manage/stores/${storeId}/roles`)
  if (response.data?.success && response.data.data) {
    return response.data.data
  }
  return []
}

export interface StoreSentInvitationResponse {
  storeId: string
  storeName: string
  role: string
  status: string
  invitedAt: string
  expiredAt: string
  userId: string
  ownerId?: string | null
}

export async function fetchStoreSentInvitations(storeId: string, page = 1, pageSize = 100): Promise<PagedResult<StoreSentInvitationResponse>> {
  const response = await apiClient.get<Result<PagedResult<StoreSentInvitationResponse>>>(`/api/store/manage/stores/${storeId}/invitations`, {
    params: { page, pageSize }
  })
  if (response.data?.success && response.data.data) {
    return response.data.data
  }
  return { items: [], page, pageSize, totalCount: 0 }
}

export async function cancelStoreInvitation(storeId: string, userId: string): Promise<Result<unknown>> {
  const response = await apiClient.delete<Result<unknown>>(`/api/store/manage/stores/${storeId}/members/invitations/${userId}`)
  return response.data
}
