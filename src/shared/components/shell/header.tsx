"use client"

import { useState, useEffect } from "react"
import { Link } from "@/i18n/navigation"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations } from "next-intl"
import { cn } from "@platform-system/design-ui/lib/cn"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@platform-system/design-ui/components/accordion"
import { Avatar, AvatarFallback, AvatarImage } from "@platform-system/design-ui/components/avatar"
import { Badge } from "@platform-system/design-ui/components/badge"
import { Button } from "@platform-system/design-ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@platform-system/design-ui/components/dropdown-menu"
import {
  Search,
  ShoppingBag,
  Heart,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  User,
  LogOut,
  LogIn,
  Settings,
  Wallet,
  Store,
  ArrowRight,
} from "lucide-react"
import { useAuth } from "@/core/providers/AuthProvider"
import { SearchModal } from "@/features/search/components/search-modal"
import { useCart } from "@/features/cart"
import { useWishlist } from "@/features/wishlist"
import { useCategories } from "@/shared/lib/category-queries"
import { useQuery } from "@tanstack/react-query"
import { fetchMyWallet } from "@/features/store/queries/wallet-queries"
import { apiClient } from "@/shared/api/api-client"
import { Result } from "@/types/api"


export function Header() {
  const t = useTranslations("Common")
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { setIsOpen: setIsCartOpen, cartCount, isOpen: isCartOpen } = useCart()
  const { wishlistCount } = useWishlist()
  const { isAuthenticated, login, logout, keycloak } = useAuth()
  const { data: categories = [] } = useCategories()

  const { data: wallet } = useQuery({
    queryKey: ["wallet", "me"],
    queryFn: fetchMyWallet,
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
  })

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      try {
        const response = await apiClient.get<Result<{ identityId?: string | null, userName?: string | null, email?: string | null, avatarUrl?: string | null, displayName?: string | null }>>("/api/identity/users/me")
        if (response.data && response.data.success && response.data.data) {
          const p = response.data.data
          try {
            const [avatarResponse, profileResponse] = await Promise.allSettled([
              apiClient.get<Result<{ url?: string | null }>>("/api/identity/users/me/images/avatar"),
              apiClient.get<Result<{ displayName?: string | null }>>("/api/identity/users/me/profile")
            ])
            if (avatarResponse.status === "fulfilled" && avatarResponse.value.data && avatarResponse.value.data.success && avatarResponse.value.data.data?.url) {
              p.avatarUrl = avatarResponse.value.data.data.url
            }
            if (profileResponse.status === "fulfilled" && profileResponse.value.data && profileResponse.value.data.success && profileResponse.value.data.data?.displayName) {
              p.displayName = profileResponse.value.data.data.displayName
            }
          } catch (e) {
            // Ignored
          }
          if (typeof window !== "undefined" && p.avatarUrl && p.avatarUrl.includes("/local-avatar-fallback/")) {
            const localAvatar = localStorage.getItem("user_avatar_" + p.identityId)
            if (localAvatar) {
              p.avatarUrl = localAvatar
            }
          }
          return p
        }
      } catch (err) {
        return null
      }
      return null
    },
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
  })

  const isActive = (path: string) => {
    const fullPath = pathname.startsWith("/") ? pathname : `/${pathname}`
    if (path === "/marketplace" && (fullPath.includes("/product/") || fullPath.includes("/marketplace"))) {
      return true
    }
    if (path === "/sellers" && (fullPath.includes("/seller/") || fullPath.includes("/sellers"))) {
      return true
    }
    return fullPath === path || fullPath.includes(path)
  }
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [mobileSearchQuery, setMobileSearchQuery] = useState("")

  useEffect(() => {
    const container = document.getElementById("store-scroll-container")
    const handleScroll = () => {
      const scrollTop = container ? container.scrollTop : window.scrollY
      setIsScrolled(scrollTop > 20)
    }

    if (container) {
      container.addEventListener("scroll", handleScroll)
    } else {
      window.addEventListener("scroll", handleScroll)
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll)
      } else {
        window.removeEventListener("scroll", handleScroll)
      }
    }
  }, [])

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("--store-header-height", isScrolled ? "56px" : "64px")
    }
  }, [isScrolled])

  return (
    <>
      <motion.header
        id="store-header"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "sticky top-0 left-0 right-0 z-[1002] transition-all duration-500",
          isScrolled
            ? "border-b border-[rgb(var(--store-border-rgb)/0.8)] dark:border-b-transparent bg-[rgb(var(--store-surface-strong-rgb)/0.88)] shadow-[0_14px_32px_rgb(var(--store-accent-rgb)/0.1)] backdrop-blur-xl"
            : "border-b border-transparent dark:border-b-transparent bg-[rgb(var(--store-surface-rgb)/0.8)] backdrop-blur-sm"
        )}
      >
        <div className="w-full px-4">
          <div className={cn(
            "flex items-center justify-between transition-all duration-500",
            isScrolled ? "h-14" : "h-16"
          )}>
            {/* Nhãn store */}
            <Link href="/home" className="flex items-center group">
              <span className="font-sans text-xl font-black tracking-tighter text-foreground transition-all duration-300 group-hover:store-accent-text">
                Nyxoris
              </span>
              <div className="h-4 w-px bg-border mx-6 hidden sm:block opacity-30" />
            </Link>

            {/* Điều hướng desktop */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link
                href="/marketplace"
                className={cn(
                  "text-sm font-medium transition-colors",
                  isActive("/marketplace") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Cửa hàng
              </Link>

              <DropdownMenu open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus:outline-none cursor-pointer">
                    Danh mục <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isCategoryOpen && "rotate-180")} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="center"
                  className="w-48 p-1.5 ds-glass-card border-[rgb(var(--store-border-rgb)/0.7)] bg-[rgb(var(--store-surface-rgb)/0.8)] backdrop-blur-md"
                >
                  {categories.map((category) => (
                    <DropdownMenuItem key={category.id} asChild>
                      <Link
                        href={`/marketplace?category=${category.slug}`}
                        onClick={() => setIsCategoryOpen(false)}
                        className="store-muted-text block w-full rounded-lg px-3 py-2 text-sm transition-colors hover:bg-[rgb(var(--store-accent-rgb)/0.1)] hover:text-foreground cursor-pointer focus:bg-[rgb(var(--store-accent-rgb)/0.1)] focus:text-foreground"
                      >
                        {category.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Link
                href="/sellers"
                className={cn(
                  "text-sm font-medium transition-colors",
                  isActive("/sellers") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Nhà bán hàng
              </Link>
              <Link
                href="/become-seller"
                className={cn(
                  "text-sm font-medium transition-colors",
                  isActive("/become-seller") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Mở gian hàng
              </Link>

            </nav>

            {/* Nhóm hành động */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex shrink-0"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-5 w-5 shrink-0" />
                <span className="sr-only">Tìm kiếm</span>
              </Button>

              <Link
                href="/wishlist"
                className="relative hidden sm:inline-flex items-center justify-center size-9 rounded-md text-foreground hover:bg-[rgb(var(--store-accent-rgb)/0.1)] hover:text-foreground transition-colors shrink-0"
              >
                <Heart className="h-5 w-5 shrink-0" />
                {wishlistCount > 0 && (
                  <Badge variant="counter" className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-none p-0 text-[9px] font-semibold shadow-sm">
                    {wishlistCount}
                  </Badge>
                )}
                <span className="sr-only">Danh sách yêu thích</span>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                className="relative text-foreground hover:store-accent-text shrink-0"
                onClick={() => setIsCartOpen(true)}
              >
                <motion.div
                  key={cartCount}
                  animate={cartCount > 0 ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.4, ease: "backOut" }}
                  className="shrink-0"
                >
                  <ShoppingBag className="h-5 w-5 shrink-0" />
                  {cartCount > 0 && (
                    <Badge variant="counter" className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-none p-0 text-[10px] font-semibold shadow-sm">
                      {cartCount}
                    </Badge>
                  )}
                </motion.div>
                <span className="sr-only">Giỏ hàng</span>
              </Button>

              {/* Avatar / Close cart button */}
              {isCartOpen ? (
                <motion.div
                  initial={{ scale: 0, rotate: -90, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  exit={{ scale: 0, rotate: 90, opacity: 0 }}
                  transition={{ type: "spring", bounce: 0.4, duration: 0.35 }}
                  className="shrink-0"
                >
                  <Button
                    variant="ghost"
                    size="icon-lg"
                    onClick={() => setIsCartOpen(false)}
                    className="relative rounded-full ml-1 hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 shrink-0"
                  >
                    <Avatar className="size-9 shrink-0">
                      <AvatarFallback className="bg-foreground text-background shrink-0">
                        <X className="size-5 shrink-0" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </motion.div>
              ) : isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-lg" className="relative rounded-full ml-1 hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 shrink-0">
                      <Avatar className="size-9 transition-transform hover:scale-110 active:scale-95 shrink-0" showDropdownIndicator>
                        <AvatarImage src={profile?.avatarUrl || ""} alt="User" className="object-cover shrink-0" />
                        <AvatarFallback className="shrink-0">
                          <User className="size-5 shrink-0" />
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" alignOffset={5} forceMount>
                    <DropdownMenuItem asChild className="cursor-pointer font-normal p-2.5 min-w-0 focus:bg-[rgb(var(--store-accent-rgb)/0.05)] focus:text-foreground">
                      <Link href="/profile" className="flex items-center gap-3 w-full min-w-0">
                        <Avatar className="size-10 shrink-0 ring-2 ring-[rgb(var(--store-accent-rgb)/0.3)] ring-offset-1 ring-offset-background">
                          <AvatarImage src={profile?.avatarUrl || ""} alt="User" className="object-cover" />
                          <AvatarFallback>
                            <User className="size-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold text-foreground truncate" title={profile?.displayName || keycloak?.idTokenParsed?.preferred_username || "Người dùng"}>
                            {profile?.displayName || keycloak?.idTokenParsed?.preferred_username || "Người dùng"}
                          </span>
                          <span className="text-xs text-muted-foreground mt-0.5">
                            Gói: Miễn phí
                          </span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/60 shrink-0 ml-auto" />
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/space?tab=store" className="cursor-pointer">
                        <Store className="mr-2 h-4 w-4" />
                        <span>Gian hàng</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/space?tab=orders" className="cursor-pointer">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        <span>Đơn hàng</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/space?tab=wallet" className="cursor-pointer">
                        <Wallet className="mr-2 h-4 w-4" />
                        <span className="flex items-center justify-between w-full gap-2">
                          <span>Ví</span>
                          <span className="text-[10px] font-bold bg-[rgb(var(--store-accent-rgb)/0.1)] px-1.5 py-0.5 rounded store-accent-text shrink-0">
                            {wallet ? `${wallet.balance.toLocaleString("vi-VN")} đ` : "--"}
                          </span>
                        </span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Đăng xuất</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={login} 
                  className="hidden sm:flex items-center gap-2 ml-2 text-foreground hover:store-accent-text font-medium shrink-0"
                >
                  <LogIn className="h-4 w-4 shrink-0" />
                  <span>Đăng nhập</span>
                </Button>
              )}

              {/* Nút mở menu mobile */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden shrink-0"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5 shrink-0" /> : <Menu className="h-5 w-5 shrink-0" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Menu mobile */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-[rgb(var(--store-surface-strong-rgb)/0.95)] backdrop-blur-xl lg:hidden"
            >
              <div className="px-4 py-6 space-y-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const searchVal = mobileSearchQuery.trim()
                    if (searchVal) {
                      setIsMobileMenuOpen(false)
                      router.push(`/marketplace?search=${encodeURIComponent(searchVal)}`)
                    }
                  }}
                  className="relative w-full"
                >
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={mobileSearchQuery}
                    onChange={(e) => setMobileSearchQuery(e.target.value)}
                    placeholder="Tìm sản phẩm..."
                    className="h-10 w-full rounded-lg border border-border bg-[rgb(var(--store-surface-rgb)/0.84)] pl-10 pr-10 text-sm text-foreground outline-none focus:border-foreground"
                  />
                  {mobileSearchQuery.trim() && (
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors rounded-md hover:bg-muted/50 flex items-center justify-center"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </form>

                <nav className="space-y-2">
                  <Link
                    href="/marketplace"
                    className="block px-4 py-3 rounded-lg hover:bg-muted transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Cửa hàng
                  </Link>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="categories" className="border-none">
                      <AccordionTrigger className="flex items-center justify-between rounded-xl px-4 py-2 text-sm font-medium text-foreground hover:bg-[rgb(var(--store-accent-rgb)/0.1)] hover:no-underline">
                        Danh mục
                      </AccordionTrigger>
                      <AccordionContent className="pt-1 pb-2 px-4 space-y-1">
                        {categories.map((category) => (
                          <Link
                            key={category.id}
                            href={`/marketplace?category=${category.slug}`}
                            className="store-muted-text block rounded-xl px-4 py-2 text-sm transition-colors hover:bg-[rgb(var(--store-accent-rgb)/0.1)] hover:text-foreground"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {category.name}
                          </Link>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  <Link
                    href="/sellers"
                    className="block px-4 py-3 rounded-lg hover:bg-muted transition-colors font-medium text-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Nhà bán hàng
                  </Link>
                  <Link
                    href="/wishlist"
                    className="block px-4 py-3 rounded-lg hover:bg-muted transition-colors font-medium flex items-center justify-between text-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Yêu thích
                    {wishlistCount > 0 && (
                      <span className="store-accent-soft flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/become-seller"
                    className="block px-4 py-3 rounded-lg hover:bg-muted transition-colors font-medium text-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Mở gian hàng
                  </Link>
                  {isAuthenticated ? (
                    <>
                      <Link
                        href="/profile"
                        className="block px-4 py-3 rounded-lg hover:bg-muted transition-colors font-medium text-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Hồ sơ cá nhân
                      </Link>
                      <Link
                        href="/space"
                        className="block px-4 py-3 rounded-lg hover:bg-muted transition-colors font-medium text-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Trung tâm cá nhân
                      </Link>
                      <button
                        className="w-full px-4 py-3 text-left rounded-lg hover:bg-muted transition-colors font-medium text-sm text-destructive"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          logout();
                        }}
                      >
                        Đăng xuất
                      </button>
                    </>
                  ) : (
                    <button
                      className="w-full px-4 py-3 text-left rounded-lg hover:bg-muted transition-colors font-medium text-sm flex items-center"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        login();
                      }}
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Đăng nhập
                    </button>
                  )}
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}


