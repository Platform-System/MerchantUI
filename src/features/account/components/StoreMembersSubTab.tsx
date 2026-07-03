"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { Input, Button, FilterBar } from "@platform-system/design-ui"
import { useQueries } from "@tanstack/react-query"
import { fetchUserProfileById } from "@/features/store/queries/store-manage-queries"
import { MemberRow } from "./MemberRow"
import { StoreMemberResponse } from "@/features/store/queries/store-manage-queries"

export interface StoreMembersSubTabProps {
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
  members: StoreMemberResponse[]
  isLoadingMembers: boolean
  getMemberRoleLabel: (role: string) => string
  getMemberStatusLabel: (status: string) => string
  savePublishPermission: (userId: string, canPublishProductDirectly: boolean) => void
  isSavingPublishPermission: boolean
  isActiveStore: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ts: (key: string, values?: any) => string
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
}: StoreMembersSubTabProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState("Tất cả vai trò")

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

        <div className="flex items-center gap-2 py-1">
          <input
            id="canPublishProductDirectly"
            type="checkbox"
            checked={inviteForm.canPublishProductDirectly}
            onChange={(e) =>
              setInviteForm((current) => ({
                ...current,
                canPublishProductDirectly: e.target.checked
              }))
            }
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
          />
          <label htmlFor="canPublishProductDirectly" className="text-xs text-muted-foreground cursor-pointer select-none">
            Cho phép đăng bán trực tiếp không cần qua kiểm duyệt của chủ sở hữu
          </label>
        </div>

        <Button
          className="store-accent-button store-accent-button-strong rounded-xl"
          onClick={inviteMember}
          disabled={isInvitingMember || !inviteForm.userId.trim() || !isActiveStore}
        >
          {isInvitingMember ? ts("inviting") : ts("inviteMember")}
        </Button>
      </div>

      <div className="pt-6 border-t border-[rgb(var(--store-border-rgb)/0.5)] space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h5 className="font-semibold text-foreground text-sm">Danh sách thành viên</h5>
        </div>

        {isLoadingMembers ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : members.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">Chưa có thành viên nào.</p>
        ) : (
          <div className="space-y-4">
            {/* Filter and Search Bar */}
            <FilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              categories={roleCategories}
              searchPlaceholder="Tìm kiếm theo tên, email hoặc ID..."
              allCategoryLabel="Tất cả vai trò"
              includeAllOption={true}
              variant="inline"
              className="max-w-none xl:max-w-none w-full"
            />

            {filteredMembers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[rgb(var(--store-border-rgb)/0.8)] py-8 text-center">
                <p className="text-sm text-muted-foreground">Không tìm thấy thành viên nào phù hợp.</p>
              </div>
            ) : (
              <div className="overflow-x-auto w-full border border-[rgb(var(--store-border-rgb)/0.6)] rounded-2xl">
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
      </div>
    </div>
  )
}
