'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { WebAdminGuard } from '@/components/web-admin/WebAdminGuard';
import { WebAdminNavigation } from '@/components/web-admin/WebAdminNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Loader2,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Calendar,
  CreditCard,
  ExternalLink,
  Image as ImageIcon,
  Eye,
} from 'lucide-react';
import type { Payment, Contract, PaymentSchedule } from '@/types';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

const statusColors: Record<VerificationStatus, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  VERIFIED: 'bg-green-500/20 text-green-400 border-green-500/30',
  REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(amount);
}

interface PaymentDetail extends Payment {
  contract?: Contract;
  expectedAmount?: number;
}

function PaymentDetailContent() {
  const params = useParams();
  const router = useRouter();
  const paymentId = params.id as string;

  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState('');

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        // Fetch payment details
        const paymentRes = await fetch('/api/payments', {
          headers: { 'x-line-userid': 'web-admin' },
        });
        const paymentData = await paymentRes.json();
        const foundPayment = (paymentData.data || []).find((p: Payment) => p.id === paymentId);

        if (!foundPayment) {
          setError('Payment not found');
          setIsLoading(false);
          return;
        }

        // Fetch contract to get expected amount
        const contractRes = await fetch(`/api/contracts/${foundPayment.contractId}`, {
          headers: { 'x-line-userid': 'web-admin' },
        });
        const contractData = await contractRes.json();

        // Find the expected installment amount
        let expectedAmount = 0;
        if (contractData.success && contractData.data) {
          const contract = contractData.data;
          expectedAmount = contract.monthlyPayment;
          
          // Check schedules for more accurate expected amount
          if (contract.schedules && contract.schedules.length > 0) {
            const pendingSchedule = contract.schedules.find((s: PaymentSchedule) => s.status !== 'PAID');
            if (pendingSchedule) {
              expectedAmount = pendingSchedule.totalAmount;
            }
          }

          foundPayment.contract = contract;
        }

        foundPayment.expectedAmount = expectedAmount;
        setPayment(foundPayment);
      } catch (err) {
        console.error('Failed to fetch payment:', err);
        setError('Failed to load payment details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayment();
  }, [paymentId]);

  const handleVerify = async (approved: boolean, note?: string) => {
    if (!payment) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/payments/${payment.id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-line-userid': 'web-admin',
        },
        body: JSON.stringify({ approved, note }),
      });

      const data = await response.json();
      if (data.success) {
        // Redirect back to pending payments
        router.push('/web-admin/payments/pending');
      } else {
        alert(data.error || 'Failed to process payment');
      }
    } catch (err) {
      console.error('Failed to verify payment:', err);
      alert('Failed to process payment');
    } finally {
      setIsProcessing(false);
      setRejectDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="p-6">
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="py-12 text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400">{error || 'Payment not found'}</p>
            <Link href="/web-admin/payments">
              <Button variant="outline" className="mt-4 border-slate-600">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Payments
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const amountDifference = payment.expectedAmount 
    ? payment.amount - payment.expectedAmount 
    : 0;
  const amountMatch = Math.abs(amountDifference) < 1;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <Link href="/web-admin/payments/pending">
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pending
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white">Payment {payment.id}</h1>
          <Badge className={statusColors[payment.verificationStatus]}>
            {payment.verificationStatus === 'PENDING' && <Clock className="w-3 h-3 mr-1" />}
            {payment.verificationStatus === 'VERIFIED' && <CheckCircle className="w-3 h-3 mr-1" />}
            {payment.verificationStatus === 'REJECTED' && <XCircle className="w-3 h-3 mr-1" />}
            {payment.verificationStatus}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Payment Info */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-400 text-sm">Amount Paid</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(payment.amount)}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Expected Amount</p>
                <p className="text-xl font-semibold text-slate-300">
                  {payment.expectedAmount ? formatCurrency(payment.expectedAmount) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Payment Date</p>
                <p className="text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {format(new Date(payment.paymentDate), 'PPP', { locale: th })}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Payment Method</p>
                <p className="text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-slate-400" />
                  {payment.paymentMethod}
                </p>
              </div>
            </div>

            {/* Amount Comparison */}
            {payment.expectedAmount && (
              <div className={`p-3 rounded-lg ${amountMatch ? 'bg-green-500/10 border border-green-500/30' : 'bg-yellow-500/10 border border-yellow-500/30'}`}>
                <div className="flex items-center gap-2">
                  {amountMatch ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  )}
                  <span className={amountMatch ? 'text-green-400' : 'text-yellow-400'}>
                    {amountMatch 
                      ? 'Amount matches expected payment' 
                      : `Difference: ${formatCurrency(amountDifference)}`
                    }
                  </span>
                </div>
              </div>
            )}

            {/* Contract Link */}
            <div className="pt-4 border-t border-slate-700">
              <Link href={`/web-admin/contracts/${payment.contractId}`}>
                <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                  <Eye className="w-4 h-4 mr-2" />
                  View Contract {payment.contractId}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Slip Image & OCR */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-green-400" />
              Payment Slip
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {payment.slipImageUrl ? (
              <>
                {/* Slip Image */}
                <a
                  href={payment.slipImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="relative aspect-[3/4] max-h-80 bg-slate-700 rounded-lg overflow-hidden border border-slate-600 hover:border-green-500 transition-colors">
                    <img
                      src={payment.slipImageUrl}
                      alt="Payment slip"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/50 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      Click to view full size
                    </div>
                  </div>
                </a>

                {/* OCR Data */}
                {(payment.slipAmount || payment.slipBank || payment.slipDate) && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-slate-400">OCR Extracted Data</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {payment.slipAmount && (
                        <div className="p-3 bg-slate-700/50 rounded-lg">
                          <p className="text-xs text-slate-400">Detected Amount</p>
                          <p className={`font-semibold ${Math.abs(payment.slipAmount - payment.amount) < 1 ? 'text-green-400' : 'text-yellow-400'}`}>
                            {formatCurrency(payment.slipAmount)}
                          </p>
                        </div>
                      )}
                      {payment.slipBank && (
                        <div className="p-3 bg-slate-700/50 rounded-lg">
                          <p className="text-xs text-slate-400">Bank</p>
                          <p className="text-white">{payment.slipBank}</p>
                        </div>
                      )}
                      {payment.slipDate && (
                        <div className="p-3 bg-slate-700/50 rounded-lg col-span-2">
                          <p className="text-xs text-slate-400">Transaction Date</p>
                          <p className="text-white">{payment.slipDate}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-[3/4] max-h-80 bg-slate-700/30 rounded-lg border-2 border-dashed border-slate-600 flex flex-col items-center justify-center">
                <AlertTriangle className="w-12 h-12 text-orange-400 mb-3" />
                <p className="text-slate-400">No slip image uploaded</p>
                <p className="text-slate-500 text-sm">Manual verification required</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      {payment.verificationStatus === 'PENDING' && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-green-500 hover:bg-green-600 text-white min-w-40"
                onClick={() => handleVerify(true)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-5 h-5 mr-2" />
                )}
                Verify Payment
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/20 min-w-40"
                onClick={() => setRejectDialogOpen(true)}
                disabled={isProcessing}
              >
                <XCircle className="w-5 h-5 mr-2" />
                Reject Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Reject Payment</DialogTitle>
            <DialogDescription className="text-slate-400">
              Please provide a reason for rejecting this payment of {formatCurrency(payment.amount)}.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection..."
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              className="border-slate-600 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleVerify(false, rejectNote)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Reject Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function WebAdminPaymentDetailPage() {
  return (
    <WebAdminGuard>
      <WebAdminNavigation>
        <PaymentDetailContent />
      </WebAdminNavigation>
    </WebAdminGuard>
  );
}

