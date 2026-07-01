import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { BRAND_METADATA, ThemeProvider, Toaster, SonnerToaster } from '@platform-system/design-ui';
import QueryProvider from "@/core/providers/QueryProvider";
import AuthProvider from "@/core/providers/AuthProvider";
import { GlobalLoadingBar } from "@/shared/layout/GlobalLoadingBar";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  preload: false,
});

export const metadata: Metadata = {
  title: BRAND_METADATA.title,
  description: BRAND_METADATA.description,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${plusJakarta.variable} relative h-screen overflow-hidden bg-background text-foreground antialiased transition-colors duration-300`}
      >
        <ThemeProvider defaultTheme="light">
          <Toaster />
          <SonnerToaster />
          <AuthProvider>
            <QueryProvider>
              <div
                className="pointer-events-none fixed top-[-10%] left-[-10%] z-0 h-[40%] w-[40%] rounded-full opacity-100"
                style={{ background: "rgb(255 255 255 / 0.03)", filter: "blur(140px)" }}
              />
              <div
                className="pointer-events-none fixed right-[-10%] bottom-[-10%] z-0 h-[40%] w-[40%] rounded-full opacity-100"
                style={{ background: "rgb(113 113 122 / 0.05)", filter: "blur(140px)" }}
              />

              <div className="relative z-10 flex h-full w-full flex-col bg-background text-foreground transition-colors duration-300">
                <GlobalLoadingBar />
                <main
                  className="relative z-10 min-h-0 flex-1"
                  style={{ viewTransitionName: "main-content" } as React.CSSProperties}
                >
                  {children}
                </main>
              </div>
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
