import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { HelmetProvider } from "react-helmet-async";
import DynamicThemeProvider from "./components/DynamicThemeProvider";
import { AuthProvider } from "./hooks/useAuth";
import ErrorBoundary from "./components/ErrorBoundary";
import { LoadingSpinner, CardSkeleton } from "./components/ui/enhanced-loading";
import BackgroundWrapper from "./components/BackgroundWrapper";

// Lazy load pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const Register = lazy(() => import("./pages/Register"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const QRScan = lazy(() => import("./pages/QRScan"));
const ErrorHandlingTest = lazy(() => import("./components/ErrorHandlingTest"));
const RegistrationSuccess = lazy(() => import("./pages/RegistrationSuccess"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Enquiry = lazy(() => import("./pages/Enquiry"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));

// Enhanced loading component for Suspense fallback
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center space-y-6 max-w-md mx-auto px-4">
      <div className="flex justify-center">
        <img
          src="/ssplt10-logo.png"
          alt="SSPL T10 Logo"
          className="w-16 h-16 animate-pulse"
        />
      </div>
      <LoadingSpinner size="lg" text="Loading SSPL T10..." />
      <CardSkeleton className="mt-6" />
    </div>
  </div>
);

// Error fallback component for lazy loading errors
const LazyErrorFallback = ({ error, retry }: { error: Error; retry: () => void }) => (
  <div className="min-h-screen bg-background flex items-center justify-center p-4">
    <div className="max-w-md mx-auto text-center space-y-4">
      <div className="text-red-600 text-6xl">⚠️</div>
      <h1 className="text-2xl font-bold text-red-800">Loading Error</h1>
      <p className="text-gray-600">Failed to load the page. This might be due to a network issue.</p>
      <div className="space-y-2">
        <button
          onClick={retry}
          className="w-full bg-cricket-blue text-white px-6 py-2 rounded-lg hover:bg-cricket-dark-blue transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Reload Page
        </button>
      </div>
    </div>
  </div>
);

// Configure React Query with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      networkMode: 'online',
    },
    mutations: {
      retry: 2,
      networkMode: 'online',
    },
  },
});

const App = () => {
  console.log('🚀 SSPL T10 App component rendering...');

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <DynamicThemeProvider>
              <AuthProvider>
                <Toaster />
                <Sonner />
                {/* Skip to main content link for accessibility */}
                <a
                  href="#main-content"
                  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-sport-orange text-white px-4 py-2 rounded-md z-50 font-semibold focus:outline-none focus:ring-2 focus:ring-sport-orange focus:ring-offset-2"
                >
                  Skip to main content
                </a>
                <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
                  <BackgroundWrapper>
                    <Suspense fallback={<PageLoader />}>
                      <ErrorBoundary fallback={<LazyErrorFallback error={new Error("Page Loading Error")} retry={() => window.location.reload()} />}>
                        <Routes>
                          {/* Home Page Route */}
                          <Route path="/" element={<Index />} />

                          {/* Dedicated Registration Route */}
                          <Route path="/register" element={<Register />} />

                        {/* Authentication Page Route */}
                        <Route path="/auth" element={<AuthPage />} />

                        {/* Admin Login Route */}
                        <Route path="/admin-login" element={<AuthPage />} />

                        {/* Admin Panel Route */}
                        <Route path="/admin" element={<AdminPanel />} />

                        {/* Test Admin Route - Bypass role checking for testing */}
                        <Route path="/admin-test" element={<AdminPanel />} />

                        {/* QR Code Scan Route */}
                        <Route path="/qr/:code" element={<QRScan />} />

                        {/* Error Handling Test Route */}
                        <Route path="/error-test" element={<ErrorHandlingTest />} />

                        {/* Custom Routes Go Here, For Example: */}
                        {/* <Route path="/profile" element={<Profile />} /> */}

                        {/* Registration Success Route */}
                        <Route path="/registration/success" element={<RegistrationSuccess />} />

                        {/* About Us Route */}
                        <Route path="/about-us" element={<AboutUs />} />

                        {/* How It Works Route */}
                        <Route path="/how-it-works" element={<HowItWorks />} />

                        {/* Enquiry Route */}
                        <Route path="/enquiry" element={<Enquiry />} />

                        {/* Terms & Conditions Route */}
                        <Route path="/terms&Conditions" element={<TermsAndConditions />} />

                        {/* Privacy Policy Route */}
                        <Route path="/privacyPolicy" element={<PrivacyPolicy />} />

                        {/* Catch-all Route for 404 Page */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </ErrorBoundary>
                        </Suspense>
                  </BackgroundWrapper>
                    </BrowserRouter>
                  </AuthProvider>
                </DynamicThemeProvider>
              </TooltipProvider>
            </QueryClientProvider>
          </HelmetProvider>
        </ErrorBoundary>
      );
};

export default App;
