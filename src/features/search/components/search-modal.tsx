"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, Clock, ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button, Input, OverlayBackdrop } from '@system/design-ui';
import { Link } from "@/i18n/navigation"
import { useQuery } from "@tanstack/react-query"
import { fetchAllProducts, productQueryKeys } from "@/features/product"
import Image from "next/image"

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const t = useTranslations("Search")
  const [query, setQuery] = useState("")
  const [history, setHistory] = useState(["Túi thiết kế", "Đồng hồ cổ điển", "Trang sức thủ công"])
  const normalizedQuery = query.trim().toLowerCase()

  const { data: allProductsData = [] } = useQuery({
    queryKey: productQueryKeys.all,
    queryFn: fetchAllProducts,
    staleTime: 5 * 60 * 1000,
  })

  const trendingProducts = useMemo(() => (Array.isArray(allProductsData) ? allProductsData.slice(8, 12) : []), [allProductsData])
  const popularSearches = t.raw("suggestions") as string[]
 
  const handleDeleteRecent = (e: React.MouseEvent, item: string) => {
    e.stopPropagation()
    setHistory(prev => prev.filter(i => i !== item))
  }

  const quickResults = allProductsData
    .filter((product) => {
      if (!normalizedQuery) return true

      return [product.name, product.seller.name, product.category ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    })
    .slice(0, 4) || []

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEsc)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleEsc)
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <OverlayBackdrop
              className="fixed inset-0 z-50 bg-[rgb(var(--store-ink-rgb)/0.32)]"
              onClick={onClose}
            />
          </motion.div>

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-[5%] left-1/2 z-50 w-full max-w-2xl -translate-x-1/2"
          >
            <div className="ds-glass-card overflow-hidden rounded-2xl shadow-2xl">
              {/* Search Input */}
              <div className="p-4 border-b border-border/40">
                <Input
                  autoFocus
                  type="text"
                  placeholder={t("placeholder")}
                  value={query}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                  startAdornment={<Search className="h-5 w-5" />}
                  endAdornment={query ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => setQuery("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  ) : undefined}
                  className="h-14 border-[1.5px] border-dashed border-[rgb(var(--store-border-rgb))] bg-[rgb(var(--store-surface-rgb)/0.74)] pr-12 pl-12 text-lg rounded-2xl focus:border-solid focus:border-[rgb(var(--store-accent-rgb))] focus:ring-[1px] focus:ring-[rgb(var(--store-accent-rgb))] focus-visible:ring-0 focus-visible:border-solid focus-visible:border-[rgb(var(--store-accent-rgb))] transition-all duration-200"
                />
              </div>

              {/* Content */}
              <div className="p-4 max-h-[70vh] overflow-y-auto">
              {query.length === 0 ? (
                <>
                  {/* Featured Collections */}
                  <div className="mb-8">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-4 px-1">
                      {t("top")}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {(popularSearches || []).slice(0, 4).map((search) => (
                        <button
                          key={search}
                          onClick={() => setQuery(search)}
                          className="store-surface-soft group relative overflow-hidden rounded-xl p-4 text-left transition-all hover:bg-primary/5"
                        >
                          <span className="relative z-10 text-xs font-medium transition-colors group-hover:text-primary">
                            {search}
                          </span>
                          <div className="absolute -right-2 -bottom-2 h-12 w-12 rounded-full bg-primary/5 transition-transform group-hover:scale-150" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Trending Products */}
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-4 px-1">
                      {t("suggestionsTitle")}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {trendingProducts.slice(0, 2).map((product) => (
                        <Link
                          key={product.id}
                          href={`/product/${product.id}`}
                          onClick={onClose}
                          className="group flex items-center gap-4 rounded-2xl p-2 transition-all hover:bg-muted/50"
                        >
                          <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-muted">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-foreground truncate">{product.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">${product.price}</p>
                            <div className="mt-2 flex items-center text-[10px] text-primary font-bold uppercase tracking-wider opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">
                              Xem chi tiết <ArrowRight className="ml-1 h-3 w-3" />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Recent Searches */}
                  {history.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-border/40">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {t("recent")}
                        </h3>
                        <button 
                          onClick={() => setHistory([])}
                          className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-destructive transition-colors"
                        >
                          Xóa tất cả
                        </button>
                      </div>
                      <div className="space-y-1">
                        {history.map((search) => (
                          <div
                            key={search}
                            className="group flex w-full items-center gap-3 rounded-xl p-2 transition-all hover:bg-muted/50"
                          >
                            <button
                              onClick={() => setQuery(search)}
                              className="flex flex-1 items-center gap-3 text-xs text-muted-foreground transition-all hover:text-foreground"
                            >
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted/50 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                                <Clock className="h-3 w-3" />
                              </div>
                              <span className="flex-1 text-left">{search}</span>
                            </button>
                            <button
                              onClick={(e) => handleDeleteRecent(e, search)}
                              className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive transition-all"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Quick Results */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      {t("quickResults")}
                    </h3>
                    <div className="space-y-2">
                      {quickResults.length > 0 ? (
                        quickResults.map((product) => (
                          <Link
                            key={product.id}
                            href={`/product/${product.id}`}
                            onClick={onClose}
                            className="flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-[rgb(var(--store-accent-rgb)/0.08)]"
                          >
                            <div className="store-surface-soft relative h-14 w-14 overflow-hidden rounded-lg">
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground">{product.seller.name}</p>
                            </div>
                            <p className="font-semibold">${product.price}</p>
                          </Link>
                        ))
                      ) : (
                        <div className="store-surface-soft rounded-2xl px-4 py-5 text-sm text-muted-foreground">
                          {t("noResults")}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* View All Results */}
                  <div className="mt-4 pt-2">
                    <Link
                      href={`/marketplace?search=${encodeURIComponent(query)}`}
                      onClick={onClose}
                      className="store-accent-text flex items-center justify-center gap-2 py-3 transition-colors hover:opacity-80"
                    >
                      {t("viewAll", { query })}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </>
      )}
    </AnimatePresence>
  )
}

