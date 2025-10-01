import * as React from "react"
import { cn } from "@/lib/utils"

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  fallbackSrc?: string
  aspectRatio?: 'square' | 'video' | 'portrait' | number
  sizes?: string
  quality?: number
  className?: string
  onLoad?: () => void
  onError?: () => void
  // Responsive image support
  srcSet?: string
  srcSetSizes?: string
  // Performance optimizations
  priority?: boolean
  placeholder?: 'blur' | 'empty'
}

const OptimizedImage = React.forwardRef<
  HTMLImageElement,
  OptimizedImageProps
>(({
  src,
  alt,
  fallbackSrc,
  aspectRatio = 'square',
  sizes = "(max-width: 599px) 100vw, (max-width: 1024px) 50vw, 33vw",
  quality = 75,
  className,
  onLoad,
  onError,
  srcSet,
  srcSetSizes,
  priority = false,
  placeholder = 'empty',
  ...props
}, ref) => {
  const [isLoading, setIsLoading] = React.useState(true)
  const [hasError, setHasError] = React.useState(false)
  const [currentSrc, setCurrentSrc] = React.useState(src)

  const aspectRatioClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    [aspectRatio]: `aspect-[${aspectRatio}]`
  }[typeof aspectRatio === 'string' ? aspectRatio : 'custom']

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setHasError(false)
      setIsLoading(true)
    } else {
      setIsLoading(false)
      onError?.()
    }
  }

  React.useEffect(() => {
    setIsLoading(true)
    setHasError(false)
    setCurrentSrc(src)
  }, [src])

  return (
    <div className={cn("relative overflow-hidden", aspectRatioClass, className)}>
      {/* Loading placeholder */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer" />
      )}

      {/* Error fallback */}
      {hasError && !isLoading && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs">Image unavailable</p>
          </div>
        </div>
      )}

      {/* Actual image */}
      <img
        ref={ref}
        src={currentSrc}
        alt={alt}
        sizes={srcSetSizes || sizes}
        srcSet={srcSet}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        {...props}
      />
    </div>
  )
})

OptimizedImage.displayName = "OptimizedImage"

export { OptimizedImage, type OptimizedImageProps }