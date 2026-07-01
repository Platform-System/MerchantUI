"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { Calendar, Shield, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage, Badge, Button } from "@platform-system/design-ui"
import { fetchUserProfileById, fetchUserAvatarById, StoreMemberResponse } from "@/features/store/queries/store-manage-queries"

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

  const { data: avatarUrl } = useQuery({
    queryKey: ["users", member.userId, "avatar"],
    queryFn: () => fetchUserAvatarById(member.userId),
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  const displayName = userProfile
    ? `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim() || userProfile.userName || userProfile.email
    : member.userId

  const email = userProfile?.email || ""

  const isOwner = member.role.toLowerCase() === "owner"

  const localAvatar = typeof window !== "undefined"
    ? localStorage.getItem("user_avatar_" + member.userId)
    : null

  const avatarSrc = avatarUrl || localAvatar

  return (
    <tr className="hover:bg-[rgb(var(--store-border-rgb)/0.15)] transition-colors border-b border-[rgb(var(--store-border-rgb)/0.3)] last:border-none">
      {/* Tên tài khoản */}
      <td className="py-4 pl-6 pr-4 whitespace-nowrap min-w-0">
        <div className="flex items-center gap-3">
          <Avatar className="size-8 shrink-0">
            {avatarSrc && <AvatarImage src={avatarSrc} alt={displayName} className="object-cover shrink-0" />}
            <AvatarFallback>
              <User className="size-4" />
            </AvatarFallback>
          </Avatar>
          {isLoading ? (
            <div className="h-4 w-20 animate-pulse bg-muted rounded" />
          ) : (
            <span className="font-semibold text-foreground truncate block max-w-[120px]" title={displayName}>
              {userProfile?.userName || displayName}
            </span>
          )}
        </div>
      </td>

      {/* Email */}
      <td className="p-4 whitespace-nowrap text-muted-foreground truncate max-w-[160px]" title={email}>
        {isLoading ? (
          <div className="h-4 w-28 animate-pulse bg-muted rounded" />
        ) : (
          email || <span className="text-muted-foreground/50">—</span>
        )}
      </td>

      {/* Họ và tên */}
      <td className="p-4 whitespace-nowrap text-foreground truncate max-w-[150px]" title={displayName}>
        {isLoading ? (
          <div className="h-4 w-24 animate-pulse bg-muted rounded" />
        ) : userProfile?.firstName || userProfile?.lastName ? (
          `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim()
        ) : (
          <span className="text-muted-foreground/50">—</span>
        )}
      </td>

      {/* Vai trò */}
      <td className="p-4">
        <div className="flex flex-col items-center justify-center gap-0.5">
          <Badge
            variant={isOwner ? "default" : "secondary"}
            className="flex items-center gap-1 text-[10px] px-1.5 py-0"
          >
            <Shield className="size-2.5" />
            {getMemberRoleLabel(member.role)}
          </Badge>
          <span className="text-[9px] text-muted-foreground">
            ({getMemberStatusLabel(member.status)})
          </span>
        </div>
      </td>

      {/* Ngày tham gia */}
      <td className="p-4 whitespace-nowrap text-center text-muted-foreground">
        <span className="inline-flex items-center justify-center gap-1 text-xs">
          <Calendar size={12} className="text-muted-foreground/80" />
          {new Date(member.joinedAt).toLocaleDateString("vi-VN")}
        </span>
      </td>

      {/* Quyền Publish */}
      <td className="p-4 text-center">
        <Badge
          variant={member.canPublishProductDirectly ? "success" : "secondary"}
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
        >
          {member.canPublishProductDirectly ? ts("publishDirectlyEnabled") : ts("publishDirectlyDisabled")}
        </Badge>
      </td>

      {/* Thao tác */}
      <td className="py-4 pl-4 pr-6 whitespace-nowrap text-center">
        {isOwner ? (
          <span className="text-muted-foreground/50">—</span>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="inline-flex items-center gap-1 text-xs py-1 h-8 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-900 transition-all font-semibold w-full max-w-[130px] justify-center"
            onClick={() => savePublishPermission(member.userId, !member.canPublishProductDirectly)}
            disabled={isSavingPublishPermission || !isActiveStore || member.status.toLowerCase() !== "active"}
          >
            {isSavingPublishPermission
              ? ts("saving")
              : member.canPublishProductDirectly
                ? ts("disablePublishPermission")
                : ts("savePublishPermission")}
          </Button>
        )}
      </td>
    </tr>
  )
}
