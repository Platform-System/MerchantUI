"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Button, Checkbox, OverlayBackdrop, RatingStars, Slider, cn } from '@system/design-ui';
import { useQuery } from "@tanstack/react-query"
import { fetchAllCategories, categoryQueryKeys } from "@/shared/lib/category-queries"
import { fetchAllSellers, sellerQueryKeys } from "@/features/seller"

interface FilterSidebarProps {
  isOpen: boolean
  onClose: () => void
  isMobile?: boolean
  priceRange: [number, number]
  onPriceRangeChange: (range: [number, number]) => void
  selectedCategories: string[]
  onSelectedCategoriesChange: (categories: string[]) => void
  selectedRating: number | null
  onSelectedRatingChange: (rating: number | null) => void
  selectedSellers: string[]
  onSelectedSellersChange: (sellers: string[]) => void
  onClearAll: () => void
}

const priceRanges = [
  { label: "Dưới $50", min: 0, max: 50 },
  { label: "$50 - $100", min: 50, max: 100 },
  { label: "$100 - $200", min: 100, max: 200 },
  { label: "$200 - $500", min: 200, max: 500 },
  { label: "Từ $500", min: 500, max: 10000 },
]

const ratings = [5, 4, 3, 2, 1]

export function FilterSidebar({
  isOpen,
  onClose,
  isMobile,
  priceRange,
  onPriceRangeChange,
  selectedCategories,
  onSelectedCategoriesChange,
  selectedRating,
  onSelectedRatingChange,
  selectedSellers,
  onSelectedSellersChange,
  onClearAll,
}: FilterSidebarProps) {
  const { data: categories = [] } = useQuery({
    queryKey: categoryQueryKeys.all,
    queryFn: fetchAllCategories,
    staleTime: 10 * 60 * 1000,
  })
  const { data: sellers = [] } = useQuery({
    queryKey: sellerQueryKeys.all,
    queryFn: fetchAllSellers,
    staleTime: 5 * 60 * 1000,
  })
  const toggleCategory = (id: string) => {
    const nextCategories = selectedCategories.includes(id)
      ? selectedCategories.filter((categoryId) => categoryId !== id)
      : [...selectedCategories, id]

    onSelectedCategoriesChange(nextCategories)
  }

  const toggleSeller = (id: string) => {
    const nextSellers = selectedSellers.includes(id)
      ? selectedSellers.filter((sellerId) => sellerId !== id)
      : [...selectedSellers, id]

    onSelectedSellersChange(nextSellers)
  }

  const filterContent = (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 shrink-0 border-b border-[rgb(var(--store-border-rgb)/0.5)]">
        <h2 className="font-semibold text-foreground">Bộ lọc</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-muted-foreground hover:text-foreground"
          >
            Xóa tất cả
          </Button>
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-xl text-muted-foreground hover:bg-[rgb(var(--store-accent-rgb))/0.08] hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </Button>
          )}

        </div>
      </div>

      {/* Filters */}
      <div className="overflow-y-auto p-6 hover-scrollbar max-h-[calc(100vh-240px)] overscroll-contain mb-4 mr-1.5">
        <Accordion type="multiple" defaultValue={["categories", "price", "rating"]} className="w-full">
          {/* Categories */}
          <AccordionItem value="categories" className="border-none">
            <AccordionTrigger className="text-sm font-medium hover:no-underline py-4 text-foreground">Danh mục</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-2">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center gap-3 cursor-pointer group">
                    <Checkbox checked={selectedCategories.includes(category.id)} onCheckedChange={() => toggleCategory(category.id)} />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      {category.name}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      ({category.productCount})
                    </span>
                  </label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Price Range */}
          <AccordionItem value="price" className="border-none">
            <AccordionTrigger className="text-sm font-medium hover:no-underline py-4 text-foreground">Khoảng giá</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2 px-3">
                <Slider
                  value={priceRange}
                  onValueChange={(value: number[]) => onPriceRangeChange([value[0] ?? 0, value[1] ?? 1000])}
                  max={1000}
                  step={10}
                  className="w-full"
                />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">${priceRange[0]}</span>
                  <span className="text-muted-foreground">${priceRange[1]}+</span>
                </div>
                <div className="space-y-2">
                  {priceRanges.map((range) => (
                    <label key={range.label} className="flex items-center gap-3 cursor-pointer group">
                      <Checkbox checked={priceRange[0] === range.min && priceRange[1] === range.max} onCheckedChange={() => onPriceRangeChange([range.min, range.max])} />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        {range.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Rating */}
          <AccordionItem value="rating" className="border-none">
            <AccordionTrigger className="text-sm font-medium hover:no-underline py-4 text-foreground">Đánh giá khách hàng</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-2">
                {ratings.map((rating) => (
                  <Button
                    key={rating}
                    variant="ghost"
                    onClick={() => onSelectedRatingChange(selectedRating === rating ? null : rating)}
                    className={cn("flex h-auto w-full items-center justify-start gap-2 rounded-xl px-3 py-2 font-normal text-muted-foreground transition-colors hover:bg-[rgb(var(--store-accent-rgb))/0.08] hover:text-foreground", selectedRating === rating && "bg-[rgb(var(--store-accent-rgb))/0.12] text-foreground hover:bg-[rgb(var(--store-accent-rgb))/0.12]")}
                  >
                    <div className="flex items-center">
                      <RatingStars rating={rating} size="sm" />
                    </div>
                    <span className="text-sm">{rating === 5 ? "5 sao" : `${rating}+ sao`}</span>
                  </Button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Sellers */}
          <AccordionItem value="sellers" className="border-b-0">
            <AccordionTrigger className="text-sm font-medium hover:no-underline py-4 text-foreground">Nhà bán hàng</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-2">
                {sellers.map((seller) => (
                  <label key={seller.slug} className="flex items-center gap-3 cursor-pointer group">
                    <Checkbox checked={selectedSellers.includes(seller.slug)} onCheckedChange={() => toggleSeller(seller.slug)} />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      {seller.name}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      ({seller.productCount})
                    </span>
                  </label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Apply Button (Mobile) */}
      {isMobile && (
        <div className="p-6">
          <Button onClick={onClose} className="store-accent-button w-full">
            Áp dụng bộ lọc
          </Button>
        </div>
      )}
    </div>
  )

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <OverlayBackdrop
                className="fixed inset-0 z-40 top-[var(--store-header-height,64px)] bg-[rgb(var(--store-ink-rgb)/0.28)]"
                onClick={onClose}
              />
            </motion.div>
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="ds-dark-panel fixed top-[var(--store-header-height,64px)] bottom-0 left-0 z-50 flex w-full max-w-sm flex-col"
            >
              {filterContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    )
  }

  return (
    <div className="ds-dark-panel flex max-h-[calc(100vh-120px)] w-full flex-col overflow-hidden rounded-2xl overscroll-contain">
      <div className="flex flex-col min-h-0 overscroll-contain">
        {filterContent}
      </div>
    </div>
  )
}
