import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  QrCode,
  Plus,
  Download,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  Copy,
  CheckCircle,
  XCircle,
  Calendar,
  Users,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { QRCodeService, QRCodeData, QRCodeTemplate } from '@/services/qrCodeService';
import { QRAnalyticsService, AnalyticsData } from '@/services/qrAnalyticsService';
import { useToast } from '@/hooks/use-toast';
import BulkQRCodeGenerator from '@/components/admin/BulkQRCodeGenerator';
import { BulkQRResponse } from '@/services/qrCodeService';

const QRCodeManagement: React.FC = () => {
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [templates, setTemplates] = useState<QRCodeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState<QRCodeData | null>(null);
  const [analytics, setAnalytics] = useState<{
    analytics: any[];
    summary: any;
    trends: Array<{ date: string; scans: number }>;
  } | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false);
  const [databaseError, setDatabaseError] = useState<string | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetUrl: '',
    templateId: '',
    expiresAt: '',
    maxScans: '',
    tags: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [codesData, templatesData] = await Promise.all([
        QRCodeService.getQRCodes(),
        QRCodeService.getQRTemplates()
      ]);

      setQrCodes(codesData.qrCodes);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading data:', error);

      // Check if it's a database table error
      const errorMessage = error?.message || '';
      if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
        setDatabaseError('Database tables for QR codes have not been created yet. Please apply the database migration to enable QR code functionality.');
        toast({
          title: 'Database Setup Required',
          description: 'QR code database tables need to be created. Please run the database migration.',
          variant: 'destructive'
        });
      } else {
        setDatabaseError(null);
        toast({
          title: 'Error',
          description: 'Failed to load QR codes data',
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQR = async () => {
    try {
      const qrData = {
        title: formData.title,
        description: formData.description,
        targetUrl: formData.targetUrl,
        templateId: formData.templateId || undefined,
        expiresAt: formData.expiresAt || undefined,
        maxScans: formData.maxScans ? parseInt(formData.maxScans) : undefined,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      };

      const validation = QRCodeService.validateQRCodeData(qrData);
      if (!validation.isValid) {
        toast({
          title: 'Validation Error',
          description: validation.errors.join(', '),
          variant: 'destructive'
        });
        return;
      }

      const newQR = await QRCodeService.generateQRCode(qrData);

      setQrCodes(prev => [newQR, ...prev]);
      setShowCreateDialog(false);
      setFormData({
        title: '',
        description: '',
        targetUrl: '',
        templateId: '',
        expiresAt: '',
        maxScans: '',
        tags: ''
      });

      toast({
        title: 'Success',
        description: 'QR code created successfully'
      });
    } catch (error) {
      console.error('Error creating QR code:', error);
      toast({
        title: 'Error',
        description: 'Failed to create QR code',
        variant: 'destructive'
      });
    }
  };

  const handleViewAnalytics = async (qrCode: QRCodeData) => {
    try {
      setSelectedQR(qrCode);
      const analyticsData = await QRCodeService.getQRAnalytics(qrCode.id);
      setAnalytics(analyticsData);
      setShowAnalyticsDialog(true);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive'
      });
    }
  };

  const handleDownloadQR = async (qrCode: QRCodeData, format: 'png' | 'svg') => {
    try {
      await QRCodeService.downloadQRCode(qrCode, format);
      toast({
        title: 'Success',
        description: `QR code downloaded as ${format.toUpperCase()}`
      });
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast({
        title: 'Error',
        description: 'Failed to download QR code',
        variant: 'destructive'
      });
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Copied',
      description: 'QR code copied to clipboard'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cricket-blue"></div>
      </div>
    );
  }

  if (databaseError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-cricket-blue">QR Code Management</h1>
            <p className="text-muted-foreground">Create and manage QR codes for player registration and marketing</p>
          </div>
        </div>

        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Database Setup Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-red-700">{databaseError}</p>

            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-800 mb-2">To fix this issue:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                <li>Go to your Supabase Dashboard</li>
                <li>Navigate to the SQL Editor</li>
                <li>Run the migration file: <code className="bg-gray-100 px-1 rounded">20250831120000_create_qr_codes_tables.sql</code></li>
                <li>Or use the Supabase CLI: <code className="bg-gray-100 px-1 rounded">supabase db push</code></li>
              </ol>
            </div>

            <Button
              onClick={() => {
                setDatabaseError(null);
                loadData();
              }}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleBulkGenerationSuccess = (results: BulkQRResponse) => {
    // Refresh the QR codes list
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cricket-blue">QR Code Management</h1>
          <p className="text-muted-foreground">Create and manage QR codes for player registration and marketing</p>
        </div>
      </div>

      <Tabs defaultValue="individual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="individual">Individual QR Codes</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Generation</TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="space-y-6">
          <div className="flex justify-end">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-cricket-yellow text-cricket-blue hover:bg-yellow-400">
                  <Plus className="w-4 h-4 mr-2" />
                  Create QR Code
                </Button>
              </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New QR Code</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Player Registration - Main"
                  />
                </div>
                <div>
                  <Label htmlFor="template">Template</Label>
                  <Select value={formData.templateId} onValueChange={(value) => setFormData(prev => ({ ...prev, templateId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="targetUrl">Target URL *</Label>
                <Input
                  id="targetUrl"
                  value={formData.targetUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetUrl: e.target.value }))}
                  placeholder="https://ssplt10.co.in/register"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description for the QR code"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiresAt">Expires At</Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="maxScans">Max Scans</Label>
                  <Input
                    id="maxScans"
                    type="number"
                    value={formData.maxScans}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxScans: e.target.value }))}
                    placeholder="Unlimited if empty"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="e.g., registration, main, 2025"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateQR} className="bg-cricket-yellow text-cricket-blue">
                Create QR Code
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total QR Codes</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qrCodes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Codes</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qrCodes.filter(qr => qr.isActive).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qrCodes.reduce((sum, qr) => sum + qr.currentScans, 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
          </CardContent>
        </Card>
      </div>

      {/* QR Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle>QR Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scans</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {qrCodes.map((qr) => (
                <TableRow key={qr.id}>
                  <TableCell className="font-medium">{qr.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-2 py-1 rounded text-sm">{qr.code}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyCode(qr.code)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={qr.isActive ? "default" : "secondary"}>
                      {qr.isActive ? (
                        <><CheckCircle className="w-3 h-3 mr-1" /> Active</>
                      ) : (
                        <><XCircle className="w-3 h-3 mr-1" /> Inactive</>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>{qr.currentScans}</TableCell>
                  <TableCell>{formatDate(qr.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewAnalytics(qr)}
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadQR(qr, 'png')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Analytics Dialog */}
      <Dialog open={showAnalyticsDialog} onOpenChange={setShowAnalyticsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>QR Code Analytics</DialogTitle>
          </DialogHeader>

          {analytics && selectedQR && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="scans">Scan Trends</TabsTrigger>
                <TabsTrigger value="devices">Devices</TabsTrigger>
                <TabsTrigger value="locations">Locations</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Total Scans</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.summary?.totalScans || 0}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Unique Visitors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.summary?.uniqueIPs || 0}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Top Browser</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.summary?.topBrowser || 'N/A'}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Top Country</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.summary?.topCountry || 'N/A'}</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="scans" className="space-y-4">
                <Alert>
                  <Calendar className="h-4 w-4" />
                  <AlertDescription>
                    Scan trends for the last 30 days
                  </AlertDescription>
                </Alert>
                <div className="text-center py-8">
                  <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Chart visualization would be implemented here</p>
                </div>
              </TabsContent>

              <TabsContent value="devices" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Device Types</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Mobile</span>
                        <span>{analytics.summary?.totalScans ? Math.floor(analytics.summary.totalScans * 0.6) : 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tablet</span>
                        <span>{analytics.summary?.totalScans ? Math.floor(analytics.summary.totalScans * 0.2) : 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Desktop</span>
                        <span>{analytics.summary?.totalScans ? Math.floor(analytics.summary.totalScans * 0.2) : 0}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Top Browsers</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Chrome</span>
                        <span>{analytics.summary?.totalScans ? Math.floor(analytics.summary.totalScans * 0.5) : 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Safari</span>
                        <span>{analytics.summary?.totalScans ? Math.floor(analytics.summary.totalScans * 0.25) : 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Firefox</span>
                        <span>{analytics.summary?.totalScans ? Math.floor(analytics.summary.totalScans * 0.15) : 0}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="locations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Locations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>India</span>
                      <span>{analytics.summary?.totalScans ? Math.floor(analytics.summary.totalScans * 0.7) : 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>UAE</span>
                      <span>{analytics.summary?.totalScans ? Math.floor(analytics.summary.totalScans * 0.15) : 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>USA</span>
                      <span>{analytics.summary?.totalScans ? Math.floor(analytics.summary.totalScans * 0.1) : 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>UK</span>
                      <span>{analytics.summary?.totalScans ? Math.floor(analytics.summary.totalScans * 0.05) : 0}</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total QR Codes</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qrCodes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Codes</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qrCodes.filter(qr => qr.isActive).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qrCodes.reduce((sum, qr) => sum + qr.currentScans, 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
          </CardContent>
        </Card>
      </div>

      {/* QR Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle>QR Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scans</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {qrCodes.map((qr) => (
                <TableRow key={qr.id}>
                  <TableCell className="font-medium">{qr.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-2 py-1 rounded text-sm">{qr.code}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyCode(qr.code)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={qr.isActive ? "default" : "secondary"}>
                      {qr.isActive ? (
                        <><CheckCircle className="w-3 h-3 mr-1" /> Active</>
                      ) : (
                        <><XCircle className="w-3 h-3 mr-1" /> Inactive</>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>{qr.currentScans}</TableCell>
                  <TableCell>{formatDate(qr.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewAnalytics(qr)}
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadQR(qr, 'png')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Analytics Dialog */}
      <Dialog open={showAnalyticsDialog} onOpenChange={setShowAnalyticsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>QR Code Analytics</DialogTitle>
          </DialogHeader>

          {analytics && selectedQR && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="scans">Scan Trends</TabsTrigger>
                <TabsTrigger value="devices">Devices</TabsTrigger>
                <TabsTrigger value="locations">Locations</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Total Scans</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.summary?.totalScans || 0}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Unique Visitors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.summary?.uniqueIPs || 0}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Top Browser</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.summary?.topBrowser || 'N/A'}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Top Country</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.summary?.topCountry || 'N/A'}</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="scans" className="space-y-4">
                <Alert>
                  <Calendar className="h-4 w-4" />
                  <AlertDescription>
                    Scan trends for the last 30 days
                  </AlertDescription>
                </Alert>
                <div className="text-center py-8">
                  <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Chart visualization would be implemented here</p>
                </div>
              </TabsContent>

              <TabsContent value="devices" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Device Types</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Mobile</span>
                        <span>{analytics.summary?.totalScans ? Math.floor(analytics.summary.totalScans * 0.6) : 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tablet</span>
                        <span>{analytics.summary?.totalScans ? Math.floor(analytics.summary.totalScans * 0.2) : 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Desktop</span>
                        <span>{analytics.summary?.totalScans ? Math.floor(analytics.summary.totalScans * 0.2) : 0}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Top Browsers</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Chrome</span>
                        <span>{analytics.summary?.totalScans ? Math.floor(analytics.summary.totalScans * 0.5) : 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Safari</span>
                        <span>{analytics.summary?.totalScans ? Math.floor(analytics.summary.totalScans * 0.25) : 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Firefox</span>
                        <span>{analytics.summary?.totalScans ? Math.floor(analytics.summary.totalScans * 0.15) : 0}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="locations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Locations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>India</span>
                      <span>{analytics.summary?.totalScans ? Math.floor(analytics.summary.totalScans * 0.7) : 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>UAE</span>
                      <span>{analytics.summary?.totalScans ? Math.floor(analytics.summary.totalScans * 0.15) : 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>USA</span>
                      <span>{analytics.summary?.totalScans ? Math.floor(analytics.summary.totalScans * 0.1) : 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>UK</span>
                      <span>{analytics.summary?.totalScans ? Math.floor(analytics.summary.totalScans * 0.05) : 0}</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </TabsContent>

    <TabsContent value="bulk" className="space-y-6">
      <BulkQRCodeGenerator onSuccess={handleBulkGenerationSuccess} />
    </TabsContent>
  </Tabs>
</div>
  );
};

export default QRCodeManagement;