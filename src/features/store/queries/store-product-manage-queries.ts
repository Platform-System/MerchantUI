import { apiClient, publicApiClient } from "@/shared/api/apiClient"
import type { AxiosError } from "axios"
import type { PagedResult, Result } from "@/types/api"
import type { CatalogProductResponse } from "@/shared/lib/storefront-normalizers"

export interface ProductCategoryOption {
  id: string
  name: string
}

export interface ManageProductFormRequest {
  title: string
  author: string
  price: number
  categoryId: string
  stock: number
}

interface CategoryApiResponse {
  id: string
  name: string
  status: string
}

export const storeProductManageQueryKeys = {
  categories: ["store-product-manage", "categories"] as const,
  myPending: ["store-product-manage", "my-pending"] as const,
  ownerReview: ["store-product-manage", "owner-review"] as const,
}

export async function fetchProductCategoryOptions(): Promise<ProductCategoryOption[]> {
  const response = await publicApiClient.get<Result<PagedResult<CategoryApiResponse>>>("/api/catalog/categories", {
    params: {
      page: 1,
      pageSize: 100,
    },
  })

  const items = response.data?.data?.items || []
  return items.map((item) => ({
    id: item.id,
    name: item.name,
  }))
}

export async function fetchMyPendingProducts(): Promise<CatalogProductResponse[]> {
  try {
    const response = await apiClient.get<Result<PagedResult<CatalogProductResponse>>>("/api/catalog/manage/products/me/pending", {
      params: {
        page: 1,
        pageSize: 100,
      },
    })

    return response.data?.data?.items || []
  } catch (error) {
    const apiError = error as AxiosError
    if (apiError.response?.status === 404) {
      return []
    }
    throw apiError
  }
}

export async function fetchOwnerReviewProducts(): Promise<CatalogProductResponse[]> {
  try {
    const response = await apiClient.get<Result<PagedResult<CatalogProductResponse>>>("/api/catalog/manage/stores/me/products/pending-owner-review", {
      params: {
        page: 1,
        pageSize: 100,
      },
    })

    return response.data?.data?.items || []
  } catch (error) {
    const apiError = error as AxiosError
    if (apiError.response?.status === 404) {
      return []
    }
    throw apiError
  }
}

export async function createManagedProduct(request: ManageProductFormRequest) {
  const response = await apiClient.post<Result<unknown>>("/api/catalog/manage/products", {
    title: request.title,
    author: request.author,
    price: request.price,
    categoryId: request.categoryId,
    stock: request.stock,
  })
  return response.data
}

export async function updateManagedProduct(productId: string, request: ManageProductFormRequest) {
  const response = await apiClient.put<Result<unknown>>(`/api/catalog/manage/products/${productId}`, {
    title: request.title,
    author: request.author,
    price: request.price,
    categoryId: request.categoryId,
    stock: request.stock,
  })
  return response.data
}

export async function deleteManagedProduct(productId: string) {
  const response = await apiClient.delete<Result<unknown>>(`/api/catalog/manage/products/${productId}`)
  return response.data
}

export async function approveManagedProductByOwner(productId: string) {
  const response = await apiClient.post<Result<unknown>>(`/api/catalog/manage/products/${productId}/approvals/owner`)
  return response.data
}
