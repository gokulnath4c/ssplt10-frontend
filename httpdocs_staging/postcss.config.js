export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production' ? {
      cssnano: {
        preset: ['default', {
          // Optimized settings for faster processing
          discardComments: { removeAll: true },
          normalizeWhitespace: false,
          colormin: true,
          convertValues: true,
          discardDuplicates: true,
          discardEmpty: true,
          discardOverridden: true,
          // Reduce aggressive optimizations for faster builds
          mergeLonghand: false, // Can be slow
          mergeRules: false, // Can be slow
          minifyFontValues: true,
          minifyGradients: true,
          minifyParams: true,
          minifySelectors: true,
          normalizeCharset: true,
          normalizeDisplayValues: true,
          normalizePositions: true,
          normalizeRepeatStyle: true,
          normalizeString: true,
          normalizeTimingFunctions: true,
          normalizeUnicode: false, // Can be slow
          normalizeUrl: true,
          orderedValues: true,
          reduceBackgroundRepeat: true,
          reduceDisplayValues: true,
          reduceInitial: true,
          reduceTransforms: true,
          svgo: false, // Disable for faster builds
          uniqueSelectors: true,
          zindex: false, // Can cause issues
        }]
      }
    } : {}),
  },
}
