import { cn } from "@/lib/utils"
import { HTMLAttributes } from "react"

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean
  hover?: boolean
  gradient?: boolean
}

export default function GlassCard({
  children,
  className,
  glow = false,
  hover = true,
  gradient = false,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass rounded-2xl",
        hover && "glass-hover",
        glow && "glow-sm",
        gradient && "border-gradient",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
