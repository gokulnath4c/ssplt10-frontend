import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  // Add debugging for path resolution
  define: {
    __VITE_BASE_DIR__: JSON.stringify(__dirname),
    __VITE_SRC_DIR__: JSON.stringify(path.resolve(__dirname, 'src')),
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          utils: ['clsx', 'tailwind-merge', 'class-variance-authority'],
          supabase: ['@supabase/supabase-js'],
          charts: ['recharts'],
        },
      },
    },
    // Optimize CSS
    cssCodeSplit: true,
    // Enable source maps for production debugging
    sourcemap: false,
    // Minify
    minify: 'terser',
  },
});
