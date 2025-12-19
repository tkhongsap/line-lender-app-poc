'use client';

import { useEffect, useState } from 'react';
import { useLiffContext } from '@/components/liff/LiffProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { FileText, Calendar, DollarSign, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import type { Contract } from '@/types';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'ใช้งาน', color: 'bg-green-100 text-green-700' },
  COMPLETED: { label: 'ปิดสัญญา', color: 'bg-gray-100 text-gray-700' },
  DEFAULT: { label: 'ผิดนัด', color: 'bg-red-100 text-red-700' },
};

export default function ContractsPage() {
  const liff = useLiffContext();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContracts = async () => {
      if (!liff.user?.userId) return;

      try {
        const response = await fetch(`/api/contracts?lineUserId=${liff.user.userId}`, {
          headers: {
            'x-line-userid': liff.user.userId,
          },
        });
        const result = await response.json();
        if (result.success) {
          setContracts(result.data);
        }
      } catch (error) {
        console.error('Error fetching contracts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContracts();
  }, [liff.user?.userId]);

  if (isLoading) {
    return (
      <div className="container max-w-lg mx-auto py-6 px-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-lg mx-auto py-6 px-4">
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
          <CardTitle>สัญญาสินเชื่อของฉัน</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {contracts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>ยังไม่มีสัญญาสินเชื่อ</p>
            </div>
          ) : (
            <div className="space-y-4">
              {contracts.map((contract) => {
                const status = STATUS_CONFIG[contract.status] || STATUS_CONFIG.ACTIVE;
                const progress = (contract.totalPaid / contract.totalDue) * 100;

                return (
                  <Link
                    key={contract.id}
                    href={`/payment?contractId=${contract.id}`}
                    className="block"
                  >
                    <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-semibold text-gray-800">{contract.id}</span>
                        <Badge className={status.color}>{status.label}</Badge>
                      </div>

                      {contract.daysOverdue > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-2 mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span className="text-red-600 text-sm font-medium">
                            ค้างชำระ {contract.daysOverdue} วัน
                          </span>
                        </div>
                      )}

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            วงเงิน:
                          </span>
                          <span className="font-medium">฿{contract.approvedAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>ยอดคงเหลือ:</span>
                          <span className="font-medium text-emerald-600">
                            ฿{(contract.totalDue - contract.totalPaid).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>ผ่อนต่อเดือน:</span>
                          <span className="font-medium">฿{contract.monthlyPayment.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            ครบกำหนด:
                          </span>
                          <span>วันที่ {contract.paymentDay} ของเดือน</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">ความคืบหน้า</span>
                          <span className="text-gray-600">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

