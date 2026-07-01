"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { Input, Button } from "@platform-system/design-ui"
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

      <div className="pt-4 border-t border-[rgb(var(--store-border-rgb)/0.5)]">
        <h5 className="font-semibold text-foreground text-sm mb-4">Danh sách thành viên</h5>
        
        {isLoadingMembers ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : members.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">Chưa có thành viên nào.</p>
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
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
