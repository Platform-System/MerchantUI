"use client"

import * as React from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { Button } from "@platform-system/design-ui/components/button"
import { Input } from "@platform-system/design-ui/components/input"
import { ArrowLeft, Settings, User, Key } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { useAccount } from "../hooks/use-account"
import { ENV } from "@/shared/config/env"

export function ProfileScreen() {
  const t = useTranslations("Account")

  const {
    profile,
    isEditingProfile,
    setIsEditingProfile,
    updateProfileField,
  } = useAccount()

  // Keycloak account console URL
  const keycloakConsoleUrl = `${ENV.KEYCLOAK_URL}/realms/${ENV.KEYCLOAK_REALM}/account`

  return (
    <div className="relative z-10 min-h-screen bg-background pt-24 pb-12 text-foreground">
      <div className="mx-auto max-w-none px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold sm:text-4xl">Hồ sơ hệ thống</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Thông tin định danh thống nhất của bạn xuyên suốt các hệ thống thuộc Nyxoris.
          </p>
        </div>

        <div className="ds-glass-panel rounded-3xl p-6 shadow-2xl sm:p-8">
          <div className="flex flex-col">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h3 className="font-serif text-2xl font-semibold text-foreground">{t("personalInfo")}</h3>
              <Button
                variant={isEditingProfile ? "outline" : "default"}
                className="rounded-xl font-semibold"
                onClick={() => setIsEditingProfile((current) => !current)}
              >
                <Settings className="mr-2 h-4 w-4" />
                {isEditingProfile ? t("done") : t("editProfile")}
              </Button>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgb(var(--store-border-rgb)/0.6)] pb-6">
              <div className="flex items-center gap-4">
                <div className="relative size-20 overflow-hidden rounded-full border border-[rgb(var(--store-border-rgb)/0.85)] flex items-center justify-center bg-[rgb(var(--store-surface-soft-rgb))]">
                  {profile.avatar ? (
                    <Image src={profile.avatar} alt={profile.name} fill className="object-cover" />
                  ) : (
                    <User className="size-8 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-semibold">{profile.name}</h4>
                  {profile.joinedDate && (
                    <p className="text-xs text-muted-foreground">{t("joinedSince")} {profile.joinedDate}</p>
                  )}
                </div>
              </div>

              <Button
                variant="outline"
                className="rounded-xl border-dashed"
                asChild
              >
                <a href={keycloakConsoleUrl} target="_blank" rel="noopener noreferrer">
                  <Key className="mr-2 h-4 w-4" />
                  Đổi mật khẩu / Quản lý bảo mật
                </a>
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <span className="text-xs text-muted-foreground">{t("fullName")}</span>
                {isEditingProfile ? (
                  <Input
                    className="h-11 rounded-xl"
                    value={profile.name}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => updateProfileField("name", event.target.value)}
                  />
                ) : (
                  <span className="store-surface-soft rounded-xl border px-3 py-2 text-sm font-medium">
                    {profile.name}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs text-muted-foreground">{t("email")}</span>
                {isEditingProfile ? (
                  <Input
                    className="h-11 rounded-xl"
                    value={profile.email}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => updateProfileField("email", event.target.value)}
                  />
                ) : (
                  <span className="store-surface-soft rounded-xl border px-3 py-2 text-sm font-medium">
                    {profile.email}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
