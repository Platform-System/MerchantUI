import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/core/providers/AuthProvider"
import { getValidToken } from "@/shared/api/apiClient"
import {
  fetchMyStore,
  fetchMyStores,
  fetchMyStoreMembers,
  fetchStoreActivationRequests,
  storeManageQueryKeys,
} from "../queries/store-manage-queries"

function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const binString = typeof window !== "undefined"
      ? window.atob(base64)
      : Buffer.from(base64, "base64").toString("binary")
    const jsonPayload = decodeURIComponent(
      binString
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

export function useStoreMetadata() {
  const { keycloak } = useAuth()
  const currentUserId = keycloak?.subject

  const [selectedStoreId, setSelectedStoreId] = React.useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedStoreId")
    }
    return null
  })

  React.useEffect(() => {
    if (selectedStoreId) {
      localStorage.setItem("selectedStoreId", selectedStoreId)
    } else {
      localStorage.removeItem("selectedStoreId")
    }
  }, [selectedStoreId])

  const [hasStoreFromToken, setHasStoreFromToken] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    async function checkToken() {
      try {
        const token = await getValidToken()
        if (token) {
          const payload = parseJwt(token)
          const hasStore = payload && "hasStore" in payload ? (payload.hasStore === true || payload.hasStore === "true") : false
          setHasStoreFromToken(hasStore)
        } else {
          setHasStoreFromToken(false)
        }
      } catch {
        setHasStoreFromToken(false)
      }
    }
    checkToken()
  }, [])

  // Load all user stores
  const { data: myStores = [], isLoading: isLoadingMyStores } = useQuery({
    queryKey: storeManageQueryKeys.myStores,
    queryFn: fetchMyStores,
    enabled: hasStoreFromToken !== null,
    staleTime: 60 * 1000,
  })

  // Synchronize selectedStoreId with available stores
  React.useEffect(() => {
    if (myStores.length > 0) {
      const exists = myStores.some(s => s.id === selectedStoreId)
      if (!exists) {
        const firstStoreId = myStores[0].id
        const timer = setTimeout(() => {
          setSelectedStoreId(firstStoreId)
        }, 0)
        return () => clearTimeout(timer)
      }
    } else {
      if (selectedStoreId !== null) {
        const timer = setTimeout(() => {
          setSelectedStoreId(null)
        }, 0)
        return () => clearTimeout(timer)
      }
    }
  }, [myStores, selectedStoreId])

  const { data: myStore, isLoading, isFetching } = useQuery({
    queryKey: selectedStoreId ? storeManageQueryKeys.store(selectedStoreId) : ["store-manage", "none"],
    queryFn: () => selectedStoreId ? fetchMyStore(selectedStoreId) : null,
    enabled: !!selectedStoreId,
    staleTime: 60 * 1000,
  })

  const storeStatus = myStore?.profile.status || ""
  const normalizedStatus = storeStatus.toLowerCase()
  const isActiveStore = normalizedStatus === "active"

  const { data: members = [] } = useQuery({
    queryKey: selectedStoreId ? storeManageQueryKeys.members(selectedStoreId) : ["store-manage", "none", "members"],
    queryFn: () => selectedStoreId ? fetchMyStoreMembers(selectedStoreId) : [],
    enabled: !!selectedStoreId && Boolean(myStore?.profile.id),
    staleTime: 60 * 1000,
  })

  const { data: activationRequests = [], isLoading: isLoadingActivationRequests } = useQuery({
    queryKey: ["store-manage", selectedStoreId, "activation-requests"],
    queryFn: () => selectedStoreId ? fetchStoreActivationRequests(selectedStoreId) : [],
    enabled: !!selectedStoreId,
    staleTime: 30 * 1000,
  })

  const isOwner = React.useMemo(() => {
    if (!currentUserId || !members || members.length === 0) return false
    const member = members.find(m => m.userId === currentUserId)
    return member ? member.role.toLowerCase() === "owner" : false
  }, [currentUserId, members])

  const latestRejectionReason = React.useMemo(() => {
    if (normalizedStatus === "draft" && activationRequests.length > 0) {
      const latest = activationRequests[0]
      if (latest.status.toLowerCase() === "rejected") {
        return latest.rejectionReason || "Không có lý do chi tiết."
      }
    }
    return null
  }, [normalizedStatus, activationRequests])

  return {
    selectedStoreId,
    setSelectedStoreId,
    myStores,
    isLoadingMyStores,
    myStore,
    isLoading,
    isFetching,
    normalizedStatus,
    isActiveStore,
    isPendingActive: normalizedStatus === "pendingactive",
    isOwner,
    activationRequests,
    isLoadingActivationRequests,
    latestRejectionReason,
    hasStoreFromToken,
  }
}
