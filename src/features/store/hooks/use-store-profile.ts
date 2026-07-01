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

  const [profileForm, setProfileForm] = React.useState({
    name: "",
    tagline: "",
    description: "",
    location: "",
    responseTime: "",
  })

  const [avatarForm, setAvatarForm] = React.useState({
    blobName: "",
    containerName: "",
    fileName: "",
    contentType: "",
    size: 0,
    url: "",
  })

  const [coverForm, setCoverForm] = React.useState({
    blobName: "",
    containerName: "",
    fileName: "",
    contentType: "",
    size: 0,
    url: "",
  })

  const [prevStoreAndPending, setPrevStoreAndPending] = React.useState({ myStore, pendingProfileUpdate })
  if (prevStoreAndPending.myStore !== myStore || prevStoreAndPending.pendingProfileUpdate !== pendingProfileUpdate) {
    setPrevStoreAndPending({ myStore, pendingProfileUpdate })
    if (myStore) {
      setProfileForm({
        name: (pendingProfileUpdate?.name !== undefined && pendingProfileUpdate?.name !== null) ? pendingProfileUpdate.name : (myStore.profile.name || ""),
        tagline: (pendingProfileUpdate?.tagline !== undefined && pendingProfileUpdate?.tagline !== null) ? pendingProfileUpdate.tagline : (myStore.profile.tagline || ""),
        description: (pendingProfileUpdate?.description !== undefined && pendingProfileUpdate?.description !== null) ? pendingProfileUpdate.description : (myStore.profile.description || ""),
        location: (pendingProfileUpdate?.location !== undefined && pendingProfileUpdate?.location !== null) ? pendingProfileUpdate.location : (myStore.profile.location || ""),
        responseTime: (pendingProfileUpdate?.responseTime !== undefined && pendingProfileUpdate?.responseTime !== null) ? pendingProfileUpdate.responseTime : (myStore.profile.responseTime || ""),
      })

      setAvatarForm((current) => ({
        ...current,
        url: myStore.profile.avatar?.url || "",
      }))

      setCoverForm((current) => ({
        ...current,
        url: myStore.profile.cover?.url || "",
      }))
    }
  }

  const updateProfileMutation = useMutation({
    mutationFn: ({ storeId, payload }: { storeId: string; payload: typeof profileForm }) =>
      isActiveStore ? submitStoreProfileUpdateRequest(storeId, payload) : updateMyStoreProfile(storeId, payload),
    onSuccess: async (result) => {
      if (result.success) {
        toast.success(isActiveStore ? t("profileUpdateRequested") || "Yêu cầu thay đổi thông tin đã được gửi." : t("profileSaved"))
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
      const res = result as { success?: boolean; url?: string; message?: string }
      if (res && (res.success || res.url)) {
        toast.success(variables.type === "avatar" ? t("avatarSaved") : t("coverSaved"))
        await refreshStore()
      } else {
        toast.error(res?.message || t("requestFailed"))
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
