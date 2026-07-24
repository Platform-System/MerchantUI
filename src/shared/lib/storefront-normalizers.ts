import type { Product, Seller } from "@/types/store"

type StoreMediaResponse = {
  url?: string | null
}

type StoreProfileResponse = {
  id: string
  name: string
  slug?: string | null
  description?: string | null
  tagline?: string | null
  location?: string | null
  responseTime?: string | null
  avatar?: StoreMediaResponse | null
  cover?: StoreMediaResponse | null
  status?: string | null
}

type StoreDetailsResponse = {
  profile: StoreProfileResponse
  policy?: {
    shippingPolicy?: string | null
    returnPolicy?: string | null
    warrantyPolicy?: string | null
  } | null
}

type CatalogProductResponse = {
  id: string
  title: string
  coverImageUrl?: string | null
  coverImage?: {
    url?: string | null
  } | null
  author: string
  price: number
  categoryName: string
  stock: number
  status: string
  createdAt: string
}

export type { CatalogProductResponse, StoreDetailsResponse, StoreProfileResponse }

const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&h=1100&fit=crop"

const DEFAULT_STORE_COVER =
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1400&h=700&fit=crop"

const CATEGORY_IMAGE_BY_SLUG: Record<string, string> = {
  fashion:
    "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=800&fit=crop",
  "nha-cua-doi-song":
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&h=800&fit=crop",
  electronics:
    "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&h=800&fit=crop",
  "lam-dep":
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=800&fit=crop",
  "nghe-thuat-suu-tam":
    "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=600&h=800&fit=crop",
  "trang-suc":
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=800&fit=crop",
}

export function slugify(value: string | null | undefined): string {
  if (!value) return ""

  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function resolveCategoryImage(name: string): string {
  const slug = slugify(name)
  return CATEGORY_IMAGE_BY_SLUG[slug] ?? FALLBACK_PRODUCT_IMAGE
}

function buildSellerDefaults(name: string, slug?: string | null) {
  const resolvedSlug = slug?.trim() || slugify(name)

  return {
    slug: resolvedSlug,
    avatar: "",
    coverImage: "",
  }
}

export function mapStoreProfileToSeller(
  profile: StoreProfileResponse,
  options?: {
    productCount?: number
    categories?: string[]
    reviewCount?: number
    rating?: number
  }
): Seller {
  const defaults = buildSellerDefaults(profile.name, profile.slug)

  return {
    id: profile.id,
    name: profile.name,
    slug: defaults.slug,
    avatar: profile.avatar?.url || defaults.avatar,
    coverImage: profile.cover?.url || defaults.coverImage,
    rating: options?.rating ?? 0,
    reviewCount: options?.reviewCount ?? 0,
    productCount: options?.productCount ?? 0,
    location: profile.location || "Chưa cập nhật",
    verified: profile.status?.toLowerCase() === "active",
    categories: options?.categories ?? [],
    description: profile.description || undefined,
    tagline: profile.tagline || undefined,
    responseTime: profile.responseTime || undefined,
  }
}

export function mapStoreDetailsToSeller(
  details: StoreDetailsResponse,
  options?: {
    productCount?: number
    categories?: string[]
    reviewCount?: number
    rating?: number
  }
): Seller {
  const seller = mapStoreProfileToSeller(details.profile, options)

  return {
    ...seller,
    policies: {
      shipping: details.policy?.shippingPolicy || "Chua cap nhat chinh sach van chuyen.",
      returns: details.policy?.returnPolicy || "Chua cap nhat chinh sach doi tra.",
      warranty: details.policy?.warrantyPolicy || "Chua cap nhat chinh sach bao hanh.",
    },
  }
}

export function buildSellerLookup(sellers: Seller[]) {
  const bySlug = new Map<string, Seller>()
  const byName = new Map<string, Seller>()

  sellers.forEach((seller) => {
    bySlug.set(seller.slug, seller)
    byName.set(seller.name.trim().toLowerCase(), seller)
  })

  return {
    bySlug,
    byName,
  }
}

export function mapCatalogProductToProduct(
  product: CatalogProductResponse,
  sellerLookup?: ReturnType<typeof buildSellerLookup>
): Product {
  const matchedSeller =
    sellerLookup?.byName.get(product.author.trim().toLowerCase()) ??
    sellerLookup?.bySlug.get(slugify(product.author))

  const sellerName = matchedSeller?.name || product.author
  const sellerSlug = matchedSeller?.slug || slugify(product.author)
  const productImage = product.coverImageUrl || product.coverImage?.url || FALLBACK_PRODUCT_IMAGE
  const categorySlug = slugify(product.categoryName)

  return {
    id: product.id,
    name: product.title,
    price: product.price,
    image: productImage,
    rating: matchedSeller ? Math.max(matchedSeller.rating, 0) : 0,
    reviewCount: matchedSeller?.reviewCount ?? 0,
    seller: {
      name: sellerName,
      slug: sellerSlug,
      verified: matchedSeller?.verified ?? false,
      avatar: matchedSeller?.avatar,
      rating: matchedSeller?.rating,
      productCount: matchedSeller?.productCount,
      location: matchedSeller?.location,
    },
    badge: undefined,
    category: categorySlug,
  }
}
