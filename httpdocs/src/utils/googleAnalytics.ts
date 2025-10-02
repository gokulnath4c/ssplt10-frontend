/**
 * Google Analytics utility for tracking user interactions
 * Provides methods for tracking button clicks, page views, and other events
 */

interface GoogleAnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

interface GoogleAnalyticsConfig {
  trackingId?: string;
  enabled: boolean;
  debug: boolean;
}

class GoogleAnalytics {
  private config: GoogleAnalyticsConfig = {
    enabled: true,
    debug: false
  };

  constructor() {
    // Check if we're in development mode
    if (import.meta.env.DEV) {
      this.config.debug = true;
    }

    // Initialize Google Analytics if gtag is available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      this.log('Google Analytics initialized');
    } else if (this.config.debug) {
      this.log('Google Analytics not available - running in debug mode');
    }
  }

  /**
   * Track button click events
   */
  trackButtonClick(action: string, category: string, label?: string): void {
    this.trackEvent({
      action,
      category,
      label
    });
  }

  /**
   * Track page view events
   */
  trackPageView(pagePath: string, pageTitle?: string): void {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', this.config.trackingId || '', {
        page_path: pagePath,
        page_title: pageTitle
      });
    }

    if (this.config.debug) {
      this.log('Page View:', { pagePath, pageTitle });
    }
  }

  /**
   * Track custom events
   */
  trackEvent(event: GoogleAnalyticsEvent): void {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value
      });
    }

    if (this.config.debug) {
      this.log('Event:', event);
    }
  }

  /**
   * Track user engagement events
   */
  trackEngagement(action: string, category: string = 'engagement', label?: string): void {
    this.trackEvent({
      action,
      category,
      label
    });
  }

  /**
   * Track error events
   */
  trackError(error: string, category: string = 'error', label?: string): void {
    this.trackEvent({
      action: 'error',
      category,
      label: `${label}: ${error}`
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(action: string, value: number, category: string = 'performance'): void {
    this.trackEvent({
      action,
      category,
      value
    });
  }

  /**
   * Track registration start events
   */
  trackRegistrationStart(data: { player_email?: string }): void {
    this.trackEvent({
      action: 'registration_start',
      category: 'registration',
      label: data.player_email
    });
  }

  /**
   * Track registration completion events
   */
  trackRegistrationComplete(data: {
    player_id: string;
    player_name: string;
    player_email: string;
    player_position: string;
    player_state: string;
    player_city?: string;
  }): void {
    this.trackEvent({
      action: 'registration_complete',
      category: 'registration',
      label: `${data.player_name} - ${data.player_email}`,
      value: undefined
    });
  }

  /**
   * Track payment initiation events
   */
  trackPaymentInitiated(paymentData: {
    amount: number;
    currency: string;
  }, playerData: {
    player_id: string;
    player_name: string;
    player_email: string;
    player_position: string;
    player_state: string;
    player_city?: string;
  }): void {
    this.trackEvent({
      action: 'payment_initiated',
      category: 'payment',
      label: `${playerData.player_name} - ${paymentData.currency} ${paymentData.amount}`,
      value: paymentData.amount
    });
  }

  /**
   * Track payment cancellation events
   */
  trackPaymentCancelled(paymentData: {
    amount: number;
    currency: string;
    payment_status: string;
  }, playerData: {
    player_id: string;
    player_name: string;
    player_email: string;
    player_position: string;
    player_state: string;
    player_city?: string;
  }): void {
    this.trackEvent({
      action: 'payment_cancelled',
      category: 'payment',
      label: `${playerData.player_name} - ${paymentData.currency} ${paymentData.amount}`,
      value: paymentData.amount
    });
  }

  /**
   * Track payment completion events
   */
  trackPaymentCompleted(paymentData: {
    payment_id: string;
    order_id: string;
    amount: number;
    currency: string;
    payment_status: string;
  }, playerData: {
    player_id: string;
    player_name: string;
    player_email: string;
    player_position: string;
    player_state: string;
    player_city?: string;
  }): void {
    this.trackEvent({
      action: 'payment_completed',
      category: 'payment',
      label: `${playerData.player_name} - ${paymentData.payment_id}`,
      value: paymentData.amount
    });
  }

  /**
   * Track payment failure events
   */
  trackPaymentFailed(paymentData: {
    amount: number;
    currency: string;
    payment_status: string;
  }, error: string, playerData: {
    player_id: string;
    player_name: string;
    player_email: string;
    player_position: string;
    player_state: string;
    player_city?: string;
  }): void {
    this.trackError(error, 'payment', `${playerData.player_name} - ${paymentData.currency} ${paymentData.amount}`);
  }

  /**
   * Configure Google Analytics
   */
  configure(config: Partial<GoogleAnalyticsConfig>): void {
    this.config = { ...this.config, ...config };

    if (this.config.debug) {
      this.log('Configuration updated:', this.config);
    }
  }

  /**
   * Check if Google Analytics is available
   */
  isAvailable(): boolean {
    return typeof window !== 'undefined' && !!(window as any).gtag;
  }

  /**
   * Debug logging
   */
  private log(...args: any[]): void {
    if (this.config.debug) {
      console.log('[GA]', ...args);
    }
  }
}

// Create singleton instance
const googleAnalytics = new GoogleAnalytics();

// Export the instance
export { googleAnalytics };
export default googleAnalytics;