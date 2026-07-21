"use client"

import * as React from "react"
import { Mail, Check, Loader2, Calendar } from "lucide-react"
import { Button, Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@system/design-ui"

export interface InvitationsTabProps {
  invitations: import("../../store/queries/store-manage-queries").StoreInvitationResponse[]
  isLoadingInvitations: boolean
  isAcceptingInvitation: boolean
  acceptInvitation: (storeId: string) => void
  getMemberRoleLabel: (role: string) => string
  ts: (key: string, values?: Record<string, string | number | Date>) => string
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
          <table className="w-full text-left border-collapse text-xs table-fixed min-w-[600px]">
            <thead>
              <tr className="bg-muted/30 border-b border-[rgb(var(--store-border-rgb)/0.6)] text-muted-foreground font-semibold">
                <th className="py-3.5 pl-6 pr-4 text-left w-[40%]">Tên gian hàng</th>
                <th className="p-4 text-center w-[20%]">Vai trò mời</th>
                <th className="p-4 text-center w-[20%]">Ngày mời</th>
                <th className="py-3.5 pl-4 pr-6 text-center w-[150px]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--store-border-rgb)/0.3)] font-medium text-foreground">
              {invitations.map((invite) => {
                const formattedDate = new Date(invite.invitedAt).toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
                return (
                  <tr key={invite.storeId} className="hover:bg-[rgb(var(--store-border-rgb)/0.15)] transition-colors border-b border-[rgb(var(--store-border-rgb)/0.3)] last:border-none">
                    <td className="py-3.5 pl-6 pr-4 whitespace-nowrap min-w-0 font-semibold text-foreground truncate" title={invite.storeName}>
                      {invite.storeName}
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-medium text-[rgb(var(--store-accent-rgb))] bg-[rgb(var(--store-accent-rgb)/0.08)] px-2.5 py-0.5 rounded-full text-[11px] whitespace-nowrap">
                        {getMemberRoleLabel(invite.role)}
                      </span>
                    </td>
                    <td className="p-4 text-center text-muted-foreground whitespace-nowrap">
                      <span className="inline-flex items-center justify-center gap-1 text-xs">
                        <Calendar size={12} className="text-muted-foreground/80" />
                        {formattedDate}
                      </span>
                    </td>
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
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
