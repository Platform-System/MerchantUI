"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Loader2, Store } from "lucide-react"
import { Badge, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, Button } from "@platform-system/design-ui"
import { StoreProfileSubTab } from "./StoreProfileSubTab"
import { StorePoliciesSubTab } from "./StorePoliciesSubTab"
import { StoreMembersSubTab } from "./StoreMembersSubTab"
import { StoreProductsSubTab } from "./StoreProductsSubTab"

export interface StoreTabProps {
  hasStore: boolean
  myStore: import("@/shared/lib/storefront-normalizers").StoreDetailsResponse | null
  myStores: import("@/shared/lib/storefront-normalizers").StoreProfileResponse[]
  selectedStoreId: string | null
  setSelectedStoreId: (id: string | null) => void
  isStoreLoading: boolean
  normalizedStatus: string
  isActiveStore: boolean
  isPendingActive: boolean
  latestRejectionReason: string | null
  storeStatusLabel: string
  storeStatusHint: string
  setActiveTab: (tab: string) => void
  ts: (key: string, values?: Record<string, string | number | Date>) => string
  storeSubTab: string
  setStoreSubTab: React.Dispatch<React.SetStateAction<string>>

  // Profile Props
  profileForm: {
    name: string
    tagline: string
    description: string
    location: string
    responseTime: string
  }
  setProfileForm: React.Dispatch<React.SetStateAction<{
    name: string
    tagline: string
    description: string
    location: string
    responseTime: string
  }>>
  isProfileLocked: boolean
  isSavingProfile: boolean
  coverForm: {
    url: string
    blobName?: string
    containerName?: string
    fileName?: string
    contentType?: string
    size?: number
  }
  avatarForm: {
    url: string
    blobName?: string
    containerName?: string
    fileName?: string
    contentType?: string
    size?: number
  }
  isUploadingAvatar: boolean
  isUploadingCover: boolean
  setIsCoverModalOpen: (open: boolean) => void
  setIsAvatarModalOpen: (open: boolean) => void
  profileErrors: {
    name: boolean
    tagline: boolean
    location: boolean
    responseTime: boolean
    description: boolean
  }
  setProfileErrors: React.Dispatch<React.SetStateAction<{
    name: boolean
    tagline: boolean
    location: boolean
    responseTime: boolean
    description: boolean
  }>>
  nameRef: React.RefObject<HTMLInputElement | null>
  taglineRef: React.RefObject<HTMLInputElement | null>
  locationRef: React.RefObject<HTMLInputElement | null>
  responseTimeRef: React.RefObject<HTMLInputElement | null>
  descriptionRef: React.RefObject<HTMLTextAreaElement | null>
  handleSaveProfile: () => void

  // Policies Props
  policyForm: {
    shippingPolicy: string
    returnPolicy: string
    warrantyPolicy: string
  }
  setPolicyForm: React.Dispatch<React.SetStateAction<{
    shippingPolicy: string
    returnPolicy: string
    warrantyPolicy: string
  }>>
  isPolicyLocked: boolean
  isSavingPolicy: boolean
  hasPendingPolicyUpdate: boolean
  canRequestActivation: boolean
  isRequestingActivation: boolean
  policyErrors: {
    shippingPolicy: boolean
    returnPolicy: boolean
    warrantyPolicy: boolean
  }
  setPolicyErrors: React.Dispatch<React.SetStateAction<{
    shippingPolicy: boolean
    returnPolicy: boolean
    warrantyPolicy: boolean
  }>>
  shippingPolicyRef: React.RefObject<HTMLTextAreaElement | null>
  returnPolicyRef: React.RefObject<HTMLTextAreaElement | null>
  warrantyPolicyRef: React.RefObject<HTMLTextAreaElement | null>
  handlePolicyKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>, fieldName: "shippingPolicy" | "returnPolicy" | "warrantyPolicy") => void
  handleSavePolicy: () => void
  handleRequestActivation: () => void

  // Members Props
  inviteForm: {
    userId: string
    role: 1 | 2
    canPublishProductDirectly: boolean
  }
  setInviteForm: React.Dispatch<React.SetStateAction<{
    userId: string
    role: 1 | 2
    canPublishProductDirectly: boolean
  }>>
  inviteMember: () => void
  isInvitingMember: boolean
  members: import("../../store/queries/store-manage-queries").StoreMemberResponse[]
  isLoadingMembers: boolean
  getMemberRoleLabel: (role: string) => string
  getMemberStatusLabel: (status: string) => string
  savePublishPermission: (userId: string, canPublishDirectly: boolean) => void
  isSavingPublishPermission: boolean

  // Products Props
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
}

