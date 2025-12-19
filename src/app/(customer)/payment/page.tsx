'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLiffContext } from '@/components/liff/LiffProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  CreditCard,
  Upload
} from 'lucide-react';
import Link from 'next/link';
import type { Contract, PaymentSchedule } from '@/types';

const SCHEDULE_STATUS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: 'รอชำระ', color: 'bg-gray-100 text-gray-700', icon: <Clock className="w-4 h-4" /> },
  PAID: { label: 'ชำระแล้ว', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-4 h-4" /> },
  OVERDUE: { label: 'เกินกำหนด', color: 'bg-red-100 text-red-700', icon: <AlertTriangle className="w-4 h-4" /> },
};

interface ContractWithSchedules extends Contract {
  schedules: PaymentSchedule[];
}

export default function PaymentPage() {
  const liff = useLiffContext();
  const searchParams = useSearchParams();
  const contractId = searchParams.get('contractId');

  const [contracts, setContracts] = useState<ContractWithSchedules[]>([]);
  const [selectedContract, setSelectedContract] = useState<ContractWithSchedules | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContracts = async () => {
      if (!liff.user?.userId) return;

      try {
        const response = await fetch(`/api/contracts?lineUserId=${liff.user.userId}&includeSchedules=true`, {
          headers: {
            'x-line-userid': liff.user.userId,
          },
        });
        const result = await response.json();
        if (result.success) {
          setContracts(result.data);
          
          // Auto-select if contractId provided
          if (contractId) {
            const found = result.data.find((c: Contract) => c.id === contractId);
            if (found) setSelectedContract(found);
          } else if (result.data.length === 1) {
            setSelectedContract(result.data[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching contracts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContracts();
  }, [liff.user?.userId, contractId]);

  if (isLoading) {
    return (
      <div className="container max-w-lg mx-auto py-6 px-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeContracts = contracts.filter(c => c.status === 'ACTIVE');

  return (
    <div className="container max-w-lg mx-auto py-6 px-4 pb-24">
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            ยอดค้างชำระ
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {activeContracts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>ไม่มียอดค้างชำระ</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Contract Selector (if multiple) */}
              {activeContracts.length > 1 && !selectedContract && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">เลือกสัญญา:</p>
                  {activeContracts.map((contract) => (
                    <button
                      key={contract.id}
                      onClick={() => setSelectedContract(contract)}
                      className="w-full p-3 border rounded-lg text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">{contract.id}</span>
                        <span className="text-emerald-600">
                          ฿{contract.outstandingBalance.toLocaleString()}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Selected Contract Details */}
              {(selectedContract || activeContracts.length === 1) && (
                <>
                  {/* Summary */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-4">
                    <div className="text-center mb-4">
                      <p className="text-sm text-gray-600">ยอดคงเหลือทั้งหมด</p>
                      <p className="text-3xl font-bold text-emerald-700">
                        ฿{(selectedContract || activeContracts[0]).outstandingBalance.toLocaleString()}
                      </p>
                    </div>

                    {(selectedContract || activeContracts[0]).daysOverdue > 0 && (
                      <div className="bg-red-100 border border-red-200 rounded-md p-3 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <span className="text-red-700 font-medium">
                          ค้างชำระ {(selectedContract || activeContracts[0]).daysOverdue} วัน
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Payment Schedule */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-emerald-600" />
                      ตารางผ่อนชำระ
                    </h3>
                    
                    <div className="space-y-2">
                      {(selectedContract || activeContracts[0]).schedules?.map((schedule) => {
                        const status = SCHEDULE_STATUS[schedule.status] || SCHEDULE_STATUS.PENDING;
                        const isPast = new Date(schedule.dueDate) < new Date() && schedule.status !== 'PAID';
                        
                        return (
                          <div
                            key={schedule.id}
                            className={`p-3 border rounded-lg ${
                              isPast ? 'border-red-200 bg-red-50' : ''
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium">
                                งวดที่ {schedule.installmentNumber}
                              </span>
                              <Badge className={`${status.color} flex items-center gap-1`}>
                                {status.icon}
                                {status.label}
                              </Badge>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(schedule.dueDate).toLocaleDateString('th-TH')}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                ฿{schedule.totalAmount.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Upload Slip Button */}
                  <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
                    <div className="max-w-lg mx-auto">
                      <Link
                        href={`/slip?contractId=${(selectedContract || activeContracts[0]).id}`}
                      >
                        <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 h-12">
                          <Upload className="w-5 h-5 mr-2" />
                          ส่งหลักฐานการชำระเงิน
                        </Button>
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

