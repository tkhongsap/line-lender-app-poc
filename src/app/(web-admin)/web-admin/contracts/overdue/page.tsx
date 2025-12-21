'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { WebAdminGuard } from '@/components/web-admin/WebAdminGuard';
import { WebAdminNavigation } from '@/components/web-admin/WebAdminNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Eye, AlertTriangle, Phone, Bell, ArrowLeft, CheckCircle, AlertCircle, Clock, Send } from 'lucide-react';
import type { Contract } from '@/types';

function getSeverity(daysOverdue: number): { color: string; label: string; bgColor: string } {
  if (daysOverdue <= 7) {
    return { 
      color: 'text-yellow-400', 
      label: '1-7 days', 
      bgColor: 'bg-yellow-500/20 border-yellow-500/30' 
    };
  }
  if (daysOverdue <= 30) {
    return { 
      color: 'text-orange-400', 
      label: '8-30 days', 
      bgColor: 'bg-orange-500/20 border-orange-500/30' 
    };
  }
  if (daysOverdue <= 60) {
    return { 
      color: 'text-red-400', 
      label: '31-60 days', 
      bgColor: 'bg-red-500/20 border-red-500/30' 
    };
  }
  return { 
    color: 'text-red-500', 
    label: '60+ days', 
    bgColor: 'bg-red-600/20 border-red-600/30' 
  };
}

