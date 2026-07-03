"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { motion, AnimatePresence } from "framer-motion"
import { ImageCropper, SidebarSectionTrigger, cn } from "@platform-system/design-ui"
import { Mail, PlusCircle, ChevronLeft, ChevronRight, Store, Package } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createStore } from "@/features/seller/queries/seller-queries"
import type { Result } from "@/types/api"
import { useAccount } from "../hooks/use-account"
import { useStoreManagement } from "@/features/store/hooks/use-store-management"
import { useStoreProductManagement } from "@/features/store/hooks/use-store-product-management"
import { toast } from "sonner"
import { keycloak } from "@/shared/api/keycloak"

// Subcomponents
import { OrderDetailDialog } from "../components/OrderDetailDialog"
import { OrdersTab } from "../components/OrdersTab"
import { CreateStoreTab } from "../components/CreateStoreTab"
import { InvitationsTab } from "../components/InvitationsTab"
import { StoreTab } from "../components/StoreTab"

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

export function AccountScreen() {
  const t = useTranslations("Account")
  const tc = useTranslations("Cart")
  const ts = useTranslations("Account.store")
  const tBecome = useTranslations("BecomeSeller")
  
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
    uploadImage,
    isUploadingAvatar,
    isUploadingCover,
    acceptInvitation,
    isAcceptingInvitation,
    savePublishPermission,
    isSavingPublishPermission,
    normalizedStatus,
    isActiveStore,
    isPendingActive,
    canRequestActivation,
    isPolicyLocked,
    isProfileLocked,
    invitations,
    isLoadingInvitations,
    myStores,
    selectedStoreId,
    setSelectedStoreId,
    isOwner,
    hasPendingProfileUpdate,
    hasPendingPolicyUpdate,
    activationRequests,
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
  } = useStoreProductManagement(myStore?.profile.name, hasStore && isOwner && isActiveStore)

  const [selectedOrderId, setSelectedOrderId] = React.useState<string | null>(null)
  
  const queryClient = useQueryClient()
  const [createFormData, setCreateFormData] = React.useState({
    name: "",
    tagline: "",
    description: "",
    location: "",
    responseTime: "Trong vòng vài giờ",
  })

  const createStoreMutation = useMutation({
    mutationFn: createStore,
    onSuccess: async (result) => {
      if (result.success) {
        toast.success(tBecome("toastSuccess") || "Đăng ký gian hàng thành công!")

        // Force refresh Keycloak token so that new roles/claims are fetched
        try {
          if (keycloak) {
            await keycloak.updateToken(-1)
          }
        } catch (err) {
          console.error("Failed to force refresh keycloak token:", err)
        }

        // Invalidate owned stores list
        await queryClient.invalidateQueries({ queryKey: ["store-manage", "my-stores"] })
        
        // Reset form
        setCreateFormData({
          name: "",
          tagline: "",
          description: "",
          location: "",
          responseTime: tBecome("defaultResponseTime") || "Trong vòng vài giờ",
        })

        // Select the new store if possible
        const newStoreId = (result as Result<{ id?: string }>).data?.id
        if (newStoreId) {
          setSelectedStoreId(newStoreId)
        }

        // Keep them on "create-store" tab to finish setup
        setActiveTab("create-store")
        return
      }

      const errors = (result as { errors?: string[] }).errors || []
      const errorMsg = result.message || errors[0] || tBecome("toastError") || "Đã có lỗi xảy ra."
      toast.error(errorMsg)
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      const responseMessage = err.response?.data?.message
      const errorMsg = responseMessage || err.message || tBecome("toastError") || "Đã có lỗi xảy ra."
      toast.error(errorMsg)
    }
  })

  const handleCreateStoreSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createStoreMutation.mutate({
      name: createFormData.name,
      tagline: createFormData.tagline,
      description: createFormData.description,
      location: createFormData.location,
      responseTime: createFormData.responseTime,
    })
  }

  const [isAvatarModalOpen, setIsAvatarModalOpen] = React.useState(false)
  const [isCoverModalOpen, setIsCoverModalOpen] = React.useState(false)
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = React.useState(true)
  const [storeSubTab, setStoreSubTab] = React.useState("profile")
  const [setupSubTab, setSetupSubTab] = React.useState("profile")

  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    "Kênh người bán": true,
    "Giao dịch": true,
  })

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  // Form validation errors state
  const [profileErrors, setProfileErrors] = React.useState({
    name: false,
    tagline: false,
    location: false,
    responseTime: false,
    description: false,
  })

  const [policyErrors, setPolicyErrors] = React.useState({
    shippingPolicy: false,
    returnPolicy: false,
    warrantyPolicy: false,
  })

  // Invalidate store queries on tab switch to ensure we always show fresh status (draft/pending/active)
  React.useEffect(() => {
    if (activeTab === "store" || activeTab === "create-store") {
      queryClient.invalidateQueries({ queryKey: ["store-manage", "my-stores"] })
      if (selectedStoreId) {
        queryClient.invalidateQueries({ queryKey: ["store-manage", selectedStoreId] })
      }
    }
  }, [activeTab, selectedStoreId, queryClient])

  // Refs for scroll and focus
  const nameRef = React.useRef<HTMLInputElement>(null)
  const taglineRef = React.useRef<HTMLInputElement>(null)
  const locationRef = React.useRef<HTMLInputElement>(null)
  const responseTimeRef = React.useRef<HTMLInputElement>(null)
  const descriptionRef = React.useRef<HTMLTextAreaElement>(null)

  const shippingPolicyRef = React.useRef<HTMLTextAreaElement>(null)
  const returnPolicyRef = React.useRef<HTMLTextAreaElement>(null)
  const warrantyPolicyRef = React.useRef<HTMLTextAreaElement>(null)

  const handleSaveProfile = () => {
    const errors = {
      name: !profileForm.name?.trim(),
      tagline: !profileForm.tagline?.trim(),
      location: !profileForm.location?.trim(),
      responseTime: !profileForm.responseTime?.trim(),
      description: !profileForm.description?.trim(),
    }

    setProfileErrors(errors)

    const hasError = Object.values(errors).some(Boolean)
    if (hasError) {
      if (errors.name) {
        nameRef.current?.focus()
        nameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      } else if (errors.tagline) {
        taglineRef.current?.focus()
        taglineRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      } else if (errors.location) {
        locationRef.current?.focus()
        locationRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      } else if (errors.responseTime) {
        responseTimeRef.current?.focus()
        responseTimeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      } else if (errors.description) {
        descriptionRef.current?.focus()
        descriptionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      }
      return
    }

    saveProfile()
  }

  const handlePolicyKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
    fieldName: "shippingPolicy" | "returnPolicy" | "warrantyPolicy"
  ) => {
    if (event.key === "Enter") {
      const textarea = event.currentTarget
      const value = textarea.value
      const selectionStart = textarea.selectionStart

      const textBeforeCursor = value.substring(0, selectionStart)
      const lines = textBeforeCursor.split("\n")
      const currentLine = lines[lines.length - 1]

      const bulletMatch = currentLine.match(/^(\s*-\s*)(.*)/)
      const numberedMatch = currentLine.match(/^(\s*(\d+)\.\s*)(.*)/)

      if (bulletMatch) {
        event.preventDefault()
        const marker = bulletMatch[1]
        const newValue = value.substring(0, selectionStart) + "\n" + marker + value.substring(selectionStart)

        setPolicyForm((current) => ({ ...current, [fieldName]: newValue }))

        window.setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart + 1 + marker.length
        }, 0)
      } else if (numberedMatch) {
        event.preventDefault()
        const currentNumber = parseInt(numberedMatch[2], 10)
        const nextNumber = currentNumber + 1
        const marker = `${numberedMatch[1].replace(numberedMatch[2], nextNumber.toString())}`
        const newValue = value.substring(0, selectionStart) + "\n" + marker + value.substring(selectionStart)

        setPolicyForm((current) => ({ ...current, [fieldName]: newValue }))

        window.setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart + 1 + marker.length
        }, 0)
      }
    }
  }

  const handleSavePolicy = () => {
    const errors = {
      shippingPolicy: !policyForm.shippingPolicy?.trim(),
      returnPolicy: !policyForm.returnPolicy?.trim(),
      warrantyPolicy: !policyForm.warrantyPolicy?.trim(),
    }

    setPolicyErrors(errors)

    const hasError = Object.values(errors).some(Boolean)
    if (hasError) {
      if (errors.shippingPolicy) {
        shippingPolicyRef.current?.focus()
        shippingPolicyRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      } else if (errors.returnPolicy) {
        returnPolicyRef.current?.focus()
        returnPolicyRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      } else if (errors.warrantyPolicy) {
        warrantyPolicyRef.current?.focus()
        warrantyPolicyRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      }
      return
    }

    savePolicy()
  }

  const handleRequestActivation = () => {
    const profileErrs = {
      name: !profileForm.name?.trim(),
      tagline: !profileForm.tagline?.trim(),
      location: !profileForm.location?.trim(),
      responseTime: !profileForm.responseTime?.trim(),
      description: !profileForm.description?.trim(),
    }
    const policyErrs = {
      shippingPolicy: !policyForm.shippingPolicy?.trim(),
      returnPolicy: !policyForm.returnPolicy?.trim(),
      warrantyPolicy: !policyForm.warrantyPolicy?.trim(),
    }

    setProfileErrors(profileErrs)
    setPolicyErrors(policyErrs)

    const hasProfileError = Object.values(profileErrs).some(Boolean)
    const hasPolicyError = Object.values(policyErrs).some(Boolean)

    if (hasProfileError) {
      if (activeTab === "store" && storeSubTab !== "profile") {
        setStoreSubTab("profile")
      } else if (activeTab === "create-store" && setupSubTab !== "profile") {
        setSetupSubTab("profile")
      }

      setTimeout(() => {
        if (profileErrs.name) {
          nameRef.current?.focus()
          nameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
        } else if (profileErrs.tagline) {
          taglineRef.current?.focus()
          taglineRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
        } else if (profileErrs.location) {
          locationRef.current?.focus()
          locationRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
        } else if (profileErrs.responseTime) {
          responseTimeRef.current?.focus()
          responseTimeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
        } else if (profileErrs.description) {
          descriptionRef.current?.focus()
          descriptionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }, 50)
      return
    }

    if (hasPolicyError) {
      if (activeTab === "store" && storeSubTab !== "policies") {
        setStoreSubTab("policies")
      } else if (activeTab === "create-store" && setupSubTab !== "policies") {
        setSetupSubTab("policies")
      }

      setTimeout(() => {
        if (policyErrs.shippingPolicy) {
          shippingPolicyRef.current?.focus()
          shippingPolicyRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
        } else if (policyErrs.returnPolicy) {
          returnPolicyRef.current?.focus()
          returnPolicyRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
        } else if (policyErrs.warrantyPolicy) {
          warrantyPolicyRef.current?.focus()
          warrantyPolicyRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }, 50)
      return
    }

    requestActivation()
  }

  const tabs = [
    { id: "store", label: t("tabStore"), icon: Store },
    { id: "create-store", label: t("tabCreateStore") || "Tạo gian hàng", icon: PlusCircle },
    { id: "invitations", label: ts("invitationSection"), icon: Mail },
    { id: "orders", label: t("tabOrders"), icon: Package },
  ]

  const menuSections = [
    {
      title: "Kênh người bán",
      items: [
        { id: "store", label: t("tabStore"), icon: Store },
        { id: "create-store", label: t("tabCreateStore") || "Tạo gian hàng", icon: PlusCircle },
        { id: "invitations", label: ts("invitationSection"), icon: Mail },
      ]
    },
    {
      title: "Giao dịch",
      items: [
        { id: "orders", label: t("tabOrders"), icon: Package },
      ]
    }
  ]

  const storeStatusLabel =
    normalizedStatus === "active"
      ? ts("statusActive")
      : normalizedStatus === "pendingactive"
        ? ts("statusPendingActive")
        : normalizedStatus === "suspended"
          ? ts("statusSuspended")
        : ts("statusDraft")

  const storeStatusHint =
    normalizedStatus === "active"
      ? ts("statusHintActive")
      : normalizedStatus === "pendingactive"
        ? ts("statusHintPendingActive")
        : normalizedStatus === "suspended"
          ? ts("statusHintSuspended")
        : ts("statusHintDraft")

  const latestRejectionReason = React.useMemo(() => {
    if (normalizedStatus === "draft" && activationRequests.length > 0) {
      const latest = activationRequests[0]
      if (latest.status.toLowerCase() === "rejected") {
        return latest.rejectionReason || "Không có lý do chi tiết."
      }
    }
    return null
  }, [normalizedStatus, activationRequests])

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

  return (
    <div className="relative z-10 flex flex-1 h-full w-full overflow-hidden text-foreground">
      {/* Floating Sidebar Toggle Button (Desktop Only - Slim Glass Pill) */}
      <button
        type="button"
        onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
        className={cn(
          "absolute top-1/2 -translate-y-1/2 z-30 transition-all duration-300 ease-in-out hidden md:flex h-10 w-[12px] hover:w-[18px] items-center justify-center rounded-r-xl border border-l-0 border-black bg-black shadow-[2px_0_10px_rgba(0,0,0,0.15)] text-white hover:bg-white hover:text-black hover:border-slate-200 cursor-pointer focus:outline-none group",
          isDesktopSidebarOpen ? "left-72" : "left-0"
        )}
        title={isDesktopSidebarOpen ? "Đóng menu" : "Mở menu"}
      >
        {isDesktopSidebarOpen ? (
          <ChevronLeft size={8} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
        ) : (
          <ChevronRight size={8} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        )}
      </button>

      {/* Sidebar - Desktop */}
      <aside
        className={cn(
          "absolute top-0 left-0 bottom-0 z-20 w-72 bg-[rgb(var(--store-surface-rgb)/0.4)] backdrop-blur-xl p-6 border-r border-[rgb(var(--store-border-rgb)/0.5)] transition-all duration-300 ease-in-out transform hidden md:flex flex-col",
          isDesktopSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="mb-8 px-2">
          <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground">Trung tâm cá nhân</h2>
        </div>

        <nav className="flex flex-col gap-6 flex-1">
          {menuSections.map((section) => {
            const isExpanded = expandedSections[section.title] ?? true
            return (
              <div key={section.title} className="flex flex-col gap-2">
                <SidebarSectionTrigger
                  expanded={isExpanded}
                  onClick={() => toggleSection(section.title)}
                  className="px-2"
                >
                  {section.title}
                </SidebarSectionTrigger>
                {isExpanded && (
                  <div className="flex flex-col gap-1">
                    {section.items.map((tab) => {
                      const Icon = tab.icon
                      const isActive = activeTab === tab.id
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-left text-sm font-medium transition-all cursor-pointer ${
                            isActive
                              ? "store-accent-soft border border-[rgb(var(--store-accent-rgb)/0.15)] text-foreground font-semibold shadow-[0_2px_8px_rgba(var(--store-accent-rgb),0.04)]"
                              : "border border-transparent text-muted-foreground hover:bg-[rgb(var(--store-accent-rgb)/0.06)] hover:text-foreground"
                          }`}
                        >
                          <Icon className={`h-5 w-5 shrink-0 ${isActive ? "store-accent-text" : ""}`} />
                          <span>{tab.label}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-1 flex flex-col min-h-0 overflow-hidden transition-[padding] duration-300 ease-in-out",
          isDesktopSidebarOpen ? "md:pl-72" : "md:pl-0"
        )}
      >
        {/* Mobile Header Tabs (Sticky at top on mobile) */}
        <div className="flex md:hidden flex-col border-b border-[rgb(var(--store-border-rgb)/0.7)] bg-[rgb(var(--store-surface-rgb)/0.8)] backdrop-blur-md px-4 py-3 shrink-0">
          <div className="mb-2">
            <h2 className="font-serif text-xl font-bold text-foreground">Trung tâm cá nhân</h2>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 shrink-0 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                    isActive
                      ? "store-accent-soft border-[rgb(var(--store-accent-rgb)/0.18)] text-foreground"
                      : "border-transparent text-muted-foreground hover:bg-[rgb(var(--store-accent-rgb)/0.08)] hover:text-foreground"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "store-accent-text" : ""}`} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Scrollable Content Pane */}
        <div id="space-scroll-container" className="flex-1 overflow-y-auto p-6 pb-12 md:p-8 md:pb-16 lg:p-10 lg:pb-20 [overscroll-behavior-y:none]">
          <div className="w-full">
            <div className="ds-glass-panel rounded-3xl p-6 shadow-2xl sm:p-8">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                  {activeTab === "orders" && (
                    <OrdersTab
                      orders={orders}
                      ordersData={ordersData}
                      statusClassName={statusClassName}
                      setSelectedOrderId={setSelectedOrderId}
                      t={t}
                      tc={tc}
                    />
                  )}

                  {activeTab === "store" && (
                    <StoreTab
                      hasStore={hasStore}
                      myStore={myStore || null}
                      myStores={myStores}
                      selectedStoreId={selectedStoreId}
                      setSelectedStoreId={setSelectedStoreId}
                      isStoreLoading={isStoreLoading}
                      normalizedStatus={normalizedStatus}
                      isActiveStore={isActiveStore}
                      isPendingActive={isPendingActive}
                      latestRejectionReason={latestRejectionReason}
                      storeStatusLabel={storeStatusLabel}
                      storeStatusHint={storeStatusHint}
                      setActiveTab={setActiveTab}
                      ts={ts}

                      // Profile Props
                      profileForm={profileForm}
                      setProfileForm={setProfileForm}
                      isProfileLocked={isProfileLocked}
                      isSavingProfile={isSavingProfile}
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

                      // Policies Props
                      policyForm={policyForm}
                      setPolicyForm={setPolicyForm}
                      isPolicyLocked={isPolicyLocked}
                      isSavingPolicy={isSavingPolicy}
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
                      storeSubTab={storeSubTab}
                      setStoreSubTab={setStoreSubTab}

                      // Members Props
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

                      // Products Props
                      productForm={productForm}
                      setProductForm={setProductForm}
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
                    />
                  )}

                  {activeTab === "create-store" && (
                    <CreateStoreTab
                      hasStore={hasStore}
                      myStore={myStore || null}
                      myStores={myStores}
                      selectedStoreId={selectedStoreId}
                      setSelectedStoreId={setSelectedStoreId}
                      createFormData={createFormData}
                      setCreateFormData={setCreateFormData}
                      createStoreMutation={createStoreMutation}
                      handleCreateStoreSubmit={handleCreateStoreSubmit}
                      setActiveTab={setActiveTab}
                      tBecome={tBecome}

                      // Setup
                      normalizedStatus={normalizedStatus}
                      isActiveStore={isActiveStore}
                      isPendingActive={isPendingActive}
                      latestRejectionReason={latestRejectionReason}
                      storeStatusLabel={storeStatusLabel}
                      storeStatusHint={storeStatusHint}
                      ts={ts}

                      // Profile Props
                      profileForm={profileForm}
                      setProfileForm={setProfileForm}
                      isProfileLocked={isProfileLocked}
                      isSavingProfile={isSavingProfile}
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

                      // Policies Props
                      policyForm={policyForm}
                      setPolicyForm={setPolicyForm}
                      isPolicyLocked={isPolicyLocked}
                      isSavingPolicy={isSavingPolicy}
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
                      setupSubTab={setupSubTab}
                      setSetupSubTab={setSetupSubTab}
                    />
                  )}

                  {activeTab === "invitations" && (
                    <InvitationsTab
                      invitations={invitations}
                      isLoadingInvitations={isLoadingInvitations}
                      isAcceptingInvitation={isAcceptingInvitation}
                      acceptInvitation={acceptInvitation}
                      getMemberRoleLabel={getMemberRoleLabel}
                      ts={ts}
                    />
                  )}
                </motion.div>
            </div>
          </div>
        </div>
      </div>

      <OrderDetailDialog
        selectedOrderId={selectedOrderId}
        setSelectedOrderId={setSelectedOrderId}
      />

      <ImageCropper
        open={isAvatarModalOpen}
        onOpenChange={setIsAvatarModalOpen}
        currentImageUrl={avatarForm.url}
        title="Cập nhật ảnh đại diện cửa hàng"
        circular={true}
        labelType="avatar"
        outputSize={1024}
        onSave={async (croppedBase64) => {
          const file = dataURLtoFile(croppedBase64, "avatar.jpg")
          uploadImage("avatar", file)
        }}
      />

      <ImageCropper
        open={isCoverModalOpen}
        onOpenChange={setIsCoverModalOpen}
        currentImageUrl={coverForm.url}
        title="Cập nhật ảnh bìa cửa hàng"
        circular={false}
        aspectRatio={4}
        labelType="cover"
        outputSize={2048}
        onSave={async (croppedBase64) => {
          const file = dataURLtoFile(croppedBase64, "cover.jpg")
          uploadImage("cover", file)
        }}
      />
    </div>
  )
}
