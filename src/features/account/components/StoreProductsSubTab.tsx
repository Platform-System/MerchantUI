"use client"

import * as React from "react"
import { AlertTriangle, Loader2 } from "lucide-react"
import { Button, Input } from "@platform-system/design-ui"

export interface StoreProductsSubTabProps {
  productForm: {
    title: string
    author: string
    price: string
    stock: string
    categoryId: string
  }
  setProductForm: React.Dispatch<React.SetStateAction<{
    title: string
    author: string
    price: string
    stock: string
    categoryId: string
  }>>
  isActiveStore: boolean
  editingProductId: string | null
  resetProductForm: () => void
  categories: any[]
  isLoadingCategories: boolean
  saveProduct: () => void
  isSavingProduct: boolean
  isLoadingMyPending: boolean
  myPendingProducts: any[]
  startEditingProduct: (product: any) => void
  deleteProduct: (id: string) => void
  isDeletingProduct: boolean
  isLoadingOwnerReview: boolean
  ownerReviewProducts: any[]
  approveProduct: (id: string) => void
  isApprovingProduct: boolean
  ts: (key: string, values?: any) => string
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
  return (
    <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)] animate-in fade-in duration-300">
      <div className="space-y-4 rounded-2xl border border-[rgb(var(--store-border-rgb)/0.7)] p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="text-lg font-semibold text-foreground">{ts("productsSection")}</h4>
            <p className="text-sm text-muted-foreground">{ts("productsSectionDesc")}</p>
          </div>
          {editingProductId && (
            <Button variant="outline" className="rounded-xl" onClick={resetProductForm}>
              {ts("products.cancelEdit")}
            </Button>
          )}
        </div>

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

          <div className="grid gap-3 sm:grid-cols-2">
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
          className="store-accent-button store-accent-button-strong w-full rounded-xl"
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
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-[rgb(var(--store-border-rgb)/0.7)] p-5">
          <div>
            <h4 className="text-lg font-semibold text-foreground">{ts("products.myPendingTitle")}</h4>
            <p className="text-sm text-muted-foreground">{ts("products.myPendingDesc")}</p>
          </div>

          {isLoadingMyPending ? (
            <div className="flex min-h-[180px] items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
            </div>
          ) : myPendingProducts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[rgb(var(--store-border-rgb)/0.7)] p-4 text-sm text-muted-foreground">
              {ts("products.emptyMyPending")}
            </div>
          ) : (
            <div className="space-y-3">
              {myPendingProducts.map((product) => (
                <div key={product.id} className="rounded-xl border border-[rgb(var(--store-border-rgb)/0.6)] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{product.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.categoryName} • ${product.price.toLocaleString()} • {ts("products.stockLabel", { count: product.stock })}
                      </p>
                      <p className="text-xs text-muted-foreground">{product.status}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="rounded-xl" onClick={() => startEditingProduct(product)} disabled={!isActiveStore}>
                        {ts("products.edit")}
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => deleteProduct(product.id)}
                        disabled={isDeletingProduct || !isActiveStore}
                      >
                        {ts("products.delete")}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-2xl border border-[rgb(var(--store-border-rgb)/0.7)] p-5">
          <div>
            <h4 className="text-lg font-semibold text-foreground">{ts("products.ownerReviewTitle")}</h4>
            <p className="text-sm text-muted-foreground">{ts("products.ownerReviewDesc")}</p>
          </div>

          {isLoadingOwnerReview ? (
            <div className="flex min-h-[180px] items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
            </div>
          ) : ownerReviewProducts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[rgb(var(--store-border-rgb)/0.7)] p-4 text-sm text-muted-foreground">
              {ts("products.emptyOwnerReview")}
            </div>
          ) : (
            <div className="space-y-3">
              {ownerReviewProducts.map((product) => (
                <div key={product.id} className="rounded-xl border border-[rgb(var(--store-border-rgb)/0.6)] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{product.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.author} • ${product.price.toLocaleString()} • {ts("products.stockLabel", { count: product.stock })}
                      </p>
                      <p className="text-xs text-muted-foreground">{product.status}</p>
                    </div>
                    <Button
                      className="store-accent-button store-accent-button-strong rounded-xl"
                      onClick={() => approveProduct(product.id)}
                      disabled={isApprovingProduct || !isActiveStore}
                    >
                      {ts("products.approve")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
