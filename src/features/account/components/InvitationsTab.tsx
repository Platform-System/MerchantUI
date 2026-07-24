"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { Mail, Check, Loader2, Calendar, Store, User } from "lucide-react"
import { Button, Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, Avatar, AvatarImage, AvatarFallback } from "@system/design-ui"
import {
  StoreInvitationResponse,
  fetchMyStore,
  fetchUserProfileById,
  fetchUserAvatarById,
} from "../../store/queries/store-manage-queries"

export interface InvitationsTabProps {
  invitations: StoreInvitationResponse[]
  isLoadingInvitations: boolean
  isAcceptingInvitation: boolean
  acceptInvitation: (storeId: string) => void
  getMemberRoleLabel: (role: string) => string
  ts: (key: string, values?: Record<string, string | number | Date>) => string
}

const getInvitationStatusBadge = (status?: string) => {
  const s = status?.toLowerCase()
  if (!s || s === "invited" || s === "pending") {
    return (
      <span className="inline-flex items-center font-medium text-amber-600 bg-amber-500/10 px-2.5 py-0.5 rounded-full text-[11px] whitespace-nowrap dark:text-amber-400">
        Chờ xác nhận
      </span>
    )
  }
  if (s === "active" || s === "accepted") {
    return (
      <span className="inline-flex items-center font-medium text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full text-[11px] whitespace-nowrap dark:text-emerald-400">
        Đã đồng ý
      </span>
    )
  }
  if (s === "rejected" || s === "declined" || s === "expired") {
    return (
      <span className="inline-flex items-center font-medium text-rose-600 bg-rose-500/10 px-2.5 py-0.5 rounded-full text-[11px] whitespace-nowrap dark:text-rose-400">
        {s === "expired" ? "Hết hạn" : "Đã từ chối"}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center font-medium text-muted-foreground bg-muted/50 px-2.5 py-0.5 rounded-full text-[11px] whitespace-nowrap">
      {status}
    </span>
  )
}

function InvitationRow({
  invite,
  isAcceptingInvitation,
  acceptInvitation,
  getMemberRoleLabel,
  ts,
}: {
  invite: StoreInvitationResponse
  isAcceptingInvitation: boolean
  acceptInvitation: (storeId: string) => void
  getMemberRoleLabel: (role: string) => string
  ts: (key: string, values?: Record<string, string | number | Date>) => string
}) {
  const { data: storeDetails } = useQuery({
    queryKey: ["store-details", invite.storeId],
    queryFn: () => fetchMyStore(invite.storeId),
    enabled: !!invite.storeId,
    staleTime: 5 * 60 * 1000,
  })

  const { data: inviterProfile } = useQuery({
    queryKey: ["user-profile", invite.ownerId],
    queryFn: () => (invite.ownerId ? fetchUserProfileById(invite.ownerId) : null),
    enabled: !!invite.ownerId,
    staleTime: 5 * 60 * 1000,
  })

  const { data: inviterAvatar } = useQuery({
    queryKey: ["user-avatar", invite.ownerId],
    queryFn: () => (invite.ownerId ? fetchUserAvatarById(invite.ownerId) : null),
    enabled: !!invite.ownerId,
    staleTime: 5 * 60 * 1000,
  })

  const storeAvatar = storeDetails?.profile?.avatar?.url
  const inviterName = inviterProfile
    ? [inviterProfile.firstName, inviterProfile.lastName].filter(Boolean).join(" ") ||
      inviterProfile.userName ||
      inviterProfile.email
    : invite.ownerId
      ? "Đang tải..."
      : "Chủ gian hàng"

  const dateObj = new Date(invite.invitedAt)
  const formattedDate = isNaN(dateObj.getTime())
    ? invite.invitedAt
    : `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`

  return (
    <tr className="hover:bg-[rgb(var(--store-border-rgb)/0.15)] transition-colors border-b border-[rgb(var(--store-border-rgb)/0.3)] last:border-none">
      {/* Tên & Avatar gian hàng */}
      <td className="py-3.5 pl-6 pr-4 whitespace-nowrap min-w-0">
        <div className="flex items-center gap-3">
          <Avatar className="size-9 shrink-0 border border-border/50 shadow-sm">
            {storeAvatar ? (
              <AvatarImage src={storeAvatar} alt={invite.storeName} className="object-cover" />
            ) : null}
            <AvatarFallback className="bg-zinc-100 text-zinc-600">
              <Store className="size-4 text-zinc-500" />
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold text-foreground truncate max-w-[200px]" title={invite.storeName}>
            {invite.storeName}
          </span>
        </div>
      </td>

      {/* Người mời (Avatar & Tên) */}
      <td className="p-4 whitespace-nowrap">
        <div className="flex items-center gap-2.5">
          <Avatar className="size-7 shrink-0 border border-border/40">
            {inviterAvatar ? (
              <AvatarImage src={inviterAvatar} alt={inviterName} className="object-cover" />
            ) : null}
            <AvatarFallback className="bg-zinc-100 text-zinc-600">
              <User className="size-3.5 text-zinc-500" />
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium text-foreground truncate max-w-[160px]" title={inviterName}>
            {inviterName}
          </span>
        </div>
      </td>

      {/* Vai trò */}
      <td className="p-4 text-center">
        <span className="font-medium text-[rgb(var(--store-accent-rgb))] bg-[rgb(var(--store-accent-rgb)/0.08)] px-2.5 py-0.5 rounded-full text-[11px] whitespace-nowrap">
          {getMemberRoleLabel(invite.role)}
        </span>
      </td>

      {/* Ngày mời */}
      <td className="p-4 text-center text-muted-foreground whitespace-nowrap">
        <span className="inline-flex items-center justify-center gap-1 text-xs">
          <Calendar size={12} className="text-muted-foreground/80" />
          {formattedDate}
        </span>
      </td>

      {/* Trạng thái */}
      <td className="p-4 text-center whitespace-nowrap">
        {getInvitationStatusBadge(invite.status)}
      </td>

      {/* Thao tác */}
      <td className="py-3.5 pl-4 pr-6 text-center">
        <Button
          className="store-accent-button store-accent-button-strong w-full max-w-[120px] mx-auto rounded-xl h-9 flex items-center justify-center gap-1.5 text-xs font-semibold transition-all duration-200 active:scale-[0.98]"
          onClick={() => acceptInvitation(invite.storeId)}
          disabled={isAcceptingInvitation}
        >
          {isAcceptingInvitation ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Đang chấp nhận</span>
            </>
          ) : (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>{ts("acceptButton")}</span>
            </>
          )}
        </Button>
      </td>
    </tr>
  )
}

