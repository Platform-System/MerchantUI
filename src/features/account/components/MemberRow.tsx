"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { User } from "lucide-react"
import { Avatar, AvatarFallback, Button } from "@platform-system/design-ui"
import { fetchUserProfileById, StoreMemberResponse } from "@/features/store/queries/store-manage-queries"

export interface MemberRowProps {
  member: StoreMemberResponse
  getMemberRoleLabel: (role: string) => string
  getMemberStatusLabel: (status: string) => string
  savePublishPermission: (userId: string, canPublishProductDirectly: boolean) => void
  isSavingPublishPermission: boolean
  isActiveStore: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ts: any
}

export function MemberRow({
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
