"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { Button } from "@platform-system/design-ui/components/button"
import { Input } from "@platform-system/design-ui/components/input"
import { Settings, Key } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { useAccount } from "../hooks/use-account"
import { ENV } from "@/shared/config/env"
import { toast } from "sonner"
import { apiClient } from "@/shared/api/api-client"
import { Result } from "@/types/api"
import { ImageCropper } from "@platform-system/design-ui/components/image-cropper"
import { ProfileHeader } from "@platform-system/design-ui/components/profile-header"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@platform-system/design-ui/components/select"
import { Textarea } from "@platform-system/design-ui/components/textarea"
import { DatePicker } from "@platform-system/design-ui/components/date-picker"
import { cn } from "@platform-system/design-ui/lib/cn"

function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(",")
  const mime = arr[0].match(/:(.*?);/)![1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

interface EditableFieldWrapperProps {
  children: React.ReactNode
  onDoubleClick: () => void
}

function EditableFieldWrapper({ children, onDoubleClick }: EditableFieldWrapperProps) {
  const t = useTranslations("Account")

  return (
    <div
      onDoubleClick={onDoubleClick}
      className="group relative cursor-pointer rounded-xl transition-all duration-200 hover:shadow-[0_0_15px_rgb(var(--store-accent-rgb)/0.08)]"
    >
      {children}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none text-muted-foreground group-hover:text-[rgb(var(--store-accent-rgb))]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-pencil"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
        <span className="text-[10px] font-medium hidden sm:inline opacity-70">{t("doubleClickToEdit")}</span>
      </div>
    </div>
  )
}

export function ProfileScreen() {
  const t = useTranslations("Account")

  const {
    profile,
    identityId,
    refetchProfile,
    isEditingProfile,
    setIsEditingProfile,
    updateProfileField,
    resetProfile,
  } = useAccount()

  const [activeEditField, setActiveEditField] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (isEditingProfile && activeEditField) {
      // Delay slightly to ensure inputs are fully mounted in DOM
      const timer = setTimeout(() => {
        const element = document.getElementById(`${activeEditField}-input`)
        if (element) {
          element.focus()
          if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
            const len = element.value.length
            element.setSelectionRange(len, len)
          }
        }
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isEditingProfile, activeEditField])

  const handleDoubleClickField = (fieldName: string) => {
    if (!isEditingProfile) {
      setIsEditingProfile(true)
      setActiveEditField(fieldName)
    }
  }

  const parseDate = (dateStr?: string) => {
    if (!dateStr) return undefined
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? undefined : d
  }

  const handleDateChange = (date?: Date) => {
    if (!date) {
      updateProfileField("dateOfBirth", "")
      return
    }
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    updateProfileField("dateOfBirth", `${year}-${month}-${day}`)
  }

  const [isAvatarModalOpen, setIsAvatarModalOpen] = React.useState(false)
  const [initialCropState, setInitialCropState] = React.useState<{ zoom: number; x: number; y: number } | null>(null)
  const [currentOriginalImageUrl, setCurrentOriginalImageUrl] = React.useState<string | null>(null)

  const [isCoverModalOpen, setIsCoverModalOpen] = React.useState(false)
  const [initialCoverCropState, setInitialCoverCropState] = React.useState<{ zoom: number; x: number; y: number } | null>(null)
  const [currentOriginalCoverImageUrl, setCurrentOriginalCoverImageUrl] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (typeof window !== "undefined" && identityId) {
      const original = localStorage.getItem("user_avatar_original_" + identityId)
      const stateStr = localStorage.getItem("user_avatar_crop_state_" + identityId)
      const originalCover = localStorage.getItem("user_cover_original_" + identityId)
      const coverStateStr = localStorage.getItem("user_cover_crop_state_" + identityId)

      setTimeout(() => {
        setCurrentOriginalImageUrl(original)

        if (stateStr) {
          try {
            setInitialCropState(JSON.parse(stateStr))
          } catch (e) {
            console.error("Loi khi doc crop state tu localStorage:", e)
          }
        } else {
          setInitialCropState(null)
        }

        setCurrentOriginalCoverImageUrl(originalCover)

        if (coverStateStr) {
          try {
            setInitialCoverCropState(JSON.parse(coverStateStr))
          } catch (e) {
            console.error("Loi khi doc cover crop state tu localStorage:", e)
          }
        } else {
          setInitialCoverCropState(null)
        }
      }, 0)
    }
  }, [identityId, isAvatarModalOpen, isCoverModalOpen])

  const handleToggleEdit = async () => {
    if (isEditingProfile) {
      const trimmedDisplayName = profile.displayName?.trim() || ""
      const trimmedBio = profile.bio?.trim() || ""
      const trimmedLocation = profile.location?.trim() || ""
      const trimmedGender = profile.gender || ""
      const dob = profile.dateOfBirth || null
      const trimmedPhone = profile.phoneNumber?.trim() || ""



      try {
        await apiClient.put("/api/identity/users/me/profile", {
          displayName: trimmedDisplayName,
          bio: trimmedBio,
          location: trimmedLocation,
          gender: trimmedGender,
          dateOfBirth: dob,
          phoneNumber: trimmedPhone,
        })
        toast.success(t("updateProfileSuccess"))
        refetchProfile()
      } catch (err) {
        console.error(err)
        toast.error(t("updateProfileError"))
        return
      }
    }

    setIsEditingProfile((current) => !current)
  }

  const handleCancelEdit = () => {
    resetProfile()
    setIsEditingProfile(false)
  }

  // Keycloak account console URL
  const keycloakConsoleUrl = `${ENV.KEYCLOAK_URL}/realms/${ENV.KEYCLOAK_REALM}/account`

  return (
    <div className="relative z-10 min-h-screen bg-background pt-24 pb-12 text-foreground">
      <div className="mx-auto max-w-none px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold sm:text-4xl">{t("systemProfile")}</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {t("systemProfileDesc")}
          </p>
        </div>

        <div className="ds-glass-panel rounded-3xl p-6 shadow-2xl sm:p-8">
          <div className="flex flex-col">
            <ProfileHeader
              avatarUrl={profile.avatar}
              coverUrl={profile.cover}
              name={profile.displayName || profile.name}
              joinedDate={profile.joinedDate}
              joinedDateLabel={t("joinedSince")}
              onAvatarClick={() => setIsAvatarModalOpen(true)}
              onCoverClick={() => setIsCoverModalOpen(true)}
              actions={
                <>
                  <Button
                    variant="outline"
                    className="rounded-xl border-dashed h-9 text-xs md:text-sm md:h-10 flex-none"
                    asChild
                  >
                    <a href={keycloakConsoleUrl} target="_blank" rel="noopener noreferrer">
                      <Key className="h-4 w-4" />
                      <span className="hidden lg:inline">{t("securityAndChangePassword")}</span>
                      <span className="inline lg:hidden">{t("securityAndChangePasswordShort")}</span>
                    </a>
                  </Button>
                  {isEditingProfile && (
                    <Button
                      variant="outline"
                      className="rounded-xl font-semibold h-9 text-xs md:text-sm md:h-10 flex-none border-destructive text-destructive hover:bg-destructive/10"
                      onClick={handleCancelEdit}
                    >
                      {t("cancel")}
                    </Button>
                  )}
                  <Button
                    variant={isEditingProfile ? "default" : "default"}
                    className="rounded-xl font-semibold h-9 text-xs md:text-sm md:h-10 flex-none"
                    onClick={handleToggleEdit}
                  >
                    <Settings className="h-4 w-4" />
                    {isEditingProfile ? t("save") : t("editProfile")}
                  </Button>
                </>
              }
            />

            {/* Section Title */}
            <div className="mb-6">
              <h3 className="font-serif text-xl font-semibold text-foreground">{t("personalInfo")}</h3>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Username - Read-only */}
              <div className="flex flex-col gap-2">
                <span className="text-xs text-muted-foreground">{t("username")}</span>
                <span className="store-surface-soft rounded-xl border px-3 h-11 flex items-center text-sm font-medium opacity-75 bg-[rgb(var(--store-surface-soft-rgb)/0.5)]">
                  {profile.name}
                </span>
              </div>

              {/* Email - Read-only */}
              <div className="flex flex-col gap-2">
                <span className="text-xs text-muted-foreground">{t("email")}</span>
                <span className="store-surface-soft rounded-xl border px-3 h-11 flex items-center text-sm font-medium opacity-75 bg-[rgb(var(--store-surface-soft-rgb)/0.5)]">
                  {profile.email}
                </span>
              </div>

              {/* Họ - Read-only */}
              <div className="flex flex-col gap-2">
                <span className="text-xs text-muted-foreground">{t("lastName")}</span>
                <span className={cn(
                  "store-surface-soft rounded-xl border px-3 h-11 flex items-center text-sm font-medium opacity-75 bg-[rgb(var(--store-surface-soft-rgb)/0.5)]",
                  !profile.lastName && "text-muted-foreground"
                )}>
                  {profile.lastName || "—"}
                </span>
              </div>

              {/* Tên - Read-only */}
              <div className="flex flex-col gap-2">
                <span className="text-xs text-muted-foreground">{t("firstName")}</span>
                <span className={cn(
                  "store-surface-soft rounded-xl border px-3 h-11 flex items-center text-sm font-medium opacity-75 bg-[rgb(var(--store-surface-soft-rgb)/0.5)]",
                  !profile.firstName && "text-muted-foreground"
                )}>
                  {profile.firstName || "—"}
                </span>
              </div>

              {/* Display Name - Editable */}
              <div className="flex flex-col gap-2">
                <span className="text-xs text-muted-foreground">{t("displayName")}</span>
                {isEditingProfile ? (
                  <Input
                    id="displayName-input"
                    className="h-11 rounded-xl"
                    value={profile.displayName || ""}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => updateProfileField("displayName", event.target.value)}
                    placeholder={t("displayNamePlaceholder")}
                    maxLength={100}
                  />
                ) : (
                  <EditableFieldWrapper onDoubleClick={() => handleDoubleClickField("displayName")}>
                    <span className={cn(
                      "store-surface-soft rounded-xl border pl-3 pr-10 sm:pr-24 h-11 flex items-center text-sm font-medium",
                      !profile.displayName && "text-muted-foreground"
                    )}>
                      {profile.displayName || "—"}
                    </span>
                  </EditableFieldWrapper>
                )}
              </div>

              {/* Phone Number - Editable */}
              <div className="flex flex-col gap-2">
                <span className="text-xs text-muted-foreground">{t("phoneNumber")}</span>
                {isEditingProfile ? (
                  <Input
                    id="phoneNumber-input"
                    className="h-11 rounded-xl"
                    value={profile.phoneNumber || ""}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      const val = event.target.value.replace(/[^0-9+\-\s()]/g, '')
                      updateProfileField("phoneNumber", val)
                    }}
                    placeholder={t("phoneNumberPlaceholder")}
                    maxLength={30}
                  />
                ) : (
                  <EditableFieldWrapper onDoubleClick={() => handleDoubleClickField("phoneNumber")}>
                    <span className={cn(
                      "store-surface-soft rounded-xl border pl-3 pr-10 sm:pr-24 h-11 flex items-center text-sm font-medium",
                      !profile.phoneNumber && "text-muted-foreground"
                    )}>
                      {profile.phoneNumber || "—"}
                    </span>
                  </EditableFieldWrapper>
                )}
              </div>

              {/* Gender - Editable */}
              <div className="flex flex-col gap-2">
                <span className="text-xs text-muted-foreground">{t("gender")}</span>
                {isEditingProfile ? (
                  <Select
                    value={profile.gender || undefined}
                    onValueChange={(val) => updateProfileField("gender", val)}
                  >
                    <SelectTrigger id="gender-input" className="!h-11 w-full rounded-xl border border-border bg-[rgb(var(--store-surface-rgb)/0.84)] px-3 py-2 text-sm">
                      <SelectValue placeholder={t("genderPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">{t("genderMale")}</SelectItem>
                      <SelectItem value="Female">{t("genderFemale")}</SelectItem>
                      <SelectItem value="Other">{t("genderOther")}</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <EditableFieldWrapper onDoubleClick={() => handleDoubleClickField("gender")}>
                    <span className={cn(
                      "store-surface-soft rounded-xl border pl-3 pr-10 sm:pr-24 h-11 flex items-center text-sm font-medium",
                      !profile.gender && "text-muted-foreground"
                    )}>
                      {profile.gender === "Male" ? t("genderMale") : profile.gender === "Female" ? t("genderFemale") : profile.gender === "Other" ? t("genderOther") : "—"}
                    </span>
                  </EditableFieldWrapper>
                )}
              </div>

              {/* Date of Birth - Editable */}
              <div className="flex flex-col gap-2">
                <span className="text-xs text-muted-foreground">{t("dateOfBirth")}</span>
                {isEditingProfile ? (
                  <DatePicker
                    id="dateOfBirth-input"
                    date={parseDate(profile.dateOfBirth)}
                    setDate={handleDateChange}
                    className="h-11 rounded-xl w-full"
                    placeholder={t("dateOfBirthPlaceholder")}
                    disabled={{ after: new Date() }}
                  />
                ) : (
                  <EditableFieldWrapper onDoubleClick={() => handleDoubleClickField("dateOfBirth")}>
                    <span className={cn(
                      "store-surface-soft rounded-xl border pl-3 pr-10 sm:pr-24 h-11 flex items-center text-sm font-medium",
                      !profile.dateOfBirth && "text-muted-foreground"
                    )}>
                      {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString("vi-VN") : "—"}
                    </span>
                  </EditableFieldWrapper>
                )}
              </div>

              {/* Location - Editable */}
              <div className="flex flex-col gap-2">
                <span className="text-xs text-muted-foreground">{t("location")}</span>
                {isEditingProfile ? (
                  <Input
                    id="location-input"
                    className="h-11 rounded-xl"
                    value={profile.location || ""}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => updateProfileField("location", event.target.value)}
                    placeholder={t("locationPlaceholder")}
                    maxLength={200}
                  />
                ) : (
                  <EditableFieldWrapper onDoubleClick={() => handleDoubleClickField("location")}>
                    <span className={cn(
                      "store-surface-soft rounded-xl border pl-3 pr-10 sm:pr-24 h-11 flex items-center text-sm font-medium",
                      !profile.location && "text-muted-foreground"
                    )}>
                      {profile.location || "—"}
                    </span>
                  </EditableFieldWrapper>
                )}
              </div>

              {/* Bio - Editable */}
              <div className="flex flex-col gap-2 sm:col-span-2">
                <span className="text-xs text-muted-foreground">{t("bio")}</span>
                {isEditingProfile ? (
                  <Textarea
                    id="bio-input"
                    className="min-h-[80px] rounded-xl border border-border bg-[rgb(var(--store-surface-rgb)/0.84)] px-3 py-2 text-sm"
                    value={profile.bio || ""}
                    onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => updateProfileField("bio", event.target.value)}
                    placeholder={t("bioPlaceholder")}
                    maxLength={500}
                  />
                ) : (
                  <EditableFieldWrapper onDoubleClick={() => handleDoubleClickField("bio")}>
                    <span className={cn(
                      "store-surface-soft rounded-xl border pl-3 pr-10 sm:pr-24 py-3 text-sm font-medium min-h-[48px] block whitespace-pre-wrap",
                      !profile.bio && "text-muted-foreground"
                    )}>
                      {profile.bio || "—"}
                    </span>
                  </EditableFieldWrapper>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ImageCropper
        open={isAvatarModalOpen}
        onOpenChange={setIsAvatarModalOpen}
        currentImageUrl={profile.avatar}
        currentOriginalImageUrl={currentOriginalImageUrl}
        initialCropState={initialCropState}
        title={t("updateAvatarTitle")}
        circular={true}
        outputSize={1024}
        onSave={async (croppedBase64, originalBase64, cropState) => {
          if (!identityId) return
          try {
            const file = dataURLtoFile(croppedBase64, "avatar.jpg")
            const formData = new FormData()
            formData.append("altText", "Profile Avatar")
            formData.append("file", file)

            await apiClient.post(`/api/identity/users/me/images/avatar`, formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            })

            localStorage.setItem("user_avatar_" + identityId, croppedBase64)
            if (originalBase64) {
              localStorage.setItem("user_avatar_original_" + identityId, originalBase64)
              setCurrentOriginalImageUrl(originalBase64)
            }
            if (cropState) {
              localStorage.setItem("user_avatar_crop_state_" + identityId, JSON.stringify(cropState))
              setInitialCropState(cropState)
            }
            toast.success(t("updateAvatarSuccess"))
            refetchProfile()
          } catch (err) {
            console.error(err)
            toast.error(t("updateAvatarError"))
          }
        }}
      />

      <ImageCropper
        open={isCoverModalOpen}
        onOpenChange={setIsCoverModalOpen}
        currentImageUrl={profile.cover}
        currentOriginalImageUrl={currentOriginalCoverImageUrl}
        initialCropState={initialCoverCropState}
        title={t("updateCoverTitle")}
        circular={false}
        aspectRatio={4} // 4:1 aspect ratio
        outputSize={3072}
        onSave={async (croppedBase64, originalBase64, cropState) => {
          if (!identityId) return
          try {
            const file = dataURLtoFile(croppedBase64, "cover.jpg")
            const formData = new FormData()
            formData.append("altText", "Profile Cover Banner")
            formData.append("file", file)

            await apiClient.post(`/api/identity/users/me/images/cover`, formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            })

            localStorage.setItem("user_cover_" + identityId, croppedBase64)
            if (originalBase64) {
              localStorage.setItem("user_cover_original_" + identityId, originalBase64)
              setCurrentOriginalCoverImageUrl(originalBase64)
            }
            if (cropState) {
              localStorage.setItem("user_cover_crop_state_" + identityId, JSON.stringify(cropState))
              setInitialCoverCropState(cropState)
            }
            toast.success(t("updateCoverSuccess"))
            refetchProfile()
          } catch (err) {
            console.error(err)
            toast.error(t("updateCoverError"))
          }
        }}
      />

      {isEditingProfile && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-background/80 backdrop-blur-md border border-border/80 shadow-2xl rounded-2xl px-4 py-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <span className="text-xs font-medium text-muted-foreground mr-2 hidden sm:inline">{t("youAreEditingProfile")}</span>
          <Button
            variant="outline"
            className="rounded-xl h-9 text-xs md:text-sm border-destructive text-destructive hover:bg-destructive/10"
            onClick={handleCancelEdit}
          >
            {t("cancel")}
          </Button>
          <Button
            variant="default"
            className="rounded-xl h-9 text-xs md:text-sm font-semibold"
            onClick={handleToggleEdit}
          >
            {t("saveChanges")}
          </Button>
        </div>
      )}
    </div>
  )
}
