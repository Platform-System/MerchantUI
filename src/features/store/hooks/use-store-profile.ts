import * as React from "react"
import { useMutation } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import {
  submitStoreProfileUpdateRequest,
  updateMyStoreProfile,
  setMyStoreImage,
  uploadMyStoreImage,
} from "../queries/store-manage-queries"
import type { StoreUpdateRequestResponse } from "../queries/store-manage-queries"
import type { StoreDetailsResponse } from "@/shared/lib/storefront-normalizers"

export interface UseStoreProfileProps {
  selectedStoreId: string | null
  myStore: StoreDetailsResponse | null
  isActiveStore: boolean
  pendingProfileUpdate: StoreUpdateRequestResponse | null
  refreshStore: () => Promise<void>
}

export function useStoreProfile({
  selectedStoreId,
  myStore,
  isActiveStore,
  pendingProfileUpdate,
  refreshStore,
}: UseStoreProfileProps) {
  const t = useTranslations("Account.store")

  const baseProfileForm = React.useMemo(() => ({
    name: pendingProfileUpdate?.name ?? myStore?.profile.name ?? "",
    tagline: pendingProfileUpdate?.tagline ?? myStore?.profile.tagline ?? "",
    description: pendingProfileUpdate?.description ?? myStore?.profile.description ?? "",
    location: pendingProfileUpdate?.location ?? myStore?.profile.location ?? "",
    responseTime: pendingProfileUpdate?.responseTime ?? myStore?.profile.responseTime ?? "",
  }), [myStore, pendingProfileUpdate])

  const baseAvatarForm = React.useMemo(() => ({
    blobName: "",
    containerName: "",
    fileName: "",
    contentType: "",
    size: 0,
    url: myStore?.profile.avatar?.url || "",
  }), [myStore])

  const baseCoverForm = React.useMemo(() => ({
    blobName: "",
    containerName: "",
    fileName: "",
    contentType: "",
    size: 0,
    url: myStore?.profile.cover?.url || "",
  }), [myStore])

  const [profileDraft, setProfileDraft] = React.useState<{ storeId: string | null; form: typeof baseProfileForm } | null>(null)
  const [avatarDraft, setAvatarDraft] = React.useState<{ storeId: string | null; form: typeof baseAvatarForm } | null>(null)
  const [coverDraft, setCoverDraft] = React.useState<{ storeId: string | null; form: typeof baseCoverForm } | null>(null)

  const profileForm = profileDraft?.storeId === selectedStoreId ? profileDraft.form : baseProfileForm
  const avatarForm = avatarDraft?.storeId === selectedStoreId ? avatarDraft.form : baseAvatarForm
  const coverForm = coverDraft?.storeId === selectedStoreId ? coverDraft.form : baseCoverForm

  const setProfileForm: React.Dispatch<React.SetStateAction<typeof baseProfileForm>> = React.useCallback((value) => {
    setProfileDraft((current) => {
      const currentForm = current?.storeId === selectedStoreId ? current.form : baseProfileForm
      const nextForm = typeof value === "function" ? value(currentForm) : value

      return {
        storeId: selectedStoreId,
        form: nextForm,
      }
    })
  }, [baseProfileForm, selectedStoreId])

  const setAvatarForm: React.Dispatch<React.SetStateAction<typeof baseAvatarForm>> = React.useCallback((value) => {
    setAvatarDraft((current) => {
      const currentForm = current?.storeId === selectedStoreId ? current.form : baseAvatarForm
      const nextForm = typeof value === "function" ? value(currentForm) : value

      return {
        storeId: selectedStoreId,
        form: nextForm,
      }
    })
  }, [baseAvatarForm, selectedStoreId])

  const setCoverForm: React.Dispatch<React.SetStateAction<typeof baseCoverForm>> = React.useCallback((value) => {
    setCoverDraft((current) => {
      const currentForm = current?.storeId === selectedStoreId ? current.form : baseCoverForm
      const nextForm = typeof value === "function" ? value(currentForm) : value

      return {
        storeId: selectedStoreId,
        form: nextForm,
      }
    })
  }, [baseCoverForm, selectedStoreId])

  const updateProfileMutation = useMutation({
    mutationFn: ({ storeId, payload }: { storeId: string; payload: typeof profileForm }) =>
      isActiveStore ? submitStoreProfileUpdateRequest(storeId, payload) : updateMyStoreProfile(storeId, payload),
    onSuccess: async (result) => {
      if (result.success) {
        toast.success(isActiveStore ? t("profileUpdateRequested") || "Yêu cầu thay đổi thông tin đã được gửi." : t("profileSaved"))
        setProfileDraft(null)
        await refreshStore()
      } else {
        toast.error(result.message || t("requestFailed"))
      }
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || t("requestFailed"))
    },
  })

  const setAvatarMutation = useMutation({
    mutationFn: ({ storeId, payload }: { storeId: string; payload: typeof avatarForm }) => setMyStoreImage(storeId, "avatar", payload),
    onSuccess: async (result) => {
      if (result.success) {
        toast.success(t("avatarSaved"))
        setAvatarDraft(null)
        await refreshStore()
      } else {
        toast.error(result.message || t("requestFailed"))
      }
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || t("requestFailed"))
    },
  })

  const setCoverMutation = useMutation({
    mutationFn: ({ storeId, payload }: { storeId: string; payload: typeof coverForm }) => setMyStoreImage(storeId, "cover", payload),
    onSuccess: async (result) => {
      if (result.success) {
        toast.success(t("coverSaved"))
        setCoverDraft(null)
        await refreshStore()
      } else {
        toast.error(result.message || t("requestFailed"))
      }
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || t("requestFailed"))
    },
  })

  const uploadImageMutation = useMutation({
    mutationFn: ({ storeId, type, file, altText }: { storeId: string; type: "avatar" | "cover"; file: File; altText: string }) =>
      uploadMyStoreImage(storeId, type, file, altText),
    onSuccess: async (result, variables) => {
      const response = result as { success?: boolean; url?: string; message?: string }
      if (response.success || response.url) {
        toast.success(variables.type === "avatar" ? t("avatarSaved") : t("coverSaved"))
        if (variables.type === "avatar") {
          setAvatarDraft(null)
        } else {
          setCoverDraft(null)
        }
        await refreshStore()
      } else {
        toast.error(response.message || t("requestFailed"))
      }
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || t("requestFailed"))
    },
  })

  const saveProfile = () => {
    if (selectedStoreId) {
      updateProfileMutation.mutate({ storeId: selectedStoreId, payload: profileForm })
    }
  }

  const saveAvatar = () => {
    if (selectedStoreId) {
      setAvatarMutation.mutate({ storeId: selectedStoreId, payload: avatarForm })
    }
  }

  const saveCover = () => {
    if (selectedStoreId) {
      setCoverMutation.mutate({ storeId: selectedStoreId, payload: coverForm })
    }
  }

  const uploadImage = (type: "avatar" | "cover", file: File) => {
    if (selectedStoreId) {
      const storeName = myStore?.profile.name || "Store"
      const altText = `${storeName} ${type}`
      uploadImageMutation.mutate({ storeId: selectedStoreId, type, file, altText })
    }
  }

  return {
    profileForm,
    setProfileForm,
    avatarForm,
    setAvatarForm,
    coverForm,
    setCoverForm,
    saveProfile,
    saveAvatar,
    saveCover,
    uploadImage,
    updateProfileMutation,
    isSavingProfile: updateProfileMutation.isPending,
    isSavingAvatar: setAvatarMutation.isPending,
    isSavingCover: setCoverMutation.isPending,
    isUploadingImage: uploadImageMutation.isPending,
    isUploadingAvatar: uploadImageMutation.isPending && uploadImageMutation.variables?.type === "avatar",
    isUploadingCover: uploadImageMutation.isPending && uploadImageMutation.variables?.type === "cover",
  }
}
