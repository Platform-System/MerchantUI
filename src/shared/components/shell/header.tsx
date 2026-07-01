"use client"

import { useState, useEffect } from "react"
import { Link } from "@/i18n/navigation"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Avatar, AvatarFallback, AvatarImage, Badge, Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, cn, UserProfileCard, HeaderLayout, UserProfileDropdown } from '@platform-system/design-ui';
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
  Wallet,
  Store,
  ArrowRight,
  Globe,
  MessageSquare,
} from "lucide-react"
import { useAuth } from "@/core/providers/AuthProvider"
import { SearchModal } from "@/features/search/components/search-modal"
import { useCart } from "@/features/cart"
import { useWishlist } from "@/features/wishlist"
import { useCategories } from "@/shared/lib/category-queries"
import { useQuery } from "@tanstack/react-query"
import { fetchMyWallet } from "@/features/store/queries/wallet-queries"
import { fetchMyStores } from "@/features/store/queries/store-manage-queries"
import { apiClient } from "@/shared/api/apiClient"
import { Result } from "@/types/api"

const portals = [
  { id: 'customer', name: 'Cổng khách hàng', url: 'https://nyxoris.com', icon: <Globe size={16} />, active: true },
  { id: 'merchant', name: 'Cổng người bán', url: 'https://merchant.nyxoris.com', icon: <ShoppingBag size={16} />, active: true },
  { id: 'community', name: 'Cổng cộng đồng', url: '#', icon: <MessageSquare size={16} />, active: false },
];

