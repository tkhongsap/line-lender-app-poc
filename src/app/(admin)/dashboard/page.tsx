'use client';

import { useEffect, useState } from 'react';
import { useLiffContext } from '@/components/liff/LiffProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FileText,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Users,
  Clock,
  ChevronRight,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';
import type { DashboardMetrics, AgingReport, Application, Contract } from '@/types';

interface DashboardData {
  metrics: DashboardMetrics;
  aging: AgingReport;
  recentApplications: Application[];
  overdueContracts: Contract[];
}

export default function DashboardPage() {
  const liff = useLiffContext();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!liff.user?.userId) return;

      try {
        // Fetch all data in parallel
        const [applicationsRes, contractsRes] = await Promise.all([
          fetch('/api/applications', {
            headers: { 'x-line-userid': liff.user.userId },
          }),
          fetch('/api/contracts?includeSchedules=false', {
            headers: { 'x-line-userid': liff.user.userId },
          }),
        ]);

        const [applicationsData, contractsData] = await Promise.all([
          applicationsRes.json(),
          contractsRes.json(),
        ]);

        const applications: Application[] = applicationsData.data || [];
        const contracts: Contract[] = contractsData.data || [];

        // Calculate metrics
        const activeContracts = contracts.filter(c => c.status === 'ACTIVE');
        const completedContracts = contracts.filter(c => c.status === 'COMPLETED');
        const defaultedContracts = contracts.filter(c => c.status === 'DEFAULT');
        const overdueContracts = activeContracts.filter(c => c.daysOverdue > 0);
        const pendingApps = applications.filter(
          a => a.status === 'SUBMITTED' || a.status === 'PENDING'
        );

        const metrics: DashboardMetrics = {
          totalContracts: contracts.length,
          activeContracts: activeContracts.length,
          completedContracts: completedContracts.length,
          defaultedContracts: defaultedContracts.length,
          totalDisbursed: contracts.reduce((sum, c) => sum + c.approvedAmount, 0),
          totalOutstanding: activeContracts.reduce((sum, c) => sum + c.outstandingBalance, 0),
          totalCollected: contracts.reduce((sum, c) => sum + c.totalPaid, 0),
          overdueCount: overdueContracts.length,
          overdueAmount: overdueContracts.reduce((sum, c) => sum + c.outstandingBalance, 0),
          onTimePaymentRate: 85, // TODO: Calculate actual rate
          pendingApplications: pendingApps.length,
        };

        // Calculate aging
        const aging: AgingReport = {
          current: { count: 0, amount: 0 },
          days1to7: { count: 0, amount: 0 },
          days8to30: { count: 0, amount: 0 },
          days31to60: { count: 0, amount: 0 },
          days60plus: { count: 0, amount: 0 },
        };

        activeContracts.forEach(c => {
          const bucket = c.daysOverdue === 0 ? 'current'
            : c.daysOverdue <= 7 ? 'days1to7'
            : c.daysOverdue <= 30 ? 'days8to30'
            : c.daysOverdue <= 60 ? 'days31to60'
            : 'days60plus';
          aging[bucket].count++;
          aging[bucket].amount += c.outstandingBalance;
        });

        setData({
          metrics,
          aging,
          recentApplications: pendingApps.slice(0, 5),
          overdueContracts: overdueContracts.slice(0, 5),
        });
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [liff.user?.userId]);

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-6 px-4">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48 bg-sidebar-accent" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-28 bg-sidebar-accent" />
            <Skeleton className="h-28 bg-sidebar-accent" />
            <Skeleton className="h-28 bg-sidebar-accent" />
            <Skeleton className="h-28 bg-sidebar-accent" />
          </div>
        </div>
      </div>
    );
  }

  const { metrics, aging, recentApplications, overdueContracts } = data || {};

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <LayoutDashboard className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold text-sidebar-foreground">แดชบอร์ด</h1>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="bg-primary border-0">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-foreground/80 text-sm">ยอดปล่อยกู้</p>
                <p className="text-2xl font-bold text-primary-foreground">
                  ฿{(metrics?.totalDisbursed || 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-primary-foreground/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-sidebar-accent border-sidebar-border">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sidebar-foreground/60 text-sm">ยอดคงค้าง</p>
                <p className="text-2xl font-bold text-sidebar-foreground">
                  ฿{(metrics?.totalOutstanding || 0).toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-destructive/80 text-sm">ค้างชำระ</p>
                <p className="text-2xl font-bold text-destructive">
                  {metrics?.overdueCount || 0} ราย
                </p>
              </div>
              <AlertTriangle className="w-10 h-10 text-destructive/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-accent border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-accent-foreground/80 text-sm">รออนุมัติ</p>
                <p className="text-2xl font-bold text-accent-foreground">
                  {metrics?.pendingApplications || 0} รายการ
                </p>
              </div>
              <FileText className="w-10 h-10 text-primary/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contract Summary */}
      <Card className="bg-sidebar-accent border-sidebar-border mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sidebar-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            สรุปสัญญา
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-3 bg-sidebar rounded-lg border border-sidebar-border">
              <p className="text-2xl font-bold text-sidebar-foreground">{metrics?.totalContracts || 0}</p>
              <p className="text-xs text-sidebar-foreground/60">ทั้งหมด</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-2xl font-bold text-primary">{metrics?.activeContracts || 0}</p>
              <p className="text-xs text-sidebar-foreground/60">ใช้งาน</p>
            </div>
            <div className="p-3 bg-sidebar rounded-lg border border-sidebar-border">
              <p className="text-2xl font-bold text-sidebar-foreground/70">{metrics?.completedContracts || 0}</p>
              <p className="text-xs text-sidebar-foreground/60">ปิดสัญญา</p>
            </div>
            <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              <p className="text-2xl font-bold text-destructive">{metrics?.defaultedContracts || 0}</p>
              <p className="text-xs text-sidebar-foreground/60">ผิดนัด</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aging Report */}
      <Card className="bg-sidebar-accent border-sidebar-border mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sidebar-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Aging Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { label: 'ปกติ', data: aging?.current, color: 'bg-primary' },
              { label: '1-7 วัน', data: aging?.days1to7, color: 'bg-yellow-500' },
              { label: '8-30 วัน', data: aging?.days8to30, color: 'bg-orange-500' },
              { label: '31-60 วัน', data: aging?.days31to60, color: 'bg-red-500' },
              { label: '60+ วัน', data: aging?.days60plus, color: 'bg-red-700' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="text-sidebar-foreground/80 w-20">{item.label}</span>
                <span className="text-sidebar-foreground font-medium">{item.data?.count || 0} ราย</span>
                <span className="text-sidebar-foreground/60 text-sm ml-auto">
                  ฿{(item.data?.amount || 0).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Pending Applications */}
      <Card className="bg-sidebar-accent border-sidebar-border mb-6">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sidebar-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            คำขอรออนุมัติ
          </CardTitle>
          <Link href="/applications/pending">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/10">
              ดูทั้งหมด <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentApplications && recentApplications.length > 0 ? (
            <div className="space-y-3">
              {recentApplications.map((app) => (
                <Link
                  key={app.id}
                  href={`/applications/${app.id}`}
                  className="flex items-center justify-between p-3 bg-sidebar rounded-lg border border-sidebar-border hover:border-primary/50 transition-colors"
                >
                  <div>
                    <p className="text-sidebar-foreground font-medium">{app.fullName}</p>
                    <p className="text-sm text-sidebar-foreground/60">
                      {app.id} • ฿{app.requestedAmount.toLocaleString()}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-sidebar-foreground/40" />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-sidebar-foreground/60 py-4">ไม่มีคำขอรออนุมัติ</p>
          )}
        </CardContent>
      </Card>

      {/* Overdue Contracts */}
      <Card className="bg-sidebar-accent border-sidebar-border mb-6">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sidebar-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            ค้างชำระ
          </CardTitle>
          <Link href="/contracts/overdue">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/10">
              ดูทั้งหมด <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {overdueContracts && overdueContracts.length > 0 ? (
            <div className="space-y-3">
              {overdueContracts.map((contract) => (
                <Link
                  key={contract.id}
                  href={`/contracts/${contract.id}`}
                  className="flex items-center justify-between p-3 bg-sidebar rounded-lg border border-sidebar-border hover:border-destructive/50 transition-colors"
                >
                  <div>
                    <p className="text-sidebar-foreground font-medium">{contract.customerName}</p>
                    <p className="text-sm text-sidebar-foreground/60">
                      {contract.id} • ค้าง {contract.daysOverdue} วัน
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-destructive font-medium">
                      ฿{contract.outstandingBalance.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-sidebar-foreground/60 py-4">ไม่มีลูกหนี้ค้างชำระ</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions - Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-sidebar border-t border-sidebar-border">
        <div className="max-w-4xl mx-auto grid grid-cols-4 gap-2">
          <Link href="/applications/pending">
            <Button variant="outline" size="sm" className="w-full h-12 flex-col border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent hover:border-primary/50">
              <FileText className="w-5 h-5 mb-1" />
              <span className="text-xs">คำขอ</span>
            </Button>
          </Link>
          <Link href="/contracts">
            <Button variant="outline" size="sm" className="w-full h-12 flex-col border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent hover:border-primary/50">
              <Users className="w-5 h-5 mb-1" />
              <span className="text-xs">สัญญา</span>
            </Button>
          </Link>
          <Link href="/payments">
            <Button variant="outline" size="sm" className="w-full h-12 flex-col border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent hover:border-primary/50">
              <DollarSign className="w-5 h-5 mb-1" />
              <span className="text-xs">ชำระเงิน</span>
            </Button>
          </Link>
          <Link href="/reports">
            <Button variant="outline" size="sm" className="w-full h-12 flex-col border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent hover:border-primary/50">
              <BarChart3 className="w-5 h-5 mb-1" />
              <span className="text-xs">รายงาน</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
