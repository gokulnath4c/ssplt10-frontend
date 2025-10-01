import QRCode from 'qrcode';
import { supabase } from '@/integrations/supabase/client';

export interface QRCodeTemplate {
  id: string;
  name: string;
  description: string;
  templateData: {
    color: {
      dark: string;
      light: string;
    };
    width: number;
    margin: number;
    errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  };
  previewImage?: string;
  isDefault: boolean;
}

export interface QRCodeData {
  id: string;
  code: string;
  title: string;
  description?: string;
  targetUrl: string;
  qrDataUrl: string;
  qrSvg: string;
  channelId?: string;
  channelName?: string;
  isActive: boolean;
  expiresAt?: string;
  maxScans?: number;
  currentScans: number;
  tags: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface QRChannel {
  id: string;
  name: string;
  description?: string;
  category: string;
  color: string;
  icon: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BulkQRRequest {
  qrCodes: Array<{
    title: string;
    description?: string;
    targetUrl: string;
    channelId?: string;
    templateId?: string;
    expiresAt?: string;
    maxScans?: number;
    tags?: string[];
    metadata?: Record<string, any>;
  }>;
  options?: {
    batchSize?: number;
    skipDuplicates?: boolean;
    notifyOnComplete?: boolean;
  };
}

export interface BulkQRResponse {
  success: boolean;
  results: Array<{
    success: boolean;
    qrCode?: QRCodeData;
    error?: string;
    index: number;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
    processingTime: number;
  };
}

export interface QRCodeAnalytics {
  id: string;
  qrCodeId: string;
  scannedAt: string;
  ipAddress: string;
  userAgent: string;
  referrer?: string;
  locationData: {
    ip: string;
    country: string;
    city: string;
    region: string;
  };
  deviceInfo: {
    browser: string;
    os: string;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    userAgent: string;
  };
  scanSource: string;
}

export interface QRCodeAnalyticsSummary {
  totalScans: number;
  uniqueIPs: number;
  topBrowser: string;
  topOS: string;
  topCountry: string;
  avgScansPerDay: number;
  dateRange: {
    start?: string;
    end?: string;
  };
}

export class QRCodeService {
  /**
   * Generate a new QR code
   */
  static async generateQRCode(data: {
    title: string;
    description?: string;
    targetUrl: string;
    templateId?: string;
    expiresAt?: string;
    maxScans?: number;
    tags?: string[];
    metadata?: Record<string, any>;
  }): Promise<QRCodeData> {
    try {
      const { data: qrCode, error } = await supabase.functions.invoke('generate-qr-code', {
        body: data
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate QR code');
      }

      if (!qrCode.success) {
        throw new Error(qrCode.error || 'Failed to generate QR code');
      }

      return qrCode.qrCode;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }

  /**
   * Get QR codes for the current user
   */
  static async getQRCodes(options: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    isActive?: boolean;
  } = {}): Promise<{
    qrCodes: QRCodeData[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('manage-qr-codes', {
        body: {
          action: 'list',
          options
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to fetch QR codes');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch QR codes');
      }

      return data.result;
    } catch (error) {
      console.error('Error fetching QR codes:', error);
      throw error;
    }
  }

  /**
   * Update a QR code
   */
  static async updateQRCode(id: string, updates: {
    title?: string;
    description?: string;
    isActive?: boolean;
    tags?: string[];
    metadata?: Record<string, any>;
  }): Promise<QRCodeData> {
    try {
      const { data, error } = await supabase.functions.invoke('manage-qr-codes', {
        body: {
          action: 'update',
          id,
          updates
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to update QR code');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to update QR code');
      }

      return data.qrCode;
    } catch (error) {
      console.error('Error updating QR code:', error);
      throw error;
    }
  }

  /**
   * Delete a QR code
   */
  static async deleteQRCode(id: string): Promise<void> {
    try {
      const { data, error } = await supabase.functions.invoke('manage-qr-codes', {
        body: {
          action: 'delete',
          id
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to delete QR code');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete QR code');
      }
    } catch (error) {
      console.error('Error deleting QR code:', error);
      throw error;
    }
  }

  /**
   * Get QR code analytics
   */
  static async getQRAnalytics(
    qrCodeId: string,
    options: {
      startDate?: string;
      endDate?: string;
      limit?: number;
    } = {}
  ): Promise<{
    analytics: QRCodeAnalytics[];
    summary: QRCodeAnalyticsSummary;
    trends: Array<{ date: string; scans: number }>;
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('get-qr-analytics', {
        body: {
          qrCodeId,
          ...options
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to fetch QR analytics');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch QR analytics');
      }

      return data.result;
    } catch (error) {
      console.error('Error fetching QR analytics:', error);
      throw error;
    }
  }

  /**
   * Generate QR code data URL locally (for preview)
   */
  static async generateQRCodeDataUrl(
    text: string,
    options: {
      width?: number;
      margin?: number;
      color?: {
        dark: string;
        light: string;
      };
      errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    } = {}
  ): Promise<string> {
    try {
      const defaultOptions = {
        width: 256,
        margin: 4,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M' as const
      };

      const qrOptions = { ...defaultOptions, ...options };
      return await QRCode.toDataURL(text, qrOptions);
    } catch (error) {
      console.error('Error generating QR code data URL:', error);
      throw error;
    }
  }

  /**
   * Generate QR code SVG locally (for preview)
   */
  static async generateQRCodeSvg(
    text: string,
    options: {
      width?: number;
      margin?: number;
      color?: {
        dark: string;
        light: string;
      };
      errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    } = {}
  ): Promise<string> {
    try {
      const defaultOptions = {
        width: 256,
        margin: 4,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M' as const
      };

      const qrOptions = { ...defaultOptions, ...options };
      return await QRCode.toString(text, { ...qrOptions, type: 'svg' });
    } catch (error) {
      console.error('Error generating QR code SVG:', error);
      throw error;
    }
  }

  /**
   * Download QR code as image
   */
  static async downloadQRCode(
    qrCode: QRCodeData,
    format: 'png' | 'svg' = 'png',
    filename?: string
  ): Promise<void> {
    try {
      const link = document.createElement('a');
      const downloadFilename = filename || `${qrCode.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_qr.${format}`;

      if (format === 'png') {
        link.href = qrCode.qrDataUrl;
      } else {
        // Convert SVG string to data URL
        const svgBlob = new Blob([qrCode.qrSvg], { type: 'image/svg+xml' });
        link.href = URL.createObjectURL(svgBlob);
      }

      link.download = downloadFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up blob URL for SVG
      if (format === 'svg') {
        URL.revokeObjectURL(link.href);
      }
    } catch (error) {
      console.error('Error downloading QR code:', error);
      throw error;
    }
  }

  /**
   * Get QR code templates
   */
  static async getQRTemplates(): Promise<QRCodeTemplate[]> {
    try {
      // For now, return default templates since DB tables don't exist yet
      return [
        {
          id: 'classic',
          name: 'Classic',
          description: 'Simple black and white QR code',
          templateData: {
            color: { dark: '#000000', light: '#FFFFFF' },
            width: 256,
            margin: 4,
            errorCorrectionLevel: 'M'
          },
          isDefault: true
        },
        {
          id: 'colored',
          name: 'Colored',
          description: 'QR code with custom colors',
          templateData: {
            color: { dark: '#3B82F6', light: '#FFFFFF' },
            width: 256,
            margin: 4,
            errorCorrectionLevel: 'M'
          },
          isDefault: false
        }
      ];
    } catch (error) {
      console.error('Error fetching QR templates:', error);
      throw error;
    }
  }

  /**
   * Get QR code categories
   */
  static async getQRCategories(): Promise<Array<{ id: string; name: string; description: string; color: string; icon: string }>> {
    try {
      // For now, return default categories since DB tables don't exist yet
      return [
        {
          id: 'registration',
          name: 'Player Registration',
          description: 'QR codes for player registration links',
          color: '#3B82F6',
          icon: 'user-plus'
        },
        {
          id: 'tournament',
          name: 'Tournament Info',
          description: 'QR codes linking to tournament information',
          color: '#10B981',
          icon: 'trophy'
        },
        {
          id: 'general',
          name: 'General',
          description: 'General purpose QR codes',
          color: '#6B7280',
          icon: 'link'
        }
      ];
    } catch (error) {
      console.error('Error fetching QR categories:', error);
      throw error;
    }
  }

  /**
   * Validate QR code data
   */
  static validateQRCodeData(data: {
    title: string;
    targetUrl: string;
    expiresAt?: string;
    maxScans?: number;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!data.targetUrl || data.targetUrl.trim().length === 0) {
      errors.push('Target URL is required');
    } else {
      try {
        new URL(data.targetUrl);
      } catch {
        errors.push('Target URL must be a valid URL');
      }
    }

    if (data.expiresAt) {
      const expiresDate = new Date(data.expiresAt);
      if (expiresDate <= new Date()) {
        errors.push('Expiration date must be in the future');
      }
    }

    if (data.maxScans && data.maxScans <= 0) {
      errors.push('Maximum scans must be greater than 0');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Bulk generate QR codes
   */
  static async bulkGenerateQRCodes(request: BulkQRRequest): Promise<BulkQRResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('bulk-generate-qr-codes', {
        body: request
      });

      if (error) {
        throw new Error(error.message || 'Failed to bulk generate QR codes');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to bulk generate QR codes');
      }

      return data.result;
    } catch (error) {
      console.error('Error bulk generating QR codes:', error);
      throw error;
    }
  }

  /**
   * Get QR channels
   */
  static async getQRChannels(): Promise<QRChannel[]> {
    try {
      // For now, return default channels since DB tables don't exist yet
      // This will be updated after database migration
      return [
        {
          id: 'website',
          name: 'Website',
          description: 'QR codes for website integration',
          category: 'digital',
          color: '#3B82F6',
          icon: 'globe',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'social-media',
          name: 'Social Media',
          description: 'QR codes for social media campaigns',
          category: 'marketing',
          color: '#10B981',
          icon: 'share',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'email-marketing',
          name: 'Email Marketing',
          description: 'QR codes for email campaigns',
          category: 'marketing',
          color: '#F59E0B',
          icon: 'mail',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'print-media',
          name: 'Print Media',
          description: 'QR codes for print advertisements',
          category: 'marketing',
          color: '#EF4444',
          icon: 'printer',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'events',
          name: 'Events',
          description: 'QR codes for event registration',
          category: 'events',
          color: '#8B5CF6',
          icon: 'calendar',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'internal',
          name: 'Internal',
          description: 'QR codes for internal use',
          category: 'internal',
          color: '#6B7280',
          icon: 'building',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'partnerships',
          name: 'Partnerships',
          description: 'QR codes for partner campaigns',
          category: 'partnerships',
          color: '#EC4899',
          icon: 'handshake',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    } catch (error) {
      console.error('Error fetching QR channels:', error);
      throw error;
    }
  }

  /**
   * Bulk download QR codes
   */
  static async bulkDownloadQRCodes(
    qrCodes: QRCodeData[],
    format: 'png' | 'svg' | 'pdf' = 'png',
    options: {
      includeMetadata?: boolean;
      filename?: string;
    } = {}
  ): Promise<void> {
    try {
      const { includeMetadata = true, filename } = options;

      if (format === 'pdf') {
        // Generate PDF with multiple QR codes
        await this.generateBulkPDF(qrCodes, includeMetadata, filename);
      } else {
        // Download individual files
        for (let i = 0; i < qrCodes.length; i++) {
          const qrCode = qrCodes[i];
          const fileName = `${qrCode.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_qr_${i + 1}`;
          await this.downloadQRCode(qrCode, format, `${fileName}.${format}`);

          // Small delay between downloads to prevent browser blocking
          if (i < qrCodes.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }
    } catch (error) {
      console.error('Error bulk downloading QR codes:', error);
      throw error;
    }
  }

  /**
   * Generate bulk PDF with QR codes
   */
  private static async generateBulkPDF(
    qrCodes: QRCodeData[],
    includeMetadata: boolean,
    filename?: string
  ): Promise<void> {
    try {
      // This would require a PDF generation library like jsPDF
      // For now, we'll create a simple implementation
      const pdfContent = qrCodes.map((qrCode, index) => `
        QR Code ${index + 1}: ${qrCode.title}
        URL: ${qrCode.targetUrl}
        ${qrCode.description ? `Description: ${qrCode.description}` : ''}
        Channel: ${qrCode.channelName || 'Not specified'}
        Created: ${new Date(qrCode.createdAt).toLocaleDateString()}
        ---
      `).join('\n');

      const blob = new Blob([pdfContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `bulk_qr_codes_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating bulk PDF:', error);
      throw error;
    }
  }

  /**
   * Get QR code by code (for public access)
   * Note: This function will work after database migration is applied
   */
  static async getQRCodeByCode(code: string): Promise<QRCodeData | null> {
    try {
      // This will work after the database migration is applied
      // For now, return null
      console.warn('QR code database tables not yet available. Please run database migration first.');
      return null;
    } catch (error) {
      console.error('Error fetching QR code by code:', error);
      throw error;
    }
  }
}