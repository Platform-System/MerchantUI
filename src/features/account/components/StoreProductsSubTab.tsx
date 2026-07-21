"use client"

import * as React from "react"
import { AlertTriangle, Loader2, PlusCircle, Clock, ClipboardCheck, Pencil, Check, Trash2 } from "lucide-react"
import { Button, Input } from "@system/design-ui"
import { motion, AnimatePresence } from "framer-motion"

export interface StoreProductsSubTabProps {
  productForm: {
    id: string
    title: string
    author: string
    price: string
    stock: string
    categoryId: string
  }
  setProductForm: React.Dispatch<React.SetStateAction<{
    id: string
    title: string
    author: string
    price: string
    stock: string
    categoryId: string
  }>>
  isActiveStore: boolean
  editingProductId: string | null
  resetProductForm: () => void
  categories: Array<{ id: string; name: string }>
  isLoadingCategories: boolean
  saveProduct: () => void
  isSavingProduct: boolean
  isLoadingMyPending: boolean
  myPendingProducts: import("@/shared/lib/storefront-normalizers").CatalogProductResponse[]
  startEditingProduct: (product: import("@/shared/lib/storefront-normalizers").CatalogProductResponse) => void
  deleteProduct: (id: string) => void
  isDeletingProduct: boolean
  isLoadingOwnerReview: boolean
  ownerReviewProducts: import("@/shared/lib/storefront-normalizers").CatalogProductResponse[]
  approveProduct: (id: string) => void
  isApprovingProduct: boolean
  ts: (key: string, values?: Record<string, string | number | Date>) => string
}

