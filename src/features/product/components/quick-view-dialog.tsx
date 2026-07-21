"use client"

import { useState } from "react"
import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { Heart, ShoppingBag, Minus, Plus, Share2, ChevronLeft, ChevronRight, Check } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage, Badge, Button, Dialog, DialogContent, DialogDescription, DialogTitle, RatingStars, cn } from '@system/design-ui';
import { useCart } from "@/features/cart"
import { useWishlist } from "@/features/wishlist"
import { Product } from "@/types/store"
import { useQuery } from "@tanstack/react-query"
import { fetchAllSellers, sellerQueryKeys } from "@/features/seller"
import { fetchProductById, productQueryKeys } from "../queries/product-queries"

interface QuickViewDialogProps {
  product: Product
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function QuickViewDialog({ product, isOpen, onOpenChange }: QuickViewDialogProps) {
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const isWishlisted = isInWishlist(product.id)

  const { data: allSellers = [] } = useQuery({
    queryKey: sellerQueryKeys.all,
    queryFn: fetchAllSellers,
    staleTime: 5 * 60 * 1000,
  })

  const { data: liveProduct } = useQuery({
    queryKey: productQueryKeys.detail(product.id),
    queryFn: () => fetchProductById(product.id),
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
  })

  const resolvedProduct = liveProduct ?? product

  const sellerAvatar = allSellers.find(s => s.name === resolvedProduct.seller?.name)?.avatar
    || `https://api.dicebear.com/7.x/adventurer/svg?seed=${resolvedProduct.seller?.name}`

  const fullProduct = {
    ...resolvedProduct,
    stock: 12,
    images: resolvedProduct.images ?? [resolvedProduct.image],
    variants: 
      resolvedProduct.category?.toLowerCase() === "fashion"
        ? { colors: [{ name: "Đen", value: "#1a1a1a" }, { name: "Nâu", value: "#8B4513" }, { name: "Vàng đồng", value: "#D2B48C" }, { name: "Xanh Navy", value: "#000080" }], sizes: ["Nhỏ", "Vừa", "Lớn"] }
        : resolvedProduct.category?.toLowerCase() === "beauty"
          ? { colors: [{ name: "Bản gốc", value: "#ffffff" }], sizes: ["50ml", "100ml", "200ml"] }
          : resolvedProduct.category?.toLowerCase() === "electronics"
            ? { colors: [{ name: "Đen", value: "#1a1a1a" }, { name: "Bạc", value: "#c0c0c0" }], sizes: ["Thường", "Lớn"] }
            : { colors: [{ name: "Đen", value: "#1a1a1a" }, { name: "Xám", value: "#808080" }], sizes: ["Thường", "Lớn"] }
  }

  const [selectedColor, setSelectedColor] = useState(fullProduct.variants.colors[0])
  const [selectedSize, setSelectedSize] = useState(fullProduct.variants.sizes[0])
  const [quantity, setQuantity] = useState(1)
  const [currentModalImage, setCurrentModalImage] = useState(0)

  const discount = fullProduct.originalPrice 
    ? Math.round(((fullProduct.originalPrice - fullProduct.price) / fullProduct.originalPrice) * 100)
    : 0

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="ds-glass-card sm:max-w-5xl md:max-w-5xl max-h-[90vh] md:max-h-[660px] flex flex-col overflow-hidden rounded-3xl p-0 text-foreground shadow-[0_24px_48px_rgb(0_0_0/0.16)]">
        <div className="grid grid-cols-1 md:grid-cols-[3fr_7fr] gap-0 h-full overflow-hidden flex-1">
          
          {/* Cột trái - bộ sưu tập ảnh */}
          <div className="store-surface-soft flex h-full flex-col justify-center p-6">
            {/* Ảnh chính */}
            <div className="ds-glass-panel group/modal relative mx-auto mb-4 flex aspect-square max-h-[380px] w-full items-center justify-center overflow-hidden rounded-2xl">
              <Image
                src={fullProduct.images[currentModalImage]}
                alt={fullProduct.name}
                fill
                className="object-cover"
              />
              
              {/* Mũi tên chuyển ảnh */}
              {fullProduct.images.length > 1 && (
                <>
                  <button
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation()
                      setCurrentModalImage((prev) => (prev - 1 + fullProduct.images.length) % fullProduct.images.length)
                    }}
                    className="store-icon-button absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 shadow-lg transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation()
                      setCurrentModalImage((prev) => (prev + 1) % fullProduct.images.length)
                    }}
                    className="store-icon-button absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 shadow-lg transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}

              {/* Badge giảm giá */}
              {discount > 0 && (
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-destructive text-white text-xs font-semibold">
                  -{discount}%
                </div>
              )}

              {/* Bộ đếm ảnh */}
              <div className="ds-glass-panel absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full px-2.5 py-1 text-[10px] text-foreground">
                {currentModalImage + 1} / {fullProduct.images.length}
              </div>
            </div>

            {/* Ảnh thumbnail */}
            {fullProduct.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto py-1">
                {fullProduct.images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation()
                      setCurrentModalImage(index)
                    }}
                    className={cn(
                      "relative h-12 w-12 shrink-0 overflow-hidden rounded-lg transition-all",
                      currentModalImage === index ? "store-accent-glow shadow-[0_10px_24px_rgb(0_0_0/0.12)]" : "store-surface-soft"
                    )}
                  >
                    <Image src={image} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cột phải - chi tiết sản phẩm */}
          <div className="relative flex h-full flex-col justify-between overflow-y-auto p-6 pt-8">
            <div>
              {/* Thông tin seller */}
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="size-6">
                  <AvatarImage src={sellerAvatar} alt={fullProduct.seller.name} className="object-cover" />
                  <AvatarFallback>{fullProduct.seller.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="store-muted-text flex items-center gap-1.5 text-xs font-medium">
                  {fullProduct.seller.name}
                  {fullProduct.seller.verified && (
                    <Badge variant="outline" className="store-accent-soft-hover px-1.5 py-0 text-[10px] font-semibold border-none leading-normal">
                      Đã xác minh
                    </Badge>
                  )}
                </span>
              </div>

              <DialogTitle className="mb-1 font-serif text-[1.5rem] font-semibold leading-tight tracking-wide text-foreground sm:text-[1.65rem]">
                {fullProduct.name}
              </DialogTitle>

              {/* Đánh giá */}
              <div className="flex items-center gap-2.5 mb-2">
                <RatingStars rating={fullProduct.rating} size="sm" />
                <span className="text-xs font-medium">{fullProduct.rating}</span>
                <span className="store-muted-text text-xs">
                  ({fullProduct.reviewCount} đánh giá)
                </span>
              </div>

              {/* Giá */}
              <div className="flex flex-wrap items-center gap-2.5 mb-2">
                <span className="text-2xl font-semibold text-foreground">${fullProduct.price}</span>
                {fullProduct.originalPrice && (
                  <>
                    <span className="store-muted-text text-sm line-through">
                      ${fullProduct.originalPrice}
                    </span>
                    <Badge variant="destructive" className="px-2 py-0.5 text-xs font-medium border-none">
                      Tiết kiệm ${fullProduct.originalPrice - fullProduct.price}
                    </Badge>
                  </>
                )}
              </div>

              {/* Mô tả */}
              <DialogDescription className="store-muted-text mb-3 line-clamp-2 text-sm leading-relaxed">
                {`${fullProduct.name} được hoàn thiện để mang lại chất lượng cao và trải nghiệm sử dụng thoải mái hơn mỗi ngày.`}
              </DialogDescription>

              {/* Chọn màu */}
              <div className="mb-2">
                <p className="mb-2.5 flex items-center gap-1 text-xs font-semibold text-foreground">
                  Màu sắc: <span className="store-muted-text font-normal">{selectedColor?.name}</span>
                </p>
                <div className="flex gap-2.5">
                  {fullProduct.variants.colors.map((color: { name: string; value: string }) => (
                    <button
                      key={color.name}
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation()
                        setSelectedColor(color)
                      }}
                      className={cn(
                        "relative flex h-8 w-8 items-center justify-center rounded-full transition-all",
                        selectedColor?.name === color.name
                          ? "store-accent-glow scale-105"
                          : "hover:scale-105"
                      )}
                      style={{ backgroundColor: color.value }}
                    >
                      {selectedColor?.name === color.name && (
                        <Check
                          className={cn(
                            "h-4 w-4",
                            color.value === "#1a1a1a" || color.value === "#000080"
                              ? "text-white"
                              : "text-charcoal"
                          )}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chọn kích thước */}
              <div className="mb-2">
                <p className="mb-1 text-xs font-semibold text-foreground">Kích thước</p>
                <div className="flex gap-2">
                  {fullProduct.variants.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation()
                        setSelectedSize(size)
                      }}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                        selectedSize === size
                          ? "store-accent-soft store-accent-text"
                          : "store-surface-soft store-muted-text hover:bg-[rgb(var(--store-accent-rgb)/0.1)]"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chọn số lượng */}
              <div className="mb-3">
                <p className="mb-1 text-xs font-semibold text-foreground">Số lượng</p>
                <div className="flex items-center gap-4">
                  <div className="store-surface-soft flex items-center rounded-lg">
                    <button
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation()
                        setQuantity(Math.max(1, quantity - 1))
                      }}
                        className="store-muted-text p-2 transition-colors hover:bg-[rgb(var(--store-accent-rgb)/0.1)] hover:text-foreground"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-4 text-xs font-semibold text-foreground">{quantity}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setQuantity(Math.min(fullProduct.stock, quantity + 1))
                      }}
                        className="store-muted-text p-2 transition-colors hover:bg-[rgb(var(--store-accent-rgb)/0.1)] hover:text-foreground"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="store-muted-text text-xs">
                    Còn {fullProduct.stock} sản phẩm
                  </span>
                </div>
              </div>
              {/* Nút xem chi tiết */}
              <div className="mt-2 mb-4">
                <Button
                  asChild
                  variant="ghost"
                  className="store-surface-soft store-muted-text flex h-10 w-full items-center justify-center gap-2 rounded-xl text-xs font-medium transition-all hover:bg-[rgb(var(--store-accent-rgb)/0.1)] hover:text-foreground"
                >
                  <Link href={`/product/${fullProduct.id}`}>
                    Xem chi tiết
                  </Link>
                </Button>
              </div>
            </div>

            {/* Các nút hành động phía dưới */}
            <div className="mt-4 flex gap-2.5 pt-2">
              <Button
                className="store-surface-soft flex h-10 flex-1 items-center justify-center gap-2 rounded-xl text-xs font-medium text-foreground transition-colors hover:bg-[rgb(var(--store-accent-rgb)/0.1)]"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation()
                  addToCart({
                    id: fullProduct.id,
                    name: fullProduct.name,
                    price: fullProduct.price,
                    image: fullProduct.images[0],
                    color: selectedColor?.name,
                    size: selectedSize,
                    quantity,
                  })
                  onOpenChange(false)
                }}
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                Thêm vào giỏ
              </Button>

              <Button
                className="store-accent-button store-accent-button-strong flex h-10 flex-1 items-center justify-center rounded-xl text-xs font-semibold transition-all"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation()
                  addToCart({
                    id: fullProduct.id,
                    name: fullProduct.name,
                    price: fullProduct.price,
                    image: fullProduct.images[0],
                    color: selectedColor?.name,
                    size: selectedSize,
                    quantity,
                  })
                  onOpenChange(false)
                }}
              >
                Mua ngay
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "store-surface-soft h-10 w-10 rounded-xl hover:bg-[rgb(var(--store-accent-rgb)/0.1)] hover:text-foreground",
                  isWishlisted && "text-destructive"
                )}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation()
                  if (isWishlisted) {
                    removeFromWishlist(fullProduct.id)
                  } else {
                    addToWishlist({
                      id: fullProduct.id,
                      name: fullProduct.name,
                      price: fullProduct.price,
                      image: fullProduct.images[0],
                      rating: fullProduct.rating,
                      reviews: fullProduct.reviewCount,
                      category: fullProduct.category,
                    })
                  }
                }}
              >
                <Heart className={cn("h-3.5 w-3.5", isWishlisted && "fill-destructive")} />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="store-surface-soft store-muted-text h-10 w-10 rounded-xl border-[rgb(var(--store-border-rgb)/0.9)] hover:bg-[rgb(var(--store-accent-rgb)/0.1)] hover:text-foreground"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation()
                  navigator.clipboard.writeText(`${window.location.origin}/product/${fullProduct.id}`)
                }}
              >
                <Share2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}

