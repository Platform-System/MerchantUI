"use client"

import * as React from "react"
import { Loader2, Store, AlertTriangle } from "lucide-react"
import { ProfilePreviewCard, Input, Button, Textarea, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@platform-system/design-ui"

export interface StoreProfileSubTabProps {
  myStore: import("@/shared/lib/storefront-normalizers").StoreDetailsResponse | null
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
  isPendingActive: boolean
  coverForm: { url: string }
  avatarForm: { url: string }
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
  ts: (key: string) => string
}

export function StoreProfileSubTab({
  myStore,
  profileForm,
  setProfileForm,
  isProfileLocked,
  isSavingProfile,
  isPendingActive,
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
  ts,
}: StoreProfileSubTabProps) {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false)

  const isActiveStore = myStore?.profile?.status?.toLowerCase() === "active"

  // Helper to reset form to current loaded values on cancel
  const handleCancel = () => {
    setIsUpdateModalOpen(false)
    if (myStore) {
      setProfileForm({
        name: myStore.profile.name || "",
        tagline: myStore.profile.tagline || "",
        description: myStore.profile.description || "",
        location: myStore.profile.location || "",
        responseTime: myStore.profile.responseTime || "",
      })
      setProfileErrors({
        name: false,
        tagline: false,
        location: false,
        responseTime: false,
        description: false,
      })
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="rounded-2xl border border-[rgb(var(--store-border-rgb)/0.7)] p-4">
        <div className="mb-4">
          <p className="text-sm font-semibold text-foreground">{ts("storePreview")}</p>
          <p className="text-xs text-muted-foreground">{ts("storePreviewDesc")}</p>
        </div>

        <ProfilePreviewCard
          coverUrl={coverForm.url}
          avatarUrl={avatarForm.url}
          avatarShape="circle"
          fallbackAvatarIcon={<Store className="h-8 w-8 opacity-40" />}
          title={profileForm.name || myStore?.profile.name}
          subtitle={profileForm.tagline || myStore?.profile.tagline}
          description={profileForm.description || myStore?.profile.description}
          subtitlePlaceholder={ts("taglinePlaceholder")}
          descriptionPlaceholder={ts("descriptionPlaceholder")}
          isUploadingAvatar={isUploadingAvatar}
          isUploadingCover={isUploadingCover}
          onCoverClick={isProfileLocked ? undefined : () => setIsCoverModalOpen(true)}
          onAvatarClick={isProfileLocked ? undefined : () => setIsAvatarModalOpen(true)}
        />
      </div>

      <div className="space-y-4 rounded-2xl border border-[rgb(var(--store-border-rgb)/0.7)] p-5">
        <div>
          <h4 className="text-lg font-semibold text-foreground">{ts("profileSection")}</h4>
          <p className="text-sm text-muted-foreground">{ts("profileSectionDesc")}</p>
        </div>

        {isActiveStore ? (
          <div className="grid gap-6 sm:grid-cols-2 p-1">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{ts("storeName")}</span>
              <p className="text-sm font-medium text-foreground">{profileForm.name || "—"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{ts("tagline")}</span>
              <p className="text-sm font-medium text-foreground">{profileForm.tagline || "—"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{ts("location")}</span>
              <p className="text-sm font-medium text-foreground">{profileForm.location || "—"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{ts("responseTime")}</span>
              <p className="text-sm font-medium text-foreground">{profileForm.responseTime || "—"}</p>
            </div>
            <div className="space-y-1 sm:col-span-2 pt-4 border-t border-[rgb(var(--store-border-rgb)/0.5)]">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{ts("descriptionField")}</span>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed mt-1">
                {profileForm.description || "—"}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-xs text-muted-foreground">{ts("storeName")}</span>
              <Input
                ref={nameRef}
                aria-invalid={profileErrors.name}
                className="h-11 rounded-xl"
                value={profileForm.name}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setProfileForm((current) => ({ ...current, name: event.target.value }))
                  if (event.target.value.trim()) {
                    setProfileErrors((current) => ({ ...current, name: false }))
                  }
                }}
                disabled={isProfileLocked}
              />
            </div>
            <div className="space-y-2">
              <span className="text-xs text-muted-foreground">{ts("tagline")}</span>
              <Input
                ref={taglineRef}
                aria-invalid={profileErrors.tagline}
                className="h-11 rounded-xl"
                value={profileForm.tagline}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setProfileForm((current) => ({ ...current, tagline: event.target.value }))
                  if (event.target.value.trim()) {
                    setProfileErrors((current) => ({ ...current, tagline: false }))
                  }
                }}
                disabled={isProfileLocked}
              />
            </div>
            <div className="space-y-2">
              <span className="text-xs text-muted-foreground">{ts("location")}</span>
              <Input
                ref={locationRef}
                aria-invalid={profileErrors.location}
                className="h-11 rounded-xl"
                value={profileForm.location}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setProfileForm((current) => ({ ...current, location: event.target.value }))
                  if (event.target.value.trim()) {
                    setProfileErrors((current) => ({ ...current, location: false }))
                  }
                }}
                disabled={isProfileLocked}
              />
            </div>
            <div className="space-y-2">
              <span className="text-xs text-muted-foreground">{ts("responseTime")}</span>
              <Input
                ref={responseTimeRef}
                aria-invalid={profileErrors.responseTime}
                className="h-11 rounded-xl"
                value={profileForm.responseTime}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setProfileForm((current) => ({ ...current, responseTime: event.target.value }))
                  if (event.target.value.trim()) {
                    setProfileErrors((current) => ({ ...current, responseTime: false }))
                  }
                }}
                disabled={isProfileLocked}
              />
            </div>
            <div className="space-y-2">
              <span className="text-xs text-muted-foreground">{ts("descriptionField")}</span>
              <Textarea
                ref={descriptionRef}
                aria-invalid={profileErrors.description}
                className="min-h-28 rounded-xl"
                value={profileForm.description}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setProfileForm((current) => ({ ...current, description: event.target.value }))
                  if (event.target.value.trim()) {
                    setProfileErrors((current) => ({ ...current, description: false }))
                  }
                }}
                disabled={isProfileLocked}
              />
            </div>
          </div>
        )}
      </div>

      {!isPendingActive && (
        <div className="flex flex-col items-start gap-1">
          <Button
            className="store-accent-button store-accent-button-strong rounded-xl"
            onClick={isActiveStore ? () => setIsUpdateModalOpen(true) : handleSaveProfile}
            disabled={isSavingProfile || isProfileLocked}
          >
            {isSavingProfile
              ? ts("saving")
              : isActiveStore
                ? "Gửi yêu cầu thay đổi"
                : ts("saveProfile")}
          </Button>
          {isActiveStore && (
            <p className="text-xs text-muted-foreground leading-normal mt-1">
              * Vì gian hàng đã hoạt động, mọi thay đổi hồ sơ sẽ cần được phê duyệt bởi Ban quản trị trước khi chính thức áp dụng.
            </p>
          )}
        </div>
      )}

      {/* Profile Update Request Modal */}
      {isActiveStore && (
        <Dialog open={isUpdateModalOpen} onOpenChange={(open) => { if (!open) handleCancel() }}>
          <DialogContent className="max-w-xl overflow-y-auto max-h-[90vh] ds-glass-panel border border-[rgb(var(--store-border-rgb)/0.7)] rounded-3xl p-6 sm:p-8">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl font-semibold text-foreground">
                Yêu cầu thay đổi hồ sơ gian hàng
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs">
                Chỉnh sửa các trường thông tin cần thiết bên dưới. Nhấn gửi để gửi yêu cầu phê duyệt lên Ban quản trị.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <span className="text-xs font-medium text-foreground">{ts("storeName")}</span>
                <Input
                  aria-invalid={profileErrors.name}
                  className="h-11 rounded-xl"
                  value={profileForm.name}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setProfileForm((current) => ({ ...current, name: event.target.value }))
                    if (event.target.value.trim()) {
                      setProfileErrors((current) => ({ ...current, name: false }))
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-medium text-foreground">{ts("tagline")}</span>
                <Input
                  aria-invalid={profileErrors.tagline}
                  className="h-11 rounded-xl"
                  value={profileForm.tagline}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setProfileForm((current) => ({ ...current, tagline: event.target.value }))
                    if (event.target.value.trim()) {
                      setProfileErrors((current) => ({ ...current, tagline: false }))
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-medium text-foreground">{ts("location")}</span>
                <Input
                  aria-invalid={profileErrors.location}
                  className="h-11 rounded-xl"
                  value={profileForm.location}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setProfileForm((current) => ({ ...current, location: event.target.value }))
                    if (event.target.value.trim()) {
                      setProfileErrors((current) => ({ ...current, location: false }))
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-medium text-foreground">{ts("responseTime")}</span>
                <Input
                  aria-invalid={profileErrors.responseTime}
                  className="h-11 rounded-xl"
                  value={profileForm.responseTime}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setProfileForm((current) => ({ ...current, responseTime: event.target.value }))
                    if (event.target.value.trim()) {
                      setProfileErrors((current) => ({ ...current, responseTime: false }))
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-medium text-foreground">{ts("descriptionField")}</span>
                <Textarea
                  aria-invalid={profileErrors.description}
                  className="min-h-28 rounded-xl"
                  value={profileForm.description}
                  onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                    setProfileForm((current) => ({ ...current, description: event.target.value }))
                    if (event.target.value.trim()) {
                      setProfileErrors((current) => ({ ...current, description: false }))
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={handleCancel} className="rounded-xl px-5">
                Hủy
              </Button>
              <Button
                onClick={() => {
                  handleSaveProfile()
                  setIsUpdateModalOpen(false)
                }}
                disabled={isSavingProfile}
                className="store-accent-button store-accent-button-strong rounded-xl px-5"
              >
                Gửi yêu cầu
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
