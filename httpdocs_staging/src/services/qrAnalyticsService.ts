import { supabase } from '@/integrations/supabase/client';

export interface ScanEvent {
  qrCodeId: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  referrer?: string;
  location?: {
    country?: string;
    city?: string;
    region?: string;
  };
  device?: {
    browser?: string;
    os?: string;
    isMobile?: boolean;
    isTablet?: boolean;
    isDesktop?: boolean;
  };
  scanSource?: string;
}

export interface AnalyticsData {
  totalScans: number;
  uniqueVisitors: number;
  scansByDate: Array<{ date: string; scans: number }>;
  scansByHour: Array<{ hour: number; scans: number }>;
  topReferrers: Array<{ referrer: string; scans: number }>;
  deviceBreakdown: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  browserBreakdown: Array<{ browser: string; scans: number }>;
  osBreakdown: Array<{ os: string; scans: number }>;
  locationBreakdown: Array<{ location: string; scans: number }>;
  conversionRate?: number;
}

export class QRAnalyticsService {
  /**
   * Track a QR code scan event
   */
  static async trackScan(scanEvent: ScanEvent): Promise<void> {
    try {
      // For now, we'll use local storage to track scans
      // In production, this would send data to the analytics service
      const scanKey = `qr_scan_${scanEvent.qrCodeId}_${Date.now()}`;
      const scanData = {
        ...scanEvent,
        id: scanKey,
        timestamp: scanEvent.timestamp.toISOString()
      };

      // Store in local storage for demo purposes
      this.storeScanLocally(scanData);

      // In production, send to analytics service
      console.log('QR Code scanned:', scanData);

    } catch (error) {
      console.error('Error tracking QR scan:', error);
      // Don't throw error to avoid breaking user experience
    }
  }

  /**
   * Get analytics data for a QR code
   */
  static async getAnalytics(qrCodeId: string, dateRange?: { start: Date; end: Date }): Promise<AnalyticsData> {
    try {
      // For demo purposes, return mock data
      // In production, this would fetch from the analytics database
      return this.generateMockAnalytics(qrCodeId, dateRange);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  /**
   * Get real-time scan count for a QR code
   */
  static async getRealTimeScanCount(qrCodeId: string): Promise<number> {
    try {
      // For demo purposes, return a random number
      // In production, this would fetch from real-time analytics
      return Math.floor(Math.random() * 100) + 50;
    } catch (error) {
      console.error('Error fetching real-time scan count:', error);
      return 0;
    }
  }

  /**
   * Export analytics data
   */
  static async exportAnalytics(qrCodeId: string, format: 'csv' | 'json' | 'pdf' = 'csv'): Promise<string> {
    try {
      const analytics = await this.getAnalytics(qrCodeId);

      switch (format) {
        case 'csv':
          return this.convertToCSV(analytics);
        case 'json':
          return JSON.stringify(analytics, null, 2);
        case 'pdf':
          return this.convertToPDF(analytics);
        default:
          throw new Error('Unsupported export format');
      }
    } catch (error) {
      console.error('Error exporting analytics:', error);
      throw error;
    }
  }

  /**
   * Get scan trends over time
   */
  static async getScanTrends(qrCodeId: string, days: number = 30): Promise<Array<{ date: string; scans: number }>> {
    try {
      // Generate mock trend data
      const trends: Array<{ date: string; scans: number }> = [];
      const today = new Date();

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // Generate random scan count with some trend
        const baseScans = 10 + Math.sin(i / 5) * 5;
        const randomVariation = Math.random() * 10;
        const scans = Math.max(0, Math.round(baseScans + randomVariation));

        trends.push({
          date: date.toISOString().split('T')[0],
          scans
        });
      }

      return trends;
    } catch (error) {
      console.error('Error fetching scan trends:', error);
      throw error;
    }
  }

  /**
   * Get top performing QR codes
   */
  static async getTopPerformingQRCodes(limit: number = 10): Promise<Array<{ id: string; title: string; scans: number; conversionRate: number }>> {
    try {
      // Mock data for top performing QR codes
      const mockData = [
        { id: '1', title: 'Player Registration - Main', scans: 1250, conversionRate: 0.85 },
        { id: '2', title: 'Tournament Info 2025', scans: 890, conversionRate: 0.72 },
        { id: '3', title: 'Team Chennai Champions', scans: 675, conversionRate: 0.91 },
        { id: '4', title: 'Prize Money Details', scans: 543, conversionRate: 0.68 },
        { id: '5', title: 'Match Schedule', scans: 432, conversionRate: 0.79 }
      ];

      return mockData.slice(0, limit);
    } catch (error) {
      console.error('Error fetching top performing QR codes:', error);
      throw error;
    }
  }

  /**
   * Parse user agent string to extract device information
   */
  static parseUserAgent(userAgent: string): {
    browser: string;
    os: string;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
  } {
    const ua = userAgent.toLowerCase();

    // Detect mobile
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);

    // Detect tablet
    const isTablet = /ipad|android(?=.*\btablet\b)|tablet/i.test(ua);

    // Detect desktop
    const isDesktop = !isMobile && !isTablet;

    // Detect browser
    let browser = 'unknown';
    if (ua.includes('chrome')) browser = 'Chrome';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('safari')) browser = 'Safari';
    else if (ua.includes('edge')) browser = 'Edge';
    else if (ua.includes('opera')) browser = 'Opera';

