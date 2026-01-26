import { Shield, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

type RankTier = "Iron" | "Bronze" | "Silver" | "Gold" | "Challenger"
type BadgeStyle = "shield" | "gauntlet"

interface RankBadgeProps {
  tier: RankTier
  style?: BadgeStyle
  size?: "sm" | "md" | "lg"
  className?: string
}

const tierColors: Record<RankTier, { bg: string; border: string; text: string }> = {
  Iron: { bg: "bg-gray-300", border: "border-gray-400", text: "text-gray-700" },
  Bronze: { bg: "bg-amber-600", border: "border-amber-700", text: "text-amber-50" },
  Silver: { bg: "bg-gray-400", border: "border-gray-500", text: "text-white" },
  Gold: { bg: "bg-yellow-500", border: "border-yellow-600", text: "text-yellow-50" },
  Challenger: { bg: "bg-purple-600", border: "border-purple-700", text: "text-purple-50" },
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-12 h-12 text-sm",
  lg: "w-16 h-16 text-base",
}

export function RankBadge({ tier, style = "shield", size = "md", className }: RankBadgeProps) {
  const colors = tierColors[tier]
  const sizeClass = sizeClasses[size]
  
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg border-2",
        colors.bg,
        colors.border,
        colors.text,
        sizeClass,
        "font-bold shadow-sm",
        className
      )}
      title={tier}
    >
      {style === "shield" ? (
        <Shield className="w-1/2 h-1/2" />
      ) : (
        <Trophy className="w-1/2 h-1/2" />
      )}
    </div>
  )
}

