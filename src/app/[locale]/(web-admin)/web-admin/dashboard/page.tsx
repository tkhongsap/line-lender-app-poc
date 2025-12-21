'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { WebAdminGuard } from '@/components/web-admin/WebAdminGuard';
import { WebAdminNavigation } from '@/components/web-admin/WebAdminNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  FileText,
  Users,
  CheckCircle,
  Clock,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Eye,
  Phone,
  ArrowRight,
  Percent,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Contract, Application, Payment } from '@/types';

interface DashboardData {
  applications: Application[];
  contracts: Contract[];
  payments: Payment[];
}

interface AgingData {
  category: string;
  count: number;
  amount: number;
  color: string;
  bgColor: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function DashboardContent() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [applicationsRes, contractsRes, paymentsRes] = await Promise.all([
          fetch('/api/applications', { headers: { 'x-line-userid': 'web-admin' } }),
          fetch('/api/contracts', { headers: { 'x-line-userid': 'web-admin' } }),
          fetch('/api/payments?verificationStatus=PENDING', { headers: { 'x-line-userid': 'web-admin' } }),
        ]);

        const [applicationsData, contractsData, paymentsData] = await Promise.all([
          applicationsRes.json(),
          contractsRes.json(),
          paymentsRes.json(),
        ]);

