'use client';

import { useState } from 'react';
import { WebAdminGuard } from '@/components/web-admin/WebAdminGuard';
import { WebAdminNavigation } from '@/components/web-admin/WebAdminNavigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  FileText,
  Calendar,
  Download,
  TrendingUp,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { th } from 'date-fns/locale';

interface AgingData {
  current: { count: number; amount: number };
  days1to7: { count: number; amount: number };
  days8to30: { count: number; amount: number };
  days31to60: { count: number; amount: number };
  days60plus: { count: number; amount: number };
}

interface DailyReportData {
  type: 'daily';
  date: string;
  generatedAt: string;
  summary: {
    totalContracts: number;
    activeContracts: number;
    completedContracts: number;
    defaultedContracts: number;
  };
  financial: {
    totalDisbursed: number;
    totalCollected: number;
    totalOutstanding: number;
    overdueAmount: number;
  };
  overdue: {
    count: number;
    amount: number;
    onTimePaymentRate: number;
  };
  aging: AgingData;
  todayActivity: {
    newApplications: number;
    approved: number;
    rejected: number;
    paymentsReceived: number;
    paymentAmount: number;
  };
  pending: {
    applications: number;
    payments: number;
  };
}

interface MonthlyReportData {
  type: 'monthly';
  month: string;
  generatedAt: string;
  summary: {
    totalContracts: number;
    activeContracts: number;
    completedContracts: number;
    defaultedContracts: number;
  };
  financial: {
    totalDisbursed: number;
    totalCollected: number;
    totalOutstanding: number;
    overdueAmount: number;
  };
  monthActivity: {
    newApplications: number;
    approved: number;
    rejected: number;
    disbursed: number;
    disbursedAmount: number;
    paymentsReceived: number;
    paymentAmount: number;
  };
  aging: AgingData;
  performance: {
    approvalRate: number;
    collectionRate: number;
    onTimePaymentRate: number;
  };
  topOverdue: Array<{
    contractId: string;
    customerName: string;
    daysOverdue: number;
    amount: number;
  }>;
}

type ReportData = DailyReportData | MonthlyReportData;

interface ReportHistoryItem {
  id: string;
  type: 'daily' | 'monthly';
  date: string;
  generatedAt: string;
  report: ReportData;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function ReportsContent() {
  const [reportType, setReportType] = useState<'daily' | 'monthly'>('daily');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reportHistory, setReportHistory] = useState<ReportHistoryItem[]>([]);

