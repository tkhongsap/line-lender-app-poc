'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { WebAdminGuard } from '@/components/web-admin/WebAdminGuard';
import { WebAdminNavigation } from '@/components/web-admin/WebAdminNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Eye, FileText, Clock } from 'lucide-react';
import type { Application, ApplicationStatus } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';

const statusColors: Record<ApplicationStatus, string> = {
  SUBMITTED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  PENDING_DOCS: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  APPROVED: 'bg-green-500/20 text-green-400 border-green-500/30',
  REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
  DISBURSED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const statusLabels: Record<ApplicationStatus, string> = {
  SUBMITTED: 'Submitted',
  PENDING: 'Pending',
  PENDING_DOCS: 'Pending Docs',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  DISBURSED: 'Disbursed',
};

function PendingApplicationsContent() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch('/api/applications', {
          headers: {
            'x-line-userid': 'web-admin',
          },
        });
        const data = await response.json();
        const allApps = data.data || [];
        const pendingApps = allApps.filter(
          (app: Application) => app.status === 'PENDING' || app.status === 'SUBMITTED'
        );
        setApplications(pendingApps);
      } catch (error) {
        console.error('Failed to fetch applications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-yellow-500/10">
            <Clock className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Pending Applications</h1>
            <p className="text-slate-400 mt-1">
              {applications.length} applications waiting for review
            </p>
          </div>
        </div>
      </div>

      {applications.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">No pending applications</p>
            <p className="text-sm text-slate-500 mt-1">
              All applications have been reviewed
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card
              key={app.id}
              className="bg-slate-800/50 border-slate-700 hover:border-yellow-500/30 transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-slate-400">{app.id}</span>
                      <Badge className={statusColors[app.status]}>
                        {statusLabels[app.status]}
                      </Badge>
                    </div>
                    <p className="text-lg font-semibold text-white">{app.fullName}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span>{app.phone}</span>
                      <span>
                        {new Intl.NumberFormat('th-TH', {
                          style: 'currency',
                          currency: 'THB',
                        }).format(app.requestedAmount)}
                      </span>
                      <span>
                        {formatDistanceToNow(new Date(app.createdAt), {
                          addSuffix: true,
                          locale: th,
                        })}
                      </span>
                    </div>
                  </div>
                  <Link href={`/web-admin/applications/${app.id}`}>
                    <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                      <Eye className="w-4 h-4 mr-2" />
                      Review
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function WebAdminPendingApplicationsPage() {
  return (
    <WebAdminGuard>
      <WebAdminNavigation>
        <PendingApplicationsContent />
      </WebAdminNavigation>
    </WebAdminGuard>
  );
}
