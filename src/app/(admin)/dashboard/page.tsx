'use client';

import { useEffect, useState } from 'react';
import { useLiffContext } from '@/components/liff/LiffProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  FileText,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
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
          <Skeleton className="h-8 w-48 bg-slate-700" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-28 bg-slate-700" />
            <Skeleton className="h-28 bg-slate-700" />
            <Skeleton className="h-28 bg-slate-700" />
            <Skeleton className="h-28 bg-slate-700" />
          </div>
        </div>
      </div>
    );
  }

  const { metrics, aging, recentApplications, overdueContracts } = data || {};

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <LayoutDashboard className="w-8 h-8 text-emerald-400" />
        <h1 className="text-2xl font-bold text-white">แดชบอร์ด</h1>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-emerald-600 to-teal-600 border-0">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">ยอดปล่อยกู้</p>
                <p className="text-2xl font-bold text-white">
                  ฿{(metrics?.totalDisbursed || 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-emerald-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-600 to-indigo-600 border-0">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">ยอดคงค้าง</p>
                <p className="text-2xl font-bold text-white">
                  ฿{(metrics?.totalOutstanding || 0).toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-600 to-red-600 border-0">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">ค้างชำระ</p>
                <p className="text-2xl font-bold text-white">
                  {metrics?.overdueCount || 0} ราย
                </p>
              </div>
              <AlertTriangle className="w-10 h-10 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-600 to-pink-600 border-0">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">รออนุมัติ</p>
                <p className="text-2xl font-bold text-white">
                  {metrics?.pendingApplications || 0} รายการ
                </p>
              </div>
              <FileText className="w-10 h-10 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contract Summary */}
      <Card className="bg-slate-800 border-slate-700 mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            สรุปสัญญา
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-3 bg-slate-700 rounded-lg">
              <p className="text-2xl font-bold text-white">{metrics?.totalContracts || 0}</p>
              <p className="text-xs text-slate-400">ทั้งหมด</p>
            </div>
            <div className="p-3 bg-emerald-900/50 rounded-lg">
              <p className="text-2xl font-bold text-emerald-400">{metrics?.activeContracts || 0}</p>
              <p className="text-xs text-slate-400">ใช้งาน</p>
            </div>
            <div className="p-3 bg-slate-700 rounded-lg">
              <p className="text-2xl font-bold text-slate-300">{metrics?.completedContracts || 0}</p>
              <p className="text-xs text-slate-400">ปิดสัญญา</p>
            </div>
            <div className="p-3 bg-red-900/50 rounded-lg">
              <p className="text-2xl font-bold text-red-400">{metrics?.defaultedContracts || 0}</p>
              <p className="text-xs text-slate-400">ผิดนัด</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aging Report */}
      <Card className="bg-slate-800 border-slate-700 mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            Aging Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { label: 'ปกติ', data: aging?.current, color: 'bg-emerald-500' },
              { label: '1-7 วัน', data: aging?.days1to7, color: 'bg-yellow-500' },
              { label: '8-30 วัน', data: aging?.days8to30, color: 'bg-orange-500' },
              { label: '31-60 วัน', data: aging?.days31to60, color: 'bg-red-500' },
              { label: '60+ วัน', data: aging?.days60plus, color: 'bg-red-700' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="text-slate-300 w-20">{item.label}</span>
                <span className="text-white font-medium">{item.data?.count || 0} ราย</span>
                <span className="text-slate-400 text-sm ml-auto">
                  ฿{(item.data?.amount || 0).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Pending Applications */}
      <Card className="bg-slate-800 border-slate-700 mb-6">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            คำขอรออนุมัติ
          </CardTitle>
          <Link href="/admin/applications/pending">
            <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300">
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
                  href={`/admin/applications/${app.id}`}
                  className="flex items-center justify-between p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  <div>
                    <p className="text-white font-medium">{app.fullName}</p>
                    <p className="text-sm text-slate-400">
                      {app.id} • ฿{app.requestedAmount.toLocaleString()}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-400 py-4">ไม่มีคำขอรออนุมัติ</p>
          )}
        </CardContent>
      </Card>

      {/* Overdue Contracts */}
      <Card className="bg-slate-800 border-slate-700 mb-6">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            ค้างชำระ
          </CardTitle>
          <Link href="/admin/contracts/overdue">
            <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300">
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
                  href={`/admin/contracts/${contract.id}`}
                  className="flex items-center justify-between p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  <div>
                    <p className="text-white font-medium">{contract.customerName}</p>
                    <p className="text-sm text-slate-400">
                      {contract.id} • ค้าง {contract.daysOverdue} วัน
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-400 font-medium">
                      ฿{contract.outstandingBalance.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-400 py-4">ไม่มีลูกหนี้ค้างชำระ</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900 border-t border-slate-700">
        <div className="max-w-4xl mx-auto grid grid-cols-4 gap-2">
          <Link href="/admin/applications/pending">
            <Button variant="outline" size="sm" className="w-full h-12 flex-col border-slate-600 text-slate-300 hover:bg-slate-700">
              <FileText className="w-5 h-5 mb-1" />
              <span className="text-xs">คำขอ</span>
            </Button>
          </Link>
          <Link href="/admin/contracts/active">
            <Button variant="outline" size="sm" className="w-full h-12 flex-col border-slate-600 text-slate-300 hover:bg-slate-700">
              <Users className="w-5 h-5 mb-1" />
              <span className="text-xs">สัญญา</span>
            </Button>
          </Link>
          <Link href="/admin/payments/pending">
            <Button variant="outline" size="sm" className="w-full h-12 flex-col border-slate-600 text-slate-300 hover:bg-slate-700">
              <DollarSign className="w-5 h-5 mb-1" />
              <span className="text-xs">ชำระเงิน</span>
            </Button>
          </Link>
          <Link href="/admin/reports">
            <Button variant="outline" size="sm" className="w-full h-12 flex-col border-slate-600 text-slate-300 hover:bg-slate-700">
              <BarChart3 className="w-5 h-5 mb-1" />
              <span className="text-xs">รายงาน</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

