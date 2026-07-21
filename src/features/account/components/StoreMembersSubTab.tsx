"use client"

import * as React from "react"
import { Loader2, X, Check, User, Calendar } from "lucide-react"
import {
  Input,
  Button,
  FilterBar,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
} from "@system/design-ui"
import { useQueries, useQuery } from "@tanstack/react-query"
import { fetchUserProfileById, lookupUser, fetchUserAvatarById, UserProfileResponse, StoreSentInvitationResponse } from "@/features/store/queries/store-manage-queries"
import { MemberRow } from "./MemberRow"
import { StoreMemberResponse } from "@/features/store/queries/store-manage-queries"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/core/providers/AuthProvider"

export interface StoreMembersSubTabProps {
  inviteForm: {
    userId: string
    roleId: string
  }
  setInviteForm: React.Dispatch<React.SetStateAction<{
    userId: string
    roleId: string
  }>>
  inviteMember: (resolvedUserId?: string) => void
  isInvitingMember: boolean
  members: StoreMemberResponse[]
  isLoadingMembers: boolean
  getMemberRoleLabel: (role: string) => string
  getMemberStatusLabel: (status: string) => string
  savePublishPermission: (userId: string, canPublishProductDirectly: boolean) => void
  isSavingPublishPermission: boolean
  isActiveStore: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ts: (key: string, values?: any) => string
  storeRoles: import("@/features/store/queries/store-manage-queries").StoreRoleResponse[]
  storeSentInvitations: StoreSentInvitationResponse[]
  isLoadingSentInvitations: boolean
  cancelSentInvitation: (userId: string) => void
  isCancelingInvitation: boolean
}

