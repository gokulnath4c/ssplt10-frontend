import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2, Play, Download, Heart, Star, Settings } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-sport uppercase tracking-wider ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sport-orange focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transform hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        // New Design System Variants
        primary: "bg-sport-orange text-white hover:bg-sport-orange/90 shadow-lg hover:shadow-sport-orange/50 min-h-[44px] hover:scale-105",
        secondary: "border-2 border-sport-teal bg-transparent text-sport-teal hover:bg-sport-teal hover:text-white shadow-lg hover:shadow-sport-teal/30 min-h-[44px] hover:scale-105",

        // Legacy variants (maintained for compatibility)
        default: "bg-sport-green text-white hover:bg-sport-green/80 shadow-lg hover:shadow-sport-green/50 min-h-[44px]",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-500 shadow-lg hover:shadow-red-500/50 min-h-[44px]",
        outline:
          "border-2 border-sport-blue bg-transparent text-sport-blue hover:bg-sport-blue hover:text-white shadow-lg hover:shadow-sport-blue/30 min-h-[44px]",
        ghost: "text-sport-green hover:bg-sport-green/10 hover:text-sport-green min-h-[44px]",
        link: "text-sport-green underline-offset-4 hover:underline hover:text-sport-green/80 min-h-[44px]",
        header: "bg-white text-sport-green border-2 border-sport-green/30 hover:bg-sport-green hover:text-white backdrop-blur-sm shadow-lg hover:shadow-sport-green/30 min-h-[44px]",
        premium: "bg-gradient-to-r from-sport-green via-green-500 to-blue-500 text-white hover:shadow-sport-green/50 transition-all duration-500 font-bold border border-sport-gold/30 shadow-lg min-h-[44px]",
        hero: "bg-gradient-to-r from-sport-green to-sport-blue text-white hover:bg-gradient-to-r hover:from-sport-blue hover:to-sport-green shadow-lg hover:shadow-sport-green/50 transition-all duration-500 font-bold min-h-[44px]",
        success: "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-green-500/50 transition-all duration-300 min-h-[44px]",
        magical: "bg-gradient-to-r from-sport-green via-purple-500 to-pink-500 text-white hover:scale-105 shadow-sport-green/50 transition-all duration-500 animate-pulse-glow min-h-[44px]",
      },
      size: {
        default: "h-11 px-6 py-3 text-sm",
        sm: "h-10 rounded-md px-4 py-2 text-xs",
        lg: "h-12 rounded-md px-8 py-4 text-base",
        icon: "h-11 w-11",
        xl: "h-14 px-10 py-5 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  fullWidth?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    asChild = false,
    loading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    disabled,
    children,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    const isDisabled = disabled || loading

    // Responsive classes for full-width on mobile
    const responsiveClasses = fullWidth
      ? "w-full sm:w-auto"
      : ""

    // When using asChild, we need to render only the single child
    // without adding our own wrapper elements
    if (asChild) {
      return (
        <Comp
          className={cn(
            buttonVariants({ variant, size, className }),
            responsiveClasses,
            "group" // For enhanced hover effects
          )}
          ref={ref}
          disabled={isDisabled}
          aria-disabled={isDisabled}
          aria-busy={loading}
          {...props}
        >
          {children}
        </Comp>
      )
    }

    // Normal button rendering with all enhancements
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          responsiveClasses,
          "group" // For enhanced hover effects
        )}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
        )}

        {/* Left icon */}
        {!loading && leftIcon && (
          <span className="mr-2" aria-hidden="true">
            {leftIcon}
          </span>
        )}

        {/* Button content */}
        <span className={loading ? "opacity-0" : ""}>
          {children}
        </span>

        {/* Right icon */}
        {!loading && rightIcon && (
          <span className="ml-2" aria-hidden="true">
            {rightIcon}
          </span>
        )}

        {/* Shine effect overlay */}
        <span
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none"
          aria-hidden="true"
        />
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
export default Button
