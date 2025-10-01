import React, { forwardRef } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ChevronDown, Check } from 'lucide-react';
import { useFloatingAnimation } from '@/utils/animationUtils';

interface EnhancedSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  success?: boolean;
  floating?: boolean;
  placeholder?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  variant?: 'default' | 'floating' | 'glass' | 'premium';
  className?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

const EnhancedSelect = forwardRef<HTMLDivElement, EnhancedSelectProps>(({
  label,
  error,
  success,
  floating = false,
  placeholder = "Select an option",
  options,
  variant = 'default',
  className,
  value,
  onValueChange,
  ...props
}, ref) => {
  const position = useFloatingAnimation();

  const baseClasses = "relative transition-all duration-300 group";

  const variantClasses = {
    default: "hover:shadow-premium focus-within:shadow-glow",
    floating: "hover:shadow-float focus-within:shadow-glow",
    glass: "glass-card hover:shadow-float focus-within:shadow-glow",
    premium: "hover:shadow-premium focus-within:shadow-glow border-2 border-transparent hover:border-cricket-blue/30 focus-within:border-cricket-blue"
  };

  const triggerClasses = cn(
    "w-full px-4 py-3 rounded-lg transition-all duration-300",
    "bg-white/90 backdrop-blur-sm border border-gray-200",
    "hover:border-cricket-blue/50 hover:bg-white",
    "focus:outline-none focus:ring-2 focus:ring-cricket-blue/20 focus:border-cricket-blue",
    "data-[placeholder]:text-gray-400",
    error && "border-red-300 focus:border-red-500 focus:ring-red-200",
    success && "border-green-300 focus:border-green-500 focus:ring-green-200",
    variant === 'glass' && "bg-white/10 border-white/20",
    variant === 'premium' && "bg-gradient-to-r from-white/5 to-white/10",
    className
  );

  return (
    <div ref={ref} className={cn(baseClasses, variantClasses[variant])}>
      {label && (
        <label className={cn(
          "block text-sm font-medium mb-2 transition-all duration-300",
          error ? "text-red-600" : success ? "text-green-600" : "text-gray-700",
          "group-hover:text-cricket-blue"
        )}>
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger
            className={cn(
              triggerClasses,
              floating && "hover:scale-[1.02] focus:scale-[1.02]"
            )}
            style={floating ? {
              transform: `translate(${position.x * 0.1}px, ${position.y * 0.1}px)`
            } : undefined}
          >
            <SelectValue placeholder={placeholder} />
            <ChevronDown className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
          </SelectTrigger>

          <SelectContent className="bg-white/95 backdrop-blur-sm border-gray-200 shadow-premium">
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className={cn(
                  "cursor-pointer transition-all duration-200",
                  "hover:bg-cricket-blue/10 focus:bg-cricket-blue/10",
                  "data-[state=checked]:bg-cricket-blue data-[state=checked]:text-white"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{option.label}</span>
                  {value === option.value && (
                    <Check className="h-4 w-4" />
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Floating animation indicator */}
        {floating && (
          <div
            className="absolute -top-1 -right-1 w-2 h-2 bg-cricket-purple rounded-full opacity-60"
            style={{
              transform: `translate(${position.x * 0.2}px, ${position.y * 0.2}px)`,
              transition: 'transform 0.1s linear'
            }}
          />
        )}

        {/* Premium shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

        {/* Success/Error indicators */}
        {success && (
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2 text-green-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        {error && (
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2 text-red-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-600 animate-fade-in">
          {error}
        </p>
      )}

      {/* Success message */}
      {success && !error && (
        <p className="mt-2 text-sm text-green-600 animate-fade-in">
          Perfect choice!
        </p>
      )}
    </div>
  );
});

EnhancedSelect.displayName = 'EnhancedSelect';

export { EnhancedSelect };