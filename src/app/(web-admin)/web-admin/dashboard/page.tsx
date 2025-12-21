'use client';

import { useEffect, useState } from 'react';
import { WebAdminGuard } from '@/components/web-admin/WebAdminGuard';
import { WebAdminNavigation } from '@/components/web-admin/WebAdminNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileText, Users, CheckCircle, Clock, DollarSign, AlertTriangle } from 'lucide-react';
import type { DashboardMetrics } from '@/types';

function DashboardContent() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/applications', {
          headers: {
            'x-line-userid': 'web-admin',
          },
        });
        const data = await response.json();
        
        const applications = data.data || [];
        const pendingCount = applications.filter((app: any) => 
          app.status === 'PENDING' || app.status === 'SUBMITTED'
        ).length;
        const approvedCount = applications.filter((app: any) => 
          app.status === 'APPROVED' || app.status === 'DISBURSED'
        ).length;
        
        setMetrics({
          totalContracts: applications.length,
          activeContracts: approvedCount,
          completedContracts: 0,
          defaultedContracts: 0,
          totalDisbursed: 0,
          totalOutstanding: 0,
          totalCollected: 0,
          overdueCount: 0,
          overdueAmount: 0,
          onTimePaymentRate: 0,
          pendingApplications: pendingCount,
        });
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Applications',
      value: metrics?.totalContracts || 0,
      icon: FileText,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Pending Review',
      value: metrics?.pendingApplications || 0,
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Approved',
      value: metrics?.activeContracts || 0,
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Active Contracts',
      value: metrics?.activeContracts || 0,
      icon: Users,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Overview of your loan management system</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href="/web-admin/applications/pending"
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
            >
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="font-medium text-white">Review Pending Applications</p>
                <p className="text-sm text-slate-400">
                  {metrics?.pendingApplications || 0} applications waiting
                </p>
              </div>
            </a>
            <a
              href="/web-admin/applications"
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
            >
              <div className="p-2 rounded-lg bg-blue-500/10">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-white">View All Applications</p>
                <p className="text-sm text-slate-400">
                  {metrics?.totalContracts || 0} total applications
                </p>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span className="text-slate-300">LINE Integration Active</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span className="text-slate-300">Google Sheets Connected</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span className="text-slate-300">Database Online</span>
            </div>
          </CardContent>
        </Card>
      </div>
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
