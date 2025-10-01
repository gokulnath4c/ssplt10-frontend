import React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Check, Minus } from 'lucide-react';

interface EnhancedCheckboxProps {
  label?: string;
  error?: string;
  helperText?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  indeterminate?: boolean;
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
  checkboxClassName?: string;
  id?: string;
  name?: string;
  value?: string;
}

const EnhancedCheckbox = React.forwardRef<HTMLButtonElement, EnhancedCheckboxProps>(
  ({
    label,
    error,
    helperText,
    checked = false,
    onCheckedChange,
    disabled = false,
    required = false,
    indeterminate = false,
    className,
    containerClassName,
    labelClassName,
    checkboxClassName,
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
        <div className="flex items-start space-x-3">
          {/* Custom Checkbox */}
          <button
            ref={ref}
            type="button"
            role="checkbox"
            aria-checked={indeterminate ? 'mixed' : checked}
            aria-describedby={(helperText || error) ? `${id}-description` : undefined}
            aria-invalid={hasError}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            className={cn(
              "relative flex items-center justify-center w-5 h-5 rounded-md transition-all duration-200",
              "border-2 bg-white/80 backdrop-blur-sm",
              "focus:outline-none focus:ring-2 focus:ring-cricket-blue focus:ring-offset-2",
              "hover:shadow-md",
              hasError && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
              !hasError && "border-gray-300 focus:border-cricket-blue",
              checked && !indeterminate && "bg-cricket-blue border-cricket-blue",
              indeterminate && "bg-cricket-blue border-cricket-blue",
              disabled && "opacity-50 cursor-not-allowed bg-gray-100",
              isFocused && "shadow-lg",
              checkboxClassName
            )}
          >
            {/* Check Icon */}
            {checked && !indeterminate && (
              <Check className="w-3 h-3 text-white transition-transform duration-200" />
            )}

            {/* Indeterminate Icon */}
            {indeterminate && (
              <Minus className="w-3 h-3 text-white transition-transform duration-200" />
            )}

            {/* Focus Ring Animation */}
            {isFocused && (
              <div className="absolute inset-0 rounded-md bg-gradient-to-r from-cricket-electric-blue/20 to-cricket-purple/20 animate-pulse" />
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
          type="checkbox"
          id={id}
          name={name}
          value={value}
          checked={checked}
          onChange={() => {}} // Handled by custom checkbox
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

EnhancedCheckbox.displayName = 'EnhancedCheckbox';

export { EnhancedCheckbox, type EnhancedCheckboxProps };