"use client"

import * as React from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import {
  Star,
  MapPin,
  Package,
  Users,
  MessageCircle,
  Share2,
  ChevronDown,
  Grid3X3,
  LayoutGrid,
  ArrowLeft,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
} from "lucide-react"
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, EmptyStatePanel, FilterBar, RatingStars, Spinner, Tabs, TabsContent, TabsList, TabsTrigger, cn } from '@platform-system/design-ui';
import { ProductCard } from "@/features/product"
import { useSellerStorefront } from "../hooks/use-seller-storefront"
import { Link } from "@/i18n/navigation"

const formatPolicyText = (text: string) => {
  if (!text) return []
  return text
    .split(/(?:\s+-\s+|^-\s*)/)
    .map((t) => t.trim())
    .filter(Boolean)
}

const renderPolicyItemContent = (item: string) => {
  const colonIndex = item.indexOf(":")
  if (colonIndex === -1) {
    return <span>{item}</span>
  }
  const prefix = item.substring(0, colonIndex)
  const suffix = item.substring(colonIndex) // Includes the colon ":"
  return (
    <span>
      <strong className="font-semibold text-foreground">{prefix}</strong>
      {suffix}
    </span>
  )
}

export function SellerStorefrontScreen() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string
  const t = useTranslations("Seller")

  const {
    seller,
    filteredProducts,
    isLoading,
    isFollowing,
    setIsFollowing,
    gridCols,
    setGridCols,
    sortBy,
    setSortBy,
    activeCategory,
    setActiveCategory,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
  } = useSellerStorefront(slug)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-12">
        <Spinner className="spinner-accent h-8 w-8" />
      </div>
    )
  }

  if (!seller) {
    return (
      <div className="relative z-10 min-h-screen bg-background pb-28 pt-12 text-foreground">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <EmptyStatePanel
            icon={<Users className="h-10 w-10" />}
            title={t("sellerNotFound")}
            description={t("sellerNotFoundDesc")}
            primaryActionNode={
              <Button asChild variant="brand" className="rounded-full px-8">
                <Link href="/sellers">{t("viewAllSellers")}</Link>
              </Button>
            }
            secondaryActionNode={
              <Button asChild variant="outline" className="rounded-full px-8">
                <Link href="/marketplace">{t("backToStore")}</Link>
              </Button>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="relative z-10 min-h-screen bg-background pb-28 pt-12 text-foreground">
      <section className="relative py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="store-surface-soft mb-5 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-foreground transition-colors hover:bg-[rgb(var(--store-accent-rgb)/0.1)]"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("back")}
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="ds-glass-panel overflow-hidden rounded-[2rem] shadow-[0_24px_56px_rgb(0_0_0/0.12)] border border-[rgb(var(--store-border-rgb)/0.5)]"
          >
            {/* Cover Image Container inside the card */}
            <div className="relative h-64 overflow-hidden w-full sm:h-80 lg:h-96">
              <Image
                src={seller.coverImage}
                alt={`${seller.name} cover`}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>

            {/* Profile Info Container */}
            <div className="relative px-6 pb-8 pt-0 sm:px-10">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-4">
                <div className="relative">
                  <div className="store-surface-soft relative -mt-[56px] h-28 w-28 overflow-hidden rounded-full border-4 border-[rgb(var(--store-surface-rgb))] shadow-[0_18px_36px_rgb(0_0_0/0.15)] sm:-mt-[72px] sm:h-36 sm:w-36 z-20">
                    <Image src={seller.avatar} alt={seller.name} fill className="object-cover" />
                  </div>
                </div>

                <div className="flex-1 min-w-0 flex flex-col xl:grid xl:grid-cols-[1fr_auto] xl:items-start gap-x-8 gap-y-4 pt-8 sm:pt-10">
                  <div className="flex flex-col gap-4 xl:col-start-1 xl:row-start-1">
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
                          {seller.name}
                        </h1>
                      </div>

                      <p className="store-muted-text">{seller.tagline}</p>
                    </div>
                  </div>

                  <p className="store-muted-text max-w-4xl leading-relaxed xl:col-start-1 xl:row-start-2">{seller.description}</p>

                  <div className="flex flex-col gap-4 xl:col-start-2 xl:row-start-1 xl:row-span-2 xl:self-start xl:items-end mt-4 xl:mt-0">
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={() => setIsFollowing((current) => !current)}
                        variant={isFollowing ? "outline" : "brand"}
                        className={cn(
                          "rounded-xl px-5 shadow-none",
                          isFollowing
                            ? "border-[rgb(var(--store-border-rgb)/0.75)] bg-[rgb(var(--store-surface-rgb)/0.7)] text-foreground hover:bg-[rgb(var(--store-accent-rgb)/0.12)]"
                            : ""
                        )}
                      >
                        {isFollowing ? t("following") : t("follow")}
                      </Button>
                      <Button variant="outline" className="rounded-xl px-5">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        {t("contact")}
                      </Button>
                      <Button variant="outline" size="icon" className="rounded-xl">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="store-muted-text flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm bg-[rgb(var(--store-border-rgb)/0.3)] rounded-full px-4 py-1.5 w-fit border border-[rgb(var(--store-border-rgb)/0.5)]">
                      <div className="flex items-center gap-1.5">
                        <Star
                          className="h-4 w-4"
                          style={{ fill: "var(--color-star)", color: "var(--color-star)" }}
                        />
                        <span className="font-medium text-foreground">{seller.rating}</span>
                        <span>({seller.reviewCount} {t("reviews")})</span>
                      </div>
                      <div className="h-3 w-px bg-[rgb(var(--store-border-rgb)/0.7)] hidden sm:block" />
                      <div className="flex items-center gap-1.5">
                        <Package className="h-4 w-4" />
                        <span>{seller.productCount} {t("products")}</span>
                      </div>
                      <div className="h-3 w-px bg-[rgb(var(--store-border-rgb)/0.7)] hidden sm:block" />
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        <span>{seller.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <TabsList className="ds-glass-panel h-auto w-full rounded-[1.75rem] p-1 xl:w-auto">
                <TabsTrigger
                  value="products"
                  className="store-muted-text rounded-[1.3rem] px-6 py-3 data-[state=active]:bg-[rgb(var(--store-accent-rgb)/0.12)] data-[state=active]:text-foreground"
                >
                  {t("productsTab")} ({seller.productCount})
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="store-muted-text rounded-[1.3rem] px-6 py-3 data-[state=active]:bg-[rgb(var(--store-accent-rgb)/0.12)] data-[state=active]:text-foreground"
                >
                  {t("reviewsTab")} ({seller.reviewCount})
                </TabsTrigger>
                <TabsTrigger
                  value="about"
                  className="store-muted-text rounded-[1.3rem] px-6 py-3 data-[state=active]:bg-[rgb(var(--store-accent-rgb)/0.12)] data-[state=active]:text-foreground"
                >
                  {t("aboutTab")}
                </TabsTrigger>
              </TabsList>

              {activeTab === "products" && (
                <FilterBar
                  variant="inline"
                  className="xl:justify-end"
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                  categories={seller.categories}
                  includeAllOption
                  searchPlaceholder={t("searchPlaceholder")}
                />
              )}
            </div>

            <TabsContent value="products" className="mt-0">
              <div className="mb-6 flex items-center justify-between">
                <p className="store-muted-text text-sm">
                  {t("showing")}{" "}
                  <span className="font-medium text-foreground">{filteredProducts.length}</span>{" "}
                  {t("products")}
                </p>

                <div className="flex items-center gap-3">
                  <div className="store-surface-soft hidden items-center gap-1 rounded-xl p-1 md:flex">
                    <button
                      onClick={() => setGridCols(3)}
                      className={cn(
                        "rounded-lg p-2 transition-colors",
                        gridCols === 3 ? "store-accent-soft text-foreground" : "store-muted-text hover:bg-[rgb(var(--store-accent-rgb)/0.08)]"
                      )}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setGridCols(4)}
                      className={cn(
                        "rounded-lg p-2 transition-colors",
                        gridCols === 4 ? "store-accent-soft text-foreground" : "store-muted-text hover:bg-[rgb(var(--store-accent-rgb)/0.08)]"
                      )}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </button>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="lg" className="min-w-[156px] justify-between rounded-xl">
                        {sortBy === "featured"
                          ? t("featured")
                          : sortBy === "newest"
                            ? t("newest")
                            : sortBy === "price-low"
                              ? t("priceLowHigh")
                              : t("priceHighLow")}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[190px]">
                      <DropdownMenuItem onClick={() => setSortBy("featured")}>{t("featured")}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("newest")}>{t("newest")}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("price-low")}>{t("priceLowHigh")}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("price-high")}>{t("priceHighLow")}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div
                className={cn(
                  "grid gap-4 sm:gap-6",
                  gridCols === 3 && "grid-cols-2 md:grid-cols-3",
                  gridCols === 4 && "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                )}
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-0">
              {seller.reviewCount > 0 ? (
                <div className="grid gap-8 xl:grid-cols-[340px_minmax(0,1fr)]">
                  <div className="ds-glass-panel rounded-[1.75rem] p-6 shadow-[0_18px_36px_rgb(0_0_0/0.1)]">
                    <div className="flex items-start gap-6">
                      <div className="min-w-[96px]">
                        <div className="text-5xl font-semibold tracking-[-0.03em]">{seller.rating}</div>
                        <div className="mt-3">
                          <RatingStars rating={seller.rating} />
                        </div>
                        <p className="store-muted-text mt-2 text-sm">{seller.reviewCount} {t("reviews")}</p>
                      </div>

                      <div className="flex-1">
                        <p className="store-muted-text text-sm leading-relaxed">
                          {t("reviewsSummaryPending")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <EmptyStatePanel
                    icon={<MessageCircle className="h-10 w-10" />}
                    title={t("reviews")}
                    description={t("reviewsUnavailable")}
                  />
                </div>
              ) : (
                <EmptyStatePanel
                  icon={<MessageCircle className="h-10 w-10" />}
                  title={t("noReviewsYet")}
                  description={t("reviewsUnavailable")}
                />
              )}
            </TabsContent>

            <TabsContent value="about" className="mt-0">
              <div className="space-y-10">
                <div className="max-w-5xl">
                  <h3 className="mb-4 text-2xl font-semibold tracking-[-0.02em] text-foreground">
                    {t("aboutSeller", { name: seller.name })}
                  </h3>
                  <p className="store-muted-text max-w-4xl leading-relaxed">{seller.description}</p>
                </div>

                {seller.policies && (
                  <div>
                    <h3 className="mb-5 text-2xl font-semibold tracking-[-0.02em] text-foreground">
                      {t("storePolicies")}
                    </h3>
                    <div className="grid gap-6 md:grid-cols-3">
                      {/* Shipping Policy */}
                      {seller.policies.shipping && (
                        <div className="ds-glass-panel rounded-2xl p-5 border border-[rgb(var(--store-border-rgb)/0.5)] flex flex-col gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                          <div className="flex items-center gap-2 text-foreground font-semibold">
                            <Truck className="h-5 w-5 store-accent-text" />
                            <span>{t("shipping") || "Vận chuyển"}</span>
                          </div>
                          <ul className="space-y-2 text-sm text-muted-foreground list-none pl-0">
                            {formatPolicyText(seller.policies.shipping).map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                                <span className="mt-[9.5px] h-1.5 w-1.5 shrink-0 rounded-full bg-[rgb(var(--store-accent-rgb)/0.6)]" />
                                {renderPolicyItemContent(item)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Return Policy */}
                      {seller.policies.returns && (
                        <div className="ds-glass-panel rounded-2xl p-5 border border-[rgb(var(--store-border-rgb)/0.5)] flex flex-col gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                          <div className="flex items-center gap-2 text-foreground font-semibold">
                            <RotateCcw className="h-5 w-5 store-accent-text" />
                            <span>{t("returns") || "Đổi trả"}</span>
                          </div>
                          <ul className="space-y-2 text-sm text-muted-foreground list-none pl-0">
                            {formatPolicyText(seller.policies.returns).map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                                <span className="mt-[9.5px] h-1.5 w-1.5 shrink-0 rounded-full bg-[rgb(var(--store-accent-rgb)/0.6)]" />
                                {renderPolicyItemContent(item)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Warranty Policy */}
                      {seller.policies.warranty && (
                        <div className="ds-glass-panel rounded-2xl p-5 border border-[rgb(var(--store-border-rgb)/0.5)] flex flex-col gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                          <div className="flex items-center gap-2 text-foreground font-semibold">
                            <ShieldCheck className="h-5 w-5 store-accent-text" />
                            <span>{t("warranty") || "Bảo hành"}</span>
                          </div>
                          <ul className="space-y-2 text-sm text-muted-foreground list-none pl-0">
                            {formatPolicyText(seller.policies.warranty).map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                                <span className="mt-[9.5px] h-1.5 w-1.5 shrink-0 rounded-full bg-[rgb(var(--store-accent-rgb)/0.6)]" />
                                {renderPolicyItemContent(item)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="mb-3 text-2xl font-semibold tracking-[-0.02em] text-foreground">
                    {t("responseTime")}
                  </h3>
                  <p className="store-muted-text">{seller.responseTime}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  )
}

