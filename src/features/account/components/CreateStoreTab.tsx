"use client"

import * as React from "react"
import { Store, Loader2, Info, AlertCircle, AlertTriangle, ArrowRight, Plus, List } from "lucide-react"
import { Button, Input, Textarea, Badge, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@platform-system/design-ui"
import { StoreProfileSubTab } from "./StoreProfileSubTab"
import { StorePoliciesSubTab } from "./StorePoliciesSubTab"

export interface CreateStoreTabProps {
  hasStore: boolean
  myStore: import("@/shared/lib/storefront-normalizers").StoreDetailsResponse | null
  myStores: import("@/shared/lib/storefront-normalizers").StoreProfileResponse[]
  selectedStoreId: string | null
  setSelectedStoreId: (id: string | null) => void
  createFormData: {
    name: string
    tagline: string
    description: string
    location: string
    responseTime: string
  }
  setCreateFormData: React.Dispatch<React.SetStateAction<{
    name: string
    tagline: string
    description: string
    location: string
    responseTime: string
  }>>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createStoreMutation: any
  handleCreateStoreSubmit: (e: React.FormEvent) => void
  setActiveTab: (tab: string) => void
  tBecome: (key: string, values?: Record<string, unknown>) => string

  // Setup props for Draft/PendingActive stores
  normalizedStatus: string
  isActiveStore: boolean
  isPendingActive: boolean
  latestRejectionReason: string | null
  storeStatusLabel: string
  storeStatusHint: string
  ts: (key: string, values?: Record<string, unknown>) => string

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
  profileErrors: Record<string, string>
  setProfileErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>
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
  policyErrors: Record<string, string>
  setPolicyErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>
  shippingPolicyRef: React.RefObject<HTMLTextAreaElement | null>
  returnPolicyRef: React.RefObject<HTMLTextAreaElement | null>
  warrantyPolicyRef: React.RefObject<HTMLTextAreaElement | null>
  handlePolicyKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  handleSavePolicy: () => void
  handleRequestActivation: () => void
}

export function CreateStoreTab({
  hasStore,
  myStore,
  myStores = [],
  selectedStoreId,
  setSelectedStoreId,
  createFormData,
  setCreateFormData,
  createStoreMutation,
  handleCreateStoreSubmit,
  setActiveTab,
  tBecome,

  // Setup
  normalizedStatus,
  isActiveStore,
  isPendingActive,
  latestRejectionReason,
  storeStatusLabel,
  storeStatusHint,
  ts,

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
  setProfileErrors: _setProfileErrors, // unused, keep to prevent warning
  policyErrors: _policyErrors, // unused, keep to prevent warning
  shippingPolicyRef,
  returnPolicyRef,
  warrantyPolicyRef,
  handlePolicyKeyDown,
  handleSavePolicy,
  handleRequestActivation,
}: CreateStoreTabProps) {
  const [setupSubTab, setSetupSubTab] = React.useState("profile")
  const [isCreatingNew, setIsCreatingNew] = React.useState(true)

  // Filter draft/pendingactive stores
  const draftStores = React.useMemo(() => {
    return myStores.filter(s => {
      const status = s.profile?.status?.toLowerCase() || s.status?.toLowerCase() || ""
      return status === "draft" || status === "pendingactive"
    })
  }, [myStores])

  const [prevDraftStoresLength, setPrevDraftStoresLength] = React.useState(draftStores.length)
  if (draftStores.length !== prevDraftStoresLength) {
    setPrevDraftStoresLength(draftStores.length)
    setIsCreatingNew(draftStores.length === 0)
  }

  // Sync selectedStoreId with draftStores when editing
  React.useEffect(() => {
    if (draftStores.length > 0 && !isCreatingNew) {
      const hasSelectedDraft = draftStores.some(s => s.id === selectedStoreId)
      if (!hasSelectedDraft) {
        setSelectedStoreId(draftStores[0].id)
      }
    }
  }, [draftStores, selectedStoreId, setSelectedStoreId, isCreatingNew])

  // Case 1: Registering a new store
  if (isCreatingNew) {
    return (
      <div className="flex flex-col gap-6 animate-in fade-in duration-300">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h3 className="font-serif text-2xl font-semibold text-foreground">
              {tBecome("formTitle") || "Biểu mẫu đăng ký gian hàng"}
            </h3>
            <p className="text-sm text-muted-foreground">
              Điền thông tin bên dưới để đăng ký thêm một gian hàng mới trong hệ thống.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleCreateStoreSubmit}
          className="flex flex-col gap-5 rounded-2xl border border-[rgb(var(--store-border-rgb)/0.7)] p-6 bg-[rgb(var(--store-surface-rgb)/0.2)] backdrop-blur-md"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">{tBecome("storeName") || "Tên gian hàng"}</label>
              <Input 
                required 
                placeholder={tBecome("storeNamePlaceholder") || "Xưởng Nghệ Thuật Nyxoris"} 
                value={createFormData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateFormData(prev => ({ ...prev, name: e.target.value }))}
                disabled={createStoreMutation.isPending}
                className="rounded-xl border-[rgb(var(--store-border-rgb)/0.8)] focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">{tBecome("tagline") || "Lĩnh vực"}</label>
              <Input 
                required 
                placeholder={tBecome("taglinePlaceholder") || "Đồ thủ công cao cấp, Trang sức nghệ thuật..."} 
                value={createFormData.tagline}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateFormData(prev => ({ ...prev, tagline: e.target.value }))}
                disabled={createStoreMutation.isPending}
                className="rounded-xl border-[rgb(var(--store-border-rgb)/0.8)] focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">{tBecome("shortDescription") || "Giới thiệu ngắn gọn"}</label>
            <Textarea
              required
              placeholder={tBecome("shortDescriptionPlaceholder") || "Kể về hành trình sáng tạo những tuyệt tác của bạn tại Nyxoris..."}
              className="min-h-[100px] rounded-xl border-[rgb(var(--store-border-rgb)/0.8)] focus:ring-1 focus:ring-primary"
              value={createFormData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCreateFormData(prev => ({ ...prev, description: e.target.value }))}
              disabled={createStoreMutation.isPending}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">{tBecome("location") || "Địa điểm / Khu vực"}</label>
              <Input 
                required 
                placeholder={tBecome("locationPlaceholder") || "Hà Nội, Việt Nam"} 
                value={createFormData.location}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateFormData(prev => ({ ...prev, location: e.target.value }))}
                disabled={createStoreMutation.isPending}
                className="rounded-xl border-[rgb(var(--store-border-rgb)/0.8)] focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">{tBecome("responseTime") || "Thời gian phản hồi"}</label>
              <Input 
                required 
                placeholder={tBecome("responseTimePlaceholder") || "Trong vòng vài giờ"} 
                value={createFormData.responseTime}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateFormData(prev => ({ ...prev, responseTime: e.target.value }))}
                disabled={createStoreMutation.isPending}
                className="rounded-xl border-[rgb(var(--store-border-rgb)/0.8)] focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="mt-2 rounded-xl bg-[rgb(var(--store-accent-rgb)/0.05)] p-4 text-xs text-muted-foreground leading-relaxed border border-[rgb(var(--store-accent-rgb)/0.1)]">
            <p><strong>{tBecome("trustNoteTitle") || "Thông tin xác thực:"}</strong> {tBecome("trustNote") || "Hệ thống sẽ tự động liên kết tài khoản của bạn với tư cách là Chủ sở hữu (Owner). Các chính sách vận chuyển và đổi trả có thể được cập nhật sau khi gian hàng được kích hoạt."}</p>
          </div>

          <Button 
            type="submit" 
            disabled={createStoreMutation.isPending}
            className="store-accent-button store-accent-button-strong h-12 mt-2 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            {createStoreMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {tBecome("processing") || "Đang xử lý..."}
              </>
            ) : (
              tBecome("submit") || "Gửi đăng ký gian hàng"
            )}
          </Button>
        </form>
      </div>
    )
  }

  // Case 2: Configuring an existing draft/pending store
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-serif text-2xl font-semibold text-foreground">Thiết lập gian hàng của bạn</h3>
          <p className="text-sm text-muted-foreground">Hoàn tất cấu hình hồ sơ và chính sách để kích hoạt gian hàng.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-semibold">
            {storeStatusLabel}
          </Badge>
        </div>
      </div>

      {/* Status Alerts */}
      <div className={`flex items-start gap-3 rounded-2xl border p-4 text-sm mb-2 ${
        normalizedStatus === "pendingactive"
          ? "border-sky-500/20 bg-sky-500/5 text-sky-700 dark:text-sky-400"
          : latestRejectionReason
            ? "border-rose-500/20 bg-rose-500/5 text-rose-700 dark:text-rose-400"
            : "border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400"
      }`}>
        {normalizedStatus === "pendingactive" ? (
          <Info className="h-5 w-5 shrink-0 mt-0" />
        ) : latestRejectionReason ? (
          <AlertCircle className="h-5 w-5 shrink-0 mt-0" />
        ) : (
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0" />
        )}
        <div className="flex-1">
          <p className="font-semibold text-foreground">
            {normalizedStatus === "pendingactive"
              ? ts("statusAlertTitlePendingActive")
              : latestRejectionReason
                ? "Yêu cầu kích hoạt bị từ chối"
                : ts("statusAlertTitleDraft")}
          </p>
          {latestRejectionReason ? (
            <div className="mt-1 opacity-90 leading-relaxed space-y-1">
              <p>
                <strong>Lý do từ chối:</strong> {latestRejectionReason}
              </p>
              <p className="text-xs opacity-75">
                Vui lòng chỉnh sửa lại thông tin hồ sơ/chính sách và gửi yêu cầu kích hoạt lại.
              </p>
            </div>
          ) : (
            <p className="mt-1 opacity-90 leading-relaxed">{storeStatusHint}</p>
          )}
        </div>
      </div>

      {/* Horizontal Navigation for Setup Sub-tabs */}
      <div className="flex border-b border-[rgb(var(--store-border-rgb)/0.4)] gap-1 mb-4 overflow-x-auto scrollbar-none shrink-0">
        <button
          type="button"
          onClick={() => setSetupSubTab("profile")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            setupSubTab === "profile"
              ? "border-[rgb(var(--store-accent-rgb))] text-[rgb(var(--store-accent-rgb))]"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Hồ sơ gian hàng
        </button>
        <button
          type="button"
          onClick={() => setSetupSubTab("policies")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            setupSubTab === "policies"
              ? "border-[rgb(var(--store-accent-rgb))] text-[rgb(var(--store-accent-rgb))]"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Chính sách bán hàng
        </button>
      </div>

      {/* Setup tab content */}
      {setupSubTab === "profile" && (
        <StoreProfileSubTab
          myStore={myStore}
          profileForm={profileForm}
          setProfileForm={setProfileForm}
          isProfileLocked={isProfileLocked}
          isSavingProfile={isSavingProfile}
          isPendingActive={isPendingActive}
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

      {setupSubTab === "policies" && (
        <StorePoliciesSubTab
          isActiveStore={isActiveStore}
          policyForm={policyForm}
          setPolicyForm={setPolicyForm}
          isPolicyLocked={isPolicyLocked}
          isSavingPolicy={isSavingPolicy}
          isPendingActive={isPendingActive}
          hasPendingPolicyUpdate={hasPendingPolicyUpdate}
          canRequestActivation={canRequestActivation}
          isRequestingActivation={isRequestingActivation}
          policyErrors={profileErrors} // Pass dummy policyErrors or use profileErrors if shared
          setPolicyErrors={setProfileErrors}
          shippingPolicyRef={shippingPolicyRef}
          returnPolicyRef={returnPolicyRef}
          warrantyPolicyRef={warrantyPolicyRef}
          handlePolicyKeyDown={handlePolicyKeyDown}
          handleSavePolicy={handleSavePolicy}
          handleRequestActivation={handleRequestActivation}
          ts={ts}
        />
      )}

      {canRequestActivation && (
        <div className="sticky bottom-2 z-20 flex justify-end mt-6 pointer-events-none">
          <Button
            className="store-accent-button store-accent-button-strong h-10 rounded-full px-6 font-semibold shadow-lg shadow-[rgb(var(--store-accent-rgb)/0.25)] pointer-events-auto"
            onClick={handleRequestActivation}
            disabled={isRequestingActivation}
          >
            {isRequestingActivation ? ts("requesting") : ts("requestActivation")}
          </Button>
        </div>
      )}
    </div>
  )
}
