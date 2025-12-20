'use client';

import { useEffect, useState } from 'react';
import { useLiffContext } from '@/components/liff/LiffProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import type { Application } from '@/types';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  SUBMITTED: { label: 'ยื่นคำขอแล้ว', color: 'bg-blue-100 text-blue-700', icon: <FileText className="w-4 h-4" /> },
  PENDING: { label: 'รอพิจารณา', color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-4 h-4" /> },
  PENDING_DOCS: { label: 'รอเอกสาร', color: 'bg-orange-100 text-orange-700', icon: <AlertCircle className="w-4 h-4" /> },
  APPROVED: { label: 'อนุมัติ', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-4 h-4" /> },
  REJECTED: { label: 'ไม่อนุมัติ', color: 'bg-red-100 text-red-700', icon: <XCircle className="w-4 h-4" /> },
  DISBURSED: { label: 'รับเงินแล้ว', color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle className="w-4 h-4" /> },
};

export default function StatusPage() {
  const liff = useLiffContext();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!liff.user?.userId) return;

      try {
        const response = await fetch(`/api/applications?lineUserId=${liff.user.userId}`, {
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

  if (isLoading) {
    return (
      <div className="container max-w-lg mx-auto py-6 px-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-lg mx-auto py-6 px-4">
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
          <CardTitle>สถานะคำขอสินเชื่อ</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {applications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>ยังไม่มีคำขอสินเชื่อ</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => {
                const status = STATUS_CONFIG[app.status] || STATUS_CONFIG.SUBMITTED;
                return (
                  <div
                    key={app.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-800">{app.id}</span>
                      <Badge className={`${status.color} flex items-center gap-1`}>
                        {status.icon}
                        {status.label}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>วงเงิน: ฿{app.requestedAmount.toLocaleString()}</p>
                      <p>วันที่ยื่น: {new Date(app.createdAt).toLocaleDateString('th-TH')}</p>
                      {app.rejectionReason && (
                        <p className="text-red-600 mt-2">เหตุผล: {app.rejectionReason}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

