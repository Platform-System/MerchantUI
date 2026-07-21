"use client"

import { useState } from "react"
import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { motion } from "framer-motion"
import { Heart, ShoppingBag, Eye, BadgeCheck } from "lucide-react"
import { Badge, Button, RatingStars, cn } from '@system/design-ui';
import { useCart } from "@/features/cart"
import { useWishlist } from "@/features/wishlist"
import { QuickViewDialog } from "./quick-view-dialog"
import { Product } from "@/types/store"

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [currentImage, setCurrentImage] = useState(0)
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const isWishlisted = isInWishlist(product.id)

  return (
    <motion.div
      className={cn("group relative", className)}
      onMouseLeave={() => {
        setCurrentImage(0)
      }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      {/* Khung ảnh */}
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-muted/70">
          {/* Ảnh chính */}
            <Image
              src={product.images?.[currentImage] || product.image}
              alt={product.name}
              fill
              className="object-cover transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0 grayscale-[0.2]"
            />

          {/* Chấm chuyển ảnh */}
          {product.images && product.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onMouseEnter={() => setCurrentImage(index)}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all",
                    currentImage === index ? "store-accent-button w-4" : "bg-[rgb(var(--store-border-rgb)/0.75)] hover:bg-[rgb(var(--store-accent-rgb)/0.5)]"
                  )}
                />
              ))}
            </div>
          )}

          {/* Nhãn sản phẩm */}
          {product.badge && (
            <Badge
              className={cn(
                "absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold border-none",
                product.badge === "new" && "ds-glass-panel text-foreground hover:bg-[rgb(var(--store-surface-strong-rgb)/0.98)]",
                product.badge === "sale" && "store-accent-soft text-foreground hover:bg-[rgb(var(--store-accent-rgb)/0.16)]",
                product.badge === "bestseller" && "bg-[rgb(var(--store-ink-rgb)/0.9)] text-[rgb(var(--store-surface-rgb))] hover:bg-[rgb(var(--store-ink-rgb)/0.9)]"
              )}
            >
              {product.badge === "new" ? "MỚI" : product.badge === "sale" ? "GIẢM GIÁ" : "BÁN CHẠY"}
            </Badge>
          )}

          {/* Hành động nhanh */}
          <motion.div
            initial={false}
            className="absolute top-3 right-3 flex flex-col gap-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100"
          >
            <Button
              size="icon"
              variant="secondary"
              className="ds-glass-panel h-9 w-9 rounded-full border-none bg-[rgb(var(--store-surface-strong-rgb))/0.92] shadow-md"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault()
                if (isWishlisted) {
                  removeFromWishlist(product.id)
                } else {
                  addToWishlist({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    rating: product.rating,
                    reviews: product.reviewCount,
                    category: product.category,
                  })
                }
              }}
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-colors",
                  isWishlisted ? "fill-destructive text-destructive" : "text-foreground"
                )}
              />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="ds-glass-panel h-9 w-9 rounded-full border-none bg-[rgb(var(--store-surface-strong-rgb))/0.92] shadow-md"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault()
                setIsQuickViewOpen(true)
              }}
            >
              <Eye className="h-4 w-4 text-foreground" />
            </Button>
          </motion.div>

          {/* Nút thêm vào giỏ ở mép dưới */}
          <motion.div
            initial={false}
            className="absolute bottom-0 inset-x-0 p-3 opacity-100 translate-y-0 transition-all md:opacity-0 md:translate-y-5 md:group-hover:translate-y-0 md:group-hover:opacity-100"
          >
            <Button
              className="store-accent-button store-accent-button-strong w-full rounded-lg font-medium"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault()
                e.stopPropagation()
                addToCart({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                  color: "Đen",
                  size: "Nhỏ"
                })
              }}
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Thêm vào giỏ
            </Button>
          </motion.div>
        </div>
      </Link>

      {/* Thông tin sản phẩm */}
      <div className="mt-4 space-y-2.5">
        {/* Seller */}
        <Link
          href={`/seller/${product.seller.slug ?? product.seller.name.toLowerCase().replace(/\s+/g, "-")}`}
          className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {product.seller.name}
          {product.seller.verified && (
            <BadgeCheck className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </Link>

        {/* Tên sản phẩm */}
        <Link href={`/product/${product.id}`}>
          <h3 className="line-clamp-2 font-semibold tracking-[-0.01em] text-foreground transition-colors hover:store-accent-text">
            {product.name}
          </h3>
        </Link>

        {/* Đánh giá */}
        <div className="flex items-center gap-1.5">
          <RatingStars rating={product.rating} size="sm" />
          <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
        </div>

        {/* Giá */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground text-[15px]">${product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>
      </div>
      {/* Modal xem nhanh */}
      <QuickViewDialog 
        key={`${product.id}-${isQuickViewOpen ? "open" : "closed"}`}
        product={product} 
        isOpen={isQuickViewOpen} 
        onOpenChange={setIsQuickViewOpen} 
      />
    </motion.div>
  )
}