        setData({
          applications: applicationsData.data || [],
          contracts: contractsData.data || [],
          payments: paymentsData.data || [],
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <Card className="bg-destructive/10 border-destructive/30">
          <CardContent className="py-12 text-center">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive">Failed to load dashboard data</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { applications, contracts, payments } = data;

  // Calculate metrics
  const pendingApplications = applications.filter(
    (app) => app.status === 'PENDING' || app.status === 'SUBMITTED'
  ).length;
  const activeContracts = contracts.filter((c) => c.status === 'ACTIVE').length;
  const completedContracts = contracts.filter((c) => c.status === 'COMPLETED').length;
  const totalDisbursed = contracts.reduce((sum, c) => sum + c.approvedAmount, 0);
  const totalOutstanding = contracts.reduce((sum, c) => sum + c.outstandingBalance, 0);
  const totalCollected = contracts.reduce((sum, c) => sum + c.totalPaid, 0);
  const overdueContracts = contracts.filter((c) => c.daysOverdue > 0);
  const pendingPayments = payments.length;

  // Calculate Collection Rate (Total Collected / Total Due)
  const totalDue = contracts.reduce((sum, c) => sum + c.totalDue, 0);
  const collectionRate = totalDue > 0 ? Math.round((totalCollected / totalDue) * 100) : 0;

  // Calculate On-time Payment Rate (contracts with no overdue / active contracts)
  const onTimeContracts = contracts.filter((c) => c.status === 'ACTIVE' && c.daysOverdue === 0).length;
  const onTimeRate = activeContracts > 0 ? Math.round((onTimeContracts / activeContracts) * 100) : 100;

  // Overdue by severity
  const overdue1to7 = contracts.filter((c) => c.daysOverdue >= 1 && c.daysOverdue <= 7).length;
  const overdue8to30 = contracts.filter((c) => c.daysOverdue >= 8 && c.daysOverdue <= 30).length;
  const overdue31to60 = contracts.filter((c) => c.daysOverdue >= 31 && c.daysOverdue <= 60).length;
  const overdue60plus = contracts.filter((c) => c.daysOverdue > 60).length;

  // Calculate aging report data
  const agingData: AgingData[] = [
    {
      category: 'Current',
      count: contracts.filter((c) => c.status === 'ACTIVE' && c.daysOverdue === 0).length,
      amount: contracts
        .filter((c) => c.status === 'ACTIVE' && c.daysOverdue === 0)
        .reduce((sum, c) => sum + c.outstandingBalance, 0),
      color: 'text-green-600',
      bgColor: 'bg-green-500',
    },
    {
      category: '1-7 days',
      count: contracts.filter((c) => c.daysOverdue >= 1 && c.daysOverdue <= 7).length,
      amount: contracts
        .filter((c) => c.daysOverdue >= 1 && c.daysOverdue <= 7)
        .reduce((sum, c) => sum + c.outstandingBalance, 0),
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-500',
    },
    {
      category: '8-30 days',
      count: contracts.filter((c) => c.daysOverdue >= 8 && c.daysOverdue <= 30).length,
      amount: contracts
        .filter((c) => c.daysOverdue >= 8 && c.daysOverdue <= 30)
        .reduce((sum, c) => sum + c.outstandingBalance, 0),
      color: 'text-orange-600',
      bgColor: 'bg-orange-500',
    },
    {
      category: '31-60 days',
      count: contracts.filter((c) => c.daysOverdue >= 31 && c.daysOverdue <= 60).length,
      amount: contracts
        .filter((c) => c.daysOverdue >= 31 && c.daysOverdue <= 60)
        .reduce((sum, c) => sum + c.outstandingBalance, 0),
      color: 'text-red-600',
      bgColor: 'bg-red-500',
    },
    {
      category: '60+ days',
      count: contracts.filter((c) => c.daysOverdue > 60).length,
      amount: contracts
        .filter((c) => c.daysOverdue > 60)
        .reduce((sum, c) => sum + c.outstandingBalance, 0),
      color: 'text-red-700',
      bgColor: 'bg-red-600',
    },
  ];

  const maxAgingAmount = Math.max(...agingData.map((d) => d.amount), 1);

  // Top 10 overdue contracts
  const topOverdue = [...overdueContracts]
    .sort((a, b) => b.daysOverdue - a.daysOverdue)
    .slice(0, 10);

  const statCards = [
    {
      title: 'Total Disbursed',
      value: formatCurrency(totalDisbursed),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Outstanding Balance',
      value: formatCurrency(totalOutstanding),
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Collected',
      value: formatCurrency(totalCollected),
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Overdue Contracts',
      value: overdueContracts.length,
      icon: AlertTriangle,
      color: overdueContracts.length > 0 ? 'text-red-600' : 'text-green-600',
      bgColor: overdueContracts.length > 0 ? 'bg-red-500/10' : 'bg-green-500/10',
    },
  ];

  const quickStats = [
    { label: 'Active Contracts', value: activeContracts, color: 'text-green-600' },
    { label: 'Completed', value: completedContracts, color: 'text-blue-600' },
    { label: 'Pending Applications', value: pendingApplications, color: 'text-yellow-600' },
    { label: 'Pending Payments', value: pendingPayments, color: 'text-orange-600' },
  ];

  const rateStats = [
    { label: 'Collection Rate', value: `${collectionRate}%`, color: collectionRate >= 80 ? 'text-green-600' : collectionRate >= 50 ? 'text-yellow-600' : 'text-red-600' },
    { label: 'On-Time Payment Rate', value: `${onTimeRate}%`, color: onTimeRate >= 80 ? 'text-green-600' : onTimeRate >= 50 ? 'text-yellow-600' : 'text-red-600' },
  ];

  const overdueBySeverity = [
    { label: '1-7 days', count: overdue1to7, color: 'text-yellow-600', bgColor: 'bg-yellow-500/20', filter: '1-7' },
    { label: '8-30 days', count: overdue8to30, color: 'text-orange-600', bgColor: 'bg-orange-500/20', filter: '8-30' },
    { label: '31-60 days', count: overdue31to60, color: 'text-red-600', bgColor: 'bg-red-500/20', filter: '31-60' },
    { label: '60+ days', count: overdue60plus, color: 'text-red-700', bgColor: 'bg-red-600/20', filter: '60+' },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your loan management system</p>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="border shadow-line">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-muted/50 rounded-lg p-4 border">
            <p className="text-muted-foreground text-sm">{stat.label}</p>
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
        {rateStats.map((stat, index) => (
          <div key={`rate-${index}`} className="bg-muted/50 rounded-lg p-4 border">
            <p className="text-muted-foreground text-sm flex items-center gap-1">
              <Percent className="w-3 h-3" />
              {stat.label}
            </p>
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Overdue by Severity */}
      {overdueContracts.length > 0 && (
        <Card className="border shadow-line">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Overdue by Severity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
              {overdueBySeverity.map((item) => (
                <button
                  key={item.label}
                  onClick={() => router.push(`/web-admin/contracts?overdueFilter=${item.filter}`)}
                  className={`${item.bgColor} rounded-lg p-4 border hover:border-muted-foreground transition-colors text-left`}
                >
                  <p className="text-muted-foreground text-sm">{item.label}</p>
                  <p className={`text-2xl font-bold ${item.color}`}>{item.count}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Aging Report */}
        <Card className="border shadow-line">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Aging Report
            </CardTitle>
            <Link href="/web-admin/contracts/overdue">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                View Details
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {agingData.map((item) => {
              // Determine the filter to apply when clicked
              const filterMap: Record<string, string> = {
                'Current': 'current',
                '1-7 Days': '1-7',
                '8-30 Days': '8-30',
                '31-60 Days': '31-60',
                '60+ Days': '60+',
              };
              const filterValue = filterMap[item.category] || 'all';

              return (
                <button
                  key={item.category}
                  onClick={() => router.push(`/web-admin/contracts?overdueFilter=${filterValue}`)}
                  className="w-full space-y-2 text-left hover:opacity-80 transition-opacity"
                  disabled={item.count === 0}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className={item.color}>{item.category}</span>
                    <span className="text-muted-foreground">
                      {item.count} contracts • {formatCurrency(item.amount)}
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.bgColor} rounded-full transition-all duration-500`}
                      style={{ width: `${(item.amount / maxAgingAmount) * 100}%` }}
                    />
                  </div>
                </button>
              );
            })}
            {agingData.every((d) => d.count === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600 opacity-50" />
                <p>No contracts to display</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overdue Quick List */}
        <Card className="border shadow-line">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Overdue Contracts
            </CardTitle>
            <Link href="/web-admin/contracts/overdue">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {topOverdue.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600 opacity-50" />
                <p>No overdue contracts!</p>
                <p className="text-sm text-tertiary mt-1">All payments are on time.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topOverdue.map((contract) => (
                  <div
                    key={contract.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-red-500/20"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground truncate">{contract.customerName}</p>
                        <Badge className="bg-red-500/20 text-red-600 border-red-500/30 text-xs">
                          {contract.daysOverdue}d
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(contract.outstandingBalance)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => window.open(`tel:${contract.customerPhone}`)}
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Link href={`/web-admin/contracts/${contract.id}`}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3">
        <Link href="/web-admin/applications/pending">
          <Card className="border shadow-line hover:border-yellow-500/50 transition-colors cursor-pointer">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-yellow-500/10">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Review Applications</p>
                  <p className="text-sm text-muted-foreground">{pendingApplications} pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/web-admin/payments/pending">
          <Card className="border shadow-line hover:border-orange-500/50 transition-colors cursor-pointer">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-orange-500/10">
                  <DollarSign className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Verify Payments</p>
                  <p className="text-sm text-muted-foreground">{pendingPayments} pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/web-admin/contracts">
          <Card className="border shadow-line hover:border-green-500/50 transition-colors cursor-pointer">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">View Contracts</p>
                  <p className="text-sm text-muted-foreground">{activeContracts} active</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* System Status */}
      <Card className="border shadow-line">
        <CardHeader>
          <CardTitle className="text-foreground">System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-muted-foreground">LINE Integration Active</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-muted-foreground">Google Sheets Connected</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-muted-foreground">Database Online</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function WebAdminDashboardPage() {
  return (
    <WebAdminGuard>
      <WebAdminNavigation>
        <DashboardContent />
      </WebAdminNavigation>
    </WebAdminGuard>
  );
}