export function StoreMembersSubTab({
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
  isActiveStore,
  ts,
  storeRoles,
  storeSentInvitations,
  isLoadingSentInvitations,
  cancelSentInvitation,
  isCancelingInvitation,
}: StoreMembersSubTabProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState("Tất cả vai trò")
  const [activeInviteTab, setActiveInviteTab] = React.useState<"members" | "send" | "sent">("members")
  const inviteInput = inviteForm.userId.trim()
  const canLookupUser = inviteInput.length >= 3

  const { keycloak } = useAuth()
  const currentUserId = keycloak?.subject

  const {
    data: resolvedUser,
    isFetching: isCheckingUser,
  } = useQuery({
    queryKey: ["store-member-lookup", inviteInput],
    queryFn: async () => {
      const isGuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(inviteInput)
      return isGuid ? fetchUserProfileById(inviteInput) : lookupUser(inviteInput)
    },
    enabled: canLookupUser,
    staleTime: 30 * 1000,
    retry: false,
  })

  const checkingStatus = React.useMemo<"idle" | "checking" | "found" | "not_found">(() => {
    if (!canLookupUser) {
      return "idle"
    }

    if (isCheckingUser) {
      return "checking"
    }

    return resolvedUser ? "found" : "not_found"
  }, [canLookupUser, isCheckingUser, resolvedUser])

  const isCurrentUser = React.useMemo(() => {
    if (!resolvedUser || !currentUserId) return false
    const currentIdLower = currentUserId.toLowerCase()
    const resolvedIdLower = resolvedUser.id?.toLowerCase()
    const resolvedIdentityIdLower = resolvedUser.identityId?.toLowerCase()
    
    const tokenUsername = keycloak?.tokenParsed?.preferred_username?.toLowerCase()
    const tokenEmail = keycloak?.tokenParsed?.email?.toLowerCase()
    const resolvedUsername = resolvedUser.userName?.toLowerCase()
    const resolvedEmail = resolvedUser.email?.toLowerCase()

    return (
      resolvedIdLower === currentIdLower ||
      resolvedIdentityIdLower === currentIdLower ||
      (!!tokenUsername && resolvedUsername === tokenUsername) ||
      (!!tokenEmail && resolvedEmail === tokenEmail)
    )
  }, [resolvedUser, currentUserId, keycloak])

  const isAlreadyMember = React.useMemo(() => {
    if (!resolvedUser) return false
    const resolvedIdLower = resolvedUser.id?.toLowerCase()
    const resolvedIdentityIdLower = resolvedUser.identityId?.toLowerCase()
    return members.some((m) => {
      const memberIdLower = m.userId?.toLowerCase()
      return memberIdLower === resolvedIdLower || memberIdLower === resolvedIdentityIdLower
    })
  }, [members, resolvedUser])

  const hasPendingInvitation = React.useMemo(() => {
    if (!resolvedUser) return false
    const resolvedIdLower = resolvedUser.id?.toLowerCase()
    const resolvedIdentityIdLower = resolvedUser.identityId?.toLowerCase()
    return (storeSentInvitations || []).some((i) => {
      const inviteIdLower = i.userId?.toLowerCase()
      return inviteIdLower === resolvedIdLower || inviteIdLower === resolvedIdentityIdLower
    })
  }, [storeSentInvitations, resolvedUser])

  const validationError = isCurrentUser
    ? "Bạn không thể tự mời chính mình."
    : isAlreadyMember
    ? "Người dùng đã là thành viên của cửa hàng."
    : hasPendingInvitation
    ? "Lời mời đã được gửi trước đó và đang chờ xác nhận."
    : null

  // Fetch user profiles for all sent invitations in parallel
  const sentInvitationUserQueries = useQueries({
    queries: (storeSentInvitations || []).map((invite) => ({
      queryKey: ["users", invite.userId],
      queryFn: () => fetchUserProfileById(invite.userId),
      staleTime: 5 * 60 * 1000,
      retry: false,
    })),
  })

  // Fetch user avatars for all sent invitations in parallel
  const sentInvitationAvatarQueries = useQueries({
    queries: (storeSentInvitations || []).map((invite) => ({
      queryKey: ["users", invite.userId, "avatar"],
      queryFn: () => fetchUserAvatarById(invite.userId),
      staleTime: 5 * 60 * 1000,
      retry: false,
    })),
  })

  const { data: resolvedAvatarUrl } = useQuery({
    queryKey: ["users", resolvedUser?.id, "avatar"],
    queryFn: () => resolvedUser ? fetchUserAvatarById(resolvedUser.id) : null,
    enabled: !!resolvedUser?.id,
    staleTime: 5 * 60 * 1000,
  })


  // Fetch user profiles for all members in parallel so we can filter by display name/email/username locally
  const memberQueries = useQueries({
    queries: (members || []).map((member) => ({
      queryKey: ["users", member.userId],
      queryFn: () => fetchUserProfileById(member.userId),
      staleTime: 5 * 60 * 1000,
      retry: false,
    })),
  })

  // Filter members list based on role category and search query
  const filteredMembers = React.useMemo(() => {
    return (members || []).filter((member, index) => {
      // 1. Role Filter
      if (activeCategory !== "Tất cả vai trò") {
        const roleLabel = getMemberRoleLabel(member.role)
        if (roleLabel !== activeCategory) return false
      }

      // 2. Search Query Filter (Username, Email, Full Name, User ID)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const profile = memberQueries[index]?.data

        const displayName = profile
          ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || profile.userName || profile.email
          : member.userId
        const email = profile?.email || ""
        const userName = profile?.userName || ""

        const matchesName = displayName.toLowerCase().includes(query)
        const matchesEmail = email.toLowerCase().includes(query)
        const matchesUsername = userName.toLowerCase().includes(query)
        const matchesUserId = member.userId.toLowerCase().includes(query)

        if (!matchesName && !matchesEmail && !matchesUsername && !matchesUserId) {
          return false
        }
      }

      return true
    })
  }, [members, memberQueries, activeCategory, searchQuery, getMemberRoleLabel])

  const roleCategories = ["Chủ sở hữu", "Quản lý", "Nhân viên"]

  return (
    <div className="space-y-4 rounded-2xl border border-[rgb(var(--store-border-rgb)/0.7)] p-5 animate-in fade-in duration-300">
      <div className="space-y-4">
        <div>
          <h4 className="text-lg font-semibold text-foreground">{ts("membersSection")}</h4>
          <p className="text-sm text-muted-foreground">Quản lý thành viên và các lời mời tham gia gian hàng của bạn.</p>
        </div>

        {/* Tab buttons */}
        <div className="flex border-b border-[rgb(var(--store-border-rgb)/0.4)]">
          <button
            type="button"
            onClick={() => setActiveInviteTab("members")}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap -mb-[2px] ${
              activeInviteTab === "members"
                ? "border-[rgb(var(--store-accent-rgb))] text-[rgb(var(--store-accent-rgb))]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Thành viên
          </button>
          <button
            type="button"
            onClick={() => setActiveInviteTab("send")}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap -mb-[2px] ${
              activeInviteTab === "send"
                ? "border-[rgb(var(--store-accent-rgb))] text-[rgb(var(--store-accent-rgb))]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Gửi lời mời
          </button>
          <button
            type="button"
            onClick={() => setActiveInviteTab("sent")}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap -mb-[2px] ${
              activeInviteTab === "sent"
                ? "border-[rgb(var(--store-accent-rgb))] text-[rgb(var(--store-accent-rgb))]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Lời mời đã gửi</span>
            {storeSentInvitations.length > 0 && (
              <span className="inline-flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono text-[10px] font-bold h-5 w-5 rounded-full border border-neutral-300/60 dark:border-neutral-700/60 shrink-0 select-none animate-in zoom-in duration-200">
                {storeSentInvitations.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {activeInviteTab === "members" && (
            <motion.div
              key="members-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              {isLoadingMembers ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : members.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[rgb(var(--store-border-rgb)/0.8)] py-8 text-center bg-muted/5">
                  <p className="text-sm text-muted-foreground">Chưa có thành viên nào.</p>
                </div>
              ) : (
                <div className="space-y-4 pt-1">
                  <FilterBar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                    categories={roleCategories}
                    searchPlaceholder="Tìm kiếm theo tên hoặc email..."
                    allCategoryLabel="Tất cả vai trò"
                    includeAllOption={true}
                    variant="inline"
                    className="max-w-none xl:max-w-none w-full"
                  />

                  {filteredMembers.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[rgb(var(--store-border-rgb)/0.8)] py-8 text-center bg-muted/5">
                      <p className="text-sm text-muted-foreground">Không tìm thấy thành viên nào phù hợp.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto w-full border border-[rgb(var(--store-border-rgb)/0.6)] rounded-2xl bg-background">
                      <table className="w-full text-left border-collapse text-xs table-fixed min-w-[800px]">
                        <thead>
                          <tr className="bg-muted/30 border-b border-[rgb(var(--store-border-rgb)/0.6)] text-muted-foreground font-semibold">
                            <th className="py-3.5 pl-6 pr-4 text-left w-[18%]">Tên tài khoản</th>
                            <th className="p-4 text-left w-[22%]">Email</th>
                            <th className="p-4 text-left w-[18%]">Họ và tên</th>
                            <th className="p-4 text-center w-[12%]">Vai trò</th>
                            <th className="p-4 text-center w-[13%]">Ngày tham gia</th>
                            <th className="p-4 text-center w-[17%]">Đăng bán trực tiếp</th>
                            <th className="py-3.5 pl-4 pr-6 text-center w-[150px]">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[rgb(var(--store-border-rgb)/0.3)] font-medium text-foreground">
                          {filteredMembers.map((member) => (
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
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {activeInviteTab === "send" && (
            <motion.div
              key="send-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-3"
            >
              <div className="relative">
                <Input
                  className="h-11 rounded-xl pr-10"
                  placeholder={ts("memberUserId")}
                  value={inviteForm.userId}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setInviteForm((current) => ({ ...current, userId: event.target.value }))
                  }
                />
                {inviteForm.userId && (
                  <button
                    type="button"
                    onClick={() => setInviteForm((current) => ({ ...current, userId: "" }))}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-[rgb(var(--store-border-rgb)/0.15)] transition-colors duration-150"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="relative min-h-[24px]">
                <AnimatePresence mode="wait">
                  {checkingStatus === "checking" && (
                    <motion.div
                      key="checking"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.15 }}
                      className="text-xs text-muted-foreground flex items-center gap-2 px-1 py-1"
                    >
                      <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                      <span>Đang kiểm tra tài khoản...</span>
                    </motion.div>
                  )}

                  {checkingStatus === "not_found" && (
                    <motion.div
                      key="not_found"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.15 }}
                      className="text-xs text-destructive font-medium flex items-center gap-2 px-1 py-1"
                    >
                      <X className="h-4 w-4 text-destructive shrink-0" />
                      <span>Không tìm thấy thành viên phù hợp</span>
                    </motion.div>
                  )}

                  {checkingStatus === "found" && resolvedUser && (
                    <motion.div
                      key="found"
                      initial={{ opacity: 0, scale: 0.96, y: -12 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96, y: 12 }}
                      transition={{ type: "spring", stiffness: 350, damping: 26 }}
                      className="bg-[rgb(var(--store-accent-rgb)/0.03)] border border-[rgb(var(--store-accent-rgb)/0.1)] p-4 rounded-2xl space-y-4 shadow-sm"
                    >
                      {/* User Info Header */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-10 border border-[rgb(var(--store-accent-rgb)/0.15)] shrink-0">
                            {resolvedAvatarUrl ? (
                              <AvatarImage src={resolvedAvatarUrl} alt={resolvedUser.userName} className="object-cover shrink-0" />
                            ) : null}
                            <AvatarFallback className="bg-[rgb(var(--store-accent-rgb)/0.08)] text-[rgb(var(--store-accent-rgb))] font-bold">
                              {resolvedUser.userName?.substring(0, 2).toUpperCase() || "US"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground text-sm truncate block max-w-[150px]" title={resolvedUser.userName}>
                                {resolvedUser.userName}
                              </span>
                              {validationError ? (
                                <Badge variant="destructive" className="text-[10px] px-1.5 py-0 select-none font-medium flex items-center gap-0.5 rounded-full shrink-0">
                                  <X className="h-2.5 w-2.5" />
                                  <span>Không hợp lệ</span>
                                </Badge>
                              ) : (
                                <Badge variant="success" className="text-[10px] px-1.5 py-0 select-none font-medium flex items-center gap-0.5 rounded-full shrink-0">
                                  <Check className="h-2.5 w-2.5" />
                                  <span>Tìm thấy</span>
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate block max-w-[200px]" title={resolvedUser.email}>
                              {resolvedUser.firstName || resolvedUser.lastName
                                ? `${resolvedUser.firstName || ""} ${resolvedUser.lastName || ""}`.trim()
                                : resolvedUser.email}
                            </p>
                            {validationError && (
                              <p className="text-xs text-destructive font-semibold mt-1">
                                {validationError}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Role select & Invite Button (Aligned side-by-side) */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-3 border-t border-[rgb(var(--store-border-rgb)/0.5)]">
                        <div className="flex items-center gap-3">
                          <label className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Vai trò:</label>
                          <div className="w-[160px]">
                            <Select
                              value={inviteForm.roleId}
                              onValueChange={(value: string) =>
                                setInviteForm((current) => ({ ...current, roleId: value }))
                              }
                              disabled={!!validationError}
                            >
                              <SelectTrigger className="h-10 rounded-xl w-full bg-background border-[rgb(var(--store-border-rgb)/0.5)]">
                                <SelectValue placeholder="Chọn vai trò" />
                              </SelectTrigger>
                              <SelectContent>
                                {storeRoles
                                  .filter((r) => r.name.toLowerCase() !== "owner")
                                  .map((role) => (
                                    <SelectItem key={role.id} value={role.id}>
                                      {role.name.toLowerCase() === "manager"
                                        ? ts("roleManager")
                                        : role.name.toLowerCase() === "staff"
                                        ? ts("roleStaff")
                                        : role.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <Button
                          className="store-accent-button store-accent-button-strong rounded-xl whitespace-nowrap w-full sm:w-auto h-10 px-5 font-semibold text-sm transition-all"
                          onClick={() => inviteMember(resolvedUser?.identityId)}
                          disabled={
                            isInvitingMember ||
                            !inviteForm.userId.trim() ||
                            !isActiveStore ||
                            !!validationError
                          }
                        >
                          {isInvitingMember ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              {ts("inviting")}
                            </span>
                          ) : (
                            ts("inviteMember")
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {activeInviteTab === "sent" && (
            <motion.div
              key="sent-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-3"
            >
              {isLoadingSentInvitations ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : storeSentInvitations.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-[rgb(var(--store-border-rgb)/0.5)] rounded-2xl bg-muted/5">
                  <p className="text-xs text-muted-foreground">Không có lời mời nào đang chờ xử lý.</p>
                </div>
              ) : (
                <div className="overflow-x-auto w-full border border-[rgb(var(--store-border-rgb)/0.6)] rounded-2xl bg-background">
                  <table className="w-full text-left border-collapse text-xs table-fixed min-w-[800px]">
                    <thead>
                      <tr className="bg-muted/30 border-b border-[rgb(var(--store-border-rgb)/0.6)] text-muted-foreground font-semibold">
                        <th className="py-3.5 pl-6 pr-4 text-left w-[18%]">Tên tài khoản</th>
                        <th className="p-4 text-left w-[22%]">Email</th>
                        <th className="p-4 text-left w-[18%]">Họ và tên</th>
                        <th className="p-4 text-center w-[12%] font-semibold">Vai trò mời</th>
                        <th className="p-4 text-center w-[13%]">Ngày mời</th>
                        <th className="p-4 text-center w-[17%]">Trạng thái</th>
                        <th className="py-3.5 pl-4 pr-6 text-center w-[150px]">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgb(var(--store-border-rgb)/0.3)] font-medium text-foreground">
                      {storeSentInvitations.map((invite: StoreSentInvitationResponse, index: number) => {
                        const userQuery = sentInvitationUserQueries[index]?.data as UserProfileResponse | undefined
                        const userName = userQuery?.userName || invite.userId
                        const email = userQuery?.email || "—"
                        const fullName = userQuery
                          ? `${userQuery.firstName || ""} ${userQuery.lastName || ""}`.trim() || "—"
                          : "—"

                        const avatarUrl = sentInvitationAvatarQueries[index]?.data as string | undefined
                        const avatarSrc = avatarUrl || ""

                        return (
                          <tr key={invite.userId} className="hover:bg-[rgb(var(--store-border-rgb)/0.15)] transition-colors border-b border-[rgb(var(--store-border-rgb)/0.3)] last:border-none">
                            <td className="py-3.5 pl-6 pr-4 whitespace-nowrap min-w-0">
                              <div className="flex items-center gap-3">
                                <Avatar className="size-8 shrink-0">
                                  {avatarSrc && <AvatarImage src={avatarSrc} alt={userName} className="object-cover shrink-0" />}
                                  <AvatarFallback>
                                    <User className="size-4" />
                                  </AvatarFallback>
                                </Avatar>
                                {sentInvitationUserQueries[index]?.isLoading ? (
                                  <div className="h-4 w-20 animate-pulse bg-muted rounded" />
                                ) : (
                                  <span className="font-semibold text-foreground truncate block max-w-[120px]" title={userName}>
                                    {userName}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-4 whitespace-nowrap truncate text-muted-foreground">
                              {sentInvitationUserQueries[index]?.isLoading ? (
                                <div className="h-4 w-28 animate-pulse bg-muted rounded" />
                              ) : (
                                email
                              )}
                            </td>
                            <td className="p-4 whitespace-nowrap truncate text-muted-foreground">
                              {sentInvitationUserQueries[index]?.isLoading ? (
                                <div className="h-4 w-20 animate-pulse bg-muted rounded" />
                              ) : (
                                fullName
                              )}
                            </td>
                            <td className="p-4 text-center">
                              <span className="font-semibold text-foreground">
                                {invite.role.toLowerCase() === "manager"
                                  ? ts("roleManager")
                                  : invite.role.toLowerCase() === "staff"
                                  ? ts("roleStaff")
                                  : invite.role}
                              </span>
                            </td>
                            <td className="p-4 text-center text-muted-foreground whitespace-nowrap">
                              <span className="inline-flex items-center justify-center gap-1 text-xs">
                                <Calendar size={12} className="text-muted-foreground/80" />
                                {new Date(invite.invitedAt).toLocaleDateString("vi-VN")}
                              </span>
                            </td>
                            <td className="p-4 text-center whitespace-nowrap">
                              <Badge variant="warning" className="rounded-full px-2 py-0.5 text-[10px] font-semibold">
                                Đã mời
                              </Badge>
                            </td>
                            <td className="py-3.5 pl-4 pr-6 text-center whitespace-nowrap">
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-8 rounded-xl text-xs font-semibold px-4"
                                onClick={() => cancelSentInvitation(invite.userId)}
                                disabled={isCancelingInvitation}
                              >
                                {isCancelingInvitation ? "Đang hủy..." : "Hủy mời"}
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

