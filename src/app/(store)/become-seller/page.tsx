"use client"

import * as React from "react"
import { Button } from "@platform-system/design-ui/components/button"
import { Input } from "@platform-system/design-ui/components/input"
import { Textarea } from "@platform-system/design-ui/components/textarea"
import { ShieldCheck, Rocket, Percent, CheckCircle2, Loader2 } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { createStore } from "@/features/seller/queries/seller-queries"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"

export default function BecomeSellerPage() {
  const t = useTranslations("BecomeSeller")
  const [isSubmitted, setIsSubmitted] = React.useState(false)
  const [alreadyHasStore, setAlreadyHasStore] = React.useState(false)
  const [formData, setFormData] = React.useState({
    name: "",
    tagline: "",
    description: "",
    location: "",
    responseTime: t("defaultResponseTime"),
  })

  const mutation = useMutation({
    mutationFn: createStore,
    onSuccess: (result) => {
      if (result.success) {
        setIsSubmitted(true)
        toast.success(t("toastSuccess"))
        return
      }

      if (result.message?.toLowerCase().includes("already belongs to a store")) {
        setAlreadyHasStore(true)
        toast.error(t("alreadyHasStoreToast"))
      } else {
        toast.error(result.message || t("toastError"))
      }
    },
    onError: (error: unknown) => {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: unknown } } }).response?.data?.message === "string"
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : t("fetchError")

      if (typeof message === "string" && message.toLowerCase().includes("already belongs to a store")) {
        setAlreadyHasStore(true)
        toast.error(t("alreadyHasStoreToast"))
      } else {
        toast.error(message)
      }
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({
      name: formData.name,
      tagline: formData.tagline,
      description: formData.description,
      location: formData.location,
      responseTime: formData.responseTime,
    })
  }

  return (
    <div className="relative z-10 flex min-h-screen items-center bg-background pt-24 pb-12 text-foreground">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        
        {/* Benefits */}
        <div className="flex flex-col gap-6 lg:sticky lg:top-32">
          <span className="store-accent-subtitle text-sm font-medium uppercase tracking-widest">{t("subtitle")}</span>
          <h1 className="font-serif text-4xl font-bold leading-tight text-foreground sm:text-5xl">
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("description")}
          </p>

          <div className="flex flex-col gap-4 mt-4 text-muted-foreground">
            <div className="flex items-start gap-3">
              <Percent className="store-accent-text h-6 w-6 shrink-0 mt-1" />
              <div>
                <strong className="block font-medium text-foreground">{t("benefits.commission.title")}</strong>
                {t("benefits.commission.description")}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="store-accent-text h-6 w-6 shrink-0 mt-1" />
              <div>
                <strong className="block font-medium text-foreground">{t("benefits.protection.title")}</strong>
                {t("benefits.protection.description")}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Rocket className="store-accent-text h-6 w-6 shrink-0 mt-1" />
              <div>
                <strong className="block font-medium text-foreground">{t("benefits.tools.title")}</strong>
                {t("benefits.tools.description")}
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="ds-dark-panel p-8">
          {alreadyHasStore ? (
            <div className="text-center py-12 flex flex-col items-center gap-4">
              <CheckCircle2 className="h-16 w-16 text-foreground" />
              <h3 className="mt-2 font-serif text-2xl font-bold">{t("existingStoreTitle")}</h3>
              <p className="max-w-md text-muted-foreground">
                {t("existingStoreDescNoName")}
              </p>
              <Button asChild className="store-accent-button store-accent-button-strong mt-4 rounded-xl">
                <Link href="/space?tab=store">{t("manageStore")}</Link>
              </Button>
            </div>
          ) : isSubmitted ? (
            <div className="text-center py-12 flex flex-col items-center gap-4">
              <CheckCircle2 className="h-16 w-16 text-foreground" />
              <h3 className="mt-2 font-serif text-2xl font-bold">{t("successTitle")}</h3>
              <p className="max-w-xs text-muted-foreground">
                {t("successDesc")}
              </p>
              <Button 
                variant="outline" 
                className="mt-4 rounded-xl"
                onClick={() => window.location.href = "/sellers"}
              >
                {t("viewSellers")}
              </Button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-5"
            >
              <h3 className="mb-2 font-serif text-2xl font-semibold text-foreground">{t("formTitle")}</h3>
              
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">{t("storeName")}</label>
                  <Input 
                    required 
                    placeholder={t("storeNamePlaceholder")} 
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={mutation.isPending}
                    className="!border-0"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">{t("tagline")}</label>
                  <Input 
                    required 
                    placeholder={t("taglinePlaceholder")} 
                    value={formData.tagline}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                    disabled={mutation.isPending}
                    className="!border-0"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">{t("shortDescription")}</label>
                <Textarea
                  required
                  placeholder={t("shortDescriptionPlaceholder")}
                  className="min-h-[100px] rounded-xl !border-0"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  disabled={mutation.isPending}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">{t("location")}</label>
                  <Input 
                    required 
                    placeholder={t("locationPlaceholder")} 
                    value={formData.location}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    disabled={mutation.isPending}
                    className="!border-0"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">{t("responseTime")}</label>
                  <Input 
                    required 
                    placeholder={t("responseTimePlaceholder")} 
                    value={formData.responseTime}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, responseTime: e.target.value }))}
                    disabled={mutation.isPending}
                    className="!border-0"
                  />
                </div>
              </div>

              <div className="mt-2 rounded-xl bg-[rgb(var(--store-accent-rgb)/0.05)] p-4 text-xs text-muted-foreground leading-relaxed">
                <p><strong>{t("trustNoteTitle")}</strong> {t("trustNote")}</p>
              </div>

              <Button 
                type="submit" 
                disabled={mutation.isPending}
                className="store-accent-button store-accent-button-strong h-12 mt-2 rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("processing")}
                  </>
                ) : (
                  t("submit")
                )}
              </Button>
            </form>
          )}
        </div>

      </div>
    </div>
  )
}
