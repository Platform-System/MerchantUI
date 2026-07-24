"use client"

import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { motion } from "framer-motion"
import { Star, MapPin, Package, Store } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage, Badge, Button } from '@system/design-ui';
import { Seller } from "@/types/store"

interface SellerCardProps {
  seller: Seller
}

export function SellerCard({ seller }: SellerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="ds-glass-panel group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-[rgb(var(--store-border-rgb)/0.6)] shadow-[0_12px_30px_rgb(0_0_0/0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_48px_rgb(0_0_0/0.16)]"
    >
      {/* Link Overlay */}
      <Link href={`/seller/${seller.slug}`} scroll={false} className="absolute inset-0 z-20" aria-label={`Xem gian hàng ${seller.name}`} />

      {/* Cover Image */}
      <div className="relative h-24 overflow-hidden">
        {seller.coverImage ? (
          <>
            <Image
              src={seller.coverImage}
              alt={`Anh bia ${seller.name}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-zinc-100 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:14px_24px]" />
        )}
      </div>

      {/* Avatar */}
      <div className="relative -mt-8 flex justify-center">
        <Avatar className="store-surface-soft size-16 shadow-[0_10px_24px_rgb(0_0_0/0.1)]">
          {seller.avatar ? (
            <AvatarImage src={seller.avatar} alt={seller.name} className="object-cover" />
          ) : null}
          <AvatarFallback className="bg-zinc-100 text-muted-foreground">
            <Store className="h-7 w-7 opacity-40" />
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Content */}
      <div className="p-5 pt-3 text-center flex flex-col flex-grow">
        <Link href={`/seller/${seller.slug}`} scroll={false}>
          <h3 className="font-semibold transition-colors hover:store-accent-text">{seller.name}</h3>
        </Link>

        <div className="flex items-center justify-center gap-1 mt-1.5 text-muted-foreground text-sm">
          <MapPin className="h-3.5 w-3.5" />
          {seller.location}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-4 mt-3 text-sm">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4" style={{ fill: 'var(--color-star)', color: 'var(--color-star)' }} />
            <span className="font-medium">{seller.rating}</span>
            <span className="text-muted-foreground">({seller.reviewCount})</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Package className="h-4 w-4" />
            {seller.productCount} sản phẩm
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center content-start gap-2 mt-3 h-[60px] overflow-hidden">
          {(seller.categories || []).slice(0, 4).map((category) => (
            <Badge
              key={category}
              className="rounded-full px-2.5 py-1 text-xs"
            >
              {category}
            </Badge>
          ))}
          {(seller.categories || []).length > 4 && (
            <Badge
              className="rounded-full px-2.5 py-1 text-xs"
            >
              ...
            </Badge>
          )}
        </div>

        {/* CTA */}
        <Button asChild variant="outline" className="relative z-30 mt-5 w-full transition-all duration-300 group-hover:bg-[rgb(var(--store-accent-rgb)/0.1)]">
          <Link href={`/seller/${seller.slug}`} scroll={false}>Xem gian hàng</Link>
        </Button>
      </div>
    </motion.div>
  )
}

