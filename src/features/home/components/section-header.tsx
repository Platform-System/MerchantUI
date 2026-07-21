"use client"

import * as React from "react"
import { motion, type HTMLMotionProps } from "framer-motion"
import { Button, cn } from '@system/design-ui';
import { Link } from "@/i18n/navigation"
import { ArrowRight } from "lucide-react"

export interface SectionHeaderProps extends Omit<HTMLMotionProps<"div">, 'title' | 'children'> {
  subtitle?: string
  title: string
  description?: string
  align?: "center" | "left"
  children?: React.ReactNode
}

export function SectionHeader({
  className,
  subtitle,
  title,
  description,
  align = "center",
  children,
  ...props
}: SectionHeaderProps) {
  const isCenter = align === "center"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className={cn(
        "flex flex-col mb-16",
        isCenter ? "text-center items-center" : "text-left items-start",
        className
      )}
      {...props}
    >
      {subtitle && (
        <span className="store-accent-subtitle text-sm font-medium uppercase tracking-widest">
          {subtitle}
        </span>
      )}
      
      <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold mt-3 mb-4 text-balance">
        {title}
      </h2>
      
      {description && (
        <p className={cn("text-muted-foreground max-w-2xl", isCenter && "mx-auto")}>
          {description}
        </p>
      )}
      
      {children as React.ReactNode}
    </motion.div>
  )
}

export interface SectionFooterProps {
  href: string
  label: string
  className?: string
}

export function SectionFooter({ href, label, className }: SectionFooterProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      viewport={{ once: true }}
      className={cn("text-center mt-12", className)}
    >
      <Button asChild variant="outline" size="lg" className="px-8">
        <Link href={href} scroll={false}>
          {label}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </motion.div>
  )
}

