"use client"

import * as React from "react"
import { Mail, Check, Loader2 } from "lucide-react"
import { Button, Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@platform-system/design-ui"

export interface InvitationsTabProps {
  invitations: any[]
  isLoadingInvitations: boolean
  isAcceptingInvitation: boolean
  acceptInvitation: (storeId: string) => void
  getMemberRoleLabel: (role: string) => string
  ts: (key: string, values?: any) => string
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {invitations.map((invite) => {
            const formattedDate = new Date(invite.invitedAt).toLocaleDateString("vi-VN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
            return (
              <div
                key={invite.storeId}
                className="flex flex-col gap-3 rounded-2xl border border-[rgb(var(--store-border-rgb)/0.7)] p-5 bg-background hover:border-[rgb(var(--store-accent-rgb)/0.4)] transition-all duration-200 shadow-sm hover:shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h5 className="font-semibold text-foreground text-base truncate">{invite.storeName}</h5>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
                      <span className="font-medium text-[rgb(var(--store-accent-rgb))] bg-[rgb(var(--store-accent-rgb)/0.08)] px-2.5 py-0.5 rounded-full">
                        {ts("invitationRole", { role: getMemberRoleLabel(invite.role) })}
                      </span>
                      <span className="flex items-center gap-1 mt-0.5">
                        {ts("invitedAt", { date: formattedDate })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <Button
                    className="store-accent-button store-accent-button-strong w-full rounded-xl h-10 flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-200 active:scale-[0.98]"
                    onClick={() => acceptInvitation(invite.storeId)}
                    disabled={isAcceptingInvitation}
                  >
                    {isAcceptingInvitation ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {ts("accepting")}
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        {ts("acceptButton")}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
