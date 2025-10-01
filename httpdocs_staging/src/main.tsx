import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initSentry } from './utils/sentry'
import { sessionManager } from './utils/sessionManager'

// Validate critical environment variables early
function validateEnvironmentVariables() {
  console.log('🔍 Starting environment variable validation...');
  console.log('Current environment:', import.meta.env.MODE);
  console.log('Available env vars:', Object.keys(import.meta.env));

  const requiredVars = [
    'VITE_API_URL',
    'VITE_RAZORPAY_KEY_ID',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_PUBLISHABLE_KEY'
  ];

  const missingVars: string[] = [];
  const foundVars: string[] = [];

  requiredVars.forEach(varName => {
    const value = import.meta.env[varName];
    if (!value) {
      missingVars.push(varName);
      console.error(`❌ Missing: ${varName}`);
    } else {
      foundVars.push(varName);
      console.log(`✅ Found: ${varName} = ${value.substring(0, 20)}...`);
    }
  });

  if (missingVars.length > 0) {
    const errorMessage = `❌ Missing required environment variables: ${missingVars.join(', ')}\n\nPlease check your .env file and ensure all required variables are set.`;
    console.error(errorMessage);
    // Throw error to prevent app from starting
    throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
  }

  console.log('✅ All required environment variables are present');
  console.log('🎯 App initialization starting...');
}

// Validate environment variables before initializing anything else
validateEnvironmentVariables();

// Initialize Sentry for error tracking
initSentry();

// Initialize session management
sessionManager.initialize().catch(console.error);

// Development utility removed for production

// Disable service workers completely and clear all caches
if ('serviceWorker' in navigator) {
  // Unregister all service workers with more aggressive approach
  navigator.serviceWorker.getRegistrations().then(registrations => {
    const unregisterPromises = registrations.map(registration => {
      console.log('Unregistering service worker:', registration.scope);
      return registration.unregister().then(success => {
        if (success) {
          console.log('✅ Service worker unregistered successfully:', registration.scope);
        } else {
          console.warn('⚠️ Service worker unregistration may have failed:', registration.scope);
        }
        return success;
      });
    });

    return Promise.all(unregisterPromises);
  }).then(() => {
    console.log('✅ All service workers unregistered');
  }).catch(err => {
    console.error('❌ Service worker unregister failed:', err);
  });

  // Clear all caches with more comprehensive approach
  if ('caches' in window) {
    caches.keys().then(names => {
      console.log('Found caches:', names);
      const deletePromises = names.map(name => {
        console.log('Deleting cache:', name);
        return caches.delete(name).then(success => {
          if (success) {
            console.log('✅ Cache deleted:', name);
          } else {
            console.warn('⚠️ Cache deletion may have failed:', name);
          }
          return success;
        });
      });

      return Promise.all(deletePromises);
    }).then(() => {
      console.log('✅ All caches cleared');
    }).catch(err => {
      console.error('❌ Failed to access caches:', err);
    });
  }

  // Prevent future service worker registration attempts
  const originalRegister = navigator.serviceWorker.register;
  navigator.serviceWorker.register = (...args) => {
    console.warn('🚫 Service worker registration blocked:', args[0]);
    return Promise.reject(new Error('Service workers are disabled in this application'));
  };

  // Also override addEventListener to prevent service worker messages
  const originalAddEventListener = navigator.serviceWorker.addEventListener;
  navigator.serviceWorker.addEventListener = function(type, listener, options) {
    if (type === 'message' || type === 'controllerchange') {
      console.warn('🚫 Service worker event listener blocked:', type);
      return;
    }
    return originalAddEventListener.call(this, type, listener, options);
  };
}

createRoot(document.getElementById("root")!).render(<App />);
