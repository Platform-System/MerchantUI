"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, SlidersHorizontal, Grid3X3, LayoutGrid, ChevronDown, X } from "lucide-react"
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, EmptyStatePanel, Input, Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, Spinner, cn } from '@platform-system/design-ui';
import { ProductCard } from "@/features/product"
import { FilterSidebar } from "../components/filter-sidebar"
import { useQuery } from "@tanstack/react-query"
import { fetchAllProducts, productQueryKeys } from "@/features/product"

const sortOptions = [
  { value: "featured", label: "Nổi bật" },
  { value: "newest", label: "Mới nhất" },
  { value: "price-low", label: "Giá: Thấp đến cao" },
  { value: "price-high", label: "Giá: Cao đến thấp" },
  { value: "rating", label: "Đánh giá cao nhất" },
  { value: "popular", label: "Phổ biến nhất" },
]

function MarketplaceScreenContent() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category")
  const searchParam = searchParams.get("search") ?? ""

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [gridCols, setGridCols] = useState<2 | 3 | 4 | 5 | 6>(4)
  const [sortBy, setSortBy] = useState("featured")
  const [searchQuery, setSearchQuery] = useState(searchParam)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryParam ? [categoryParam] : []
  )
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [selectedSellers, setSelectedSellers] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = gridCols === 6 ? 24 : 16

  const { data: allProducts = [] } = useQuery({
    queryKey: productQueryKeys.all,
    queryFn: fetchAllProducts,
    staleTime: 5 * 60 * 1000,
  })


  const clearAllFilters = () => {
    setSearchQuery("")
    setSelectedCategories([])
    setPriceRange([0, 1000])
    setSelectedRating(null)
    setSelectedSellers([])
    setCurrentPage(1)
  }

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const handleSelectedCategoriesChange = (value: string[]) => {
    setSelectedCategories(value)
    setCurrentPage(1)
  }

  const handlePriceRangeChange = (value: [number, number]) => {
    setPriceRange(value)
    setCurrentPage(1)
  }

  const handleSelectedRatingChange = (value: number | null) => {
    setSelectedRating(value)
    setCurrentPage(1)
  }

  const handleSelectedSellersChange = (value: string[]) => {
    setSelectedSellers(value)
    setCurrentPage(1)
  }



  const handleGridColsChange = (value: 2 | 3 | 4 | 5 | 6) => {
    setGridCols(value)
    setCurrentPage(1)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    setCurrentPage(1)
  }

  const filteredProducts = allProducts.filter((product) => {
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (selectedCategories.length > 0 && (!product.category || !selectedCategories.includes(product.category))) {
      return false
    }
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false
    }
    if (selectedRating !== null && product.rating < selectedRating) {
      return false
    }
    if (selectedSellers.length > 0) {
      const sellerSlug = product.seller.slug ?? product.seller.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "")
      if (!selectedSellers.includes(sellerSlug)) {
        return false
      }
    }

    return true
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return 0
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "rating":
        return b.rating - a.rating
      default:
        return 0
    }
  })

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)
  const paginatedProducts = (sortedProducts || []).slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden pt-12 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="pb-12 pt-0 text-center"
          >
            <h1 className="mb-4 font-serif text-4xl font-semibold tracking-[0.18em] text-foreground sm:text-5xl">
              CỬA HÀNG
            </h1>
            <p className="store-muted-text mx-auto max-w-2xl">
              Khám phá hàng nghìn sản phẩm chọn lọc từ các nhà bán hàng đã xác minh.
              Mua sắm an tâm, chất lượng được ưu tiên.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto max-w-2xl"
          >
            <div className="relative">
              <Search className="store-muted-text absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Tìm sản phẩm..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchQueryChange(e.target.value)}
                className="ds-glass-panel h-14 rounded-full pl-12 pr-12 text-base text-foreground placeholder:text-[rgb(var(--store-muted-rgb))]"
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => handleSearchQueryChange("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-8">
        <div className="mx-auto max-w-[1600px] px-4">
          <div className="flex gap-10">
            <div className="sticky top-[112px] hidden h-fit w-64 shrink-0 lg:block">
              <FilterSidebar
                isOpen
                onClose={() => {}}
                priceRange={priceRange}
                onPriceRangeChange={handlePriceRangeChange}
                selectedCategories={selectedCategories}
                onSelectedCategoriesChange={handleSelectedCategoriesChange}
                selectedRating={selectedRating}
                onSelectedRatingChange={handleSelectedRatingChange}
                selectedSellers={selectedSellers}
                onSelectedSellersChange={handleSelectedSellersChange}
                onClearAll={clearAllFilters}
              />
            </div>

            <div className="flex-1">
              {sortedProducts.length > 0 && (
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsFilterOpen(true)}
                      className="lg:hidden"
                    >
                      <SlidersHorizontal className="mr-2 h-4 w-4" />
                      Bộ lọc
                    </Button>

                    <p className="text-sm text-muted-foreground">
                      Hiện có <span className="font-medium text-foreground">{sortedProducts.length}</span> sản phẩm
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="hidden items-center gap-1 rounded-lg bg-muted p-1 md:flex">
                      <button
                        onClick={() => handleGridColsChange(6)}
                        className={cn(
                          "rounded-md p-2 transition-colors",
                          gridCols === 6 ? "bg-background shadow-sm" : "hover:bg-background/50"
                        )}
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleGridColsChange(4)}
                        className={cn(
                          "rounded-md p-2 transition-colors",
                          gridCols === 4 ? "bg-background shadow-sm" : "hover:bg-background/50"
                        )}
                      >
                        <LayoutGrid className="h-4 w-4" />
                      </button>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="min-w-[160px] justify-between">
                          {sortOptions.find((option) => option.value === sortBy)?.label}
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        {sortOptions.map((option) => (
                          <DropdownMenuItem
                            key={option.value}
                            onClick={() => handleSortChange(option.value)}
                            className={cn(sortBy === option.value && "bg-muted")}
                          >
                            {option.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )}
              
              {/* Nút lọc cho Mobile khi không có sản phẩm */}
              {sortedProducts.length === 0 && (
                <div className="mb-6 lg:hidden">
                  <Button
                    variant="outline"
                    onClick={() => setIsFilterOpen(true)}
                    className="w-full"
                  >
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Thay đổi bộ lọc
                  </Button>
                </div>
              )}

              {paginatedProducts.length > 0 ? (
                <div
                  className={cn(
                    "grid gap-4 sm:gap-6",
                    gridCols === 4 && "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
                    gridCols === 6 && "grid-cols-2 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6"
                  )}
                >
                  <AnimatePresence mode="popLayout">
                    {paginatedProducts.map((product) => (
                      <motion.div
                        layout
                        key={product.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <EmptyStatePanel
                  icon={<Search className="h-8 w-8" />}
                  title="Không có sản phẩm nào"
                  description="Hiện tại chưa có sản phẩm nào. Hãy quay lại sau nhé!"
                  primaryActionNode={
                    <Button
                      variant="outline"
                      className="rounded-xl border-[rgb(var(--store-border-rgb))] hover:bg-[rgb(var(--store-accent-rgb)/0.05)] hover:text-foreground"
                      onClick={clearAllFilters}
                    >
                      Xóa tất cả bộ lọc
                    </Button>
                  }
                  className="gap-4 flex flex-col items-center"
                  panelClassName="min-h-[400px] justify-center rounded-3xl p-12 animate-in fade-in zoom-in duration-500"
                  iconClassName="h-16 w-16 bg-[rgb(var(--store-accent-rgb)/0.1)] text-[rgb(var(--store-accent-rgb))] shadow-none border-none"
                />
              )}

              {paginatedProducts.length > 0 && totalPages > 1 && (
                <Pagination className="mt-12 select-none">
                  <PaginationContent>
                    <PaginationItem>
                    <PaginationPrevious
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        className={cn(
                          "store-surface-soft store-strong-text cursor-pointer rounded-xl transition-all duration-200 hover:bg-[rgb(var(--store-surface-rgb))] hover:text-foreground",
                          currentPage === 1 && "pointer-events-none opacity-30"
                        )}
                      />
                    </PaginationItem>

                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className={cn(
                              "cursor-pointer rounded-xl transition-all duration-200",
                              currentPage === page
                                ? "store-accent-button border-none font-semibold"
                                : "store-surface-soft store-muted-text hover:bg-[rgb(var(--store-surface-rgb))] hover:text-foreground"
                            )}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        className={cn(
                          "store-surface-soft store-strong-text cursor-pointer rounded-xl transition-all duration-200 hover:bg-[rgb(var(--store-surface-rgb))] hover:text-foreground",
                          currentPage === totalPages && "pointer-events-none opacity-30"
                        )}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          </div>
        </div>
      </section>

      <FilterSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        isMobile
        priceRange={priceRange}
        onPriceRangeChange={handlePriceRangeChange}
        selectedCategories={selectedCategories}
        onSelectedCategoriesChange={handleSelectedCategoriesChange}
        selectedRating={selectedRating}
        onSelectedRatingChange={handleSelectedRatingChange}
        selectedSellers={selectedSellers}
        onSelectedSellersChange={handleSelectedSellersChange}
        onClearAll={clearAllFilters}
      />
    </div>
  )
}

export function MarketplaceScreen() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background pt-12 pb-8"><Spinner className="spinner-accent h-8 w-8" /></div>}>
      <MarketplaceScreenContent />
    </Suspense>
  )
}