  const generateReport = async () => {
    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: reportType,
          date: reportType === 'daily' ? selectedDate : selectedMonth,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setReport(data.data);
        
        // Add to history
        const historyItem: ReportHistoryItem = {
          id: `${Date.now()}`,
          type: reportType,
          date: reportType === 'daily' ? selectedDate : selectedMonth,
          generatedAt: new Date().toISOString(),
          report: data.data,
        };
        setReportHistory(prev => [historyItem, ...prev.slice(0, 9)]);
      } else {
        setError(data.error || 'Failed to generate report');
      }
    } catch (err) {
      console.error('Failed to generate report:', err);
      setError('Failed to generate report');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromHistory = (item: ReportHistoryItem) => {
    setReport(item.report);
    setReportType(item.type);
    if (item.type === 'daily') {
      setSelectedDate(item.date);
    } else {
      setSelectedMonth(item.date);
    }
  };

  const exportToCSV = () => {
    if (!report) return;

    let csv = '';
    const reportDate = report.type === 'daily' ? report.date : report.month;
    
    if (report.type === 'daily') {
      csv = `Daily Report - ${reportDate}\n`;
      csv += `Generated At,${report.generatedAt}\n\n`;
      csv += `Contract Summary\n`;
      csv += `Total Contracts,${report.summary.totalContracts}\n`;
      csv += `Active Contracts,${report.summary.activeContracts}\n`;
      csv += `Completed,${report.summary.completedContracts}\n`;
      csv += `Defaulted,${report.summary.defaultedContracts}\n\n`;
      csv += `Financial\n`;
      csv += `Total Disbursed,${report.financial.totalDisbursed}\n`;
      csv += `Total Collected,${report.financial.totalCollected}\n`;
      csv += `Outstanding,${report.financial.totalOutstanding}\n`;
      csv += `Overdue Amount,${report.financial.overdueAmount}\n`;
    } else {
      csv = `Monthly Report - ${reportDate}\n`;
      csv += `Generated At,${report.generatedAt}\n\n`;
      csv += `Month Activity\n`;
      csv += `New Applications,${report.monthActivity.newApplications}\n`;
      csv += `Approved,${report.monthActivity.approved}\n`;
      csv += `Rejected,${report.monthActivity.rejected}\n`;
      csv += `Disbursed,${report.monthActivity.disbursed}\n`;
      csv += `Disbursed Amount,${report.monthActivity.disbursedAmount}\n`;
      csv += `Payments Received,${report.monthActivity.paymentsReceived}\n`;
      csv += `Payment Amount,${report.monthActivity.paymentAmount}\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report-${reportType}-${reportDate}.csv`;
    link.click();
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-green-400" />
          <h1 className="text-xl sm:text-2xl font-bold text-white">Reports</h1>
        </div>
      </div>

      {/* Report Type Selector */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg text-white">Generate Report</CardTitle>
          <CardDescription className="text-slate-400">
            Select report type and date to generate
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <Button
              variant={reportType === 'daily' ? 'default' : 'outline'}
              onClick={() => setReportType('daily')}
              className={reportType === 'daily' 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'border-slate-600 text-slate-300'}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Daily Report
            </Button>
            <Button
              variant={reportType === 'monthly' ? 'default' : 'outline'}
              onClick={() => setReportType('monthly')}
              className={reportType === 'monthly' 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'border-slate-600 text-slate-300'}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Monthly Report
            </Button>
          </div>

          <div className="flex gap-4 items-end flex-wrap">
            <div className="space-y-2">
              <Label className="text-slate-300">
                {reportType === 'daily' ? 'Select Date' : 'Select Month'}
              </Label>
              {reportType === 'daily' ? (
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={format(new Date(), 'yyyy-MM-dd')}
                  className="bg-slate-700 border-slate-600 text-white w-48"
                />
              ) : (
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  max={format(new Date(), 'yyyy-MM')}
                  className="bg-slate-700 border-slate-600 text-white w-48"
                />
              )}
            </div>

            {/* Date Range Filter (Optional) */}
            <div className="flex items-center gap-2 border-l border-slate-700 pl-4">
              <div className="space-y-2">
                <Label className="text-slate-400 text-xs">Date Range (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white w-36 text-sm"
                    placeholder="From"
                  />
                  <span className="text-slate-500">-</span>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    max={format(new Date(), 'yyyy-MM-dd')}
                    className="bg-slate-700 border-slate-600 text-white w-36 text-sm"
                    placeholder="To"
                  />
                  {(dateFrom || dateTo) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => { setDateFrom(''); setDateTo(''); }}
                      className="text-slate-400 hover:text-white text-xs px-2"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={generateReport}
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              Generate Report
            </Button>
            {report && (
              <Button
                variant="outline"
                onClick={exportToCSV}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>

          {/* Quick Date Presets */}
          {reportType === 'daily' && (
            <div className="flex gap-2 flex-wrap">
              <span className="text-slate-400 text-sm">Quick select:</span>
              {[0, 1, 7, 30].map((daysAgo) => (
                <Button
                  key={daysAgo}
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDate(format(subDays(new Date(), daysAgo), 'yyyy-MM-dd'))}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  {daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="py-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Report History */}
      {reportHistory.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              Recent Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {reportHistory.map((item) => (
                <button
                  key={item.id}
                  onClick={() => loadFromHistory(item)}
                  className="px-3 py-2 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-green-500/50 hover:bg-slate-700 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <Badge
                      className={item.type === 'daily' 
                        ? 'bg-blue-500/20 text-blue-400 text-xs' 
                        : 'bg-purple-500/20 text-purple-400 text-xs'
                      }
                    >
                      {item.type === 'daily' ? 'Daily' : 'Monthly'}
                    </Badge>
                    <span className="text-white text-sm">{item.date}</span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1">
                    {format(new Date(item.generatedAt), 'HH:mm')}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Display */}
      {report && (
        <div className="space-y-6">
          {/* Header */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="py-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {report.type === 'daily' ? 'Daily Report' : 'Monthly Report'}
                    </h2>
                    <p className="text-slate-400 text-sm">
                      {report.type === 'daily' 
                        ? format(new Date(report.date), 'PPP', { locale: th })
                        : format(new Date(report.month + '-01'), 'MMMM yyyy', { locale: th })}
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-500/20 text-green-400">
                  Generated {format(new Date(report.generatedAt), 'HH:mm')}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Active Contracts</p>
                    <p className="text-2xl font-bold text-white">{report.summary.activeContracts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <DollarSign className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Total Disbursed</p>
                    <p className="text-xl font-bold text-green-400">{formatCurrency(report.financial.totalDisbursed)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Outstanding</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(report.financial.totalOutstanding)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Overdue Amount</p>
                    <p className="text-xl font-bold text-red-400">{formatCurrency(report.financial.overdueAmount)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Section */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Activity */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-400" />
                  {report.type === 'daily' ? 'Today\'s Activity' : 'Month Activity'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {report.type === 'daily' ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                      <span className="text-slate-300">New Applications</span>
                      <span className="text-white font-semibold">{report.todayActivity.newApplications}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                      <span className="text-slate-300">Approved</span>
                      <span className="text-green-400 font-semibold">{report.todayActivity.approved}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                      <span className="text-slate-300">Rejected</span>
                      <span className="text-red-400 font-semibold">{report.todayActivity.rejected}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                      <span className="text-slate-300">Payments Received</span>
                      <span className="text-white font-semibold">{report.todayActivity.paymentsReceived}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                      <span className="text-green-400">Payment Amount</span>
                      <span className="text-green-400 font-bold">{formatCurrency(report.todayActivity.paymentAmount)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                      <span className="text-slate-300">New Applications</span>
                      <span className="text-white font-semibold">{report.monthActivity.newApplications}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                      <span className="text-slate-300">Approved</span>
                      <span className="text-green-400 font-semibold">{report.monthActivity.approved}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                      <span className="text-slate-300">Rejected</span>
                      <span className="text-red-400 font-semibold">{report.monthActivity.rejected}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                      <span className="text-slate-300">Contracts Disbursed</span>
                      <span className="text-white font-semibold">{report.monthActivity.disbursed}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                      <span className="text-blue-400">Disbursed Amount</span>
                      <span className="text-blue-400 font-bold">{formatCurrency(report.monthActivity.disbursedAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                      <span className="text-green-400">Collected Amount</span>
                      <span className="text-green-400 font-bold">{formatCurrency(report.monthActivity.paymentAmount)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Aging Report */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-400" />
                  Aging Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { key: 'current', label: 'Current', color: 'green' },
                  { key: 'days1to7', label: '1-7 days', color: 'yellow' },
                  { key: 'days8to30', label: '8-30 days', color: 'orange' },
                  { key: 'days31to60', label: '31-60 days', color: 'red' },
                  { key: 'days60plus', label: '60+ days', color: 'red' },
                ].map(({ key, label, color }) => {
                  const data = report.aging[key as keyof AgingData];
                  return (
                    <div key={key} className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                      <span className={`text-${color}-400`}>{label}</span>
                      <div className="text-right">
                        <span className="text-white font-semibold">{data.count} contracts</span>
                        <span className="text-slate-400 ml-2">({formatCurrency(data.amount)})</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Monthly Performance (only for monthly reports) */}
          {report.type === 'monthly' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Approval Rate</span>
                      <span className="text-white">{report.performance.approvalRate}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ width: `${report.performance.approvalRate}%` }} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Collection Rate</span>
                      <span className="text-white">{report.performance.collectionRate}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${Math.min(report.performance.collectionRate, 100)}%` }} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">On-Time Payment Rate</span>
                      <span className="text-white">{report.performance.onTimePaymentRate}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full" 
                        style={{ width: `${report.performance.onTimePaymentRate}%` }} 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    Top Overdue Accounts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {report.topOverdue.length === 0 ? (
                    <div className="text-center py-6 text-slate-400">
                      <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-400 opacity-50" />
                      <p>No overdue accounts!</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {report.topOverdue.map((item, index) => (
                        <div key={item.contractId} className="flex justify-between items-center p-2 bg-slate-700/30 rounded-lg">
                          <div>
                            <span className="text-white font-medium">{item.customerName}</span>
                            <span className="text-slate-400 text-sm ml-2">{item.contractId}</span>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-red-500/20 text-red-400">{item.daysOverdue}d</Badge>
                            <span className="text-slate-400 text-sm ml-2">{formatCurrency(item.amount)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Pending Section (daily only) */}
          {report.type === 'daily' && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Pending Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-400 text-sm">Pending Applications</p>
                    <p className="text-2xl font-bold text-white">{report.pending.applications}</p>
                  </div>
                  <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <p className="text-orange-400 text-sm">Pending Payment Verifications</p>
                    <p className="text-2xl font-bold text-white">{report.pending.payments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default function WebAdminReportsPage() {
  return (
    <WebAdminGuard>
      <WebAdminNavigation>
        <ReportsContent />
      </WebAdminNavigation>
    </WebAdminGuard>
  );
}

