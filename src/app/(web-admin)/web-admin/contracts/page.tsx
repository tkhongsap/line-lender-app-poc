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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Eye, FileText, Search, AlertCircle, ArrowUpDown, Download } from 'lucide-react';
import { format } from 'date-fns';
import type { Contract, ContractStatus } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';

const statusColors: Record<ContractStatus, string> = {
  ACTIVE: 'bg-green-500/20 text-green-400 border-green-500/30',
  COMPLETED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  DEFAULT: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const statusLabels: Record<ContractStatus, string> = {
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  DEFAULT: 'Default',
};

function getOverdueColor(daysOverdue: number): string {
  if (daysOverdue === 0) return 'text-green-400';
  if (daysOverdue <= 7) return 'text-yellow-400';
  if (daysOverdue <= 30) return 'text-orange-400';
  return 'text-red-400';
}

function getOverdueBadge(daysOverdue: number): { color: string; label: string } | null {
  if (daysOverdue === 0) return null;
  if (daysOverdue <= 7) return { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: `${daysOverdue}d overdue` };
  if (daysOverdue <= 30) return { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', label: `${daysOverdue}d overdue` };
  return { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: `${daysOverdue}d overdue` };
}

type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'overdue-desc';

function ContractsContent() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [overdueFilter, setOverdueFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await fetch('/api/contracts', {
          headers: {
            'x-line-userid': 'web-admin',
          },
        });
        const data = await response.json();
        setContracts(data.data || []);
      } catch (error) {
        console.error('Failed to fetch contracts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContracts();
  }, []);

  const filteredContracts = contracts.filter((contract) => {
    // Status filter
    if (statusFilter !== 'all' && contract.status !== statusFilter) return false;
    
    // Overdue bucket filter
    if (overdueFilter !== 'all') {
      if (overdueFilter === 'current' && contract.daysOverdue !== 0) return false;
      if (overdueFilter === '1-7' && (contract.daysOverdue < 1 || contract.daysOverdue > 7)) return false;
      if (overdueFilter === '8-30' && (contract.daysOverdue < 8 || contract.daysOverdue > 30)) return false;
      if (overdueFilter === '31-60' && (contract.daysOverdue < 31 || contract.daysOverdue > 60)) return false;
      if (overdueFilter === '60+' && contract.daysOverdue <= 60) return false;
    }
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        contract.id.toLowerCase().includes(term) ||
        contract.customerName.toLowerCase().includes(term) ||
        contract.customerPhone.includes(term)
      );
    }
    
    return true;
  });

  // Sort contracts based on selected sort option
  const sortedContracts = [...filteredContracts].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      case 'date-asc':
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      case 'amount-desc':
        return b.approvedAmount - a.approvedAmount;
      case 'amount-asc':
        return a.approvedAmount - b.approvedAmount;
      case 'overdue-desc':
        return b.daysOverdue - a.daysOverdue;
      default:
        return 0;
    }
  });

  const exportToCSV = () => {
    if (sortedContracts.length === 0) return;

    const headers = ['Contract ID', 'Customer Name', 'Phone', 'Amount', 'Interest Rate', 'Term', 'Start Date', 'End Date', 'Outstanding', 'Days Overdue', 'Status'];
    const rows = sortedContracts.map(c => [
      c.id,
      c.customerName,
      c.customerPhone,
      c.approvedAmount,
      `${c.interestRate}%`,
      `${c.termMonths} months`,
      c.startDate,
      c.endDate,
      c.outstandingBalance,
      c.daysOverdue,
      c.status,
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contracts-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Contracts</h1>
          <p className="text-slate-400 mt-1">
            {sortedContracts.length} contracts found
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name, ID, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
          <Button
            variant="outline"
            onClick={exportToCSV}
            disabled={sortedContracts.length === 0}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 shrink-0"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'All' },
          { key: 'ACTIVE', label: 'Active' },
          { key: 'COMPLETED', label: 'Completed' },
          { key: 'DEFAULT', label: 'Default' },
        ].map(({ key, label }) => (
          <Button
            key={key}
            size="sm"
            variant={statusFilter === key ? 'default' : 'outline'}
            onClick={() => setStatusFilter(key)}
            className={
              statusFilter === key
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'border-slate-600 text-slate-300 hover:bg-slate-700'
            }
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Overdue Bucket Filters & Sort */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2 flex-wrap">
          <span className="text-slate-400 text-sm flex items-center">Overdue:</span>
          {[
            { key: 'all', label: 'All', count: contracts.length },
            { key: 'current', label: 'Current', color: 'green' },
            { key: '1-7', label: '1-7d', color: 'yellow' },
            { key: '8-30', label: '8-30d', color: 'orange' },
            { key: '31-60', label: '31-60d', color: 'red' },
            { key: '60+', label: '60+d', color: 'red' },
          ].map(({ key, label, color }) => {
            let count = 0;
            if (key === 'all') count = contracts.length;
            else if (key === 'current') count = contracts.filter(c => c.daysOverdue === 0).length;
            else if (key === '1-7') count = contracts.filter(c => c.daysOverdue >= 1 && c.daysOverdue <= 7).length;
            else if (key === '8-30') count = contracts.filter(c => c.daysOverdue >= 8 && c.daysOverdue <= 30).length;
            else if (key === '31-60') count = contracts.filter(c => c.daysOverdue >= 31 && c.daysOverdue <= 60).length;
            else if (key === '60+') count = contracts.filter(c => c.daysOverdue > 60).length;

            return (
              <Button
                key={key}
                size="sm"
                variant={overdueFilter === key ? 'default' : 'outline'}
                onClick={() => setOverdueFilter(key)}
                className={
                  overdueFilter === key
                    ? `bg-${color || 'green'}-500 hover:bg-${color || 'green'}-600 text-white`
                    : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                }
              >
                {label}
                {count > 0 && key !== 'all' && (
                  <span className="ml-1 text-xs opacity-70">({count})</span>
                )}
              </Button>
            );
          })}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 ml-auto">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-44 bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="date-desc" className="text-white">Date (Newest)</SelectItem>
              <SelectItem value="date-asc" className="text-white">Date (Oldest)</SelectItem>
              <SelectItem value="amount-desc" className="text-white">Amount (High-Low)</SelectItem>
              <SelectItem value="amount-asc" className="text-white">Amount (Low-High)</SelectItem>
              <SelectItem value="overdue-desc" className="text-white">Days Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {sortedContracts.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">No contracts found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedContracts.map((contract) => {
            const overdueBadge = getOverdueBadge(contract.daysOverdue);
            return (
              <Card key={contract.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-sm text-slate-400 truncate max-w-[100px] sm:max-w-none">{contract.id}</span>
                        <Badge className={statusColors[contract.status]}>
                          {statusLabels[contract.status]}
                        </Badge>
                        {overdueBadge && (
                          <Badge className={overdueBadge.color}>
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {overdueBadge.label}
                          </Badge>
                        )}
                      </div>
                      <p className="text-lg font-semibold text-white truncate max-w-[200px] sm:max-w-none">{contract.customerName}</p>
                      <div className="grid grid-cols-1 sm:flex sm:items-center gap-1 sm:gap-4 text-sm text-slate-400">
                        <span className="flex justify-between sm:block">
                          <span className="sm:hidden text-slate-500">Phone:</span>
                          {contract.customerPhone}
                        </span>
                        <span className="flex justify-between sm:block">
                          <span className="sm:hidden text-slate-500">Amount:</span>
                          {new Intl.NumberFormat('th-TH', {
                            style: 'currency',
                            currency: 'THB',
                          }).format(contract.approvedAmount)}
                        </span>
                        <span className={`flex justify-between sm:block ${getOverdueColor(contract.daysOverdue)}`}>
                          <span className="sm:hidden text-slate-500">Outstanding:</span>
                          <span>{new Intl.NumberFormat('th-TH', {
                            style: 'currency',
                            currency: 'THB',
                          }).format(contract.outstandingBalance)}</span>
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        Started {formatDistanceToNow(new Date(contract.startDate), {
                          addSuffix: true,
                          locale: th,
                        })} • {contract.termMonths} months at {contract.interestRate}%/month
                      </div>
                    </div>
                    <Link href={`/web-admin/contracts/${contract.id}`}>
                      <Button
                        size="sm"
                        className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function WebAdminContractsPage() {
  return (
    <WebAdminGuard>
      <WebAdminNavigation>
        <ContractsContent />
      </WebAdminNavigation>
    </WebAdminGuard>
  );
}