    // Detect OS
    let os = 'unknown';
    if (ua.includes('windows')) os = 'Windows';
    else if (ua.includes('mac os x')) os = 'macOS';
    else if (ua.includes('linux')) os = 'Linux';
    else if (ua.includes('android')) os = 'Android';
    else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';

    return {
      browser,
      os,
      isMobile,
      isTablet,
      isDesktop
    };
  }

  /**
   * Store scan data locally (for demo purposes)
   */
  private static storeScanLocally(scanData: any): void {
    try {
      const scans = JSON.parse(localStorage.getItem('qr_scans') || '[]');
      scans.push(scanData);

      // Keep only last 1000 scans to prevent localStorage overflow
      if (scans.length > 1000) {
        scans.splice(0, scans.length - 1000);
      }

      localStorage.setItem('qr_scans', JSON.stringify(scans));
    } catch (error) {
      console.error('Error storing scan locally:', error);
    }
  }

  /**
   * Generate mock analytics data
   */
  private static generateMockAnalytics(qrCodeId: string, dateRange?: { start: Date; end: Date }): AnalyticsData {
    const totalScans = Math.floor(Math.random() * 1000) + 100;
    const uniqueVisitors = Math.floor(totalScans * 0.7);

    // Generate date-based scan data
    const scansByDate: Array<{ date: string; scans: number }> = [];
    const days = 30;
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      scansByDate.push({
        date: date.toISOString().split('T')[0],
        scans: Math.floor(Math.random() * 50) + 10
      });
    }

    // Generate hourly data
    const scansByHour: Array<{ hour: number; scans: number }> = [];
    for (let hour = 0; hour < 24; hour++) {
      scansByHour.push({
        hour,
        scans: Math.floor(Math.random() * 20) + 5
      });
    }

    return {
      totalScans,
      uniqueVisitors,
      scansByDate,
      scansByHour,
      topReferrers: [
        { referrer: 'Direct', scans: Math.floor(totalScans * 0.4) },
        { referrer: 'Facebook', scans: Math.floor(totalScans * 0.25) },
        { referrer: 'Instagram', scans: Math.floor(totalScans * 0.2) },
        { referrer: 'Twitter', scans: Math.floor(totalScans * 0.15) }
      ],
      deviceBreakdown: {
        mobile: Math.floor(totalScans * 0.6),
        tablet: Math.floor(totalScans * 0.2),
        desktop: Math.floor(totalScans * 0.2)
      },
      browserBreakdown: [
        { browser: 'Chrome', scans: Math.floor(totalScans * 0.5) },
        { browser: 'Safari', scans: Math.floor(totalScans * 0.25) },
        { browser: 'Firefox', scans: Math.floor(totalScans * 0.15) },
        { browser: 'Edge', scans: Math.floor(totalScans * 0.1) }
      ],
      osBreakdown: [
        { os: 'Android', scans: Math.floor(totalScans * 0.4) },
        { os: 'iOS', scans: Math.floor(totalScans * 0.35) },
        { os: 'Windows', scans: Math.floor(totalScans * 0.15) },
        { os: 'macOS', scans: Math.floor(totalScans * 0.1) }
      ],
      locationBreakdown: [
        { location: 'India', scans: Math.floor(totalScans * 0.7) },
        { location: 'UAE', scans: Math.floor(totalScans * 0.15) },
        { location: 'USA', scans: Math.floor(totalScans * 0.1) },
        { location: 'UK', scans: Math.floor(totalScans * 0.05) }
      ],
      conversionRate: Math.random() * 0.3 + 0.7 // 70-100%
    };
  }

  /**
   * Convert analytics data to CSV format
   */
  private static convertToCSV(analytics: AnalyticsData): string {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Scans', analytics.totalScans.toString()],
      ['Unique Visitors', analytics.uniqueVisitors.toString()],
      ['Conversion Rate', `${(analytics.conversionRate! * 100).toFixed(2)}%`],
      ['', ''],
      ['Device Breakdown', ''],
      ['Mobile', analytics.deviceBreakdown.mobile.toString()],
      ['Tablet', analytics.deviceBreakdown.tablet.toString()],
      ['Desktop', analytics.deviceBreakdown.desktop.toString()],
      ['', ''],
      ['Top Browsers', ''],
      ...analytics.browserBreakdown.map(b => [b.browser, b.scans.toString()]),
      ['', ''],
      ['Top Operating Systems', ''],
      ...analytics.osBreakdown.map(os => [os.os, os.scans.toString()])
    ];

    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }

  /**
   * Convert analytics data to PDF format (placeholder)
   */
  private static convertToPDF(analytics: AnalyticsData): string {
    // In a real implementation, this would generate a PDF
    // For now, return a message
    return `PDF Report for QR Code Analytics\n\nTotal Scans: ${analytics.totalScans}\nUnique Visitors: ${analytics.uniqueVisitors}\nConversion Rate: ${(analytics.conversionRate! * 100).toFixed(2)}%`;
  }
}