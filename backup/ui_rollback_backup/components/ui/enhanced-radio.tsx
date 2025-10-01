import React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface EnhancedRadioProps {
  label?: string;
  error?: string;
  helperText?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
  radioClassName?: string;
  id?: string;
  name?: string;
  value?: string;
}

const EnhancedRadio = React.forwardRef<HTMLButtonElement, EnhancedRadioProps>(
  ({
    label,
    error,
    helperText,
    checked = false,
    onCheckedChange,
    disabled = false,
    required = false,
    className,
    containerClassName,
    labelClassName,
    radioClassName,
    id,
    name,
    value,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);

    const hasError = !!error;

    const handleClick = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!checked);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        handleClick();
      }
    };

    return (
      <div className={cn("relative", containerClassName)}>
        <div className="flex items-center space-x-3">
          {/* Custom Radio Button */}
          <button
            ref={ref}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-describedby={helperText || error ? `${id}-description` : undefined}
            aria-invalid={hasError}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            className={cn(
              "relative flex items-center justify-center w-5 h-5 rounded-full transition-all duration-200",
              "border-2 bg-white/80 backdrop-blur-sm",
              "focus:outline-none focus:ring-2 focus:ring-cricket-blue focus:ring-offset-2",
              "hover:shadow-md",
              hasError && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
              !hasError && "border-gray-300 focus:border-cricket-blue",
              checked && "border-cricket-blue",
              disabled && "opacity-50 cursor-not-allowed bg-gray-100",
              isFocused && "shadow-lg",
              radioClassName
            )}
            {...props}
          >
            {/* Inner Circle */}
            {checked && (
              <div className="w-2.5 h-2.5 bg-cricket-blue rounded-full transition-all duration-200" />
            )}

            {/* Focus Ring Animation */}
            {isFocused && (
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cricket-electric-blue/20 to-cricket-purple/20 animate-pulse" />
            )}
          </button>

          {/* Label */}
          {label && (
            <Label
              htmlFor={id}
              onClick={handleClick}
              className={cn(
                "text-sm font-medium leading-none cursor-pointer transition-colors duration-200",
                "select-none",
                hasError && "text-red-600",
                !hasError && "text-gray-700",
                disabled && "opacity-50 cursor-not-allowed",
                labelClassName
              )}
            >
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          )}
        </div>

        {/* Hidden Input for Form Data */}
        <input
          type="radio"
          id={id}
          name={name}
          value={value}
          checked={checked}
          onChange={() => {}} // Handled by custom radio
          className="sr-only"
          required={required}
          disabled={disabled}
        />

        {/* Helper Text / Error Message */}
        {(helperText || error) && (
          <div
            id={`${id}-description`}
            className={cn(
              "mt-2 text-sm transition-all duration-200",
              hasError && "text-red-600",
              !hasError && "text-gray-500"
            )}
          >
            {error || helperText}
          </div>
        )}
      </div>
    );
  }
);

EnhancedRadio.displayName = 'EnhancedRadio';

export { EnhancedRadio, type EnhancedRadioProps };