'use client';

import { useEffect, useState } from 'react';
import { useLiffContext } from '@/components/liff/LiffProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, ChevronRight, Filter } from 'lucide-react';
import Link from 'next/link';
import type { Application } from '@/types';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  SUBMITTED: { label: 'ยื่นใหม่', color: 'bg-blue-500' },
  PENDING: { label: 'รอพิจารณา', color: 'bg-yellow-500' },
  PENDING_DOCS: { label: 'รอเอกสาร', color: 'bg-orange-500' },
  APPROVED: { label: 'อนุมัติ', color: 'bg-green-500' },
  REJECTED: { label: 'ไม่อนุมัติ', color: 'bg-red-500' },
  DISBURSED: { label: 'รับเงินแล้ว', color: 'bg-emerald-500' },
};

export default function ApplicationsPage() {
  const liff = useLiffContext();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchApplications = async () => {
      if (!liff.user?.userId) return;

      try {
        const response = await fetch('/api/applications', {
          headers: {
            'x-line-userid': liff.user.userId,
          },
        });
        const result = await response.json();
        if (result.success) {
          setApplications(result.data);
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [liff.user?.userId]);

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    if (filter === 'pending') return app.status === 'SUBMITTED' || app.status === 'PENDING';
    if (filter === 'approved') return app.status === 'APPROVED' || app.status === 'DISBURSED';
    if (filter === 'rejected') return app.status === 'REJECTED';
    return true;
  });

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-6 px-4">
        <Skeleton className="h-8 w-48 bg-slate-700 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-24 bg-slate-700" />
          <Skeleton className="h-24 bg-slate-700" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-emerald-400" />
          <h1 className="text-2xl font-bold text-white">คำขอสินเชื่อ</h1>
        </div>
        <Badge variant="outline" className="text-slate-300 border-slate-600">
          {applications.length} รายการ
        </Badge>
      </div>

      <Tabs defaultValue="all" value={filter} onValueChange={setFilter} className="mb-6">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="all" className="data-[state=active]:bg-emerald-600">ทั้งหมด</TabsTrigger>
          <TabsTrigger value="pending" className="data-[state=active]:bg-emerald-600">รออนุมัติ</TabsTrigger>
          <TabsTrigger value="approved" className="data-[state=active]:bg-emerald-600">อนุมัติ</TabsTrigger>
          <TabsTrigger value="rejected" className="data-[state=active]:bg-emerald-600">ไม่อนุมัติ</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-3">
        {filteredApplications.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="py-8 text-center">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">ไม่พบคำขอสินเชื่อ</p>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((app) => {
            const status = STATUS_CONFIG[app.status] || STATUS_CONFIG.SUBMITTED;
            return (
              <Link key={app.id} href={`/admin/applications/${app.id}`}>
                <Card className="bg-slate-800 border-slate-700 hover:border-emerald-600 transition-colors cursor-pointer">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium">{app.fullName}</span>
                          <Badge className={`${status.color} text-white text-xs`}>
                            {status.label}
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-400">
                          <span>{app.id}</span>
                          <span className="mx-2">•</span>
                          <span>฿{app.requestedAmount.toLocaleString()}</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(app.createdAt).toLocaleDateString('th-TH')}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