export function InvitationsTab({
  invitations,
  isLoadingInvitations,
  isAcceptingInvitation,
  acceptInvitation,
  getMemberRoleLabel,
  ts,
}: InvitationsTabProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h3 className="font-serif text-2xl font-semibold text-foreground">
          {ts("invitationSection")}
        </h3>
        <p className="text-sm text-muted-foreground">{ts("invitationSectionDesc")}</p>
      </div>

      {isLoadingInvitations ? (
        <div className="flex min-h-[240px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : invitations.length === 0 ? (
        <Empty className="border border-[rgb(var(--store-border-rgb)/0.7)] bg-transparent px-6 py-12 rounded-3xl min-h-[300px] flex flex-col justify-center items-center">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="store-surface-soft store-muted-text flex h-16 w-16 items-center justify-center rounded-full">
              <Mail className="h-8 w-8" />
            </EmptyMedia>
            <EmptyTitle>{ts("noInvitations")}</EmptyTitle>
            <EmptyDescription className="max-w-md">
              Bạn hiện không có lời mời gia nhập gian hàng nào đang chờ xử lý.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="overflow-x-auto w-full border border-[rgb(var(--store-border-rgb)/0.6)] rounded-2xl bg-background shadow-sm">
          <table className="w-full text-left border-collapse text-xs table-fixed min-w-[780px]">
            <thead>
              <tr className="bg-muted/30 border-b border-[rgb(var(--store-border-rgb)/0.6)] text-muted-foreground font-semibold">
                <th className="py-3.5 pl-6 pr-4 text-left w-[25%]">Tên gian hàng</th>
                <th className="p-4 text-left w-[22%]">Người mời</th>
                <th className="p-4 text-center w-[13%]">Vai trò mời</th>
                <th className="p-4 text-center w-[14%]">Ngày mời</th>
                <th className="p-4 text-center w-[14%]">Trạng thái</th>
                <th className="py-3.5 pl-4 pr-6 text-center w-[125px]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--store-border-rgb)/0.3)] font-medium text-foreground">
              {invitations.map((invite) => (
                <InvitationRow
                  key={invite.storeId}
                  invite={invite}
                  isAcceptingInvitation={isAcceptingInvitation}
                  acceptInvitation={acceptInvitation}
                  getMemberRoleLabel={getMemberRoleLabel}
                  ts={ts}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

