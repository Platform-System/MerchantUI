import { useTranslations } from "next-intl"
import { useState, useLayoutEffect, useMemo } from "react"
import { Store } from "lucide-react"
import { EmptyStatePanel, FilterBar, Spinner } from '@platform-system/design-ui';
import { SellerCard } from "../components/seller-card"
import { useQuery } from "@tanstack/react-query"
import { fetchAllSellers, sellerQueryKeys } from "../queries/seller-queries"

export function SellersScreen() {
  // Trigger hot-reload for design-system updates
  const t = useTranslations("Seller")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState(t("all"))

  const { data: allSellers = [], isLoading } = useQuery({
    queryKey: sellerQueryKeys.all,
    queryFn: fetchAllSellers,
    staleTime: 5 * 60 * 1000,
  })

  useLayoutEffect(() => {
    const container = document.getElementById('store-scroll-container')
    if (container) {
      container.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [])

  const categories = useMemo(() => {
    const categorySet = new Set<string>()

    allSellers.forEach((seller) => {
      seller.categories.forEach((category) => {
        if (category.trim()) {
          categorySet.add(category)
        }
      })
    })

    return [t("all"), ...Array.from(categorySet).sort((left, right) => left.localeCompare(right, "vi"))]
  }, [allSellers, t])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-12">
        <Spinner className="spinner-accent h-8 w-8" />
      </div>
    )
  }

  const filteredSellers = allSellers.filter((seller) => {
    const matchesSearch = seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         seller.location.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = activeCategory === t("all") || 
                           seller.categories.some(c => c.toLowerCase() === activeCategory.toLowerCase())

    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-background pt-12 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <span className="store-muted-text text-sm font-medium uppercase tracking-widest">
            {t("verifiedList")}
          </span>
          <h1 className="mt-3 mb-4 text-balance font-serif text-4xl font-semibold text-foreground sm:text-5xl">
            {t("discoverSellers")}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("discoverSellersDesc")}
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-12">
          <FilterBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            categories={categories}
            searchPlaceholder={t("searchSellerPlaceholder")}
          />
        </div>

        {/* Results Grid */}
        {filteredSellers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredSellers.map((seller) => (
              <SellerCard key={seller.id} seller={seller} />
            ))}
          </div>
        ) : (
          <EmptyStatePanel
            icon={<Store className="h-10 w-10" />}
            title={allSellers.length === 0 ? t("noSellers") : t("noSellersFound")}
            description={allSellers.length === 0 ? t("noSellersDesc") : t("noSellersFoundDesc")}
            className="gap-4 flex flex-col items-center"
            panelClassName="rounded-2xl py-24"
            descriptionClassName="max-w-md"
            iconClassName="opacity-60 shadow-none"
          />
        )}
      </div>
    </div>
  )
}