function OverdueContractsContent() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [reminderResult, setReminderResult] = useState<{ success: boolean; message: string } | null>(null);
  
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ sent: number; failed: number; total: number } | null>(null);
  const [isBulkSending, setIsBulkSending] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = (contracts: Contract[]) => {
    if (selectedIds.size === contracts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(contracts.map(c => c.id)));
    }
  };

  const sendBulkReminders = async (type: 'payment_reminder' | 'overdue_alert') => {
    const selectedContracts = contracts.filter(c => selectedIds.has(c.id));
    if (selectedContracts.length === 0) return;

    setIsBulkSending(true);
    setBulkProgress({ sent: 0, failed: 0, total: selectedContracts.length });

    let sent = 0;
    let failed = 0;

    for (const contract of selectedContracts) {
      try {
        const response = await fetch('/api/notifications/send-reminder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contractId: contract.id, type }),
        });

        const data = await response.json();
        if (data.success) {
          sent++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
      setBulkProgress({ sent, failed, total: selectedContracts.length });
    }

    setIsBulkSending(false);
  };

  const openReminderDialog = (contract: Contract) => {
    setSelectedContract(contract);
    setReminderResult(null);
    setReminderDialogOpen(true);
  };

  const sendReminder = async (type: 'payment_reminder' | 'overdue_alert') => {
    if (!selectedContract) return;
    
    setIsSendingReminder(true);
    setReminderResult(null);

    try {
      const response = await fetch('/api/notifications/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId: selectedContract.id, type }),
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
    const fetchContracts = async () => {
      try {
        const response = await fetch('/api/contracts?overdue=true', {
          headers: {
            'x-line-userid': 'web-admin',
          },
        });
        const data = await response.json();
        // Sort by days overdue descending
        const sortedContracts = (data.data || []).sort(
          (a: Contract, b: Contract) => b.daysOverdue - a.daysOverdue
        );
        setContracts(sortedContracts);
      } catch (error) {
        console.error('Failed to fetch contracts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContracts();
  }, []);

  const filteredContracts = contracts.filter((contract) => {
    if (severityFilter === 'all') return true;
    if (severityFilter === '1-7' && contract.daysOverdue >= 1 && contract.daysOverdue <= 7) return true;
    if (severityFilter === '8-30' && contract.daysOverdue >= 8 && contract.daysOverdue <= 30) return true;
    if (severityFilter === '31-60' && contract.daysOverdue >= 31 && contract.daysOverdue <= 60) return true;
    if (severityFilter === '60+' && contract.daysOverdue > 60) return true;
    return false;
  });

  const totalOverdueAmount = filteredContracts.reduce(
    (sum, c) => sum + c.outstandingBalance,
    0
  );

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
        <Link href="/web-admin/contracts">
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Contracts
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <h1 className="text-2xl font-bold text-white">Overdue Contracts</h1>
          </div>
          <p className="text-slate-400 mt-1">
            {filteredContracts.length} overdue contracts • Total: {new Intl.NumberFormat('th-TH', {
              style: 'currency',
              currency: 'THB',
            }).format(totalOverdueAmount)}
          </p>
        </div>
        {filteredContracts.length > 0 && (
          <Button
            onClick={() => setBulkDialogOpen(true)}
            disabled={selectedIds.size === 0}
            className="bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
          >
            <Send className="w-4 h-4 mr-2" />
            Send to Selected ({selectedIds.size})
          </Button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'All Overdue' },
          { key: '1-7', label: '1-7 days', color: 'yellow' },
          { key: '8-30', label: '8-30 days', color: 'orange' },
          { key: '31-60', label: '31-60 days', color: 'red' },
          { key: '60+', label: '60+ days', color: 'red' },
        ].map(({ key, label }) => (
          <Button
            key={key}
            size="sm"
            variant={severityFilter === key ? 'default' : 'outline'}
            onClick={() => setSeverityFilter(key)}
            className={
              severityFilter === key
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'border-slate-600 text-slate-300 hover:bg-slate-700'
            }
          >
            {label}
          </Button>
        ))}
      </div>

      {filteredContracts.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="py-12 text-center">
            <AlertTriangle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">No overdue contracts found</p>
            <p className="text-slate-500 text-sm mt-1">Great news! All payments are on time.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Select All Row */}
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/30 rounded-lg border border-slate-700">
            <Checkbox
              id="select-all"
              checked={selectedIds.size === filteredContracts.length && filteredContracts.length > 0}
              onCheckedChange={() => toggleSelectAll(filteredContracts)}
              className="border-slate-500 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
            />
            <label htmlFor="select-all" className="text-sm text-slate-400 cursor-pointer">
              Select All ({filteredContracts.length})
            </label>
          </div>

          {filteredContracts.map((contract) => {
            const severity = getSeverity(contract.daysOverdue);
            const isSelected = selectedIds.has(contract.id);
            return (
              <Card key={contract.id} className={`${severity.bgColor} border transition-colors ${isSelected ? 'ring-2 ring-red-500/50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelect(contract.id)}
                        className="mt-1 border-slate-500 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-mono text-sm text-slate-400">{contract.id}</span>
                          <Badge className={`${severity.bgColor} ${severity.color}`}>
                            {contract.daysOverdue} days overdue
                          </Badge>
                        </div>
                        <p className="text-lg font-semibold text-white">{contract.customerName}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-400 flex-wrap">
                          <span>{contract.customerPhone}</span>
                          <span className={severity.color}>
                            Outstanding: {new Intl.NumberFormat('th-TH', {
                              style: 'currency',
                              currency: 'THB',
                            }).format(contract.outstandingBalance)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-7 sm:ml-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        onClick={() => window.open(`tel:${contract.customerPhone}`)}
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                        title="Send overdue reminder"
                        onClick={() => openReminderDialog(contract)}
                      >
                        <Bell className="w-4 h-4" />
                      </Button>
                      <Link href={`/web-admin/contracts/${contract.id}`}>
                        <Button
                          size="sm"
                          className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Send Reminder Dialog */}
      <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-red-400" />
              Send Overdue Reminder
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedContract && `Send a LINE notification to ${selectedContract.customerName}`}
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
                  <p className="text-xs text-slate-400">Send general payment reminder</p>
                </div>
              </Button>

              <Button
                className="w-full justify-start gap-3 bg-red-500/20 hover:bg-red-500/30 text-white border border-red-500/30"
                onClick={() => sendReminder('overdue_alert')}
                disabled={isSendingReminder}
              >
                {isSendingReminder ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                )}
                <div className="text-left">
                  <p className="font-medium">Overdue Alert</p>
                  <p className="text-xs text-slate-400">
                    Alert about overdue payment ({selectedContract?.daysOverdue} days)
                  </p>
                </div>
              </Button>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReminderDialogOpen(false);
                setReminderResult(null);
                setSelectedContract(null);
              }}
              className="border-slate-600 text-slate-300"
            >
              {reminderResult ? 'Close' : 'Cancel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Reminder Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-red-400" />
              Send Bulk Reminders
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Send reminders to {selectedIds.size} selected contracts
            </DialogDescription>
          </DialogHeader>

          {bulkProgress ? (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Progress</span>
                <span className="text-white">
                  {bulkProgress.sent + bulkProgress.failed} / {bulkProgress.total}
                </span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-red-500 rounded-full transition-all"
                  style={{ width: `${((bulkProgress.sent + bulkProgress.failed) / bulkProgress.total) * 100}%` }}
                />
              </div>
              <div className="flex gap-4 text-sm">
                <span className="text-green-400">✓ Sent: {bulkProgress.sent}</span>
                <span className="text-red-400">✗ Failed: {bulkProgress.failed}</span>
              </div>
              {!isBulkSending && (
                <div className={`p-3 rounded-lg ${
                  bulkProgress.failed === 0 ? 'bg-green-500/10 border border-green-500/30' : 'bg-yellow-500/10 border border-yellow-500/30'
                }`}>
                  <p className={bulkProgress.failed === 0 ? 'text-green-400' : 'text-yellow-400'}>
                    {bulkProgress.failed === 0 
                      ? `Successfully sent ${bulkProgress.sent} reminders!`
                      : `Sent ${bulkProgress.sent} reminders, ${bulkProgress.failed} failed.`
                    }
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 py-4">
              <Button
                className="w-full justify-start gap-3 bg-slate-700 hover:bg-slate-600 text-white"
                onClick={() => sendBulkReminders('payment_reminder')}
                disabled={isBulkSending}
              >
                <Clock className="w-5 h-5 text-yellow-400" />
                <div className="text-left">
                  <p className="font-medium">Payment Reminder</p>
                  <p className="text-xs text-slate-400">Send general payment reminder to all selected</p>
                </div>
              </Button>

              <Button
                className="w-full justify-start gap-3 bg-red-500/20 hover:bg-red-500/30 text-white border border-red-500/30"
                onClick={() => sendBulkReminders('overdue_alert')}
                disabled={isBulkSending}
              >
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <div className="text-left">
                  <p className="font-medium">Overdue Alert</p>
                  <p className="text-xs text-slate-400">Alert about overdue payment to all selected</p>
                </div>
              </Button>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setBulkDialogOpen(false);
                setBulkProgress(null);
                if (!isBulkSending) {
                  setSelectedIds(new Set());
                }
              }}
              disabled={isBulkSending}
              className="border-slate-600 text-slate-300"
            >
              {bulkProgress && !isBulkSending ? 'Done' : 'Cancel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function WebAdminOverdueContractsPage() {
  return (
    <WebAdminGuard>
      <WebAdminNavigation>
        <OverdueContractsContent />
      </WebAdminNavigation>
    </WebAdminGuard>
  );
}

