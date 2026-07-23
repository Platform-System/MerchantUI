"use client"

import { Header } from "@/shared/components/shell/header"
import { Footer } from "@/shared/components/shell/footer"
import { CartDrawer } from "@/features/cart"
import I18nProvider from "@/core/providers/I18nProvider"
import { defaultLocale } from "@/i18n/config"
import { AbstractIntlMessages } from "next-intl"
import viMessages from "@/../messages/vi.json"
import { ScrollRestoration } from "@/shared/components/ui/scroll-restoration"

/**
 * StoreLayout: The global layout for all store-related pages.
 * Features a high-end monochrome background and shared navigation.
 */
export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider locale={defaultLocale} messages={viMessages as unknown as AbstractIntlMessages}>
      <div className="store-theme relative h-screen w-full bg-background text-foreground selection:bg-primary/25 selection:text-charcoal overflow-hidden flex flex-col">
        {/* Premium Background Effects */}
        <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top,rgb(var(--store-surface-strong-rgb)/0.82)_0%,rgb(var(--store-surface-rgb)/0.97)_42%,rgb(var(--store-surface-rgb))_100%)]" />

        {/* Mesh Gradient Glows - Optimized for performance */}
        <div className="pointer-events-none fixed top-[-10%] left-[-10%] z-0 h-[40%] w-[40%] rounded-full bg-[rgb(var(--store-accent-rgb)/0.05)] blur-[100px]" />
        <div className="pointer-events-none fixed top-[10%] right-[-10%] z-0 h-[30%] w-[30%] rounded-full bg-[rgb(var(--store-surface-strong-rgb)/0.22)] blur-[80px]" />
        <div className="pointer-events-none fixed bottom-[-10%] left-[20%] z-0 h-[50%] w-[50%] rounded-full bg-[rgb(var(--store-surface-strong-rgb)/0.32)] blur-[110px]" />

        {/* Subtle Texture Overlay */}
        <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(rgb(var(--store-muted-rgb)/0.1)_1px,transparent_1px)] opacity-[0.02] [background-size:24px_24px]" />

        <ScrollRestoration />
        <Header />
        {/* The Scrollable Surface */}
        <main id="store-scroll-container" className="flex-1 w-full overflow-y-auto relative z-10 flex flex-col">
          <div className="flex-1 relative">
            {children}
          </div>
          <Footer />
        </main>
        <CartDrawer />
      </div>
    </I18nProvider>
  );
}

