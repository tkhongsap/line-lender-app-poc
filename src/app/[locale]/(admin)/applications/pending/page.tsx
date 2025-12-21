'use client';

import { useEffect, useState } from 'react';
import { useLiffContext } from '@/components/liff/LiffProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, ChevronRight, FileText } from 'lucide-react';
import Link from 'next/link';
import type { Application } from '@/types';

export default function PendingApplicationsPage() {
  const liff = useLiffContext();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
          // Filter to only pending
          const pending = result.data.filter(
            (app: Application) => app.status === 'SUBMITTED' || app.status === 'PENDING'
          );
          setApplications(pending);
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [liff.user?.userId]);

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
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-8 h-8 text-yellow-400" />
        <h1 className="text-2xl font-bold text-white">รออนุมัติ</h1>
        <Badge variant="outline" className="text-yellow-400 border-yellow-600 ml-2">
          {applications.length} รายการ
        </Badge>
      </div>

      <div className="space-y-3">
        {applications.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="py-8 text-center">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">ไม่มีคำขอรออนุมัติ</p>
            </CardContent>
          </Card>
        ) : (
          applications.map((app) => (
            <Link key={app.id} href={`/admin/applications/${app.id}`}>
              <Card className="bg-slate-800 border-slate-700 hover:border-yellow-600 transition-colors cursor-pointer">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium mb-1">{app.fullName}</p>
                      <div className="text-sm text-slate-400">
                        <span>{app.id}</span>
                        <span className="mx-2">•</span>
                        <span>฿{app.requestedAmount.toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {app.collateralType} • ยื่น {new Date(app.createdAt).toLocaleDateString('th-TH')}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

