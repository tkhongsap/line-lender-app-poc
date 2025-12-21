'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { WebAdminGuard } from '@/components/web-admin/WebAdminGuard';
import { WebAdminNavigation } from '@/components/web-admin/WebAdminNavigation';
import { useWebAuth } from '@/hooks/use-web-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import {
  User,
  Phone,
  Mail,
  CreditCard,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import type { Application } from '@/types';
import { Toaster } from '@/components/ui/sonner';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  SUBMITTED: { label: 'Submitted', color: 'bg-blue-500' },
  PENDING: { label: 'Pending', color: 'bg-yellow-500' },
  PENDING_DOCS: { label: 'Pending Docs', color: 'bg-orange-500' },
  APPROVED: { label: 'Approved', color: 'bg-green-500' },
  REJECTED: { label: 'Rejected', color: 'bg-red-500' },
  DISBURSED: { label: 'Disbursed', color: 'bg-emerald-500' },
};

const COLLATERAL_LABELS: Record<string, string> = {
  LAND: 'Land',
  HOUSE: 'House',
  CONDO: 'Condo',
  CAR: 'Car',
  GOLD: 'Gold',
  OTHER: 'Other',
};

const PURPOSE_LABELS: Record<string, string> = {
  BUSINESS: 'Business',
  PERSONAL: 'Personal',
  EDUCATION: 'Education',
  MEDICAL: 'Medical',
  OTHER: 'Other',
};

function ApplicationDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useWebAuth();
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const [approvalData, setApprovalData] = useState({
    approvedAmount: 0,
    interestRate: 1.5,
    termMonths: 12,
    paymentDay: 25,
    note: '',
  });

  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    const fetchApplication = async () => {
      if (!params.id) return;

      try {
        const response = await fetch(`/api/applications/${params.id}`, {
          headers: {
            'x-line-userid': 'web-admin',
          },
        });
        const result = await response.json();
        if (result.success) {
          setApplication(result.data);
          setApprovalData(prev => ({
            ...prev,
            approvedAmount: result.data.requestedAmount,
          }));
        }
      } catch (error) {
        console.error('Error fetching application:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplication();
  }, [params.id]);

  const handleApprove = async () => {
    if (!application) return;

    setIsApproving(true);

    try {
      const response = await fetch(`/api/applications/${application.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-line-userid': 'web-admin',
        },
        body: JSON.stringify(approvalData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Application approved successfully');
        router.push('/web-admin/applications');
      } else {
        toast.error(result.error || 'Failed to approve');
      }
    } catch (error) {
      console.error('Approve error:', error);
      toast.error('Failed to approve application');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!application || !rejectionReason) {
      toast.error('Please provide a reason');
      return;
    }

    setIsRejecting(true);

    try {
      const response = await fetch(`/api/applications/${application.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-line-userid': 'web-admin',
        },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Application rejected');
        router.push('/web-admin/applications');
      } else {
        toast.error(result.error || 'Failed to reject');
      }
    } catch (error) {
      console.error('Reject error:', error);
      toast.error('Failed to reject application');
    } finally {
      setIsRejecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-6 px-4">
        <Skeleton className="h-8 w-48 bg-slate-700 mb-6" />
        <Skeleton className="h-64 bg-slate-700" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container max-w-4xl mx-auto py-6 px-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="py-8 text-center">
            <p className="text-slate-400">Application not found</p>
            <Link href="/web-admin/applications">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = STATUS_CONFIG[application.status] || STATUS_CONFIG.SUBMITTED;
  const isPending = application.status === 'SUBMITTED' || application.status === 'PENDING';
  const canApprove = user?.role === 'SUPER_ADMIN' || user?.role === 'APPROVER';

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4 pb-32">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/web-admin/applications">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">{application.id}</h1>
            <Badge className={`${status.color} text-white`}>{status.label}</Badge>
          </div>
          <p className="text-sm text-slate-400">
            Submitted on {new Date(application.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <Card className="bg-slate-800 border-slate-700 mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <User className="w-5 h-5 text-green-400" />
            Applicant Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Full Name</p>
              <p className="text-white">{application.fullName}</p>
            </div>
            <div>
              <p className="text-slate-400">National ID</p>
              <p className="text-white font-mono">{application.nationalId}</p>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" />
              <p className="text-white">{application.phone}</p>
            </div>
            {application.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <p className="text-white">{application.email}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700 mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <CreditCard className="w-5 h-5 text-green-400" />
            Loan Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-green-900/30 rounded-lg p-4 text-center">
            <p className="text-slate-400 text-sm">Requested Amount</p>
            <p className="text-3xl font-bold text-green-400">
              {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(application.requestedAmount)}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Purpose</p>
              <p className="text-white">{PURPOSE_LABELS[application.purpose]}</p>
            </div>
            {application.purposeDetail && (
              <div className="col-span-2">
                <p className="text-slate-400">Details</p>
                <p className="text-white">{application.purposeDetail}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700 mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <MapPin className="w-5 h-5 text-green-400" />
            Collateral
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Type</p>
              <p className="text-white">{COLLATERAL_LABELS[application.collateralType]}</p>
            </div>
            <div>
              <p className="text-slate-400">Value</p>
              <p className="text-white">
                {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(application.collateralValue)}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-slate-400">Address</p>
              <p className="text-white">{application.collateralAddress}</p>
            </div>
            {application.collateralDescription && (
              <div className="col-span-2">
                <p className="text-slate-400">Description</p>
                <p className="text-white">{application.collateralDescription}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {application.documents && application.documents.length > 0 && (
        <Card className="bg-slate-800 border-slate-700 mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-green-400" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {application.documents.map((doc, idx) => (
                <a
                  key={idx}
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  <span className="text-white">{doc.fileName}</span>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isPending && canApprove && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900 border-t border-slate-700">
          <div className="max-w-4xl mx-auto flex gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Approve
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Approve Loan Application</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Approved Amount (THB)</Label>
                    <Input
                      type="number"
                      value={approvalData.approvedAmount}
                      onChange={(e) => setApprovalData({ ...approvalData, approvedAmount: Number(e.target.value) })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Interest Rate (%/month)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={approvalData.interestRate}
                        onChange={(e) => setApprovalData({ ...approvalData, interestRate: Number(e.target.value) })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Term (months)</Label>
                      <Input
                        type="number"
                        value={approvalData.termMonths}
                        onChange={(e) => setApprovalData({ ...approvalData, termMonths: Number(e.target.value) })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Payment Day (1-28)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={28}
                      value={approvalData.paymentDay}
                      onChange={(e) => setApprovalData({ ...approvalData, paymentDay: Number(e.target.value) })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Notes</Label>
                    <Textarea
                      value={approvalData.note}
                      onChange={(e) => setApprovalData({ ...approvalData, note: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleApprove}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isApproving}
                  >
                    {isApproving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      'Confirm Approval'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="flex-1">
                  <XCircle className="w-5 h-5 mr-2" />
                  Reject
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Reject Application</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <Label className="text-slate-300">Reason</Label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter rejection reason..."
                    className="bg-slate-700 border-slate-600 text-white mt-2"
                  />
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleReject}
                    variant="destructive"
                    disabled={isRejecting || !rejectionReason}
                  >
                    {isRejecting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Confirm Rejection'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WebAdminApplicationDetailPage() {
  return (
    <WebAdminGuard>
      <WebAdminNavigation>
        <ApplicationDetailContent />
      </WebAdminNavigation>
      <Toaster position="top-center" richColors />
    </WebAdminGuard>
  );
}
