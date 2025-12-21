'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { WebAdminGuard } from '@/components/web-admin/WebAdminGuard';
import { WebAdminNavigation } from '@/components/web-admin/WebAdminNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Eye,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ExternalLink,
  Image as ImageIcon,
  AlertTriangle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import type { Payment } from '@/types';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(amount);
}

function PendingPaymentsContent() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [rejectingPayment, setRejectingPayment] = useState<Payment | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/payments?verificationStatus=PENDING', {
        headers: {
          'x-line-userid': 'web-admin',
        },
      });
      const data = await response.json();
      // Sort by date ascending (oldest first for FIFO processing)
      const sortedPayments = (data.data || []).sort(
        (a: Payment, b: Payment) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setPayments(sortedPayments);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleVerify = async (paymentId: string, approved: boolean, note?: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/payments/${paymentId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-line-userid': 'web-admin',
        },
        body: JSON.stringify({ approved, note }),
      });

      const data = await response.json();
      if (data.success) {
        // Remove from list
        setPayments((prev) => prev.filter((p) => p.id !== paymentId));
      } else {
        alert(data.error || 'Failed to process payment');
      }
    } catch (error) {
      console.error('Failed to verify payment:', error);
      alert('Failed to process payment');
    } finally {
      setIsProcessing(false);
      setVerifyingId(null);
      setRejectingPayment(null);
      setRejectNote('');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/web-admin/payments">
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Payments
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-400" />
            <h1 className="text-2xl font-bold text-white">Pending Verification</h1>
          </div>
          <p className="text-slate-400 mt-1">
            {payments.length} payment{payments.length !== 1 ? 's' : ''} waiting for verification
          </p>
        </div>
      </div>

      {payments.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="py-12 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <p className="text-slate-400">All payments have been verified!</p>
            <p className="text-slate-500 text-sm mt-1">Great job staying on top of verifications.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <Card
              key={payment.id}
              className="bg-slate-800/50 border-yellow-500/30 hover:border-yellow-500/50 transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-sm text-slate-400">{payment.id}</span>
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 gap-1">
                        <Clock className="w-3 h-3" />
                        Pending
                      </Badge>
                      {payment.slipImageUrl ? (
                        <Badge variant="outline" className="border-green-500/30 text-green-400 gap-1">
                          <ImageIcon className="w-3 h-3" />
                          Has Slip
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-orange-500/30 text-orange-400 gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          No Slip
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <p className="text-2xl font-bold text-white">{formatCurrency(payment.amount)}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span>Contract: {payment.contractId}</span>
                        <span>{payment.paymentMethod}</span>
                        <span>
                          {format(new Date(payment.paymentDate), 'PP', { locale: th })}
                        </span>
                      </div>
                    </div>
                    {payment.slipImageUrl && (
                      <div className="flex items-center gap-2 text-sm">
                        <a
                          href={payment.slipImageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-400 hover:text-green-300 flex items-center gap-1"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Payment Slip
                        </a>
                        {payment.slipAmount && (
                          <span className="text-slate-400">
                            • OCR Amount: {formatCurrency(payment.slipAmount)}
                          </span>
                        )}
                        {payment.slipBank && (
                          <span className="text-slate-400">• {payment.slipBank}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/web-admin/contracts/${payment.contractId}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Contract
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                      onClick={() => setRejectingPayment(payment)}
                      disabled={isProcessing}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => {
                        setVerifyingId(payment.id);
                        handleVerify(payment.id, true);
                      }}
                      disabled={isProcessing}
                    >
                      {verifyingId === payment.id && isProcessing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Verify
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={!!rejectingPayment} onOpenChange={() => setRejectingPayment(null)}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Reject Payment</DialogTitle>
            <DialogDescription className="text-slate-400">
              Please provide a reason for rejecting this payment of{' '}
              {rejectingPayment && formatCurrency(rejectingPayment.amount)}.
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
              onClick={() => setRejectingPayment(null)}
              className="border-slate-600 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => rejectingPayment && handleVerify(rejectingPayment.id, false, rejectNote)}
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

export default function WebAdminPendingPaymentsPage() {
  return (
    <WebAdminGuard>
      <WebAdminNavigation>
        <PendingPaymentsContent />
      </WebAdminNavigation>
    </WebAdminGuard>
  );
}

