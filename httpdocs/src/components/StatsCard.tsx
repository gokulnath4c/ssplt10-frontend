import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
    label: string
  }
  format?: 'number' | 'currency' | 'percentage'
  isLoading?: boolean
  onClick?: () => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const StatsCard = React.forwardRef<
  HTMLDivElement,
  StatsCardProps
>(({
  title,
  value,
  description,
  icon,
  trend,
  format = 'number',
  isLoading = false,
  onClick,
  className,
  size = 'md',
  ...props
}, ref) => {
  const formatValue = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : val

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(num)
      case 'percentage':
        return `${num}%`
      default:
        return new Intl.NumberFormat('en-IN').format(num)
    }
  }

  const sizeClasses = {
    sm: "min-w-[200px]",
    md: "min-w-[240px]",
    lg: "min-w-[280px]"
  }

  const textSizeClasses = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-4xl"
  }

  return (
    <Card
      ref={ref}
      variant="stats"
      isLoading={isLoading}
      clickable={!!onClick}
      onClick={onClick}
      className={cn(
        sizeClasses[size],
        "h-full transition-all duration-300 overflow-hidden",
        "hover:shadow-lg hover:scale-105",
        className
      )}
      ariaLabel={`Statistics: ${title} - ${formatValue(value)}`}
      {...props}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          {icon && (
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
          )}
          {trend && (
            <div className={cn(
              "flex items-center space-x-1 text-sm font-medium",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}>
              <svg
                className={cn(
                  "w-4 h-4",
                  trend.isPositive ? "rotate-0" : "rotate-180"
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 11l5-5m0 0l5 5m-5-5v12"
                />
              </svg>
              <span>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
              <span className="text-muted-foreground text-xs">{trend.label}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className={cn(
            "font-bold transition-all duration-300",
            textSizeClasses[size],
            "bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
          )}>
            {formatValue(value)}
          </div>
        </div>

        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}

        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </CardContent>
    </Card>
  )
})

StatsCard.displayName = "StatsCard"

export { StatsCard, type StatsCardProps }