export interface Seller {
  id: string
  name: string
  slug: string
  avatar: string
  coverImage: string
  rating: number
  reviewCount: number
  productCount: number
  location: string
  verified: boolean
  categories: string[]
  description?: string
  tagline?: string
  responseTime?: string
  policies?: {
    shipping: string
    returns: string
    warranty: string
  }
}

export interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  images?: string[]
  rating: number
  reviewCount: number
  seller: {
    name: string
    slug?: string
    verified: boolean
    avatar?: string
    rating?: number
    productCount?: number
    location?: string
  }
  badge?: "new" | "sale" | "bestseller"
  category?: string
}

export interface StoreOrderItem {
  id: string | number
  name: string
  image: string
  price: number
  quantity: number
  color?: string
  size?: string
}

export interface StoreOrder {
  id: string
  createdAt: string
  customerName: string
  email: string
  phone: string
  city: string
  district: string
  ward: string
  addressLine: string
  deliveryNote: string
  deliveryMethod: "standard" | "express"
  paymentMethod: "wallet" | "payment"
  items: StoreOrderItem[]
  subtotal: number
  shippingFee: number
  taxAmount: number
  total: number
  status: "pending" | "processing" | "shipped" | "delivered"
}

export interface StoreProfile {
  name: string
  email: string
  avatar: string
  joinedDate: string
  displayName?: string
  bio?: string
  location?: string
  gender?: string
  dateOfBirth?: string
  phoneNumber?: string
  firstName?: string
  lastName?: string
  cover?: string
}