export function Header() {
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
          } catch {
            // Ignored
          }
          if (typeof window !== "undefined" && p.identityId) {
            if (p.avatarUrl && p.avatarUrl.includes("/local-avatar-fallback/")) {
              const localAvatar = localStorage.getItem("user_avatar_" + p.identityId)
              if (localAvatar) {
                p.avatarUrl = localAvatar
              } else {
                p.avatarUrl = ""
              }
            } else if (!p.avatarUrl) {
              const localAvatar = localStorage.getItem("user_avatar_" + p.identityId)
              if (localAvatar) {
                p.avatarUrl = localAvatar
              }
            }
          }
          return p
        }
      } catch {
        return null
      }
      return null
    },
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
  })

  const { data: myStores = [] } = useQuery({
    queryKey: ["store-manage", "my-stores"],
    queryFn: fetchMyStores,
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  })

  const becomeSellerUrl = isAuthenticated && myStores.length > 0
    ? "/space?tab=create-store"
    : "/become-seller"

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
      setIsScrolled((prev) => {
        if (prev) {
          return scrollTop > 15;
        }
        return scrollTop > 35;
      });
    }

    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true })
    } else {
      window.addEventListener("scroll", handleScroll, { passive: true })
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
    <HeaderLayout
        id="store-header"
        className="z-[1002]"
        isScrolled={isScrolled}
        logo={
          <Link href="/home" className="flex items-center group">
            <span className="font-sans text-xl font-black tracking-tighter text-foreground transition-all duration-300 group-hover:store-accent-text">
              Nyxoris
            </span>
            <div className="h-4 w-px bg-border mx-6 hidden sm:block opacity-30" />
          </Link>
        }
        centerContent={
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
                <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus:ring-0 focus-visible:ring-0 cursor-pointer">
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
              href={becomeSellerUrl}
              className={cn(
                "text-sm font-medium transition-colors",
                isActive("/become-seller") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Mở gian hàng
            </Link>
          </nav>
        }
        rightActions={
          <>
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex shrink-0 focus:ring-0 focus-visible:ring-0"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-5 w-5 shrink-0" />
              <span className="sr-only">Tìm kiếm</span>
            </Button>

            <Link
              href="/wishlist"
              className="relative hidden sm:inline-flex items-center justify-center size-9 rounded-md text-foreground hover:bg-[rgb(var(--store-accent-rgb)/0.1)] hover:text-foreground transition-colors shrink-0 focus:ring-0 focus-visible:ring-0"
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
              className="relative text-foreground hover:store-accent-text shrink-0 focus:ring-0 focus-visible:ring-0"
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
                  className="relative rounded-full ml-1 hover:bg-transparent focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 shrink-0"
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
                  <Button variant="ghost" size="icon-lg" className="relative rounded-full ml-1 hover:bg-transparent focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 shrink-0">
                    <Avatar className="size-9 transition-transform hover:scale-110 active:scale-95 shrink-0" showDropdownIndicator>
                      <AvatarImage src={profile?.avatarUrl || ""} alt="User" className="object-cover shrink-0" />
                      <AvatarFallback className="shrink-0">
                        <User className="size-5 shrink-0" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" alignOffset={5} forceMount>
                  <UserProfileDropdown
                    userCard={
                      <DropdownMenuItem asChild className="cursor-pointer font-normal p-2.5 min-w-0 focus:bg-[rgb(var(--store-accent-rgb)/0.05)] focus:text-foreground w-full">
                        <a href="https://account.nyxoris.com" target="_blank" rel="noreferrer" className="w-full">
                          <UserProfileCard
                            name={profile?.displayName || (keycloak?.idTokenParsed?.preferred_username as string) || (keycloak?.idTokenParsed?.name as string) || "Người dùng"}
                            avatarSrc={profile?.avatarUrl || ""}
                            subtext="Gói: Miễn phí"
                            showChevron={true}
                          />
                        </a>
                      </DropdownMenuItem>
                    }
                    menuItems={
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/space?tab=store" className="cursor-pointer">
                            <Store className="mr-2 h-4 w-4 shrink-0" />
                            <span>Gian hàng</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/space?tab=orders" className="cursor-pointer">
                            <ShoppingBag className="mr-2 h-4 w-4 shrink-0" />
                            <span>Đơn hàng</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href="https://account.nyxoris.com/wallet" target="_blank" rel="noopener noreferrer" className="cursor-pointer flex items-center w-full">
                            <Wallet className="mr-2 h-4 w-4 shrink-0" />
                            <span className="flex items-center justify-between w-full gap-2 min-w-0">
                              <span className="truncate font-normal">Ví</span>
                              <span className="text-[10px] font-bold bg-[rgb(var(--store-accent-rgb)/0.1)] px-1.5 py-0.5 rounded store-accent-text shrink-0">
                                {wallet ? `${wallet.balance.toLocaleString("vi-VN")} đ` : "--"}
                              </span>
                            </span>
                          </a>
                        </DropdownMenuItem>
                      </>
                    }
                    portals={portals.map((portal) => ({
                      id: portal.id,
                      name: portal.name,
                      icon: portal.icon,
                      href: portal.url,
                      active: portal.active,
                      target: portal.active ? '_blank' : undefined,
                      rel: portal.active ? 'noreferrer' : undefined,
                    }))}
                    currentPortalId="merchant"
                    logoutItem={
                      <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4 shrink-0" />
                        <span>Đăng xuất</span>
                      </DropdownMenuItem>
                    }
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={login} 
                className="hidden sm:flex items-center gap-2 ml-2 text-foreground hover:store-accent-text font-medium shrink-0 focus:ring-0 focus-visible:ring-0"
              >
                <LogIn className="h-4 w-4 shrink-0" />
                <span>Đăng nhập</span>
              </Button>
            )}

            {/* Nút mở menu mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden shrink-0 focus:ring-0 focus-visible:ring-0"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5 shrink-0" /> : <Menu className="h-5 w-5 shrink-0" />}
            </Button>
          </>
        }
      >
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
                      router.push(`/marketplace?search=${encodeURIComponent(searchVal)}`)
                      setIsMobileMenuOpen(false)
                    }
                  }}
                  className="relative"
                >
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={mobileSearchQuery}
                    onChange={(e) => setMobileSearchQuery(e.target.value)}
                    className="w-full bg-[rgb(var(--store-surface-rgb)/0.5)] border border-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary text-foreground"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </form>

                <nav className="flex flex-col space-y-2">
                  <Link
                    href="/marketplace"
                    className="block px-4 py-3 rounded-lg hover:bg-muted transition-colors font-medium text-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Cửa hàng
                  </Link>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="categories" className="border-none">
                      <AccordionTrigger className="px-4 py-3 hover:bg-muted rounded-lg transition-colors font-medium text-sm hover:no-underline focus:ring-0 focus-visible:ring-0">
                        Danh mục
                      </AccordionTrigger>
                      <AccordionContent className="pb-0 pl-4 pt-1 flex flex-col space-y-1">
                        {categories.map((category) => (
                          <Link
                            key={category.id}
                            href={`/marketplace?category=${category.slug}`}
                            className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
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
                    href={becomeSellerUrl}
                    className="block px-4 py-3 rounded-lg hover:bg-muted transition-colors font-medium text-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Mở gian hàng
                  </Link>

                  <div className="h-px bg-border my-2" />

                  {isAuthenticated ? (
                    <>
                      <a
                        href="https://account.nyxoris.com"
                        className="block px-4 py-3 rounded-lg hover:bg-muted transition-colors font-medium text-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Hồ sơ cá nhân
                      </a>
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
      </HeaderLayout>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}


