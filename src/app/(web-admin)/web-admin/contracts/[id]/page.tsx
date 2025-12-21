'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { WebAdminGuard } from '@/components/web-admin/WebAdminGuard';
import { WebAdminNavigation } from '@/components/web-admin/WebAdminNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Phone,
  MessageCircle,
  User,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  ExternalLink,
  Send,
  Bell,
} from 'lucide-react';
import type { Contract, PaymentSchedule, Payment, ContractStatus, PaymentStatus } from '@/types';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface ContractWithDetails extends Contract {
  schedules: PaymentSchedule[];
  payments: Payment[];
}

const statusColors: Record<ContractStatus, string> = {
  ACTIVE: 'bg-green-500/20 text-green-400 border-green-500/30',
  COMPLETED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  DEFAULT: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const paymentStatusColors: Record<PaymentStatus, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400',
  PAID: 'bg-green-500/20 text-green-400',
  OVERDUE: 'bg-red-500/20 text-red-400',
};

const paymentStatusIcons: Record<PaymentStatus, React.ReactNode> = {
  PENDING: <Clock className="w-4 h-4" />,
  PAID: <CheckCircle className="w-4 h-4" />,
  OVERDUE: <AlertCircle className="w-4 h-4" />,
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(amount);
}

function ContractDetailContent() {
  const params = useParams();
  const contractId = params.id as string;
  
  const [contract, setContract] = useState<ContractWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [reminderResult, setReminderResult] = useState<{ success: boolean; message: string } | null>(null);

  const sendReminder = async (type: 'payment_reminder' | 'overdue_alert') => {
    setIsSendingReminder(true);
    setReminderResult(null);

    try {
      const response = await fetch('/api/notifications/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId, type }),
      });

      const data = await response.json();
      if (data.success) {
        setReminderResult({ success: true, message: data.message });
      } else {
        setReminderResult({ success: false, message: data.error || 'Failed to send reminder' });
      }
    } catch (err) {
      console.error('Failed to send reminder:', err);
      setReminderResult({ success: false, message: 'Failed to send reminder' });
    } finally {
      setIsSendingReminder(false);
    }
  };

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const response = await fetch(`/api/contracts/${contractId}`, {
          headers: {
            'x-line-userid': 'web-admin',
          },
        });
        const data = await response.json();
        
        if (!data.success) {
          setError(data.error || 'Failed to load contract');
          return;
        }
        
        setContract(data.data);
      } catch (err) {
        console.error('Failed to fetch contract:', err);
        setError('Failed to load contract');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContract();
  }, [contractId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="p-6">
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400">{error || 'Contract not found'}</p>
            <Link href="/web-admin/contracts">
              <Button variant="outline" className="mt-4 border-slate-600">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Contracts
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const paidInstallments = contract.schedules.filter(s => s.status === 'PAID').length;
  const totalInstallments = contract.schedules.length;
  const progressPercent = totalInstallments > 0 ? (paidInstallments / totalInstallments) * 100 : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <Link href="/web-admin/contracts">
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Contracts
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white">Contract {contract.id}</h1>
          <Badge className={statusColors[contract.status]}>
            {contract.status}
          </Badge>
          {contract.daysOverdue > 0 && (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
              {contract.daysOverdue} days overdue
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Customer Info */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <User className="w-5 h-5 text-green-400" />
              Customer Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xl font-semibold text-white">{contract.customerName}</p>
              <p className="text-slate-400">{contract.customerPhone}</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                onClick={() => window.open(`tel:${contract.customerPhone}`)}
              >
                <Phone className="w-4 h-4 mr-2" />
                Call
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-green-500/30 text-green-400 hover:bg-green-500/20"
                onClick={() => setReminderDialogOpen(true)}
              >
                <Bell className="w-4 h-4 mr-2" />
                Send Reminder
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loan Details */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <DollarSign className="w-5 h-5 text-green-400" />
              Loan Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Approved Amount</p>
                <p className="text-white font-semibold">{formatCurrency(contract.approvedAmount)}</p>
              </div>
              <div>
                <p className="text-slate-400">Interest Rate</p>
                <p className="text-white font-semibold">{contract.interestRate}% / month</p>
              </div>
              <div>
                <p className="text-slate-400">Term</p>
                <p className="text-white font-semibold">{contract.termMonths} months</p>
              </div>
              <div>
                <p className="text-slate-400">Monthly Payment</p>
                <p className="text-white font-semibold">{formatCurrency(contract.monthlyPayment)}</p>
              </div>
              <div>
                <p className="text-slate-400">Payment Day</p>
                <p className="text-white font-semibold">Day {contract.paymentDay}</p>
              </div>
              <div>
                <p className="text-slate-400">Start Date</p>
                <p className="text-white font-semibold">
                  {format(new Date(contract.startDate), 'PP', { locale: th })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Overview */}
        <Card className="bg-slate-800/50 border-slate-700 md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Calendar className="w-5 h-5 text-green-400" />
              Payment Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Total Paid</p>
                <p className="text-2xl font-bold text-green-400">{formatCurrency(contract.totalPaid)}</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Outstanding</p>
                <p className={`text-2xl font-bold ${contract.daysOverdue > 0 ? 'text-red-400' : 'text-white'}`}>
                  {formatCurrency(contract.outstandingBalance)}
                </p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Installments Paid</p>
                <p className="text-2xl font-bold text-white">{paidInstallments} / {totalInstallments}</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Days Overdue</p>
                <p className={`text-2xl font-bold ${contract.daysOverdue > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {contract.daysOverdue}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Progress</span>
                <span className="text-white">{progressPercent.toFixed(0)}% complete</span>
              </div>
              <Progress value={progressPercent} className="h-3 bg-slate-700" />
            </div>
          </CardContent>
        </Card>

        {/* Payment Schedule */}
        <Card className="bg-slate-800/50 border-slate-700 md:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Calendar className="w-5 h-5 text-green-400" />
              Payment Schedule
            </CardTitle>
            <Link href={`/web-admin/payments/record?contractId=${contract.id}`}>
              <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Record Payment
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-2 text-slate-400 font-medium">#</th>
                    <th className="text-left py-3 px-2 text-slate-400 font-medium">Due Date</th>
                    <th className="text-right py-3 px-2 text-slate-400 font-medium">Principal</th>
                    <th className="text-right py-3 px-2 text-slate-400 font-medium">Interest</th>
                    <th className="text-right py-3 px-2 text-slate-400 font-medium">Total</th>
                    <th className="text-center py-3 px-2 text-slate-400 font-medium">Status</th>
                    <th className="text-left py-3 px-2 text-slate-400 font-medium">Paid Date</th>
                  </tr>
                </thead>
                <tbody>
                  {contract.schedules.map((schedule) => (
                    <tr key={schedule.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="py-3 px-2 text-slate-300">{schedule.installmentNumber}</td>
                      <td className="py-3 px-2 text-white">
                        {format(new Date(schedule.dueDate), 'PP', { locale: th })}
                      </td>
                      <td className="py-3 px-2 text-right text-slate-300">
                        {formatCurrency(schedule.principalAmount)}
                      </td>
                      <td className="py-3 px-2 text-right text-slate-300">
                        {formatCurrency(schedule.interestAmount)}
                      </td>
                      <td className="py-3 px-2 text-right text-white font-medium">
                        {formatCurrency(schedule.totalAmount)}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Badge className={`${paymentStatusColors[schedule.status]} gap-1`}>
                          {paymentStatusIcons[schedule.status]}
                          {schedule.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-slate-400">
                        {schedule.paidAt 
                          ? format(new Date(schedule.paidAt), 'PP', { locale: th })
                          : '-'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card className="bg-slate-800/50 border-slate-700 md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <FileText className="w-5 h-5 text-green-400" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contract.payments.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No payments recorded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {contract.payments
                  .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
                  .map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          payment.verificationStatus === 'VERIFIED' 
                            ? 'bg-green-500/20' 
                            : payment.verificationStatus === 'REJECTED'
                            ? 'bg-red-500/20'
                            : 'bg-yellow-500/20'
                        }`}>
                          {payment.verificationStatus === 'VERIFIED' ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : payment.verificationStatus === 'REJECTED' ? (
                            <AlertCircle className="w-5 h-5 text-red-400" />
                          ) : (
                            <Clock className="w-5 h-5 text-yellow-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {formatCurrency(payment.amount)}
                          </p>
                          <p className="text-slate-400 text-sm">
                            {format(new Date(payment.paymentDate), 'PPP', { locale: th })} • {payment.paymentMethod}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={
                          payment.verificationStatus === 'VERIFIED'
                            ? 'bg-green-500/20 text-green-400'
                            : payment.verificationStatus === 'REJECTED'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }>
                          {payment.verificationStatus}
                        </Badge>
                        {payment.slipImageUrl && (
                          <a
                            href={payment.slipImageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-green-400 flex items-center gap-1 mt-1 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View Slip
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Send Reminder Dialog */}
      <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-green-400" />
              Send Reminder
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Send a LINE notification to {contract.customerName}
            </DialogDescription>
          </DialogHeader>

          {reminderResult ? (
            <div className={`p-4 rounded-lg flex items-center gap-3 ${
              reminderResult.success 
                ? 'bg-green-500/10 border border-green-500/30' 
                : 'bg-red-500/10 border border-red-500/30'
            }`}>
              {reminderResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
              <p className={reminderResult.success ? 'text-green-400' : 'text-red-400'}>
                {reminderResult.message}
              </p>
            </div>
          ) : (
            <div className="space-y-3 py-4">
              <Button
                className="w-full justify-start gap-3 bg-slate-700 hover:bg-slate-600 text-white"
                onClick={() => sendReminder('payment_reminder')}
                disabled={isSendingReminder}
              >
                {isSendingReminder ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Clock className="w-5 h-5 text-yellow-400" />
                )}
                <div className="text-left">
                  <p className="font-medium">Payment Reminder</p>
                  <p className="text-xs text-slate-400">Remind about upcoming payment</p>
                </div>
              </Button>

              {contract.daysOverdue > 0 && (
                <Button
                  className="w-full justify-start gap-3 bg-slate-700 hover:bg-slate-600 text-white"
                  onClick={() => sendReminder('overdue_alert')}
                  disabled={isSendingReminder}
                >
                  {isSendingReminder ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                  <div className="text-left">
                    <p className="font-medium">Overdue Alert</p>
                    <p className="text-xs text-slate-400">Alert about overdue payment ({contract.daysOverdue} days)</p>
                  </div>
                </Button>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReminderDialogOpen(false);
                setReminderResult(null);
              }}
              className="border-slate-600 text-slate-300"
            >
              {reminderResult ? 'Close' : 'Cancel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function WebAdminContractDetailPage() {
  return (
    <WebAdminGuard>
      <WebAdminNavigation>
        <ContractDetailContent />
      </WebAdminNavigation>
    </WebAdminGuard>
  );
}

