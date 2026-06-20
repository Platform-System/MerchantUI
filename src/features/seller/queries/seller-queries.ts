import { Seller } from "@/types/store"
import { apiClient, publicApiClient } from "@/shared/api/apiClient"
import { Result, PagedResult } from "@/types/api"
import {
  buildSellerLookup,
  mapCatalogProductToProduct,
  mapStoreDetailsToSeller,
  mapStoreProfileToSeller,
  type CatalogProductResponse,
  type StoreDetailsResponse,
  type StoreProfileResponse,
} from "@/shared/lib/storefront-normalizers"
import type { Product } from "@/types/store"

/** Trả về tất cả sellers. Gọi GET /api/sellers. */
export async function fetchAllSellers(): Promise<Seller[]> {
  try {
    const [storesResponse, productsResponse] = await Promise.all([
      publicApiClient.get<Result<PagedResult<StoreProfileResponse>>>("/api/store/stores", {
        params: {
          page: 1,
          pageSize: 100,
        },
      }),
      publicApiClient.get<Result<PagedResult<CatalogProductResponse>>>("/api/catalog/products", {
        params: {
          page: 1,
          pageSize: 100,
        },
      }),
    ])

    const stores = storesResponse.data?.data?.items || []
    const products = productsResponse.data?.data?.items || []

    return stores.map((store) => {
      const relatedProducts = products.filter((product) => product.author.trim().toLowerCase() === store.name.trim().toLowerCase())
      const categories = [...new Set(relatedProducts.map((product) => product.categoryName).filter(Boolean))]

      return mapStoreProfileToSeller(store, {
        productCount: relatedProducts.length,
        categories,
      })
    })
  } catch (error) {
    console.error("Loi goi API Stores:", error)
    return []
  }
}

/** Tìm seller theo slug. Gọi GET /api/sellers/:slug. */
export async function fetchSellerBySlug(slug: string): Promise<Seller | undefined> {
  try {
    const [storeResponse, productsResponse] = await Promise.all([
      publicApiClient.get<Result<StoreDetailsResponse>>(`/api/store/stores/${slug}`),
      publicApiClient.get<Result<PagedResult<CatalogProductResponse>>>(`/api/catalog/stores/${slug}/products`, {
        params: {
          page: 1,
          pageSize: 100,
        },
      }),
    ])

    const details = storeResponse.data?.data
    if (storeResponse.data?.success && details) {
      const relatedProducts = productsResponse.data?.data?.items || []
      const categories = [...new Set(relatedProducts.map((product) => product.categoryName).filter(Boolean))]

      return mapStoreDetailsToSeller(details, {
        productCount: relatedProducts.length,
        categories,
      })
    }
  } catch (error) {
    console.error(`Loi goi API cho store ${slug}:`, error)
    return undefined
  }

  return undefined
}

export async function fetchSellerProductsBySlug(slug: string): Promise<Product[]> {
  try {
    const [productsResponse, seller] = await Promise.all([
      publicApiClient.get<Result<PagedResult<CatalogProductResponse>>>(`/api/catalog/stores/${slug}/products`, {
        params: {
          page: 1,
          pageSize: 100,
        },
      }),
      fetchSellerBySlug(slug),
    ])

    const items = productsResponse.data?.data?.items || []
    const sellerLookup = seller ? buildSellerLookup([seller]) : undefined

    return items.map((item) => mapCatalogProductToProduct(item, sellerLookup))
  } catch (error) {
    console.error(`Loi goi API products cua store ${slug}:`, error)
    return []
  }
}

/** Trả về seller stats live từ backend. */
export async function fetchSellerStats(): Promise<{ label: string; value: string }[]> {
  try {
    const [sellers, products] = await Promise.all([
      fetchAllSellers(),
      publicApiClient.get<Result<PagedResult<CatalogProductResponse>>>("/api/catalog/products", {
        params: {
          page: 1,
          pageSize: 100,
        },
      }),
    ])

    const productItems = products.data?.data?.items || []
    const uniqueCategories = new Set(productItems.map((item) => item.categoryName).filter(Boolean))
    const avgProductsPerStore = sellers.length > 0 ? Math.round(productItems.length / sellers.length) : 0

    return [
      { label: "Nhà bán hàng hoạt động", value: sellers.length.toLocaleString("vi-VN") },
      { label: "Sản phẩm đang bán", value: productItems.length.toLocaleString("vi-VN") },
      { label: "Danh mục hiện có", value: uniqueCategories.size.toLocaleString("vi-VN") },
      { label: "SP trung bình / shop", value: avgProductsPerStore.toLocaleString("vi-VN") },
    ]
  } catch (error) {
    console.error("Loi tong hop seller stats:", error)
    return []
  }
}

/** Query keys dùng với TanStack Query. */
export const sellerQueryKeys = {
  all: ["sellers"] as const,
  detail: (slug: string) => ["sellers", slug] as const,
  stats: ["sellers", "stats"] as const,
}

export interface CreateStoreRequest {
  name: string;
  description?: string;
  tagline?: string;
  location?: string;
  responseTime?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  shippingPolicy?: string;
  returnPolicy?: string;
  warrantyPolicy?: string;
}

/** Tạo store mới (Become Seller). Gọi POST /api/store/manage/stores. */
export async function createStore(request: CreateStoreRequest): Promise<Result<unknown>> {
  const response = await apiClient.post<Result<unknown>>("/api/store/manage/stores", request);
  return response.data;
}

