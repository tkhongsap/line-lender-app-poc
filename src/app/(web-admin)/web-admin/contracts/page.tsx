'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { WebAdminGuard } from '@/components/web-admin/WebAdminGuard';
import { WebAdminNavigation } from '@/components/web-admin/WebAdminNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Eye, FileText, Search, AlertCircle } from 'lucide-react';
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

function ContractsContent() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
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
    if (filter === 'overdue' && contract.daysOverdue === 0) return false;
    if (filter !== 'all' && filter !== 'overdue' && contract.status !== filter) return false;
    
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

  // Sort by overdue days (most overdue first) for overdue filter
  const sortedContracts = filter === 'overdue' 
    ? [...filteredContracts].sort((a, b) => b.daysOverdue - a.daysOverdue)
    : filteredContracts;

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
          <h1 className="text-2xl font-bold text-white">Contracts</h1>
          <p className="text-slate-400 mt-1">
            {sortedContracts.length} contracts found
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name, ID, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'All' },
          { key: 'ACTIVE', label: 'Active' },
          { key: 'overdue', label: 'Overdue' },
          { key: 'COMPLETED', label: 'Completed' },
          { key: 'DEFAULT', label: 'Default' },
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
            {key === 'overdue' && contracts.filter(c => c.daysOverdue > 0).length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-red-500/30 text-red-300">
                {contracts.filter(c => c.daysOverdue > 0).length}
              </span>
            )}
          </Button>
        ))}
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
                        <span className="font-mono text-sm text-slate-400">{contract.id}</span>
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
                      <p className="text-lg font-semibold text-white">{contract.customerName}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-400 flex-wrap">
                        <span>{contract.customerPhone}</span>
                        <span>
                          {new Intl.NumberFormat('th-TH', {
                            style: 'currency',
                            currency: 'THB',
                          }).format(contract.approvedAmount)}
                        </span>
                        <span className={getOverdueColor(contract.daysOverdue)}>
                          Outstanding: {new Intl.NumberFormat('th-TH', {
                            style: 'currency',
                            currency: 'THB',
                          }).format(contract.outstandingBalance)}
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

