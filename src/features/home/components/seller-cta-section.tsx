"use client"

import { Link } from "@/i18n/navigation"
import { motion } from "framer-motion"
import { ArrowRight, Store, TrendingUp, Users, Shield } from "lucide-react"
import { Button } from '@platform-system/design-ui';
import { useTranslations } from "next-intl"
import { useQuery } from "@tanstack/react-query"
import { fetchSellerStats, sellerQueryKeys } from "@/features/seller"

export function SellerCtaSection() {
  const t = useTranslations("Home.sellerCta")
  const tCommon = useTranslations("Common")

  const benefits = [
    {
      icon: Store,
      title: t("benefits.store.title"),
      description: t("benefits.store.description"),
    },
    {
      icon: TrendingUp,
      title: t("benefits.analytics.title"),
      description: t("benefits.analytics.description"),
    },
    {
      icon: Users,
      title: t("benefits.reach.title"),
      description: t("benefits.reach.description"),
    },
    {
      icon: Shield,
      title: t("benefits.security.title"),
      description: t("benefits.security.description"),
    },
  ]
  const { data: sellerStats = [] } = useQuery({
    queryKey: sellerQueryKeys.stats,
    queryFn: fetchSellerStats,
    staleTime: 10 * 60 * 1000,
  })
  return (
    <section className="relative overflow-hidden bg-background py-24 text-foreground">


      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Phần tiêu đề */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-muted-foreground text-sm font-medium uppercase tracking-widest">
            {t("eyebrow")}
          </span>
          <h2 className="mt-3 mb-4 text-balance font-serif text-3xl font-semibold text-foreground sm:text-4xl lg:text-5xl">
            {t("title", { brand: tCommon("brandName") })}
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            {t("description")}
          </p>
        </motion.div>

        {/* Các chỉ số */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
        >
          {sellerStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-foreground font-serif text-3xl sm:text-4xl font-semibold mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Các lợi ích */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              viewport={{ once: true }}
              className="group rounded-2xl bg-secondary/50 p-6 shadow-[0_16px_36px_rgb(0_0_0/0.05)] transition-all hover:bg-secondary"
            >
              <div className="w-fit rounded-xl p-3 mb-4 bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                <benefit.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-semibold text-foreground">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">{benefit.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Khối kêu gọi hành động */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button
            asChild
            size="lg"
            className="store-accent-button h-14 px-10 text-base font-semibold"
          >
            <Link href="/become-seller" scroll={false}>
              {t("cta")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <p className="mt-4 text-sm text-muted-foreground/80">
            {t("note")}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
