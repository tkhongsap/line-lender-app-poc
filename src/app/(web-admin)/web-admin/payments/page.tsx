'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { WebAdminGuard } from '@/components/web-admin/WebAdminGuard';
import { WebAdminNavigation } from '@/components/web-admin/WebAdminNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Loader2,
  Eye,
  DollarSign,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react';
import type { Payment } from '@/types';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

const statusColors: Record<VerificationStatus, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  VERIFIED: 'bg-green-500/20 text-green-400 border-green-500/30',
  REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const statusIcons: Record<VerificationStatus, React.ReactNode> = {
  PENDING: <Clock className="w-4 h-4" />,
  VERIFIED: <CheckCircle className="w-4 h-4" />,
  REJECTED: <XCircle className="w-4 h-4" />,
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(amount);
}

function PaymentsContent() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch('/api/payments', {
          headers: {
            'x-line-userid': 'web-admin',
          },
        });
        const data = await response.json();
        // Sort by date descending
        const sortedPayments = (data.data || []).sort(
          (a: Payment, b: Payment) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setPayments(sortedPayments);
      } catch (error) {
        console.error('Failed to fetch payments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const filteredPayments = payments.filter((payment) => {
    // Status filter
    if (filter !== 'all' && payment.verificationStatus !== filter) return false;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        payment.id.toLowerCase().includes(term) ||
        payment.contractId.toLowerCase().includes(term)
      );
    }

    return true;
  });

  const pendingCount = payments.filter((p) => p.verificationStatus === 'PENDING').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Payments</h1>
          <p className="text-slate-400 mt-1">{filteredPayments.length} payments found</p>
        </div>
        <div className="flex gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by ID or contract..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
          <Link href="/web-admin/payments/record">
            <Button className="bg-green-500 hover:bg-green-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Record
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'All' },
          { key: 'PENDING', label: 'Pending' },
          { key: 'VERIFIED', label: 'Verified' },
          { key: 'REJECTED', label: 'Rejected' },
        ].map(({ key, label }) => (
          <Button
            key={key}
            size="sm"
            variant={filter === key ? 'default' : 'outline'}
            onClick={() => setFilter(key)}
            className={
              filter === key
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'border-slate-600 text-slate-300 hover:bg-slate-700'
            }
          >
            {label}
            {key === 'PENDING' && pendingCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-yellow-500/30 text-yellow-300">
                {pendingCount}
              </span>
            )}
          </Button>
        ))}
      </div>

      {filteredPayments.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="py-12 text-center">
            <DollarSign className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">No payments found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <Card
              key={payment.id}
              className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-sm text-slate-400">{payment.id}</span>
                      <Badge className={`gap-1 ${statusColors[payment.verificationStatus]}`}>
                        {statusIcons[payment.verificationStatus]}
                        {payment.verificationStatus}
                      </Badge>
                      {payment.slipImageUrl && (
                        <Badge variant="outline" className="border-slate-600 text-slate-400 gap-1">
                          <ImageIcon className="w-3 h-3" />
                          Has Slip
                        </Badge>
                      )}
                    </div>
                    <p className="text-xl font-bold text-white">{formatCurrency(payment.amount)}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-400 flex-wrap">
                      <span>Contract: {payment.contractId}</span>
                      <span>{payment.paymentMethod}</span>
                      <span>
                        {format(new Date(payment.paymentDate), 'PP', { locale: th })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {payment.slipImageUrl && (
                      <a
                        href={payment.slipImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Slip
                        </Button>
                      </a>
                    )}
                    <Link href={`/web-admin/contracts/${payment.contractId}`}>
                      <Button
                        size="sm"
                        className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Contract
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function WebAdminPaymentsPage() {
  return (
    <WebAdminGuard>
      <WebAdminNavigation>
        <PaymentsContent />
      </WebAdminNavigation>
    </WebAdminGuard>
  );
}

