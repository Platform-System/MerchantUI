import { Product } from "@/types/store";
import { publicApiClient } from "@/shared/api/apiClient";
import { Result, PagedResult } from "@/types/api";
import {
  buildSellerLookup,
  mapCatalogProductToProduct,
  mapStoreProfileToSeller,
  type CatalogProductResponse,
  type StoreProfileResponse,
} from "@/shared/lib/storefront-normalizers";

interface ProductMediaResponse {
  id: string
  url?: string | null
  productId: string
  sortOrder: number
}

async function fetchSellerLookup() {
  const response = await publicApiClient.get<Result<PagedResult<StoreProfileResponse>>>("/api/store/stores", {
    params: {
      page: 1,
      pageSize: 100,
    },
  })

  const sellerProfiles = response.data?.data?.items || []
  const sellers = sellerProfiles.map((profile) => mapStoreProfileToSeller(profile))

  return buildSellerLookup(sellers)
}

async function fetchProductMediaUrls(productId: string): Promise<string[]> {
  const response = await publicApiClient.get<Result<PagedResult<ProductMediaResponse>>>("/api/catalog/product-medias", {
    params: {
      productId,
      page: 1,
      pageSize: 20,
    },
  })

  const items = response.data?.data?.items || []

  return items
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((item) => item.url?.trim())
    .filter((url): url is string => Boolean(url))
}

/** Trả về toàn bộ product pool. Gọi GET /api/catalog/products từ gateway. */
export async function fetchAllProducts(): Promise<Product[]> {
  try {
    const [response, sellerLookup] = await Promise.all([
      publicApiClient.get<Result<PagedResult<CatalogProductResponse>>>("/api/catalog/products", {
        params: {
          page: 1,
          pageSize: 100,
        },
      }),
      fetchSellerLookup(),
    ])

    if (response.data?.success && response.data.data?.items) {
      return response.data.data.items.map((item) => mapCatalogProductToProduct(item, sellerLookup))
    }

    return []
  } catch (error) {
    console.error("Loi goi API Catalog:", error)
    return []
  }
}

/** Tìm một product theo id. Gọi GET /api/catalog/products/:id. */
export async function fetchProductById(id: string): Promise<Product | undefined> {
  try {
    const [response, sellerLookup, mediaUrls] = await Promise.all([
      publicApiClient.get<Result<CatalogProductResponse>>(`/api/catalog/products/${id}`),
      fetchSellerLookup(),
      fetchProductMediaUrls(id),
    ])

    if (response.data?.success && response.data.data) {
      const mappedProduct = mapCatalogProductToProduct(response.data.data, sellerLookup)

      return {
        ...mappedProduct,
        images: mediaUrls,
      }
    }
  } catch (error) {
    console.error(`Loi goi API cho san pham ${id}:`, error)
  }

  return undefined
}

/** Query keys dùng với TanStack Query — đảm bảo cache invalidation nhất quán. */
export const productQueryKeys = {
  all: ["products"] as const,
  detail: (id: string) => ["products", id] as const,
};

