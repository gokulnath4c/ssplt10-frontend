import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ChevronDown, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface EnhancedSelectProps {
  label?: string;
  error?: string;
  success?: string;
  warning?: string;
  helperText?: string;
  placeholder?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
  triggerClassName?: string;
  contentClassName?: string;
  floatingLabel?: boolean;
  animated?: boolean;
  id?: string;
  name?: string;
}

const EnhancedSelect = React.forwardRef<HTMLButtonElement, EnhancedSelectProps>(
  ({
    label,
    error,
    success,
    warning,
    helperText,
    placeholder = "Select an option...",
    options,
    value,
    onValueChange,
    disabled = false,
    required = false,
    className,
    containerClassName,
    labelClassName,
    triggerClassName,
    contentClassName,
    floatingLabel = false,
    animated = true,
    id,
    name,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);

    const hasError = !!error;
    const hasSuccess = !!success;
    const hasWarning = !!warning;

    const getStatusIcon = () => {
      if (hasError) return <XCircle className="w-4 h-4 text-red-500" />;
      if (hasSuccess) return <CheckCircle className="w-4 h-4 text-green-500" />;
      if (hasWarning) return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      return null;
    };

    const getStatusColor = () => {
      if (hasError) return 'border-red-500 focus:border-red-500 focus:ring-red-500/20';
      if (hasSuccess) return 'border-green-500 focus:border-green-500 focus:ring-green-500/20';
      if (hasWarning) return 'border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500/20';
      return 'border-gray-300 focus:border-cricket-blue focus:ring-cricket-blue/20';
    };

    const getStatusTextColor = () => {
      if (hasError) return 'text-red-600';
      if (hasSuccess) return 'text-green-600';
      if (hasWarning) return 'text-yellow-600';
      return 'text-gray-700';
    };

    return (
      <div className={cn("relative", containerClassName)}>
        {/* Label */}
        {label && !floatingLabel && (
          <Label
            htmlFor={id}
            className={cn(
              "block text-sm font-medium mb-2 transition-colors duration-200",
              getStatusTextColor(),
              labelClassName
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}

        {/* Select Container */}
        <div className="relative">
          <Select
            value={value}
            onValueChange={onValueChange}
            disabled={disabled}
            onOpenChange={(open) => setIsFocused(open)}
          >
            <SelectTrigger
              ref={ref}
              id={id}
              name={name}
              className={cn(
                "transition-all duration-300 ease-out",
                "bg-white/80 backdrop-blur-sm",
                "placeholder:text-gray-400",
                animated && "hover:shadow-md focus:shadow-lg",
                getStatusColor(),
                hasError && "text-red-900",
                hasSuccess && "text-green-900",
                hasWarning && "text-yellow-900",
                triggerClassName
              )}
              {...props}
            >
              <SelectValue placeholder={placeholder} />

              {/* Floating Label */}
              {label && floatingLabel && (
                <Label
                  htmlFor={id}
                  className={cn(
                    "absolute left-3 transition-all duration-200 pointer-events-none",
                    (isFocused || value) ? "top-1 text-xs text-cricket-blue" : "top-1/2 -translate-y-1/2 text-sm text-gray-500",
                    getStatusTextColor(),
                    labelClassName
                  )}
                >
                  {label}
                  {required && <span className="text-red-500 ml-1">*</span>}
                </Label>
              )}
            </SelectTrigger>

            <SelectContent className={cn("bg-white/95 backdrop-blur-sm border-gray-200", contentClassName)}>
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className="focus:bg-cricket-light-blue/50 focus:text-cricket-blue"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Icon */}
          {getStatusIcon() && (
            <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-10">
              {getStatusIcon()}
            </div>
          )}

          {/* Chevron Down Icon */}
          <ChevronDown className={cn(
            "absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-200",
            "text-gray-400",
            isFocused && "text-cricket-blue"
          )} />

          {/* Focus Ring Animation */}
          {animated && isFocused && (
            <div className="absolute inset-0 rounded-md bg-gradient-to-r from-cricket-electric-blue/20 to-cricket-purple/20 animate-pulse" />
          )}
        </div>

        {/* Helper Text / Error Message */}
        {(helperText || error || success || warning) && (
          <div className={cn(
            "mt-2 text-sm transition-all duration-200",
            hasError && "text-red-600",
            hasSuccess && "text-green-600",
            hasWarning && "text-yellow-600",
            !hasError && !hasSuccess && !hasWarning && "text-gray-500"
          )}>
            {error || success || warning || helperText}
          </div>
        )}

        {/* Success Animation */}
        {hasSuccess && animated && (
          <div className="absolute right-2 top-2 w-2 h-2 bg-green-500 rounded-full animate-ping" />
        )}
      </div>
    );
  }
);

EnhancedSelect.displayName = 'EnhancedSelect';

export { EnhancedSelect, type EnhancedSelectProps };