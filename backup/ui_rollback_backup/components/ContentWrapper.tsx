import { ReactNode } from "react";

interface ContentWrapperProps {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full";
  spacing?: "none" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const ContentWrapper = ({
  children,
  maxWidth = "2xl",
  spacing = "lg",
  className = ""
}: ContentWrapperProps) => {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
    full: "max-w-full"
  };

  const spacingClasses = {
    none: "",
    xs: "py-2 sm:py-3",
    sm: "py-3 sm:py-4 md:py-6",
    md: "py-4 sm:py-6 md:py-8 lg:py-12",
    lg: "py-6 sm:py-8 md:py-12 lg:py-16",
    xl: "py-8 sm:py-12 md:py-16 lg:py-24",
    "2xl": "py-12 sm:py-16 md:py-20 lg:py-28"
  };

  return (
    <div
      className={`
        w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-8
        ${maxWidthClasses[maxWidth]}
        ${spacingClasses[spacing]}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default ContentWrapper;