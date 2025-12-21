'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useLiffContext } from '@/components/liff/LiffProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
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

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  SUBMITTED: { label: 'ยื่นใหม่', color: 'bg-blue-500' },
  PENDING: { label: 'รอพิจารณา', color: 'bg-yellow-500' },
  PENDING_DOCS: { label: 'รอเอกสาร', color: 'bg-orange-500' },
  APPROVED: { label: 'อนุมัติ', color: 'bg-green-500' },
  REJECTED: { label: 'ไม่อนุมัติ', color: 'bg-red-500' },
  DISBURSED: { label: 'รับเงินแล้ว', color: 'bg-emerald-500' },
};

const COLLATERAL_LABELS: Record<string, string> = {
  LAND: 'ที่ดิน',
  HOUSE: 'บ้าน',
  CONDO: 'คอนโด',
  CAR: 'รถยนต์',
  GOLD: 'ทองคำ',
  OTHER: 'อื่นๆ',
};

const PURPOSE_LABELS: Record<string, string> = {
  BUSINESS: 'ธุรกิจ',
  PERSONAL: 'ใช้จ่ายส่วนตัว',
  EDUCATION: 'การศึกษา',
  MEDICAL: 'การแพทย์',
  OTHER: 'อื่นๆ',
};

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const liff = useLiffContext();
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  // Approval form
  const [approvalData, setApprovalData] = useState({
    approvedAmount: 0,
    interestRate: 1.5,
    termMonths: 12,
    paymentDay: 25,
    note: '',
  });

  // Rejection form
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    const fetchApplication = async () => {
      if (!liff.user?.userId || !params.id) return;

      try {
        const response = await fetch(`/api/applications/${params.id}`, {
          headers: {
            'x-line-userid': liff.user.userId,
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
  }, [liff.user?.userId, params.id]);

  const handleApprove = async () => {
    if (!liff.user?.userId || !application) return;

    setIsApproving(true);

    try {
      const response = await fetch(`/api/applications/${application.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-line-userid': liff.user.userId,
        },
        body: JSON.stringify(approvalData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('อนุมัติเรียบร้อยแล้ว');
        router.push('/admin/applications');
      } else {
        toast.error(result.error || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Approve error:', error);
      toast.error('ไม่สามารถอนุมัติได้');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!liff.user?.userId || !application || !rejectionReason) {
      toast.error('กรุณาระบุเหตุผล');
      return;
    }

    setIsRejecting(true);

    try {
      const response = await fetch(`/api/applications/${application.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-line-userid': liff.user.userId,
        },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('ปฏิเสธเรียบร้อยแล้ว');
        router.push('/admin/applications');
      } else {
        toast.error(result.error || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Reject error:', error);
      toast.error('ไม่สามารถปฏิเสธได้');
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
            <p className="text-slate-400">ไม่พบคำขอสินเชื่อ</p>
            <Link href="/admin/applications">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                กลับ
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = STATUS_CONFIG[application.status] || STATUS_CONFIG.SUBMITTED;
  const isPending = application.status === 'SUBMITTED' || application.status === 'PENDING';

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4 pb-32">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/applications">
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
            ยื่นเมื่อ {new Date(application.createdAt).toLocaleDateString('th-TH')}
          </p>
        </div>
      </div>

      {/* Personal Info */}
      <Card className="bg-slate-800 border-slate-700 mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <User className="w-5 h-5 text-emerald-400" />
            ข้อมูลผู้ยื่น
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400">ชื่อ-นามสกุล</p>
              <p className="text-white">{application.fullName}</p>
            </div>
            <div>
              <p className="text-slate-400">เลขบัตรประชาชน</p>
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

      {/* Loan Request */}
      <Card className="bg-slate-800 border-slate-700 mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            รายละเอียดสินเชื่อ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-emerald-900/30 rounded-lg p-4 text-center">
            <p className="text-slate-400 text-sm">วงเงินที่ขอ</p>
            <p className="text-3xl font-bold text-emerald-400">
              ฿{application.requestedAmount.toLocaleString()}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400">วัตถุประสงค์</p>
              <p className="text-white">{PURPOSE_LABELS[application.purpose]}</p>
            </div>
            {application.purposeDetail && (
              <div className="col-span-2">
                <p className="text-slate-400">รายละเอียด</p>
                <p className="text-white">{application.purposeDetail}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Collateral */}
      <Card className="bg-slate-800 border-slate-700 mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <MapPin className="w-5 h-5 text-emerald-400" />
            หลักทรัพย์ค้ำประกัน
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400">ประเภท</p>
              <p className="text-white">{COLLATERAL_LABELS[application.collateralType]}</p>
            </div>
            <div>
              <p className="text-slate-400">มูลค่า</p>
              <p className="text-white">฿{application.collateralValue.toLocaleString()}</p>
            </div>
            <div className="col-span-2">
              <p className="text-slate-400">ที่อยู่</p>
              <p className="text-white">{application.collateralAddress}</p>
            </div>
            {application.collateralDescription && (
              <div className="col-span-2">
                <p className="text-slate-400">รายละเอียด</p>
                <p className="text-white">{application.collateralDescription}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      {application.documents && application.documents.length > 0 && (
        <Card className="bg-slate-800 border-slate-700 mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-emerald-400" />
              เอกสารแนบ
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

      {/* Action Buttons */}
      {isPending && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900 border-t border-slate-700">
          <div className="max-w-4xl mx-auto flex gap-3">
            {/* Approve Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  อนุมัติ
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">อนุมัติสินเชื่อ</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">วงเงินอนุมัติ (บาท)</Label>
                    <Input
                      type="number"
                      value={approvalData.approvedAmount}
                      onChange={(e) => setApprovalData({ ...approvalData, approvedAmount: Number(e.target.value) })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">อัตราดอกเบี้ย (%/เดือน)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={approvalData.interestRate}
                        onChange={(e) => setApprovalData({ ...approvalData, interestRate: Number(e.target.value) })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">จำนวนงวด</Label>
                      <Input
                        type="number"
                        value={approvalData.termMonths}
                        onChange={(e) => setApprovalData({ ...approvalData, termMonths: Number(e.target.value) })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">วันครบกำหนดชำระ (วันที่)</Label>
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
                    <Label className="text-slate-300">หมายเหตุ</Label>
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
                    className="bg-emerald-600 hover:bg-emerald-700"
                    disabled={isApproving}
                  >
                    {isApproving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        กำลังอนุมัติ...
                      </>
                    ) : (
                      'ยืนยันอนุมัติ'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="flex-1">
                  <XCircle className="w-5 h-5 mr-2" />
                  ไม่อนุมัติ
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">ไม่อนุมัติสินเชื่อ</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <Label className="text-slate-300">เหตุผล</Label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="ระบุเหตุผลที่ไม่อนุมัติ..."
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
                        กำลังดำเนินการ...
                      </>
                    ) : (
                      'ยืนยันไม่อนุมัติ'
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