export function StoreProductsSubTab({
  productForm,
  setProductForm,
  isActiveStore,
  editingProductId,
  resetProductForm,
  categories,
  isLoadingCategories,
  saveProduct,
  isSavingProduct,
  isLoadingMyPending,
  myPendingProducts,
  startEditingProduct,
  deleteProduct,
  isDeletingProduct,
  isLoadingOwnerReview,
  ownerReviewProducts,
  approveProduct,
  isApprovingProduct,
  ts,
}: StoreProductsSubTabProps) {
  const [selectedTab, setSelectedTab] = React.useState<"manage" | "pending" | "review">("manage")
  const activeTab = editingProductId ? "manage" : selectedTab

  return (
    <div className="space-y-4 rounded-2xl border border-[rgb(var(--store-border-rgb)/0.7)] p-5 animate-in fade-in duration-300">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="text-lg font-semibold text-foreground">{ts("productsSection")}</h4>
            <p className="text-sm text-muted-foreground">{ts("productsSectionDesc")}</p>
          </div>
          {editingProductId && activeTab === "manage" && (
            <Button variant="outline" className="rounded-xl shrink-0" onClick={resetProductForm}>
              {ts("products.cancelEdit")}
            </Button>
          )}
        </div>

        {/* Tab buttons */}
        <div className="flex border-b border-[rgb(var(--store-border-rgb)/0.4)] gap-1">
          <button
            type="button"
            onClick={() => setSelectedTab("manage")}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap -mb-[2px] ${
              activeTab === "manage"
                ? "border-[rgb(var(--store-accent-rgb))] text-[rgb(var(--store-accent-rgb))]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {editingProductId ? <Pencil className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
            <span>{editingProductId ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}</span>
          </button>
          
          <button
            type="button"
            onClick={() => setSelectedTab("pending")}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap -mb-[2px] ${
              activeTab === "pending"
                ? "border-[rgb(var(--store-accent-rgb))] text-[rgb(var(--store-accent-rgb))]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>{ts("products.myPendingTitle")}</span>
            {myPendingProducts.length > 0 && (
              <span className="inline-flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono text-[10px] font-bold h-5 w-5 rounded-full border border-neutral-300/60 dark:border-neutral-700/60 shrink-0 select-none animate-in zoom-in duration-200">
                {myPendingProducts.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab("review")}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap -mb-[2px] ${
              activeTab === "review"
                ? "border-[rgb(var(--store-accent-rgb))] text-[rgb(var(--store-accent-rgb))]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <ClipboardCheck className="h-4 w-4" />
            <span>{ts("products.ownerReviewTitle")}</span>
            {ownerReviewProducts.length > 0 && (
              <span className="inline-flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono text-[10px] font-bold h-5 w-5 rounded-full border border-neutral-300/60 dark:border-neutral-700/60 shrink-0 select-none animate-in zoom-in duration-200">
                {ownerReviewProducts.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab contents */}
      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {activeTab === "manage" && (
            <motion.div
              key="manage-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-xl space-y-4 pt-1"
            >
              {!isActiveStore && (
                <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400 leading-normal">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{ts("products.storeInactiveWarning")}</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">{ts("products.title")}</label>
                  <Input
                    className="h-11 rounded-xl"
                    placeholder={ts("products.title")}
                    value={productForm.title}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setProductForm((current) => ({ ...current, title: event.target.value }))
                    }
                    disabled={!isActiveStore}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">{ts("products.author")}</label>
                  <Input
                    className="h-11 rounded-xl"
                    placeholder={ts("products.author")}
                    value={productForm.author}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setProductForm((current) => ({ ...current, author: event.target.value }))
                    }
                    disabled={!isActiveStore}
                  />
                  <p className="text-[10px] text-muted-foreground opacity-80 mt-1 leading-normal">
                    Mặc định hiển thị tên cửa hàng của bạn. Bạn có thể thay đổi nếu bán sách của tác giả khác hoặc sản phẩm của thương hiệu đối tác.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">{ts("products.price")}</label>
                    <Input
                      className="h-11 rounded-xl"
                      placeholder={ts("products.price")}
                      type="number"
                      value={productForm.price}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        setProductForm((current) => ({ ...current, price: event.target.value }))
                      }
                      disabled={!isActiveStore}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">{ts("products.stock")}</label>
                    <Input
                      className="h-11 rounded-xl"
                      placeholder={ts("products.stock")}
                      type="number"
                      value={productForm.stock}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        setProductForm((current) => ({ ...current, stock: event.target.value }))
                      }
                      disabled={!isActiveStore}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Danh mục</label>
                  <select
                    className="flex h-11 w-full rounded-xl border border-[rgb(var(--store-border-rgb)/0.9)] bg-[rgb(var(--store-surface-rgb)/0.84)] px-3 text-sm text-foreground outline-none disabled:opacity-50 cursor-pointer"
                    value={productForm.categoryId}
                    onChange={(event) =>
                      setProductForm((current) => ({ ...current, categoryId: event.target.value }))
                    }
                    disabled={!isActiveStore}
                  >
                    <option value="">
                      {isLoadingCategories ? ts("products.loadingCategories") : ts("products.category")}
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                className="store-accent-button store-accent-button-strong w-full rounded-xl h-11 font-semibold text-sm transition-all"
                onClick={saveProduct}
                disabled={
                  isSavingProduct ||
                  !productForm.title.trim() ||
                  !productForm.author.trim() ||
                  !productForm.categoryId ||
                  !productForm.price ||
                  !productForm.stock ||
                  !isActiveStore
                }
              >
                {isSavingProduct
                  ? ts("saving")
                  : editingProductId
                    ? ts("products.saveEdit")
                    : ts("products.create")}
              </Button>
            </motion.div>
          )}

          {activeTab === "pending" && (
            <motion.div
              key="pending-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >


              {isLoadingMyPending ? (
                <div className="flex min-h-[200px] items-center justify-center">
                  <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
                </div>
              ) : myPendingProducts.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-[rgb(var(--store-border-rgb)/0.5)] rounded-2xl bg-muted/5">
                  <p className="text-sm text-muted-foreground">{ts("products.emptyMyPending")}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                  {myPendingProducts.map((product) => (
                    <div
                      key={product.id}
                      className="relative overflow-hidden rounded-2xl border border-[rgb(var(--store-border-rgb)/0.6)] p-5 bg-background hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="font-semibold text-foreground text-sm leading-snug truncate pr-2" title={product.title}>
                            {product.title}
                          </h5>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgb(var(--store-accent-rgb)/0.08)] text-[rgb(var(--store-accent-rgb))] shrink-0 uppercase tracking-wider">
                            {product.categoryName || "Danh mục"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">Tác giả / Thương hiệu: <span className="font-medium text-foreground">{product.author}</span></p>
                        
                        <div className="flex items-center gap-4 text-xs pt-1">
                          <div>
                            <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-wider mb-0.5">Giá bán</span>
                            <span className="font-bold text-foreground text-sm">${product.price.toLocaleString()}</span>
                          </div>
                          <div className="h-6 w-px bg-[rgb(var(--store-border-rgb)/0.4)]" />
                          <div>
                            <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-wider mb-0.5">Tồn kho</span>
                            <span className="font-medium text-foreground text-sm">{product.stock}</span>
                          </div>
                          <div className="h-6 w-px bg-[rgb(var(--store-border-rgb)/0.4)]" />
                          <div>
                            <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-wider mb-0.5">Trạng thái</span>
                            <span className="text-[10px] font-semibold text-neutral-600 dark:text-neutral-400 capitalize">{product.status}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3 border-t border-[rgb(var(--store-border-rgb)/0.3)] mt-auto">
                        <Button
                          variant="outline"
                          className="rounded-xl flex-1 text-xs h-9 font-medium"
                          onClick={() => {
                            setSelectedTab("manage")
                            startEditingProduct(product)
                          }}
                          disabled={!isActiveStore}
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1.5" />
                          Sửa
                        </Button>
                        <Button
                          variant="outline"
                          className="rounded-xl flex-1 text-xs h-9 font-medium text-destructive hover:text-destructive hover:bg-destructive/5"
                          onClick={() => deleteProduct(product.id)}
                          disabled={isDeletingProduct || !isActiveStore}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                          Xóa
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "review" && (
            <motion.div
              key="review-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >


              {isLoadingOwnerReview ? (
                <div className="flex min-h-[200px] items-center justify-center">
                  <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
                </div>
              ) : ownerReviewProducts.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-[rgb(var(--store-border-rgb)/0.5)] rounded-2xl bg-muted/5">
                  <p className="text-sm text-muted-foreground">{ts("products.emptyOwnerReview")}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                  {ownerReviewProducts.map((product) => (
                    <div
                      key={product.id}
                      className="relative overflow-hidden rounded-2xl border border-[rgb(var(--store-border-rgb)/0.6)] p-5 bg-background hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="font-semibold text-foreground text-sm leading-snug truncate pr-2" title={product.title}>
                            {product.title}
                          </h5>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 uppercase tracking-wider">
                            Chờ duyệt
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">Tác giả / Thương hiệu: <span className="font-medium text-foreground">{product.author}</span></p>
                        
                        <div className="flex items-center gap-4 text-xs pt-1">
                          <div>
                            <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-wider mb-0.5">Giá bán</span>
                            <span className="font-bold text-foreground text-sm">${product.price.toLocaleString()}</span>
                          </div>
                          <div className="h-6 w-px bg-[rgb(var(--store-border-rgb)/0.4)]" />
                          <div>
                            <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-wider mb-0.5">Tồn kho</span>
                            <span className="font-medium text-foreground text-sm">{product.stock}</span>
                          </div>
                          <div className="h-6 w-px bg-[rgb(var(--store-border-rgb)/0.4)]" />
                          <div>
                            <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-wider mb-0.5">Trạng thái</span>
                            <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 capitalize">{product.status}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex pt-3 border-t border-[rgb(var(--store-border-rgb)/0.3)] mt-auto">
                        <Button
                          className="store-accent-button store-accent-button-strong rounded-xl w-full text-xs h-9 font-semibold transition-all flex items-center justify-center gap-1.5"
                          onClick={() => approveProduct(product.id)}
                          disabled={isApprovingProduct || !isActiveStore}
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>{ts("products.approve")}</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
