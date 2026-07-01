"use client"

import { useRef } from "react"
import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, Play, Sparkles, BadgeCheck } from "lucide-react"

export function HeroSection() {
  const containerRef = useRef<HTMLElement>(null)

  // Sử dụng scrollY trực tiếp thay vì target offset để tránh bug warning của framer-motion
  // đối với section nằm ở đầu trang
  const { scrollY } = useScroll()

  // Khi cuộn từ 0 đến 500px, phần tử sẽ di chuyển xuống 200px
  const y = useTransform(scrollY, [0, 500], [0, 200])
  // Khi cuộn từ 0 đến 300px, phần tử sẽ mờ dần
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-background"
      style={{ position: "relative" }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Animated Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgb(var(--store-surface-strong-rgb) / 0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgb(var(--store-surface-strong-rgb) / 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Floating Shapes */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-1/4 top-1/4 h-64 w-64 rounded-full bg-[rgb(var(--store-accent-rgb)/0.12)] blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 left-1/4 h-96 w-96 rounded-full bg-[rgb(var(--store-border-rgb)/0.24)] blur-3xl"
        />
      </div>

      {/* Content */}
      <motion.div style={{ y, opacity }} className="relative z-20 pt-12 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[80vh]">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="ds-glass-panel mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2"
              >
                <Sparkles className="store-accent-text h-4 w-4" />
                <span className="text-sm font-medium uppercase tracking-widest text-foreground">Cửa hàng chọn lọc</span>
              </motion.div>

              {/* Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="mb-6 font-serif text-4xl font-semibold leading-[1.1] text-foreground sm:text-5xl lg:text-6xl xl:text-7xl"
              >
                Khám phá{" "}
                <span className="relative inline-block">
                  <span className="store-accent-text pb-1">độc bản</span>
                </span>
                <br />
                sản phẩm từ
                <br />
                nhà bán hàng uy tín
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="store-muted-text mx-auto mb-8 max-w-xl text-lg sm:text-xl lg:mx-0"
              >
                Mua sắm từ hàng nghìn nhà bán hàng đã xác minh. Trải nghiệm không gian mua sắm
                cao cấp với những bộ sưu tập được chọn lọc mà bạn khó tìm thấy ở nơi khác.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
              >
                <Link
                  href="/marketplace"
                  scroll={false}
                  className="store-accent-button store-accent-button-strong inline-flex items-center justify-center h-14 px-8 text-base font-semibold rounded-md transition-all"
                >
                  Khám phá cửa hàng
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/become-seller"
                  scroll={false}
                  className="store-surface-soft inline-flex items-center justify-center h-14 px-8 text-base text-foreground hover:bg-[rgb(var(--store-accent-rgb)/0.1)] border border-[rgb(var(--store-border-rgb)/0.95)] rounded-md transition-all"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Mở gian hàng
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex items-center gap-8 mt-12 justify-center lg:justify-start"
              >
                {[
                  { value: "15K+", label: "Nhà bán hàng" },
                  { value: "250K+", label: "Sản phẩm" },
                  { value: "500K+", label: "Khách hàng" },
                ].map((stat, index) => (
                  <div key={stat.label} className="text-center lg:text-left">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                      className="font-serif text-2xl font-semibold text-foreground sm:text-3xl"
                    >
                      {stat.value}
                    </motion.div>
                    <div className="store-muted-text text-sm">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right Content - Product Showcase */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative hidden lg:block"
            >
              {/* Main Featured Image */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=1000&fit=crop"
                    alt="Bộ sưu tập nổi bật"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />

                  {/* Floating Product Card */}
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-6 left-6 right-6 glass rounded-2xl p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16 rounded-xl overflow-hidden">
                        <Image
                          src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=100&h=100&fit=crop"
                          alt="Sản phẩm"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">Túi da cao cấp</p>
                        <p className="store-muted-text text-xs">từ Luxe Leather Co.</p>
                      </div>
                      <div className="font-semibold text-foreground">$299</div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Floating Cards */}
              <motion.div
                animate={{ y: [0, 10, 0], rotate: [0, -2, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -left-8 z-0 aspect-square w-32 overflow-hidden rounded-2xl shadow-xl"
              >
                <Image
                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop"
                  alt="Đồng hồ"
                  fill
                  className="object-cover"
                />
              </motion.div>

              <motion.div
                animate={{ y: [0, -15, 0], rotate: [0, 3, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-4 -right-4 z-20 aspect-square w-40 overflow-hidden rounded-2xl shadow-xl"
              >
                <Image
                  src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200&h=200&fit=crop"
                  alt="Trang sức"
                  fill
                  className="object-cover"
                />
              </motion.div>

              {/* Verified Badge */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="ds-glass-panel absolute right-0 top-8 z-30 flex items-center gap-2 rounded-full px-4 py-2 shadow-lg"
              >
                <BadgeCheck className="store-accent-text h-4 w-4" />
                <span className="text-sm font-semibold">Nhà bán hàng đã xác minh</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="store-muted-text text-xs uppercase tracking-widest">Cuộn xuống</span>
          <div className="store-surface-soft flex h-10 w-6 justify-center rounded-full pt-2">
            <motion.div
              animate={{ y: [0, 12, 0], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="store-accent-button h-1.5 w-1.5 rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
