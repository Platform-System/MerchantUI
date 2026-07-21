"use client"

import * as React from "react"
import Image from "next/image"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations } from "next-intl"
import {
  Heart,
  Share2,
  ShoppingBag,
  Truck,
  Shield,
  RotateCcw,
  Star,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Check,
  MapPin,
  MessageCircle,
} from "lucide-react"
import { Button, Calendar, ChartContainer, ChartTooltip, ChartTooltipContent, EmptyStatePanel, InfoPanel, RatingStars, SurfaceIcon, Tabs, TabsContent, TabsList, TabsTrigger, cn } from '@system/design-ui';
import { Link } from "@/i18n/navigation"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { ProductDetailSkeleton } from "../index"
import { useProductDetail } from "../hooks/use-product-detail"
import { REVIEWS, PRICE_HISTORY, PRICE_CHART_CONFIG } from "../constants"

export function ProductDetailScreen() {
  const params = useParams()
  const id = params?.id as string
  const t = useTranslations("Product")
  const ts = useTranslations("Seller")

  const [isLoading, setIsLoading] = React.useState(true)
  const {
    baseProduct,
    product,
    currentCare,
    currentImage,
    setCurrentImage,
    quantity,
    setQuantity,
    selectedColor,
    setSelectedColor,
    selectedSize,
    setSelectedSize,
    selectedDeliveryDate,
    setSelectedDeliveryDate,
    isWishlisted,
    discount,
    handleAddToCart,
    handleBuyNow,
    handleWishlistToggle,
    handleShare,
  } = useProductDetail(id)

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [id])

  if (isLoading) {
    return <ProductDetailSkeleton />
  }

  if (!baseProduct) {
    return (
      <main className="relative min-h-screen bg-background pt-12 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <EmptyStatePanel
            icon={<ShoppingBag className="h-10 w-10" />}
            title={t("productNotFound")}
            description={t("productNotFoundDesc")}
            primaryActionNode={
              <Button asChild variant="brand" className="rounded-full px-8">
                <Link href="/marketplace">{ts("backToStore")}</Link>
              </Button>
            }
            secondaryActionNode={
              <Button asChild variant="outline" className="rounded-full px-8">
                <Link href="/home">{t("backToHome")}</Link>
              </Button>
            }
          />
        </div>
      </main>
    )
  }

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % product.images.length)
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + product.images.length) % product.images.length)
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="relative pt-12 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.nav initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 text-sm">
            <ol className="flex items-center gap-2 text-muted-foreground">
              <li>
                <Link href="/home" className="hover:text-foreground">
                  {t("breadcrumb.home")}
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/marketplace" className="hover:text-foreground">
                  {t("breadcrumb.store")}
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href={`/marketplace?category=${baseProduct.category}`} className="hover:text-foreground">
                  {product.categoryName}
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground">{product.name}</li>
            </ol>
          </motion.nav>

          <div className="grid gap-8 lg:grid-cols-10 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-3"
            >
              <div className="ds-glass-panel relative mb-4 aspect-[4/5] overflow-hidden rounded-2xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={product.images[currentImage]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>

                <button
                  onClick={prevImage}
                  className="store-icon-button absolute left-4 top-1/2 -translate-y-1/2 rounded-full p-2 shadow-lg transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="store-icon-button absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-2 shadow-lg transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                {discount > 0 && (
                  <div className="absolute left-4 top-4 rounded-full bg-destructive px-3 py-1 text-sm font-semibold text-white">
                    -{discount}%
                  </div>
                )}

                <div className="ds-glass-panel absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-sm text-foreground">
                  {currentImage + 1} / {product.images.length}
                </div>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={cn(
                      "store-surface-soft relative h-20 w-20 shrink-0 overflow-hidden rounded-xl transition-all",
                      currentImage === index
                        ? "shadow-[0_0_0_2px_rgb(var(--store-accent-rgb)/0.45)]"
                        : "hover:bg-[rgb(var(--store-accent-rgb)/0.08)]"
                    )}
                  >
                    <Image src={image} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 lg:sticky lg:top-24 lg:self-start"
            >
              <Link
                href={`/seller/${product.seller.slug}`}
                className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <div className="relative h-6 w-6 overflow-hidden rounded-full">
                  <Image src={product.seller.avatar} alt={product.seller.name} fill className="object-cover" />
                </div>
                {product.seller.name}
                {product.seller.verified && (
                    <span className="store-accent-soft rounded-full px-2.5 py-1 text-xs font-medium">
                    {ts("verifiedSeller")}
                  </span>
                )}
              </Link>

              <h1 className="mb-4 font-serif text-3xl font-semibold sm:text-4xl">{product.name}</h1>

              <div className="mb-6 flex items-center gap-3">
                <RatingStars rating={product.rating} size="lg" />
                <span className="font-medium">{product.rating}</span>
                <span className="text-muted-foreground">({product.reviewCount} {ts("reviews")})</span>
              </div>

              <div className="mb-6 flex items-center gap-4">
                <span className="text-3xl font-semibold">${product.price}</span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">${product.originalPrice}</span>
                )}
                {product.originalPrice && (
                  <span className="rounded-full bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive">
                    {t("save")} ${product.originalPrice - product.price}
                  </span>
                )}
              </div>

              <p className="mb-8 leading-relaxed text-muted-foreground">{product.description}</p>

              <div className="mb-6">
                <p className="mb-3 text-sm font-medium">
                  {t("color")}: <span className="text-muted-foreground">{selectedColor.name}</span>
                </p>
                <div className="flex gap-3">
                  {product.variants.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "relative h-10 w-10 rounded-full transition-all",
                        selectedColor.name === color.name ? "scale-110 shadow-[0_0_0_2px_rgb(var(--store-accent-rgb)/0.45)]" : "hover:scale-105"
                      )}
                      style={{ backgroundColor: color.value }}
                    >
                      {selectedColor.name === color.name && (
                        <Check
                          className={cn(
                            "absolute inset-0 m-auto h-5 w-5",
                            color.value === "#1a1a1a" || color.value === "#000080" ? "text-[var(--color-primary-foreground)]" : "text-[var(--color-charcoal)]"
                          )}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <p className="mb-3 text-sm font-medium">{t("size")}</p>
                <div className="flex gap-3">
                  {product.variants.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "rounded-xl px-6 py-3 text-sm font-medium transition-all",
                        selectedSize === size
                          ? "store-accent-soft store-accent-text shadow-[inset_0_0_0_1px_rgb(var(--store-accent-rgb)/0.14)]"
                          : "store-surface-soft text-foreground hover:bg-[rgb(var(--store-accent-rgb)/0.08)]"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <p className="mb-3 text-sm font-medium">{t("quantity")}</p>
                <div className="flex items-center gap-4">
                  <div className="store-surface-soft flex items-center rounded-xl">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 transition-colors hover:bg-muted"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-6 font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="p-3 transition-colors hover:bg-muted"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-sm text-muted-foreground">{t("inStock", { count: product.stock })}</span>
                </div>
              </div>

              <div className="mb-8 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] gap-3">
                <Button
                  size="lg"
                  variant="brand"
                  className="h-14 w-full"
                  onClick={handleAddToCart}
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  {t("addToCart")}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 w-full"
                  onClick={handleBuyNow}
                >
                  {t("buyNow")}
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-14 w-14"
                  onClick={handleWishlistToggle}
                >
                  <Heart className={cn("h-5 w-5", isWishlisted && "fill-destructive text-destructive")} />
                </Button>
                <Button size="icon" variant="outline" className="h-14 w-14" onClick={handleShare}>
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              <InfoPanel className="grid grid-cols-3 gap-4 rounded-2xl p-4">
                <div className="flex flex-col items-center text-center">
                  <SurfaceIcon tone="tint" size="sm" className="mb-2 h-10 w-10 rounded-xl">
                    <Truck className="h-5 w-5" />
                  </SurfaceIcon>
                  <span className="text-xs font-medium">{t("freeShipping")}</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <SurfaceIcon tone="tint" size="sm" className="mb-2 h-10 w-10 rounded-xl">
                    <Shield className="h-5 w-5" />
                  </SurfaceIcon>
                  <span className="text-xs font-medium">{t("securePayment")}</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <SurfaceIcon tone="tint" size="sm" className="mb-2 h-10 w-10 rounded-xl">
                    <RotateCcw className="h-5 w-5" />
                  </SurfaceIcon>
                  <span className="text-xs font-medium">{t("returnPolicy30Days")}</span>
                </div>
              </InfoPanel>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="ds-glass-panel mt-16 overflow-hidden rounded-[28px] p-6 shadow-[0_20px_48px_rgb(0_0_0/0.1)]"
          >
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <div className="flex items-start gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full">
                  <Image src={product.seller.avatar} alt={product.seller.name} fill className="object-cover" />
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-semibold tracking-[-0.02em]">{product.seller.name}</h3>
                    {product.seller.verified && (
                        <span className="store-surface-soft store-muted-text rounded-full px-2.5 py-1 text-[11px] font-medium">
                        {ts("verifiedSeller")}
                      </span>
                    )}
                  </div>
                  <div className="store-muted-text flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                    <span className="inline-flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                      {product.seller.rating} {ts("reviews")}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      {product.seller.productCount} {ts("products")}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {product.seller.location}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button variant="outline" asChild className="rounded-2xl px-5">
                  <Link href={`/seller/${product.seller.slug}`}>{t("viewStore")}</Link>
                </Button>
                <Button variant="brand" className="rounded-2xl">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {t("messageSeller")}
                </Button>
              </div>
            </div>
          </motion.div>

          <Tabs defaultValue="features" className="mt-16">
            <TabsList className="ds-glass-panel grid h-auto w-full grid-cols-1 gap-2 rounded-[26px] p-2 sm:grid-cols-2 lg:grid-cols-5">
              <TabsTrigger
                value="features"
                className="store-muted-text h-12 w-full rounded-[18px] border-none bg-transparent px-5 data-[state=active]:bg-[rgb(var(--store-accent-rgb)/0.12)] data-[state=active]:text-foreground"
              >
                {t("tabFeatures")}
              </TabsTrigger>
              <TabsTrigger
                value="delivery"
                className="store-muted-text h-12 w-full rounded-[18px] border-none bg-transparent px-5 data-[state=active]:bg-[rgb(var(--store-accent-rgb)/0.12)] data-[state=active]:text-foreground"
              >
                {t("tabDelivery")}
              </TabsTrigger>
              <TabsTrigger
                value="shipping"
                className="store-muted-text h-12 w-full rounded-[18px] border-none bg-transparent px-5 data-[state=active]:bg-[rgb(var(--store-accent-rgb)/0.12)] data-[state=active]:text-foreground"
              >
                {t("tabShipping")}
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="store-muted-text h-12 w-full rounded-[18px] border-none bg-transparent px-5 data-[state=active]:bg-[rgb(var(--store-accent-rgb)/0.12)] data-[state=active]:text-foreground"
              >
                {t("tabReviews")} ({REVIEWS.length})
              </TabsTrigger>
              <TabsTrigger
                value="pricing"
                className="store-muted-text h-12 w-full rounded-[18px] border-none bg-transparent px-5 data-[state=active]:bg-[rgb(var(--store-accent-rgb)/0.12)] data-[state=active]:text-foreground"
              >
                {t("tabPriceHistory")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="features" className="mt-8">
              <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="space-y-8">
                  <div>
                  <h3 className="mb-4 text-lg font-semibold">{t("highlights")}</h3>
                  <ul className="space-y-3">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <Check className="store-accent-text h-5 w-5 shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  </div>
                </div>
                <div className="space-y-8">
                  <div>
                    <h3 className="mb-4 text-lg font-semibold">{t("careInstructions")}</h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {currentCare}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="delivery" className="mt-8">
              <div className="ds-glass-panel rounded-[30px] p-6 shadow-[0_18px_44px_rgb(0_0_0/0.1)]">
                <div className="flex flex-col gap-4 pb-5 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                      <p className="store-muted-text text-[11px] uppercase tracking-[0.18em]">{t("deliveryWindow")}</p>
                    <h3 className="mt-3 text-2xl font-semibold">
                      {selectedDeliveryDate
                        ? selectedDeliveryDate.toLocaleDateString("vi-VN", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                          })
                        : t("delivery.selectDate")}
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                      {t("delivery.packingCommitment")}
                    </p>
                  </div>
                  <div className="store-muted-text flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                    <span>{t("delivery.expectedArrival")}</span>
                    <span>{t("delivery.priorityWindow")}</span>
                    <span className="store-accent-text">{t("delivery.priorityShipping")}</span>
                  </div>
                </div>

                <div className="grid gap-8 pt-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                  <div>
                    <h4 className="mb-2 text-base font-semibold">{t("delivery.deliverySchedule")}</h4>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {t("delivery.deliveryScheduleDesc")}
                    </p>
                    <Calendar
                      mode="single"
                      selected={selectedDeliveryDate}
                      onSelect={setSelectedDeliveryDate}
                      className="mx-auto w-full max-w-[300px] rounded-xl bg-transparent p-0"
                      classNames={{
                        root: "w-full",
                        months: "w-full",
                        month: "w-full flex flex-col gap-4",
                        nav: "relative flex w-full items-center justify-between mb-4",
                        button_previous: "store-surface-soft h-8 w-8 rounded-full flex items-center justify-center hover:bg-[rgb(var(--store-accent-rgb)/0.1)] transition-colors",
                        button_next: "store-surface-soft h-8 w-8 rounded-full flex items-center justify-center hover:bg-[rgb(var(--store-accent-rgb)/0.1)] transition-colors",
                        month_caption: "flex h-8 items-center justify-center px-8",
                        caption_label: "text-sm font-semibold text-foreground",
                        table: "w-full border-collapse table-fixed",
                        weekdays: "flex w-full mb-2",
                        weekday: "store-muted-text flex-1 text-center text-[10px] font-medium uppercase tracking-[0.14em]",
                        week: "flex w-full mt-1.5",
                        day: "flex-1 text-center p-0",
                        day_button: "mx-auto flex aspect-square h-8 w-8 items-center justify-center rounded-lg text-xs transition-all hover:bg-[rgb(var(--store-accent-rgb)/0.1)] hover:text-foreground",
                        selected: "store-accent-button !text-white font-bold",
                        today: "store-accent-soft store-accent-text font-bold",
                      }}
                    />
                  </div>

                  <div className="space-y-6">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <p className="store-muted-text text-[11px] uppercase tracking-[0.18em]">{t("delivery.packingPromise")}</p>
                        <p className="mt-3 text-base font-medium text-foreground">{t("delivery.packingPromiseTitle")}</p>
                        <p className="mt-2 text-sm leading-7 text-muted-foreground">
                          {t("delivery.packingPromiseDesc")}
                        </p>
                      </div>
                      <div>
                        <p className="store-muted-text text-[11px] uppercase tracking-[0.18em]">{t("delivery.shippingNote")}</p>
                        <p className="mt-3 text-base font-medium text-foreground">{t("delivery.shippingNoteTitle")}</p>
                        <p className="mt-2 text-sm leading-7 text-muted-foreground">
                          {t("delivery.shippingNoteDesc")}
                        </p>
                      </div>
                    </div>

                    <div className="pt-5">
                      <p className="store-muted-text text-[11px] uppercase tracking-[0.18em]">{t("delivery.deliveryTips")}</p>
                      <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
                        <li>{t("delivery.tip1")}</li>
                        <li>{t("delivery.tip2")}</li>
                        <li>{t("delivery.tip3")}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>


            <TabsContent value="shipping" className="mt-8">
              <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
                <InfoPanel className="rounded-[1.5rem] px-5 py-5 shadow-[0_16px_32px_rgb(0_0_0/0.08)]">
                  <h3 className="mb-4 text-lg font-semibold">{t("shippingPolicy.title")}</h3>
                  <div className="space-y-4 text-muted-foreground">
                    <p>{t("shippingPolicy.line1")}</p>
                    <p>{t("shippingPolicy.line2")}</p>
                    <p>{t("shippingPolicy.line3")}</p>
                    <p>{t("shippingPolicy.line4")}</p>
                  </div>
                </InfoPanel>
                <InfoPanel className="rounded-[1.5rem] px-5 py-5 shadow-[0_16px_32px_rgb(0_0_0/0.08)]">
                  <h3 className="mb-4 text-lg font-semibold">{t("returnPolicy.title")}</h3>
                  <div className="space-y-4 text-muted-foreground">
                    <p>{t("returnPolicy.line1")}</p>
                    <p>{t("returnPolicy.line2")}</p>
                    <p>{t("returnPolicy.line3")}</p>
                    <p>{t("returnPolicy.line4")}</p>
                  </div>
                </InfoPanel>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-8">
              <div className="space-y-5">
                {REVIEWS.map((review) => (
                  <article
                    key={review.id}
                    className="ds-glass-panel rounded-[28px] p-6 shadow-[0_16px_36px_rgb(0_0_0/0.08)]"
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
                        <Image src={review.avatar} alt={review.author} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                              <p className="text-lg font-semibold tracking-[-0.02em]">{review.author}</p>
                              <span className="store-surface-soft store-muted-text rounded-full px-2.5 py-1 text-xs">
                                {review.date}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={cn(
                                      "h-4 w-4",
                                      i < review.rating ? "fill-gold text-gold" : "fill-muted text-muted"
                                    )}
                                  />
                                ))}
                              </div>
                              <span className="store-muted-text text-sm">{t("verifiedPurchase")}</span>
                            </div>
                          </div>

                          {review.images && (
                            <div className="flex gap-2 lg:pl-4">
                              {review.images.map((img, idx) => (
                                <div
                                  key={idx}
                                    className="store-surface-soft relative h-20 w-20 overflow-hidden rounded-2xl"
                                >
                                  <Image src={img} alt="" fill className="object-cover" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <h4 className="mt-4 font-semibold text-foreground">{review.title}</h4>
                        <p className="mt-2 leading-relaxed text-muted-foreground">{review.content}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="mt-8">
              <div className="ds-glass-panel rounded-[30px] p-8 shadow-[0_18px_44px_rgb(0_0_0/0.1)]">
                <div className="mb-8">
                  <h3 className="text-xl font-semibold">{t("priceHistory.title")}</h3>
                  <p className="mt-2 text-muted-foreground">{t("priceHistory.description")}</p>
                </div>

                <div className="h-[300px] w-full">
                  <ChartContainer config={PRICE_CHART_CONFIG} className="h-full w-full">
                    <AreaChart
                      data={PRICE_HISTORY}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="rgb(var(--store-accent-rgb))" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="rgb(var(--store-accent-rgb))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(var(--store-border-rgb), 0.2)" />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                        dy={10}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke="rgb(var(--store-accent-rgb))"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorPrice)"
                      />
                    </AreaChart>
                  </ChartContainer>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}

