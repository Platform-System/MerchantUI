"use client"

import * as React from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { Avatar, AvatarFallback, Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle, Input, Textarea } from '@platform-system/design-ui';
import { User, Package, Store, Loader2 } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { useAccount, useOrderDetails } from "../hooks/use-account"
import { useQuery } from "@tanstack/react-query"
import { fetchUserProfileById, StoreMemberResponse } from "@/features/store/queries/store-manage-queries"
import { StoreOrder } from "@/types/store"
import { useStoreManagement } from "@/features/store/hooks/use-store-management"
import { useStoreProductManagement } from "@/features/store/hooks/use-store-product-management"
import { toast } from "sonner"


interface MemberRowProps {
  member: StoreMemberResponse
  getMemberRoleLabel: (role: string) => string
  getMemberStatusLabel: (status: string) => string
  savePublishPermission: (userId: string, canPublishProductDirectly: boolean) => void
  isSavingPublishPermission: boolean
  isActiveStore: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ts: any
}

function MemberRow({
  member,
  getMemberRoleLabel,
  getMemberStatusLabel,
  savePublishPermission,
  isSavingPublishPermission,
  isActiveStore,
  ts
}: MemberRowProps) {
  const { data: userProfile, isLoading } = useQuery({
    queryKey: ["users", member.userId],
    queryFn: () => fetchUserProfileById(member.userId),
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  const displayName = userProfile
    ? `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim() || userProfile.userName || userProfile.email
    : member.userId

  const email = userProfile?.email || ""

  return (
    <div className="rounded-xl border border-[rgb(var(--store-border-rgb)/0.6)] p-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <Avatar className="size-10 shrink-0">
              <AvatarFallback>
                <User className="size-5" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1 min-w-0">
              {isLoading ? (
                <div className="h-4 w-24 animate-pulse bg-muted rounded" />
              ) : (
                <p className="font-semibold text-foreground truncate" title={displayName}>
                  {displayName}
                </p>
              )}
              {email && (
                <p className="text-xs text-muted-foreground truncate" title={email}>
                  {email}
                </p>
              )}
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground pt-1">
                <span className="rounded-full border border-[rgb(var(--store-border-rgb)/0.7)] px-2 py-0.5">
                  {getMemberRoleLabel(member.role)}
                </span>
                <span className="rounded-full border border-[rgb(var(--store-border-rgb)/0.7)] px-2 py-0.5">
                  {getMemberStatusLabel(member.status)}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground pt-1">
                {ts("joinedAt", { date: new Date(member.joinedAt).toLocaleDateString("vi-VN") })}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-[rgb(var(--store-accent-rgb)/0.08)] px-3 py-1 text-xs font-medium text-foreground shrink-0 self-start sm:self-auto">
            {member.canPublishProductDirectly ? ts("publishDirectlyEnabled") : ts("publishDirectlyDisabled")}
          </span>
        </div>

        <Button
          variant="outline"
          className="w-full rounded-xl"
          onClick={() => savePublishPermission(member.userId, !member.canPublishProductDirectly)}
          disabled={isSavingPublishPermission || !isActiveStore || member.status.toLowerCase() !== "active"}
        >
          {isSavingPublishPermission
            ? ts("saving")
            : member.canPublishProductDirectly
              ? ts("disablePublishPermission")
              : ts("savePublishPermission")}
        </Button>
      </div>
    </div>
  )
}

export function AccountScreen() {
  const t = useTranslations("Account")
  const tc = useTranslations("Cart")
  const ts = useTranslations("Account.store")
  
  const {
    activeTab,
    setActiveTab,
    orders,
    ordersData,
    statusClassName,
  } = useAccount()
  const {
    myStore,
    hasStore,
    isLoading: isStoreLoading,
    profileForm,
    setProfileForm,
    policyForm,
    setPolicyForm,
    inviteForm,
    setInviteForm,
    avatarForm,
    setAvatarForm,
    coverForm,
    setCoverForm,
    acceptInviteStoreId,
    setAcceptInviteStoreId,
    members,
    isLoadingMembers,
    saveProfile,
    savePolicy,
    requestActivation,
    isSavingProfile,
    isSavingPolicy,
    isRequestingActivation,
    inviteMember,
    isInvitingMember,
    saveAvatar,
    saveCover,
    isSavingAvatar,
    isSavingCover,
    acceptInvitation,
    isAcceptingInvitation,
    savePublishPermission,
    isSavingPublishPermission,
    normalizedStatus,
    isActiveStore,
    canRequestActivation,
    isPolicyLocked,
  } = useStoreManagement()
  const {
    categories,
    isLoadingCategories,
    myPendingProducts,
    ownerReviewProducts,
    isLoadingMyPending,
    isLoadingOwnerReview,
    productForm,
    setProductForm,
    editingProductId,
    resetProductForm,
    saveProduct,
    isSavingProduct,
    deleteProduct,
    isDeletingProduct,
    approveProduct,
    isApprovingProduct,
    startEditingProduct,
  } = useStoreProductManagement(myStore?.profile.name, hasStore)

  const [selectedOrderId, setSelectedOrderId] = React.useState<string | null>(null)
  const { data: orderDetails, isLoading: isLoadingOrderDetails } = useOrderDetails(selectedOrderId)



  const tabs = [
    { id: "store", label: t("tabStore"), icon: Store },
    { id: "orders", label: t("tabOrders"), icon: Package },
  ]

  const storeStatusLabel =
    normalizedStatus === "active"
      ? ts("statusActive")
      : normalizedStatus === "pendingactive"
        ? ts("statusPendingActive")
        : normalizedStatus === "suspended"
          ? ts("statusSuspended")
        : ts("statusDraft")

  const getMemberRoleLabel = (role: string) => {
    const normalizedRole = role.toLowerCase()
    if (normalizedRole === "owner") return ts("roleOwner")
    if (normalizedRole === "manager") return ts("roleManager")
    return ts("roleStaff")
  }

  const getMemberStatusLabel = (status: string) => {
    const normalizedMemberStatus = status.toLowerCase()
    if (normalizedMemberStatus === "active") return ts("memberStatusActive")
    if (normalizedMemberStatus === "invited") return ts("memberStatusInvited")
    return ts("memberStatusRemoved")
  }

  const getTranslatedStatus = (status: StoreOrder["status"]) => {
    switch (status) {
      case "pending": return t("statusPending")
      case "processing": return t("statusProcessing")
      case "shipped": return t("statusShipped")
      case "delivered": return t("statusDelivered")
      default: return t("statusProcessing")
    }
  }

  return (
    <div className="relative z-10 min-h-screen bg-background pt-24 pb-12 text-foreground">
      <div className="mx-auto max-w-none px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8 font-serif text-3xl font-bold sm:text-4xl">Trung tâm cá nhân</h1>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <div className="flex shrink-0 flex-row gap-2 overflow-x-auto border-b border-[rgb(var(--store-border-rgb)/0.7)] pb-4 md:col-span-3 lg:col-span-2 md:flex-col md:overflow-visible md:border-b-0 md:pb-0">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-medium transition-all border md:w-full md:justify-start ${
                    activeTab === tab.id
                      ? "store-accent-soft border-[rgb(var(--store-accent-rgb)/0.18)] text-foreground"
                      : "border-transparent text-muted-foreground hover:bg-[rgb(var(--store-accent-rgb)/0.08)] hover:text-foreground"
                  }`}
                >
                  <Icon className={`h-5 w-5 shrink-0 ${activeTab === tab.id ? "store-accent-text" : ""}`} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          <div className="ds-glass-panel rounded-3xl p-6 shadow-2xl sm:p-8 md:col-span-9 lg:col-span-10">
            {activeTab === "orders" && (
              <div className="flex flex-col gap-6">
                <div className="space-y-1">
                  <h3 className="font-serif text-2xl font-semibold text-foreground">{t("orderHistory")}</h3>
                  <p className="text-sm text-muted-foreground">{t("orderHistoryDesc")}</p>
                </div>

                {orders.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {orders.map((order: StoreOrder) => (
                      <div
                        key={order.id}
                        className="store-surface-soft rounded-2xl border p-4 transition-all hover:bg-[rgb(var(--store-accent-rgb)/0.08)]"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-foreground">{order.id}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString("vi-VN")} • {order.items.length} {tc("itemCount", { count: order.items.length })}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {order.customerName} • {order.phone}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="store-accent-text font-semibold">
                              ${order.total.toLocaleString()}
                            </span>
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClassName(order.status)}`}>
                              {getTranslatedStatus(order.status)}
                            </span>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="rounded-xl border-[rgb(var(--store-accent-rgb)/0.3)] text-foreground hover:bg-[rgb(var(--store-accent-rgb)/0.08)]"
                              onClick={() => {
                                const cleanId = order.id.startsWith("#") ? order.id.slice(1) : order.id
                                const rawOrder = ordersData?.find(o => o.orderCode?.toString() === cleanId || o.id === cleanId)
                                if (rawOrder) {
                                  setSelectedOrderId(rawOrder.id)
                                }
                              }}
                            >
                              Xem chi tiết
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty className="border-none bg-transparent px-0 py-10">
                    <EmptyHeader>
                      <EmptyMedia variant="icon" className="store-surface-soft store-muted-text flex h-16 w-16 items-center justify-center rounded-full">
                        <Package className="h-8 w-8" />
                      </EmptyMedia>
                      <EmptyTitle>{t("noOrders")}</EmptyTitle>
                      <EmptyDescription className="max-w-md">
                        {t("noOrdersDesc")}
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}
              </div>
            )}

            {activeTab === "store" && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-serif text-2xl font-semibold text-foreground">{ts("title")}</h3>
                    <p className="text-sm text-muted-foreground">{ts("description")}</p>
                  </div>
                  {hasStore && (
                    <span className="rounded-full border border-[rgb(var(--store-border-rgb)/0.8)] px-3 py-1 text-xs font-semibold text-foreground">
                      {storeStatusLabel}
                    </span>
                  )}
                </div>

                {isStoreLoading ? (
                  <div className="flex min-h-[240px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : !hasStore ? (
                  <Empty className="border-none bg-transparent px-0 py-10">
                    <EmptyHeader>
                      <EmptyMedia variant="icon" className="store-surface-soft store-muted-text flex h-16 w-16 items-center justify-center rounded-full">
                        <Store className="h-8 w-8" />
                      </EmptyMedia>
                      <EmptyTitle>{ts("emptyTitle")}</EmptyTitle>
                      <EmptyDescription className="max-w-md">
                        {ts("emptyDesc")}
                      </EmptyDescription>
                    </EmptyHeader>
                    <Button asChild className="store-accent-button store-accent-button-strong rounded-xl px-6">
                      <Link href="/become-seller">{ts("createStore")}</Link>
                    </Button>
                  </Empty>
                ) : (
                  <>
                    <div className="rounded-2xl border border-[rgb(var(--store-border-rgb)/0.7)] p-4 text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">{myStore?.profile.name}</p>
                      <p className="mt-1">{myStore?.profile.slug}</p>
                      <p className="mt-3">{ts("statusHint")}</p>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                      <div className="rounded-2xl border border-[rgb(var(--store-border-rgb)/0.7)] p-4">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{ts("storePreview")}</p>
                            <p className="text-xs text-muted-foreground">{ts("storePreviewDesc")}</p>
                          </div>
                          <span className="rounded-full bg-[rgb(var(--store-accent-rgb)/0.1)] px-3 py-1 text-xs font-medium text-foreground">
                            {storeStatusLabel}
                          </span>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-[rgb(var(--store-border-rgb)/0.6)]">
                          <div className="relative h-36 w-full bg-muted/20">
                            {coverForm.url ? (
                              <Image src={coverForm.url} alt={coverForm.altText || myStore?.profile.name || "Store cover"} fill className="object-cover" />
                            ) : (
                              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">{ts("coverPlaceholder")}</div>
                            )}
                          </div>
                          <div className="relative px-5 pb-5 pt-0">
                            <div className="relative -mt-10 h-20 w-20 overflow-hidden rounded-2xl border-4 border-background bg-muted/30 shadow-sm">
                              {avatarForm.url ? (
                                <Image src={avatarForm.url} alt={avatarForm.altText || myStore?.profile.name || "Store avatar"} fill className="object-cover" />
                              ) : (
                                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">{ts("avatarPlaceholder")}</div>
                              )}
                            </div>
                            <div className="mt-4 space-y-2">
                              <h4 className="text-lg font-semibold text-foreground">{profileForm.name || myStore?.profile.name}</h4>
                              <p className="text-sm text-muted-foreground">{profileForm.tagline || myStore?.profile.tagline || ts("taglinePlaceholder")}</p>
                              <p className="text-sm text-muted-foreground">{profileForm.description || myStore?.profile.description || ts("descriptionPlaceholder")}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 rounded-2xl border border-[rgb(var(--store-border-rgb)/0.7)] p-5">
                        <div>
                          <h4 className="text-lg font-semibold text-foreground">{ts("invitationSection")}</h4>
                          <p className="text-sm text-muted-foreground">{ts("invitationSectionDesc")}</p>
                        </div>
                        <Input
                          className="h-11 rounded-xl"
                          placeholder={ts("storeIdField")}
                          value={acceptInviteStoreId}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setAcceptInviteStoreId(event.target.value)}
                        />
                        <Button
                          variant="outline"
                          className="w-full rounded-xl"
                          onClick={acceptInvitation}
                          disabled={isAcceptingInvitation || !acceptInviteStoreId.trim()}
                        >
                          {isAcceptingInvitation ? ts("accepting") : ts("acceptInvitation")}
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                      <div className="space-y-4 rounded-2xl border border-[rgb(var(--store-border-rgb)/0.7)] p-5">
                        <div>
                          <h4 className="text-lg font-semibold text-foreground">{ts("profileSection")}</h4>
                          <p className="text-sm text-muted-foreground">{ts("profileSectionDesc")}</p>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <span className="text-xs text-muted-foreground">{ts("storeName")}</span>
                            <Input
                              className="h-11 rounded-xl"
                              value={profileForm.name}
                              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                setProfileForm((current) => ({ ...current, name: event.target.value }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <span className="text-xs text-muted-foreground">{ts("tagline")}</span>
                            <Input
                              className="h-11 rounded-xl"
                              value={profileForm.tagline}
                              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                setProfileForm((current) => ({ ...current, tagline: event.target.value }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <span className="text-xs text-muted-foreground">{ts("location")}</span>
                            <Input
                              className="h-11 rounded-xl"
                              value={profileForm.location}
                              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                setProfileForm((current) => ({ ...current, location: event.target.value }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <span className="text-xs text-muted-foreground">{ts("responseTime")}</span>
                            <Input
                              className="h-11 rounded-xl"
                              value={profileForm.responseTime}
                              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                setProfileForm((current) => ({ ...current, responseTime: event.target.value }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <span className="text-xs text-muted-foreground">{ts("descriptionField")}</span>
                            <Textarea
                              className="min-h-28 rounded-xl"
                              value={profileForm.description}
                              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                                setProfileForm((current) => ({ ...current, description: event.target.value }))
                              }
                            />
                          </div>
                        </div>

                        <Button
                          className="store-accent-button store-accent-button-strong rounded-xl"
                          onClick={saveProfile}
                          disabled={isSavingProfile}
                        >
                          {isSavingProfile ? ts("saving") : ts("saveProfile")}
                        </Button>
                      </div>

                      <div className="space-y-4 rounded-2xl border border-[rgb(var(--store-border-rgb)/0.7)] p-5">
                        <div>
                          <h4 className="text-lg font-semibold text-foreground">{ts("policySection")}</h4>
                          <p className="text-sm text-muted-foreground">{ts("policySectionDesc")}</p>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <span className="text-xs text-muted-foreground">{ts("shippingPolicy")}</span>
                            <Textarea
                              className="min-h-24 rounded-xl"
                              value={policyForm.shippingPolicy}
                              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                                setPolicyForm((current) => ({ ...current, shippingPolicy: event.target.value }))
                              }
                              disabled={isPolicyLocked}
                            />
                          </div>
                          <div className="space-y-2">
                            <span className="text-xs text-muted-foreground">{ts("returnPolicy")}</span>
                            <Textarea
                              className="min-h-24 rounded-xl"
                              value={policyForm.returnPolicy}
                              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                                setPolicyForm((current) => ({ ...current, returnPolicy: event.target.value }))
                              }
                              disabled={isPolicyLocked}
                            />
                          </div>
                          <div className="space-y-2">
                            <span className="text-xs text-muted-foreground">{ts("warrantyPolicy")}</span>
                            <Textarea
                              className="min-h-24 rounded-xl"
                              value={policyForm.warrantyPolicy}
                              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                                setPolicyForm((current) => ({ ...current, warrantyPolicy: event.target.value }))
                              }
                              disabled={isPolicyLocked}
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <Button
                            className="store-accent-button store-accent-button-strong rounded-xl"
                            onClick={savePolicy}
                            disabled={isSavingPolicy || isPolicyLocked}
                          >
                            {isSavingPolicy ? ts("saving") : ts("savePolicy")}
                          </Button>
                          {canRequestActivation && (
                            <Button
                              variant="outline"
                              className="rounded-xl"
                              onClick={requestActivation}
                              disabled={isRequestingActivation}
                            >
                              {isRequestingActivation ? ts("requesting") : ts("requestActivation")}
                            </Button>
                          )}
                        </div>

                        {isPolicyLocked && (
                          <p className="text-sm text-muted-foreground">{ts("policyLocked")}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                      <div className="space-y-4 rounded-2xl border border-[rgb(var(--store-border-rgb)/0.7)] p-5">
                        <div>
                          <h4 className="text-lg font-semibold text-foreground">{ts("mediaSection")}</h4>
                          <p className="text-sm text-muted-foreground">{ts("mediaSectionDesc")}</p>
                        </div>

                        <div className="space-y-3 rounded-xl border border-[rgb(var(--store-border-rgb)/0.5)] p-4">
                          <p className="text-sm font-medium text-foreground">{ts("avatarImage")}</p>
                          <Input
                            className="h-11 rounded-xl"
                            placeholder={ts("imageUrl")}
                            value={avatarForm.url}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                              setAvatarForm((current) => ({ ...current, url: event.target.value }))
                            }
                          />
                          <Input
                            className="h-11 rounded-xl"
                            placeholder={ts("altText")}
                            value={avatarForm.altText}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                              setAvatarForm((current) => ({ ...current, altText: event.target.value }))
                            }
                          />
                          <div className="grid gap-3 sm:grid-cols-2">
                            <Input
                              className="h-11 rounded-xl"
                              placeholder={ts("blobName")}
                              value={avatarForm.blobName}
                              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                setAvatarForm((current) => ({ ...current, blobName: event.target.value }))
                              }
                            />
                            <Input
                              className="h-11 rounded-xl"
                              placeholder={ts("containerName")}
                              value={avatarForm.containerName}
                              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                setAvatarForm((current) => ({ ...current, containerName: event.target.value }))
                              }
                            />
                            <Input
                              className="h-11 rounded-xl"
                              placeholder={ts("fileName")}
                              value={avatarForm.fileName}
                              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                setAvatarForm((current) => ({ ...current, fileName: event.target.value }))
                              }
                            />
                            <Input
                              className="h-11 rounded-xl"
                              placeholder={ts("contentType")}
                              value={avatarForm.contentType}
                              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                setAvatarForm((current) => ({ ...current, contentType: event.target.value }))
                              }
                            />
                            <Input
                              className="h-11 rounded-xl"
                              placeholder={ts("fileSize")}
                              type="number"
                              value={avatarForm.size ? String(avatarForm.size) : ""}
                              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                setAvatarForm((current) => ({ ...current, size: Number(event.target.value) || 0 }))
                              }
                            />
                          </div>
                          <Button className="rounded-xl" onClick={saveAvatar} disabled={isSavingAvatar}>
                            {isSavingAvatar ? ts("saving") : ts("saveAvatar")}
                          </Button>
                        </div>

                        <div className="space-y-3 rounded-xl border border-[rgb(var(--store-border-rgb)/0.5)] p-4">
                          <p className="text-sm font-medium text-foreground">{ts("coverImage")}</p>
                          <Input
                            className="h-11 rounded-xl"
                            placeholder={ts("imageUrl")}
                            value={coverForm.url}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                              setCoverForm((current) => ({ ...current, url: event.target.value }))
                            }
                          />
                          <Input
                            className="h-11 rounded-xl"
                            placeholder={ts("altText")}
                            value={coverForm.altText}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                              setCoverForm((current) => ({ ...current, altText: event.target.value }))
                            }
                          />
                          <div className="grid gap-3 sm:grid-cols-2">
                            <Input
                              className="h-11 rounded-xl"
                              placeholder={ts("blobName")}
                              value={coverForm.blobName}
                              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                setCoverForm((current) => ({ ...current, blobName: event.target.value }))
                              }
                            />
                            <Input
                              className="h-11 rounded-xl"
                              placeholder={ts("containerName")}
                              value={coverForm.containerName}
                              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                setCoverForm((current) => ({ ...current, containerName: event.target.value }))
                              }
                            />
                            <Input
                              className="h-11 rounded-xl"
                              placeholder={ts("fileName")}
                              value={coverForm.fileName}
                              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                setCoverForm((current) => ({ ...current, fileName: event.target.value }))
                              }
                            />
                            <Input
                              className="h-11 rounded-xl"
                              placeholder={ts("contentType")}
                              value={coverForm.contentType}
                              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                setCoverForm((current) => ({ ...current, contentType: event.target.value }))
                              }
                            />
                            <Input
                              className="h-11 rounded-xl"
                              placeholder={ts("fileSize")}
                              type="number"
                              value={coverForm.size ? String(coverForm.size) : ""}
                              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                setCoverForm((current) => ({ ...current, size: Number(event.target.value) || 0 }))
                              }
                            />
                          </div>
                          <Button className="rounded-xl" onClick={saveCover} disabled={isSavingCover}>
                            {isSavingCover ? ts("saving") : ts("saveCover")}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-4 rounded-2xl border border-[rgb(var(--store-border-rgb)/0.7)] p-5">
                        <div>
                          <h4 className="text-lg font-semibold text-foreground">{ts("membersSection")}</h4>
                          <p className="text-sm text-muted-foreground">{ts("membersSectionDesc")}</p>
                        </div>

                        <div className="space-y-3">
                          <Input
                            className="h-11 rounded-xl"
                            placeholder={ts("memberUserId")}
                            value={inviteForm.userId}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                              setInviteForm((current) => ({ ...current, userId: event.target.value }))
                            }
                          />

                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant={inviteForm.role === 1 ? "default" : "outline"}
                              className="rounded-xl"
                              onClick={() => setInviteForm((current) => ({ ...current, role: 1 }))}
                            >
                              {ts("roleManager")}
                            </Button>
                            <Button
                              type="button"
                              variant={inviteForm.role === 2 ? "default" : "outline"}
                              className="rounded-xl"
                              onClick={() => setInviteForm((current) => ({ ...current, role: 2 }))}
                            >
                              {ts("roleStaff")}
                            </Button>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setInviteForm((current) => ({
                                ...current,
                                canPublishProductDirectly: !current.canPublishProductDirectly,
                              }))
                            }
                            className="flex items-center gap-3 rounded-xl border border-[rgb(var(--store-border-rgb)/0.7)] px-4 py-3 text-sm text-foreground"
                          >
                            <span
                              className={`h-4 w-4 rounded border ${inviteForm.canPublishProductDirectly ? "bg-[rgb(var(--store-accent-rgb))] border-[rgb(var(--store-accent-rgb))]" : "border-[rgb(var(--store-border-rgb))]"}`}
                            />
                            {ts("directPublishPermission")}
                          </button>
                        </div>

                        <Button
                          className="store-accent-button store-accent-button-strong rounded-xl"
                          onClick={inviteMember}
                          disabled={isInvitingMember || !inviteForm.userId || !isActiveStore}
                        >
                          {isInvitingMember ? ts("inviting") : ts("inviteMember")}
                        </Button>

                        <div className="space-y-3 rounded-xl border border-[rgb(var(--store-border-rgb)/0.5)] p-4">
                          <div>
                            <p className="text-sm font-medium text-foreground">{ts("publishPermissionSection")}</p>
                            <p className="text-xs text-muted-foreground">{ts("membersListDesc")}</p>
                          </div>

                          {isLoadingMembers ? (
                            <div className="flex min-h-[120px] items-center justify-center">
                              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                          ) : members.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-[rgb(var(--store-border-rgb)/0.7)] p-4 text-sm text-muted-foreground">
                              {ts("noMembersYet")}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {members.map((member) => (
                                <MemberRow
                                  key={member.userId}
                                  member={member}
                                  getMemberRoleLabel={getMemberRoleLabel}
                                  getMemberStatusLabel={getMemberStatusLabel}
                                  savePublishPermission={savePublishPermission}
                                  isSavingPublishPermission={isSavingPublishPermission}
                                  isActiveStore={isActiveStore}
                                  ts={ts}
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="rounded-xl border border-dashed border-[rgb(var(--store-border-rgb)/0.7)] p-4 text-sm text-muted-foreground">
                          {isActiveStore ? ts("membersHint") : ts("membersInactiveHint")}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
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

                        <div className="space-y-3">
                          <Input
                            className="h-11 rounded-xl"
                            placeholder={ts("products.title")}
                            value={productForm.title}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                              setProductForm((current) => ({ ...current, title: event.target.value }))
                            }
                          />
                          <Input
                            className="h-11 rounded-xl"
                            placeholder={ts("products.author")}
                            value={productForm.author}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                              setProductForm((current) => ({ ...current, author: event.target.value }))
                            }
                          />
                          <div className="grid gap-3 sm:grid-cols-2">
                            <Input
                              className="h-11 rounded-xl"
                              placeholder={ts("products.price")}
                              type="number"
                              value={productForm.price}
                              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                setProductForm((current) => ({ ...current, price: event.target.value }))
                              }
                            />
                            <Input
                              className="h-11 rounded-xl"
                              placeholder={ts("products.stock")}
                              type="number"
                              value={productForm.stock}
                              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                setProductForm((current) => ({ ...current, stock: event.target.value }))
                              }
                            />
                          </div>
                          <select
                            className="flex h-11 w-full rounded-xl border border-[rgb(var(--store-border-rgb)/0.9)] bg-[rgb(var(--store-surface-rgb)/0.84)] px-3 text-sm text-foreground outline-none"
                            value={productForm.categoryId}
                            onChange={(event) =>
                              setProductForm((current) => ({ ...current, categoryId: event.target.value }))
                            }
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

                        <Button
                          className="store-accent-button store-accent-button-strong w-full rounded-xl"
                          onClick={saveProduct}
                          disabled={
                            isSavingProduct ||
                            !productForm.title.trim() ||
                            !productForm.author.trim() ||
                            !productForm.categoryId ||
                            !productForm.price ||
                            !productForm.stock
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
                                      <Button variant="outline" className="rounded-xl" onClick={() => startEditingProduct(product)}>
                                        {ts("products.edit")}
                                      </Button>
                                      <Button
                                        variant="outline"
                                        className="rounded-xl"
                                        onClick={() => deleteProduct(product.id)}
                                        disabled={isDeletingProduct}
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
                                      disabled={isApprovingProduct}
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
                  </>
                )}
              </div>
            )}


          </div>
        </div>
      </div>
      {/* Modal chi tiết đơn hàng */}
      <Dialog open={selectedOrderId !== null} onOpenChange={(open) => { if (!open) setSelectedOrderId(null) }}>
        <DialogContent className="max-w-2xl overflow-y-auto max-h-[85vh] ds-glass-panel border border-[rgb(var(--store-border-rgb)/0.7)] rounded-3xl p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-semibold text-foreground">
              Chi tiết đơn hàng {orderDetails?.orderCode ? `#${orderDetails.orderCode}` : ""}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Thông tin chi tiết về trạng thái đơn hàng và các mặt hàng đã mua.
            </DialogDescription>
          </DialogHeader>

          {isLoadingOrderDetails ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : orderDetails ? (
            <div className="space-y-6 text-sm text-foreground">
              {/* 1. Trạng thái đơn hàng */}
              <div className="flex justify-between items-center p-4 rounded-2xl store-surface-soft border border-[rgb(var(--store-border-rgb)/0.5)]">
                <div>
                  <p className="font-medium text-foreground">Trạng thái thanh toán</p>
                  <p className="text-xs text-muted-foreground">
                    Hạn thanh toán: {new Date(orderDetails.expiredAt).toLocaleString("vi-VN")}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  orderDetails.status === 2 ? "bg-emerald-500/10 text-emerald-700" :
                  orderDetails.status === 1 ? "bg-amber-500/10 text-amber-700" : "bg-rose-500/10 text-rose-700"
                }`}>
                  {orderDetails.status === 1 ? "Chờ thanh toán" :
                   orderDetails.status === 2 ? "Đã thanh toán" :
                   orderDetails.status === 3 ? "Thanh toán thất bại" : "Đã hủy"}
                </span>
              </div>

              {/* 2. Địa chỉ giao hàng & Shipment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl store-surface-soft border border-[rgb(var(--store-border-rgb)/0.5)]">
                  <h4 className="font-semibold text-foreground mb-2">Thông tin người nhận</h4>
                  {orderDetails.address ? (
                    <div className="space-y-1 text-muted-foreground text-xs">
                      <p className="font-medium text-foreground">{orderDetails.address.recipientName}</p>
                      <p>{orderDetails.address.phoneNumber}</p>
                      <p>{`${orderDetails.address.streetAddress}, ${orderDetails.address.ward}, ${orderDetails.address.district}, ${orderDetails.address.city}`}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Không có địa chỉ giao hàng.</p>
                  )}
                </div>

                <div className="p-4 rounded-2xl store-surface-soft border border-[rgb(var(--store-border-rgb)/0.5)]">
                  <h4 className="font-semibold text-foreground mb-2">Vận chuyển</h4>
                  {orderDetails.shipment ? (
                    <div className="space-y-1 text-muted-foreground text-xs">
                      <p>Phương thức: <span className="font-medium text-foreground capitalize">{orderDetails.shipment.method}</span></p>
                      <p>Phí vận chuyển: <span className="font-medium text-foreground">${orderDetails.shipment.fee.toLocaleString()}</span></p>
                      {orderDetails.shipment.note && (
                        <p className="italic">Ghi chú: {orderDetails.shipment.note}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Không có thông tin vận chuyển.</p>
                  )}
                </div>
              </div>

              {/* 3. Danh sách sản phẩm */}
              <div className="border border-[rgb(var(--store-border-rgb)/0.5)] rounded-2xl overflow-hidden">
                <div className="bg-[rgb(var(--store-accent-rgb)/0.04)] px-4 py-3 border-b border-[rgb(var(--store-border-rgb)/0.5)]">
                  <h4 className="font-semibold text-foreground">Sản phẩm đã chọn</h4>
                </div>
                <div className="divide-y divide-[rgb(var(--store-border-rgb)/0.3)]">
                  {orderDetails.items.map((item) => (
                    <div key={item.productId} className="flex justify-between items-center p-4">
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Số lượng: {item.quantity}</p>
                      </div>
                      <span className="font-semibold text-foreground">
                        ${(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Tổng cộng */}
              <div className="flex justify-between items-center pt-2 border-t border-[rgb(var(--store-border-rgb)/0.5)] text-base font-bold">
                <span>Tổng số tiền:</span>
                <span className="store-accent-text">${orderDetails.totalAmount.toLocaleString()}</span>
              </div>

              {/* 5. Nút thanh toán lại nếu đơn hàng đang Pending và có link thanh toán */}
              {orderDetails.status === 1 && orderDetails.checkoutUrl && (
                <Button 
                  asChild 
                  className="w-full store-accent-button store-accent-button-strong rounded-xl py-3 font-semibold text-center block mt-6"
                >
                  <a href={orderDetails.checkoutUrl} target="_blank" rel="noopener noreferrer">
                    Thanh toán ngay qua Cổng Thanh Toán
                  </a>
                </Button>
              )}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">Không tìm thấy thông tin đơn hàng.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

