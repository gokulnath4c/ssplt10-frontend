import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, CheckCircle, XCircle, RefreshCw, Filter, List, Grid3X3, Users } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { supabase } from '@/integrations/supabase/client';

interface RegistrationsTabProps {
  registeredUsers: any[];
  loadingUsers: boolean;
  fetchRegisteredPlayers: () => Promise<void>;
  retryCount: number;
  fetchError: string | null;
}

const RegistrationsTab = ({
  registeredUsers,
  loadingUsers,
  fetchRegisteredPlayers,
  retryCount,
  fetchError
}: RegistrationsTabProps) => {
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');

  // Calculate filtered users
  const filteredUsers = paymentStatusFilter === 'all'
    ? registeredUsers
    : registeredUsers.filter(user => user.payment_status === paymentStatusFilter);

  // Function to generate Player ID in format: sspl-MM-YYYY-0000001
  const generatePlayerId = (registrationDate: string, index: number) => {
    const date = new Date(registrationDate);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const storageKey = `sspl_player_counter_${year}_${month}`;
    let currentCounter = parseInt(localStorage.getItem(storageKey) || '0');

    if (currentCounter === 0) {
      currentCounter = 1;
    }

    const playerId = `sspl-${month}-${year}-${String(currentCounter).padStart(7, '0')}`;
    localStorage.setItem(storageKey, String(currentCounter + 1));
    return playerId;
  };

  // Function to generate and download receipt for individual player
  const downloadReceipt = (player: any) => {
    const receiptData = {
      playerName: player.full_name,
      playerId: player.player_id,
      email: player.email,
      phone: player.phone,
      dateOfBirth: player.date_of_birth,
      position: player.position,
      state: player.state,
      city: player.city,
      town: player.town,
      pincode: player.pincode,
      paymentAmount: player.payment_amount,
      paymentStatus: player.payment_status,
      registrationDate: new Date(player.created_at).toLocaleDateString(),
      registrationId: player.id
    };

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>SSPL T10 Registration Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #0066CC; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { width: 100px; height: auto; margin-bottom: 10px; }
            .receipt-title { color: #FFD700; font-size: 18px; margin-top: 10px; }
            .details { margin: 20px 0; }
            .detail-row { display: flex; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
            .label { font-weight: bold; width: 200px; color: #555; }
            .value { flex: 1; color: #333; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 20px; }
            .status { padding: 5px 10px; border-radius: 4px; display: inline-block; font-weight: bold; }
            .status.completed { background: #d4edda; color: #155724; }
            .status.pending { background: #fff3cd; color: #856404; }
            .status.failed { background: #f8d7da; color: #721c24; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="/ssplt10-logo.png" alt="SSPL Logo" class="logo" />
            <div class="receipt-title">Player Registration Receipt</div>
          </div>
          <div class="details">
            <div class="detail-row">
              <span class="label">Player ID:</span>
              <span class="value" style="font-weight: bold; color: #0066CC; font-family: monospace;">${receiptData.playerId}</span>
            </div>
            <div class="detail-row">
              <span class="label">Registration ID:</span>
              <span class="value">${receiptData.registrationId}</span>
            </div>
            <div class="detail-row">
              <span class="label">Player Name:</span>
              <span class="value">${receiptData.playerName || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Email:</span>
              <span class="value">${receiptData.email || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Phone:</span>
              <span class="value">${receiptData.phone || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date of Birth:</span>
              <span class="value">${receiptData.dateOfBirth || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Player Type:</span>
              <span class="value">${receiptData.position || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="label">State:</span>
              <span class="value">${receiptData.state || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="label">City:</span>
              <span class="value">${receiptData.city || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Town/Area:</span>
              <span class="value">${receiptData.town || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="label">PIN Code:</span>
              <span class="value">${receiptData.pincode || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Payment Amount:</span>
              <span class="value">₹${receiptData.paymentAmount || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Payment Status:</span>
              <span class="value">
                <span class="status ${receiptData.paymentStatus === 'completed' ? 'completed' : receiptData.paymentStatus === 'failed' ? 'failed' : 'pending'}">
                  ${receiptData.paymentStatus || 'pending'}
                </span>
              </span>
            </div>
            <div class="detail-row">
              <span class="label">Registration Date:</span>
              <span class="value">${receiptData.registrationDate}</span>
            </div>
          </div>
          <div class="footer">
            <p>Thank you for registering with SSPL T10!</p>
            <p>This receipt confirms your player registration details.</p>
          </div>
        </body>
      </html>
    `;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = receiptHTML;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);

    const options = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `SSPL_Receipt_${player.full_name || 'Player'}_${player.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', width: 800, height: 1100 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait', compress: true }
    };

    html2pdf().set(options).from(tempDiv).save().then(() => {
      document.body.removeChild(tempDiv);
    }).catch((error) => {
      console.error('Error generating PDF:', error);
      document.body.removeChild(tempDiv);
    });
  };

  // Function to export all registrations to Excel
  const exportToExcel = () => {
    const csvContent = [
      ['Player ID', 'Registration ID', 'Full Name', 'Email', 'Phone', 'Date of Birth', 'Position', 'State', 'City', 'Town', 'PIN Code', 'Payment Amount', 'Payment Status', 'Registration Status', 'Registration Date'].join(','),
      ...filteredUsers.map(player => [
        `"${player.player_id}"`,
        player.id,
        `"${player.full_name || ''}"`,
        `"${player.email || ''}"`,
        `"${player.phone || ''}"`,
        `"${player.date_of_birth || ''}"`,
        `"${player.position || ''}"`,
        `"${player.state || ''}"`,
        `"${player.city || ''}"`,
        `"${player.town || ''}"`,
        `"${player.pincode || ''}"`,
        player.payment_amount || '',
        `"${player.payment_status || ''}"`,
        `"${player.status || ''}"`,
        `"${new Date(player.created_at).toLocaleDateString()}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SSPL_Player_Registrations_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header with View Toggle and Export Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-cricket-blue">Player Registrations</h2>
          <p className="text-muted-foreground">Manage and track all player registrations</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-white rounded-lg border border-cricket-blue/20 p-1">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 ${viewMode === 'table' ? 'bg-cricket-blue text-white hover:bg-cricket-dark-blue' : 'text-cricket-blue hover:bg-cricket-blue/10'}`}
            >
              <List className="w-4 h-4" />
              Table
            </Button>
            <Button
              variant={viewMode === 'card' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('card')}
              className={`flex items-center gap-2 ${viewMode === 'card' ? 'bg-cricket-blue text-white hover:bg-cricket-dark-blue' : 'text-cricket-blue hover:bg-cricket-blue/10'}`}
            >
              <Grid3X3 className="w-4 h-4" />
              Cards
            </Button>
          </div>

          {/* Payment Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-cricket-blue" />
            <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
              <SelectTrigger className="w-40 border-cricket-blue/20">
                <SelectValue placeholder="Filter by payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="completed">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={fetchRegisteredPlayers}
            variant="outline"
            className="border-cricket-blue text-cricket-blue hover:bg-cricket-blue hover:text-white transition-all duration-300"
            disabled={loadingUsers}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>

          <Button
            onClick={exportToExcel}
            className="bg-cricket-yellow text-cricket-blue hover:bg-cricket-yellow/90 transition-all duration-300"
            disabled={loadingUsers || registeredUsers.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export to Excel
          </Button>
        </div>
      </div>

      <Card className="shadow-elegant">
        <CardContent className="p-0">
          {/* Filter Summary */}
          {paymentStatusFilter !== 'all' && (
            <div className="p-4 bg-cricket-light-blue/20 border-b">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-cricket-blue" />
                <span className="text-sm font-medium text-cricket-blue">
                  Showing {paymentStatusFilter} payments only
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPaymentStatusFilter('all')}
                  className="text-xs h-6 px-2"
                >
                  Clear filter
                </Button>
              </div>
            </div>
          )}

          {loadingUsers ? (
            <div className="flex items-center justify-center p-12">
              <div className="rounded-full h-12 w-12 border-b-2 border-cricket-blue"></div>
              <span className="ml-3 text-muted-foreground">
                Loading registrations... {retryCount > 0 && `(Retry ${retryCount}/3)`}
              </span>
            </div>
          ) : fetchError ? (
            <div className="text-center py-12 text-red-600">
              <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <p className="text-lg font-medium mb-2">Failed to load registrations</p>
              <p className="text-sm text-muted-foreground mb-4">{fetchError}</p>
              <Button
                onClick={fetchRegisteredPlayers}
                variant="outline"
                className="border-red-500 text-red-600 hover:bg-red-50"
                disabled={loadingUsers}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg">No player registrations found</p>
              <p className="text-sm">Registrations will appear here once players sign up</p>
            </div>
          ) : viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-cricket-light-blue/30 hover:bg-cricket-light-blue/40">
                    <TableHead className="font-semibold text-cricket-blue">Player ID</TableHead>
                    <TableHead className="font-semibold text-cricket-blue">Player Info</TableHead>
                    <TableHead className="font-semibold text-cricket-blue">Contact Details</TableHead>
                    <TableHead className="font-semibold text-cricket-blue">Location</TableHead>
                    <TableHead className="font-semibold text-cricket-blue">Registration Details</TableHead>
                    <TableHead className="font-semibold text-cricket-blue">Payment</TableHead>
                    <TableHead className="font-semibold text-cricket-blue">Registration Status</TableHead>
                    <TableHead className="font-semibold text-cricket-blue">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((player, index) => (
                    <TableRow
                      key={player.id}
                      className={`transition-all duration-200 hover:bg-cricket-light-blue/20 ${index % 2 === 0 ? 'bg-white' : 'bg-cricket-light-blue/10'}`}
                    >
                      <TableCell>
                        <div className="font-mono text-sm font-semibold text-cricket-blue bg-cricket-yellow/10 px-2 py-1 rounded border">
                          {player.player_id}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="space-y-1">
                          <div className="font-semibold text-cricket-blue">{player.full_name || 'N/A'}</div>
                          <div className="text-sm text-muted-foreground">DOB: {player.date_of_birth ? new Date(player.date_of_birth).toLocaleDateString() : 'N/A'}</div>
                          <div className="text-sm text-muted-foreground">Position: {player.position || 'N/A'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">📧</span>
                            <span className="text-sm">{player.email || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">📱</span>
                            <span className="text-sm">{player.phone || 'N/A'}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          {player.state && <div><strong>State:</strong> {player.state}</div>}
                          {player.city && <div><strong>City:</strong> {player.city}</div>}
                          {player.town && <div><strong>Town:</strong> {player.town}</div>}
                          {player.pincode && <div><strong>PIN:</strong> {player.pincode}</div>}
                          {!player.state && !player.city && !player.town && !player.pincode && <span className="text-muted-foreground">N/A</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div><strong>ID:</strong> {player.id.slice(-8)}</div>
                          <div><strong>Registered:</strong></div>
                          <div className="text-muted-foreground">{new Date(player.created_at).toLocaleDateString()}</div>
                          <div className="text-muted-foreground">{new Date(player.created_at).toLocaleTimeString()}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="font-semibold text-lg text-cricket-blue">₹{player.payment_amount || 'N/A'}</div>
                          <Badge
                            variant={player.payment_status === 'completed' ? 'default' : 'secondary'}
                            className={`flex items-center gap-1 ${player.payment_status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'}`}
                          >
                            {player.payment_status === 'completed' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {player.payment_status || 'pending'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={player.payment_status === 'completed' ? 'default' : 'secondary'}
                          className={`${player.payment_status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'}`}
                        >
                          {player.payment_status === 'completed' ? 'Active' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2 min-w-[140px]">
                          {player.payment_status === 'completed' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadReceipt(player)}
                              className="text-xs border-cricket-blue text-cricket-blue hover:bg-cricket-blue hover:text-white transition-all duration-300"
                            >
                              <FileText className="w-3 h-3 mr-1" />
                              Receipt
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled
                              className="text-xs border-gray-300 text-gray-400 cursor-not-allowed"
                              title={`Receipt not available - Payment status: ${player.payment_status || 'pending'}`}
                            >
                              <FileText className="w-3 h-3 mr-1" />
                              Receipt
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredUsers.map((player) => (
                <Card key={player.id} className="shadow-elegant border-cricket-blue/20">
                  <CardHeader className="bg-gradient-to-r from-cricket-blue to-cricket-dark-blue text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cricket-yellow rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-cricket-blue" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold">{player.full_name || 'N/A'}</CardTitle>
                          <div className="font-mono text-sm bg-white/20 px-2 py-1 rounded text-cricket-yellow">
                            {player.player_id}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant={player.payment_status === 'completed' ? 'default' : 'secondary'}
                        className={`${player.payment_status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                      >
                        {player.payment_status === 'completed' ? 'Active' : 'Pending'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span>📧</span>
                        <span className="truncate">{player.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span>📱</span>
                        <span>{player.phone || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-cricket-blue">Position:</span>
                        <div>{player.position || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="font-medium text-cricket-blue">DOB:</span>
                        <div>{player.date_of_birth ? new Date(player.date_of_birth).toLocaleDateString() : 'N/A'}</div>
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-cricket-blue">Location:</span>
                      <div className="mt-1">
                        {player.city && player.state ? `${player.city}, ${player.state}` : (player.city || player.state || 'N/A')}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-cricket-blue">Payment:</span>
                        <div className="text-lg font-bold text-cricket-blue">₹{player.payment_amount || 'N/A'}</div>
                      </div>
                      <Badge
                        variant={player.payment_status === 'completed' ? 'default' : 'secondary'}
                        className={`flex items-center gap-1 ${player.payment_status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                      >
                        {player.payment_status === 'completed' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {player.payment_status || 'pending'}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground border-t pt-2">
                      Registered: {new Date(player.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2 pt-2">
                      {player.payment_status === 'completed' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadReceipt(player)}
                          className="flex-1 text-xs border-cricket-blue text-cricket-blue hover:bg-cricket-blue hover:text-white"
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          Receipt
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="flex-1 text-xs border-gray-300 text-gray-400 cursor-not-allowed"
                          title={`Receipt not available - Payment status: ${player.payment_status || 'pending'}`}
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          Receipt
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {!loadingUsers && filteredUsers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-cricket-blue to-cricket-dark-blue text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8" />
                <div>
                  <div className="text-2xl font-bold">{filteredUsers.length}</div>
                  <div className="text-sm opacity-90">Total Registrations</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8" />
                <div>
                  <div className="text-2xl font-bold">{filteredUsers.filter(p => p.payment_status === 'completed').length}</div>
                  <div className="text-sm opacity-90">Paid Registrations</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <XCircle className="w-8 h-8" />
                <div>
                  <div className="text-2xl font-bold">{filteredUsers.filter(p => p.payment_status !== 'completed').length}</div>
                  <div className="text-sm opacity-90">Pending Payments</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-cricket-yellow to-yellow-600 text-cricket-blue">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Download className="w-8 h-8" />
                <div>
                  <div className="text-2xl font-bold">₹{filteredUsers.reduce((sum, p) => sum + (p.payment_amount || 0), 0)}</div>
                  <div className="text-sm opacity-90">Total Revenue</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RegistrationsTab;