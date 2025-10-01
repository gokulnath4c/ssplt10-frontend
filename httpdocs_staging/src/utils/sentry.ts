import * as Sentry from "@sentry/react";
import { browserTracingIntegration } from "@sentry/react";

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const SENTRY_ENVIRONMENT = import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development';

export const initSentry = () => {
  console.log('🔍 Sentry Debug - DSN value:', SENTRY_DSN);
  console.log('🔍 Sentry Debug - DSN type:', typeof SENTRY_DSN);
  console.log('🔍 Sentry Debug - DSN length:', SENTRY_DSN?.length);
  console.log('🔍 Sentry Debug - Is placeholder?', SENTRY_DSN?.includes('your-sentry-dsn'));

  if (!SENTRY_DSN) {
    console.warn('❌ Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  if (SENTRY_DSN.includes('your-sentry-dsn')) {
    console.warn('❌ Sentry DSN is placeholder value. Error tracking disabled.');
    console.warn('💡 Please replace VITE_SENTRY_DSN in your environment file with a real Sentry DSN from https://sentry.io/settings/projects/YOUR_PROJECT/keys/');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    integrations: [
      browserTracingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,
    // Session Replay
    replaysSessionSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,
    // Release tracking
    release: import.meta.env.VITE_APP_VERSION || '1.0.0',
    // Error filtering
    beforeSend(event, hint) {
      // Filter out network errors that are expected
      if (event.exception) {
        const error = hint.originalException;
        if (error && typeof error === 'object' && 'message' in error) {
          const message = (error as Error).message;
          // Filter out common network errors
          if (message.includes('NetworkError') ||
              message.includes('Failed to fetch') ||
              message.includes('Load failed')) {
            return null;
          }
        }
      }
      return event;
    },
  });

  console.log('Sentry initialized for environment:', SENTRY_ENVIRONMENT);
};

// User feedback helper
export const captureUserFeedback = (name: string, email: string, comments: string) => {
  Sentry.captureMessage(`User Feedback: ${name}`, {
    level: 'info',
    tags: {
      feedback: 'user',
    },
    user: {
      email,
      username: name,
    },
    extra: {
      comments,
    },
  });
};

// Custom error reporting
export const reportError = (error: Error, context?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    if (context) {
      Object.keys(context).forEach(key => {
        scope.setTag(key, context[key]);
      });
    }
    Sentry.captureException(error);
  });
};

