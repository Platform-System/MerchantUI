import { apiClient } from "@/shared/api/api-client"
import type { AxiosError } from "axios"
import type { Result } from "@/types/api"
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
  role: 1 | 2
  canPublishProductDirectly: boolean
}

export interface SetStoreImageRequest {
  blobName: string
  containerName: string
  fileName: string
  contentType: string
  size: number
  altText: string
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

export const storeManageQueryKeys = {
  me: ["store-manage", "me"] as const,
  meMembers: ["store-manage", "me-members"] as const,
}

interface StoreLookupResult extends Result<StoreDetailsResponse> {
  errors?: string[]
}

export async function fetchMyStore(): Promise<StoreDetailsResponse | null> {
  try {
    const response = await apiClient.get<StoreLookupResult>("/api/store/manage/stores/me", {
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

export async function updateMyStoreProfile(request: UpdateStoreProfileRequest) {
  const response = await apiClient.put<Result<unknown>>("/api/store/manage/stores/me/profile", request)
  return response.data
}

export async function updateMyStorePolicy(request: UpdateStorePolicyRequest) {
  const response = await apiClient.put<Result<unknown>>("/api/store/manage/stores/me/policy", request)
  return response.data
}

export async function fetchMyStoreMembers(): Promise<StoreMemberResponse[]> {
  const response = await apiClient.get<Result<StoreMemberResponse[]>>("/api/store/manage/stores/me/members")
  if (response.data?.success && response.data.data) {
    return response.data.data
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

export async function setMyStoreImage(type: "avatar" | "cover", request: SetStoreImageRequest) {
  const response = await apiClient.put<Result<unknown>>(`/api/store/manage/stores/me/images/${type}`, request)
  return response.data
}

export async function updateStoreMemberPublishPermission(userId: string, request: UpdatePublishPermissionRequest) {
  const response = await apiClient.put<Result<unknown>>(`/api/store/manage/stores/members/${userId}/publish-permission`, request)
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
  } catch (error) {
    console.error(`Loi khi lay thong tin user ${userId}:`, error)
    return null
  }
}
