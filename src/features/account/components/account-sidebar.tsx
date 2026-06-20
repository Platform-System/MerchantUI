"use client"

import { Link } from "@/i18n/navigation"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  User,
  Heart,
  Store,
  LogOut,
} from "lucide-react"
import { cn } from '@platform-system/design-ui';

const customerLinks = [
  { href: "/space", icon: User, label: "Tổng quan tài khoản" },
  { href: "/wishlist", icon: Heart, label: "Danh sách yêu thích" },
  { href: "/become-seller", icon: Store, label: "Mở gian hàng" },
]

export function AccountSidebar() {
  const pathname = usePathname()
  const links = customerLinks

  return (
    <aside className="w-full shrink-0 lg:w-64">
      {/* User Info */}
      <div className="ds-glass-panel mb-4 rounded-2xl p-6 shadow-[0_16px_32px_rgb(0_0_0/0.1)]">
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 rounded-full overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
              alt="Ảnh đại diện người dùng"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold">Sarah Johnson</h3>
            <p className="text-sm text-muted-foreground">sarah@example.com</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="ds-glass-panel rounded-2xl p-2 shadow-[0_16px_32px_rgb(0_0_0/0.1)]">
        <ul className="space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors relative",
                    isActive
                      ? "store-accent-text"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeAccountLink"
                      className="store-accent-glow absolute inset-0 rounded-xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <link.icon className="h-5 w-5 relative z-10" />
                  <span className="relative z-10">{link.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Logout */}
        <div className="mt-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="h-5 w-5" />
            Đăng xuất
          </button>
        </div>
      </nav>
    </aside>
  )
}
