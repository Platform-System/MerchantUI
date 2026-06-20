import { resolveCategoryImage, slugify } from "@/shared/lib/storefront-normalizers";
import { publicApiClient } from "@/shared/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Result, PagedResult } from "@/types/api";
import { fetchAllProducts } from "@/features/product/queries/product-queries";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image: string;
  productCount?: number;
}

interface CategoryApiResponse {
  id: string;
  name: string;
  status: string;
}

/** Query keys dùng với TanStack Query. */
export const categoryQueryKeys = {
  all: ["categories"] as const,
};

/** Trả về tất cả categories từ backend, sau đó enrich thêm image/count cho UI. */
export async function fetchAllCategories(): Promise<Category[]> {
  const [categoriesResponse, products] = await Promise.all([
    publicApiClient.get<Result<PagedResult<CategoryApiResponse>>>("/api/catalog/categories", {
      params: {
        page: 1,
        pageSize: 100,
      },
    }),
    fetchAllProducts(),
  ]);

  const categories = categoriesResponse.data?.data?.items || [];
  const productCountByCategory = products.reduce<Record<string, number>>((accumulator, product) => {
    const key = product.category || "";
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});

  return categories.map((category) => {
    const slug = slugify(category.name);

    return {
      id: slug,
      name: category.name,
      slug,
      image: resolveCategoryImage(category.name),
      productCount: productCountByCategory[slug] ?? 0,
    };
  });
}

/** Hook để sử dụng trong Component */
export const useCategories = () => {
  return useQuery({
    queryKey: categoryQueryKeys.all,
    queryFn: fetchAllCategories,
    staleTime: 1000 * 60 * 10,
  });
};

