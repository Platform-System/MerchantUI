"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ProductCard, ProductGridSkeleton, fetchAllProducts, productQueryKeys } from "@/features/product"
import { useQuery } from "@tanstack/react-query"
import { cn } from '@system/design-ui';

import { SectionFooter } from "./section-header"

export function FeaturedProductsSection() {
  const [activeTab, setActiveTab] = useState("featured")
  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: productQueryKeys.all,
    queryFn: fetchAllProducts,
    staleTime: 5 * 60 * 1000,
  })

  const tabs = useMemo(() => [
    { id: "featured", label: "Nổi bật", products: (allProducts || []).slice?.(0, 8) || [] },
    { id: "trending", label: "Xu hướng", products: (allProducts || []).slice?.(8, 12) || [] },
    { id: "new", label: "Mới về", products: (allProducts || []).slice?.(12) || [] },
  ], [allProducts])

  const currentProducts = tabs.find((t) => t.id === activeTab)?.products ?? []

  return (
    <section className="relative py-24 bg-background" style={{ position: "relative" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Tiêu đề section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12"
        >
          <div>
            <span className="store-accent-subtitle text-sm font-medium uppercase tracking-widest">
              Chọn lọc dành riêng
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold mt-3 text-balance">
              Sản phẩm được yêu thích
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 p-1.5 bg-[rgb(var(--store-surface-strong-rgb))] border border-[rgb(var(--store-border-rgb)/0.5)] rounded-full shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative px-6 py-2 text-sm font-medium rounded-full transition-all duration-300",
                  activeTab === tab.id
                    ? "text-white"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeProductTab"
                    className="absolute inset-0 bg-primary rounded-full shadow-md"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Lưới sản phẩm */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <ProductGridSkeleton key="skeleton" count={8} className="gap-4 sm:gap-6" />
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
            >
              {currentProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nút xem tất cả */}
        <SectionFooter href="/marketplace" label="Xem tất cả sản phẩm" />
      </div>
    </section>
  )
}


