import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { QRCodeService, QRChannel, BulkQRRequest, BulkQRResponse } from '@/services/qrCodeService';
import { QrCode, Plus, Trash2, Download, Upload, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface BulkQRCodeGeneratorProps {
  onSuccess?: (results: BulkQRResponse) => void;
}

interface QRCodeFormData {
  title: string;
  description: string;
  targetUrl: string;
  channelId: string;
  templateId: string;
  expiresAt: string;
  maxScans: string;
  tags: string[];
}

const BulkQRCodeGenerator: React.FC<BulkQRCodeGeneratorProps> = ({ onSuccess }) => {
  const [channels, setChannels] = useState<QRChannel[]>([]);
  const [qrCodes, setQrCodes] = useState<QRCodeFormData[]>([
    {
      title: '',
      description: '',
      targetUrl: '',
      channelId: '',
      templateId: 'classic',
      expiresAt: '',
      maxScans: '',
      tags: []
    }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [results, setResults] = useState<BulkQRResponse | null>(null);
  const [errors, setErrors] = useState<Record<number, string[]>>({});

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      const channelData = await QRCodeService.getQRChannels();
      setChannels(channelData);
    } catch (error) {
      console.error('Error loading channels:', error);
      toast.error('Failed to load channels');
    }
  };

  const addQRCode = () => {
    setQrCodes([...qrCodes, {
      title: '',
      description: '',
      targetUrl: '',
      channelId: '',
      templateId: 'classic',
      expiresAt: '',
      maxScans: '',
      tags: []
    }]);
  };

  const removeQRCode = (index: number) => {
    if (qrCodes.length > 1) {
      setQrCodes(qrCodes.filter((_, i) => i !== index));
      const newErrors = { ...errors };
      delete newErrors[index];
      setErrors(newErrors);
    }
  };

  const updateQRCode = (index: number, field: keyof QRCodeFormData, value: any) => {
    const updated = [...qrCodes];
    updated[index] = { ...updated[index], [field]: value };
    setQrCodes(updated);

    // Clear errors for this field
    if (errors[index]) {
      const newErrors = { ...errors };
      newErrors[index] = newErrors[index].filter(error =>
        !error.toLowerCase().includes(field.toLowerCase())
      );
      if (newErrors[index].length === 0) {
        delete newErrors[index];
      }
      setErrors(newErrors);
    }
  };

  const addTag = (index: number, tag: string) => {
    if (tag.trim() && !qrCodes[index].tags.includes(tag.trim())) {
      const updated = [...qrCodes];
      updated[index].tags = [...updated[index].tags, tag.trim()];
      setQrCodes(updated);
    }
  };

  const removeTag = (index: number, tagToRemove: string) => {
    const updated = [...qrCodes];
    updated[index].tags = updated[index].tags.filter(tag => tag !== tagToRemove);
    setQrCodes(updated);
  };

  const validateQRCode = (qrCode: QRCodeFormData): string[] => {
    const errors: string[] = [];

    if (!qrCode.title.trim()) {
      errors.push('Title is required');
    }

    if (!qrCode.targetUrl.trim()) {
      errors.push('Target URL is required');
    } else {
      try {
        new URL(qrCode.targetUrl);
      } catch {
        errors.push('Target URL must be a valid URL');
      }
    }

    if (!qrCode.channelId) {
      errors.push('Channel must be selected');
    }

    if (qrCode.expiresAt) {
      const expiresDate = new Date(qrCode.expiresAt);
      if (expiresDate <= new Date()) {
        errors.push('Expiration date must be in the future');
      }
    }

    if (qrCode.maxScans && parseInt(qrCode.maxScans) <= 0) {
      errors.push('Maximum scans must be greater than 0');
    }

    return errors;
  };

  const validateAllQRCodes = (): boolean => {
    const newErrors: Record<number, string[]> = {};
    let hasErrors = false;

    qrCodes.forEach((qrCode, index) => {
      const qrErrors = validateQRCode(qrCode);
      if (qrErrors.length > 0) {
        newErrors[index] = qrErrors;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const generateBulkQRCodes = async () => {
    if (!validateAllQRCodes()) {
      toast.error('Please fix validation errors before generating QR codes');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setResults(null);

    try {
      const request: BulkQRRequest = {
        qrCodes: qrCodes.map(qr => ({
          title: qr.title.trim(),
          description: qr.description.trim() || undefined,
          targetUrl: qr.targetUrl.trim(),
          channelId: qr.channelId,
          templateId: qr.templateId,
          expiresAt: qr.expiresAt || undefined,
          maxScans: qr.maxScans ? parseInt(qr.maxScans) : undefined,
          tags: qr.tags.length > 0 ? qr.tags : undefined,
          metadata: {
            bulk_generated: true,
            generated_at: new Date().toISOString()
          }
        })),
        options: {
          batchSize: 5,
          skipDuplicates: true,
          notifyOnComplete: true
        }
      };

      const response = await QRCodeService.bulkGenerateQRCodes(request);
      setResults(response);

      if (response.success) {
        toast.success(`Successfully generated ${response.summary.successful} QR codes`);
        onSuccess?.(response);
      } else {
        toast.error(`Failed to generate ${response.summary.failed} QR codes`);
      }

    } catch (error) {
      console.error('Error generating bulk QR codes:', error);
      toast.error('Failed to generate QR codes');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(100);
    }
  };

  const downloadResults = async () => {
    if (!results) return;

    try {
      const successfulQRCodes = results.results
        .filter(result => result.success && result.qrCode)
        .map(result => result.qrCode!);

      if (successfulQRCodes.length > 0) {
        await QRCodeService.bulkDownloadQRCodes(successfulQRCodes, 'png', {
          filename: `bulk_qr_codes_${new Date().toISOString().split('T')[0]}.zip`
        });
        toast.success('Download started');
      }
    } catch (error) {
      console.error('Error downloading QR codes:', error);
      toast.error('Failed to download QR codes');
    }
  };

  const resetForm = () => {
    setQrCodes([{
      title: '',
      description: '',
      targetUrl: '',
      channelId: '',
      templateId: 'classic',
      expiresAt: '',
      maxScans: '',
      tags: []
    }]);
    setErrors({});
    setResults(null);
    setGenerationProgress(0);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Bulk QR Code Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code Forms */}
          {qrCodes.map((qrCode, index) => (
            <Card key={index} className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">QR Code #{index + 1}</CardTitle>
                  {qrCodes.length > 1 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeQRCode(index)}
                      disabled={isGenerating}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`title-${index}`}>Title *</Label>
                    <Input
                      id={`title-${index}`}
                      value={qrCode.title}
                      onChange={(e) => updateQRCode(index, 'title', e.target.value)}
                      placeholder="Enter QR code title"
                      disabled={isGenerating}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`channel-${index}`}>Channel *</Label>
                    <Select
                      value={qrCode.channelId}
                      onValueChange={(value) => updateQRCode(index, 'channelId', value)}
                      disabled={isGenerating}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select channel" />
                      </SelectTrigger>
                      <SelectContent>
                        {channels.map((channel) => (
                          <SelectItem key={channel.id} value={channel.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: channel.color }}
                              />
                              {channel.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`url-${index}`}>Target URL *</Label>
                  <Input
                    id={`url-${index}`}
                    value={qrCode.targetUrl}
                    onChange={(e) => updateQRCode(index, 'targetUrl', e.target.value)}
                    placeholder="https://example.com"
                    disabled={isGenerating}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`description-${index}`}>Description</Label>
                  <Textarea
                    id={`description-${index}`}
                    value={qrCode.description}
                    onChange={(e) => updateQRCode(index, 'description', e.target.value)}
                    placeholder="Optional description"
                    disabled={isGenerating}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`template-${index}`}>Template</Label>
                    <Select
                      value={qrCode.templateId}
                      onValueChange={(value) => updateQRCode(index, 'templateId', value)}
                      disabled={isGenerating}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="classic">Classic</SelectItem>
                        <SelectItem value="colored">Colored</SelectItem>
                        <SelectItem value="compact">Compact</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`expires-${index}`}>Expires At</Label>
                    <Input
                      id={`expires-${index}`}
                      type="datetime-local"
                      value={qrCode.expiresAt}
                      onChange={(e) => updateQRCode(index, 'expiresAt', e.target.value)}
                      disabled={isGenerating}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`max-scans-${index}`}>Max Scans</Label>
                    <Input
                      id={`max-scans-${index}`}
                      type="number"
                      value={qrCode.maxScans}
                      onChange={(e) => updateQRCode(index, 'maxScans', e.target.value)}
                      placeholder="Unlimited"
                      disabled={isGenerating}
                    />
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {qrCode.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          onClick={() => removeTag(index, tag)}
                          className="ml-1 hover:text-destructive"
                          disabled={isGenerating}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tag"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.target as HTMLInputElement;
                          addTag(index, input.value);
                          input.value = '';
                        }
                      }}
                      disabled={isGenerating}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        addTag(index, input.value);
                        input.value = '';
                      }}
                      disabled={isGenerating}
                    >
                      Add
                    </Button>
                  </div>
                </div>

                {/* Validation Errors */}
                {errors[index] && errors[index].length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <ul className="list-disc list-inside">
                        {errors[index].map((error, errorIndex) => (
                          <li key={errorIndex}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Add QR Code Button */}
          <div className="flex justify-center">
            <Button
              onClick={addQRCode}
              variant="outline"
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Another QR Code
            </Button>
          </div>

          {/* Generation Progress */}
          {isGenerating && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Generating QR codes...</span>
                <span>{generationProgress}%</span>
              </div>
              <Progress value={generationProgress} />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={generateBulkQRCodes}
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? 'Generating...' : 'Generate QR Codes'}
            </Button>
            <Button
              onClick={resetForm}
              variant="outline"
              disabled={isGenerating}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {results.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Generation Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">{results.summary.successful}</div>
                <div className="text-sm text-muted-foreground">Successful</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-red-600">{results.summary.failed}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{results.summary.processingTime}ms</div>
                <div className="text-sm text-muted-foreground">Processing Time</div>
              </div>
            </div>

            {results.summary.successful > 0 && (
              <div className="flex gap-2">
                <Button onClick={downloadResults} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download QR Codes
                </Button>
                <Button variant="outline" onClick={() => setResults(null)}>
                  Clear Results
                </Button>
              </div>
            )}

            {/* Error Details */}
            {results.results.some(result => !result.success) && (
              <div className="space-y-2">
                <h4 className="font-semibold text-red-600">Errors:</h4>
                {results.results
                  .filter(result => !result.success)
                  .map((result, index) => (
                    <Alert key={index} variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        QR Code #{result.index + 1}: {result.error}
                      </AlertDescription>
                    </Alert>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BulkQRCodeGenerator;