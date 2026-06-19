"use client"

import { Icon } from "@iconify/react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"

const SOCIAL_LINKS = [
  { icon: "mdi:instagram", href: "#", label: "Instagram" },
  { icon: "mdi:twitter",   href: "#", label: "Twitter" },
  { icon: "mdi:facebook",  href: "#", label: "Facebook" },
]

export function Footer() {
  const t = useTranslations("Footer")

  return (
    <footer className="relative bg-background border-t border-primary/5 pt-20 pb-16 md:pt-32 md:pb-24">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-2 lg:grid-cols-12 lg:gap-12">
          {/* Brand Info - Left Side (3/12) */}
          <div className="lg:col-span-3">
            <Link href="/" className="inline-block mb-3">
              <span className="font-serif text-2xl font-bold tracking-tighter text-foreground uppercase leading-none">
                {t("brandName")}<span className="text-primary">.</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-xs leading-normal mb-4 max-w-[240px]">
              {t("brandDescription")}
            </p>
            <div className="flex gap-6">
              {SOCIAL_LINKS.map((social) => (
                <Link key={social.label} href={social.href} aria-label={social.label} className="text-muted-foreground/60 hover:text-primary transition-all duration-300 hover:-translate-y-1">
                  <Icon icon={social.icon} className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Link Columns - Center (6/12) */}
          <div className="lg:col-span-6 md:pt-[12px]">
            <div className="flex flex-col gap-10 sm:flex-row lg:justify-center sm:gap-16">
              <div className="border-b border-primary/5 pb-10 sm:border-none sm:pb-0">
                <h4 className="font-serif text-[12px] font-bold uppercase tracking-[0.1em] text-foreground mb-4 leading-none">
                  {t("sections.brand")}
                </h4>
                <ul className="space-y-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80 leading-tight">
                  <li><Link href="#" className="hover:text-primary transition-colors">{t("links.story")}</Link></li>
                </ul>
              </div>
              <div className="border-b border-primary/5 pb-10 sm:border-none sm:pb-0">
                <h4 className="font-serif text-[12px] font-bold uppercase tracking-[0.1em] text-foreground mb-4 leading-none">
                  {t("sections.support")}
                </h4>
                <ul className="space-y-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80 leading-tight">
                  <li><Link href="#" className="hover:text-primary transition-colors">{t("links.helpCenter")}</Link></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Newsletter - Right Side (3/12) */}
          <div className="lg:col-span-3 md:pt-[12px]">
            <h4 className="font-serif text-[12px] font-bold uppercase tracking-[0.1em] text-foreground mb-3 leading-none">
              {t("sections.subscribe")}
            </h4>
            <p className="text-muted-foreground text-xs leading-normal mb-4">
              {t("newsletter.description")}
            </p>
            <div className="relative group max-w-[240px]">
              <div className="flex items-center p-1 bg-muted/30 border border-primary/10 rounded-full focus-within:bg-muted/50 focus-within:border-primary/30 transition-all duration-300">
                <input
                  type="email"
                  placeholder={t("newsletter.placeholder")}
                  className="w-full bg-transparent border-none pl-5 pr-20 h-9 text-xs font-medium placeholder:text-muted-foreground/40 focus:outline-none focus:ring-0"
                />
                <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-foreground text-background h-9 px-5 rounded-full font-serif text-[10px] font-bold uppercase tracking-widest hover:bg-primary transition-colors duration-300">
                  {t("newsletter.button")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