export function StoreTab({
  hasStore,
  myStore,
  myStores,
  selectedStoreId,
  setSelectedStoreId,
  isStoreLoading,
  normalizedStatus,
  isActiveStore,
  isPendingActive,
  latestRejectionReason,
  storeStatusLabel,
  storeStatusHint,
  setActiveTab,
  ts,
  storeSubTab,
  setStoreSubTab,

  // Profile
  profileForm,
  setProfileForm,
  isProfileLocked,
  isSavingProfile,
  coverForm,
  avatarForm,
  isUploadingAvatar,
  isUploadingCover,
  setIsCoverModalOpen,
  setIsAvatarModalOpen,
  profileErrors,
  setProfileErrors,
  nameRef,
  taglineRef,
  locationRef,
  responseTimeRef,
  descriptionRef,
  handleSaveProfile,

  // Policies
  policyForm,
  setPolicyForm,
  isPolicyLocked,
  isSavingPolicy,
  hasPendingPolicyUpdate,
  canRequestActivation,
  isRequestingActivation,
  policyErrors,
  setPolicyErrors,
  shippingPolicyRef,
  returnPolicyRef,
  warrantyPolicyRef,
  handlePolicyKeyDown,
  handleSavePolicy,
  handleRequestActivation,

  // Members
  inviteForm,
  setInviteForm,
  inviteMember,
  isInvitingMember,
  members,
  isLoadingMembers,
  getMemberRoleLabel,
  getMemberStatusLabel,
  savePublishPermission,
  isSavingPublishPermission,

  // Products
  productForm,
  setProductForm,
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
}: StoreTabProps) {
  // Filter active/suspended stores
  const activeStores = React.useMemo(() => {
    return myStores.filter(s => {
      const status = s.status?.toLowerCase() || ""
      return status === "active" || status === "suspended"
    })
  }, [myStores])

  // Sync selectedStoreId with activeStores
  React.useEffect(() => {
    if (activeStores.length > 0) {
      const hasSelectedActive = activeStores.some(s => s.id === selectedStoreId)
      if (!hasSelectedActive) {
        setSelectedStoreId(activeStores[0].id)
      }
    }
  }, [activeStores, selectedStoreId, setSelectedStoreId])

  React.useEffect(() => {
    setStoreSubTab("profile")
  }, [selectedStoreId, setStoreSubTab])

  const hasActiveStores = activeStores.length > 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-serif text-2xl font-semibold text-foreground">
            {hasActiveStores && myStore?.profile?.name ? myStore.profile.name : ts("title")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {hasActiveStores && myStore?.profile?.tagline ? myStore.profile.tagline : ts("description")}
          </p>
        </div>
        {hasActiveStores && (
          <Badge
            variant={
              normalizedStatus === "active"
                ? "success"
                : normalizedStatus === "suspended"
                  ? "destructive"
                  : "secondary"
            }
            className="rounded-full px-3 py-1 text-xs font-semibold"
          >
            {storeStatusLabel}
          </Badge>
        )}
      </div>

      {hasActiveStores && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-[rgb(var(--store-border-rgb)/0.7)] p-4 bg-[rgb(var(--store-surface-rgb)/0.4)] backdrop-blur-md">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Store className="h-5 w-5 store-accent-text" />
            <span>Gian hàng vận hành:</span>
          </div>
          {activeStores.length > 1 ? (
            <Select value={selectedStoreId || ""} onValueChange={(val) => setSelectedStoreId(val)}>
              <SelectTrigger className="w-full sm:w-[320px] rounded-xl select-none">
                <SelectValue placeholder="Chọn gian hàng..." />
              </SelectTrigger>
              <SelectContent className="ds-glass-card bg-[rgb(var(--store-surface-strong-rgb)/0.95)]">
                {activeStores.map((store) => (
                  <SelectItem key={store.id} value={store.id} className="cursor-pointer">
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-sm font-semibold text-foreground bg-[rgb(var(--store-surface-rgb)/0.8)] px-3 py-1.5 rounded-xl border border-[rgb(var(--store-border-rgb)/0.5)]">
              {activeStores[0]?.name || myStore?.profile?.name}
            </span>
          )}
        </div>
      )}

      {isStoreLoading ? (
        <div className="flex min-h-[240px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !hasActiveStores ? (
        <Empty className="border border-[rgb(var(--store-border-rgb)/0.7)] bg-transparent px-6 py-12 rounded-3xl min-h-[300px] flex flex-col justify-center items-center">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="store-surface-soft store-muted-text flex h-16 w-16 items-center justify-center rounded-full">
              <Store className="h-8 w-8" />
            </EmptyMedia>
            <EmptyTitle>Chưa có gian hàng vận hành</EmptyTitle>
            <EmptyDescription className="max-w-md">
              Bạn chưa có gian hàng đang hoạt động.
            </EmptyDescription>
          </EmptyHeader>
          <Button 
            className="store-accent-button store-accent-button-strong rounded-xl px-6 mt-4"
            onClick={() => setActiveTab("create-store")}
          >
            Đi đến Tạo gian hàng
          </Button>
        </Empty>
      ) : (
        <>
          {/* Horizontal Sub-tabs Navigation */}
          <div className="flex border-b border-[rgb(var(--store-border-rgb)/0.4)] gap-1 mb-6 overflow-x-auto scrollbar-none shrink-0">
            <button
              type="button"
              onClick={() => setStoreSubTab("profile")}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                storeSubTab === "profile"
                  ? "border-[rgb(var(--store-accent-rgb))] text-[rgb(var(--store-accent-rgb))]"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Hồ sơ gian hàng
            </button>
            <button
              type="button"
              onClick={() => setStoreSubTab("policies")}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                storeSubTab === "policies"
                  ? "border-[rgb(var(--store-accent-rgb))] text-[rgb(var(--store-accent-rgb))]"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Chính sách bán hàng
            </button>
            {isActiveStore && (
              <>
                <button
                  type="button"
                  onClick={() => setStoreSubTab("members")}
                  className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    storeSubTab === "members"
                      ? "border-[rgb(var(--store-accent-rgb))] text-[rgb(var(--store-accent-rgb))]"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Thành viên
                </button>
                <button
                  type="button"
                  onClick={() => setStoreSubTab("products")}
                  className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    storeSubTab === "products"
                      ? "border-[rgb(var(--store-accent-rgb))] text-[rgb(var(--store-accent-rgb))]"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sản phẩm
                </button>
              </>
            )}
          </div>

          {/* Subtab content switches */}
          <motion.div
            key={storeSubTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {storeSubTab === "profile" && (
              <StoreProfileSubTab
                myStore={myStore}
                profileForm={profileForm}
                setProfileForm={setProfileForm}
                isProfileLocked={isProfileLocked}
                isSavingProfile={isSavingProfile}
                isPendingActive={false}
                coverForm={coverForm}
                avatarForm={avatarForm}
                isUploadingAvatar={isUploadingAvatar}
                isUploadingCover={isUploadingCover}
                setIsCoverModalOpen={setIsCoverModalOpen}
                setIsAvatarModalOpen={setIsAvatarModalOpen}
                profileErrors={profileErrors}
                setProfileErrors={setProfileErrors}
                nameRef={nameRef}
                taglineRef={taglineRef}
                locationRef={locationRef}
                responseTimeRef={responseTimeRef}
                descriptionRef={descriptionRef}
                handleSaveProfile={handleSaveProfile}
                ts={ts}
              />
            )}

            {storeSubTab === "policies" && (
              <StorePoliciesSubTab
                isActiveStore={isActiveStore}
                policyForm={policyForm}
                setPolicyForm={setPolicyForm}
                isPolicyLocked={isPolicyLocked}
                isSavingPolicy={isSavingPolicy}
                isPendingActive={false}
                hasPendingPolicyUpdate={hasPendingPolicyUpdate}
                canRequestActivation={canRequestActivation}
                isRequestingActivation={isRequestingActivation}
                policyErrors={policyErrors}
                setPolicyErrors={setPolicyErrors}
                shippingPolicyRef={shippingPolicyRef}
                returnPolicyRef={returnPolicyRef}
                warrantyPolicyRef={warrantyPolicyRef}
                handlePolicyKeyDown={handlePolicyKeyDown}
                handleSavePolicy={handleSavePolicy}
                handleRequestActivation={handleRequestActivation}
                ts={ts}
              />
            )}

            {storeSubTab === "members" && isActiveStore && (
              <StoreMembersSubTab
                inviteForm={inviteForm}
                setInviteForm={setInviteForm}
                inviteMember={inviteMember}
                isInvitingMember={isInvitingMember}
                members={members}
                isLoadingMembers={isLoadingMembers}
                getMemberRoleLabel={getMemberRoleLabel}
                getMemberStatusLabel={getMemberStatusLabel}
                savePublishPermission={savePublishPermission}
                isSavingPublishPermission={isSavingPublishPermission}
                isActiveStore={isActiveStore}
                ts={ts}
              />
            )}

            {storeSubTab === "products" && isActiveStore && (
              <StoreProductsSubTab
                productForm={productForm}
                setProductForm={setProductForm}
                isActiveStore={isActiveStore}
                editingProductId={editingProductId}
                resetProductForm={resetProductForm}
                categories={categories}
                isLoadingCategories={isLoadingCategories}
                saveProduct={saveProduct}
                isSavingProduct={isSavingProduct}
                isLoadingMyPending={isLoadingMyPending}
                myPendingProducts={myPendingProducts}
                startEditingProduct={startEditingProduct}
                deleteProduct={deleteProduct}
                isDeletingProduct={isDeletingProduct}
                isLoadingOwnerReview={isLoadingOwnerReview}
                ownerReviewProducts={ownerReviewProducts}
                approveProduct={approveProduct}
                isApprovingProduct={isApprovingProduct}
                ts={ts}
              />
            )}
          </motion.div>
        </>
      )}
    </div>
  )
}
