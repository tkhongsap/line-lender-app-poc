'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { WebAdminGuard } from '@/components/web-admin/WebAdminGuard';
import { WebAdminNavigation } from '@/components/web-admin/WebAdminNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  ArrowLeft,
  DollarSign,
  Upload,
  Scan,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import type { Contract } from '@/types';
import { format } from 'date-fns';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(amount);
}

function RecordPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedContractId = searchParams.get('contractId');

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoadingContracts, setIsLoadingContracts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);

  // Form state
  const [selectedContractId, setSelectedContractId] = useState(preselectedContractId || '');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [paymentMethod, setPaymentMethod] = useState<'TRANSFER' | 'CASH' | 'OTHER'>('TRANSFER');
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<{
    amount?: number;
    date?: string;
    bank?: string;
  } | null>(null);

  const selectedContract = contracts.find((c) => c.id === selectedContractId);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await fetch('/api/contracts?status=ACTIVE', {
          headers: {
            'x-line-userid': 'web-admin',
          },
        });
        const data = await response.json();
        setContracts(data.data || []);
      } catch (error) {
        console.error('Failed to fetch contracts:', error);
      } finally {
        setIsLoadingContracts(false);
      }
    };

    fetchContracts();
  }, []);

  const handleSlipChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSlipFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setOcrResult(null);
    }
  }, []);

  const handleOcr = async () => {
    if (!slipFile) return;

    setIsOcrProcessing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        
        const response = await fetch('/api/slip/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-line-userid': 'web-admin',
          },
          body: JSON.stringify({
            image: {
              fileName: slipFile.name,
              base64Data: base64,
              mimeType: slipFile.type,
            },
          }),
        });

        const data = await response.json();
        if (data.success && data.data) {
          setOcrResult({
            amount: data.data.amount,
            date: data.data.date,
            bank: data.data.bank,
          });
          // Auto-fill amount if we got it
          if (data.data.amount) {
            setAmount(data.data.amount.toString());
          }
          if (data.data.date) {
            setPaymentDate(data.data.date);
          }
        } else {
          alert('OCR failed: ' + (data.error || 'Could not read slip'));
        }
        setIsOcrProcessing(false);
      };
      reader.readAsDataURL(slipFile);
    } catch (error) {
      console.error('OCR failed:', error);
      alert('OCR processing failed');
      setIsOcrProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedContractId || !amount || !paymentDate) {
      setSubmitResult({ success: false, message: 'Please fill all required fields' });
      return;
    }

    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      // Prepare slip data if file exists
      let slipImage;
      if (slipFile && slipPreview) {
        const base64 = slipPreview.split(',')[1];
        slipImage = {
          fileName: slipFile.name,
          base64Data: base64,
          mimeType: slipFile.type,
        };
      }

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-line-userid': 'web-admin',
        },
        body: JSON.stringify({
          contractId: selectedContractId,
          amount: parseFloat(amount),
          paymentDate,
          paymentMethod,
          slipImage,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSubmitResult({ success: true, message: 'Payment recorded successfully! Pending verification.' });
        // Reset form
        setTimeout(() => {
          router.push('/web-admin/payments/pending');
        }, 2000);
      } else {
        setSubmitResult({ success: false, message: data.error || 'Failed to record payment' });
      }
    } catch (error) {
      console.error('Failed to record payment:', error);
      setSubmitResult({ success: false, message: 'Failed to record payment' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingContracts) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/web-admin/payments">
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Payments
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <DollarSign className="w-8 h-8 text-green-400" />
        <h1 className="text-2xl font-bold text-white">Record Payment</h1>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg text-white">Payment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contract Selection */}
            <div className="space-y-2">
              <Label className="text-slate-300">Contract *</Label>
              <Select value={selectedContractId} onValueChange={setSelectedContractId}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select a contract..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {contracts.map((contract) => (
                    <SelectItem key={contract.id} value={contract.id} className="text-white">
                      {contract.id} - {contract.customerName} ({formatCurrency(contract.outstandingBalance)} due)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedContract && (
                <div className="text-sm text-slate-400 p-3 bg-slate-700/50 rounded-lg">
                  <p>Customer: {selectedContract.customerName}</p>
                  <p>Monthly Payment: {formatCurrency(selectedContract.monthlyPayment)}</p>
                  <p>Outstanding: {formatCurrency(selectedContract.outstandingBalance)}</p>
                </div>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label className="text-slate-300">Amount (THB) *</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                required
              />
              {selectedContract && parseFloat(amount) !== selectedContract.monthlyPayment && amount && (
                <p className="text-yellow-400 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Amount differs from expected monthly payment ({formatCurrency(selectedContract.monthlyPayment)})
                </p>
              )}
            </div>

            {/* Payment Date */}
            <div className="space-y-2">
              <Label className="text-slate-300">Payment Date *</Label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label className="text-slate-300">Payment Method *</Label>
              <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as typeof paymentMethod)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="TRANSFER" className="text-white">Bank Transfer</SelectItem>
                  <SelectItem value="CASH" className="text-white">Cash</SelectItem>
                  <SelectItem value="OTHER" className="text-white">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Slip Upload */}
            <div className="space-y-2">
              <Label className="text-slate-300">Payment Slip (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleSlipChange}
                  className="bg-slate-700 border-slate-600 text-white file:bg-slate-600 file:text-white file:border-0 file:mr-3"
                />
                {slipFile && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleOcr}
                    disabled={isOcrProcessing}
                    className="border-green-500/30 text-green-400 hover:bg-green-500/20"
                  >
                    {isOcrProcessing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Scan className="w-4 h-4 mr-2" />
                    )}
                    OCR
                  </Button>
                )}
              </div>
              {slipPreview && (
                <div className="mt-2">
                  <img
                    src={slipPreview}
                    alt="Slip preview"
                    className="max-h-48 rounded-lg border border-slate-600"
                  />
                </div>
              )}
              {ocrResult && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm">
                  <p className="text-green-400 font-medium mb-1">OCR Results:</p>
                  {ocrResult.amount && <p className="text-slate-300">Amount: {formatCurrency(ocrResult.amount)}</p>}
                  {ocrResult.date && <p className="text-slate-300">Date: {ocrResult.date}</p>}
                  {ocrResult.bank && <p className="text-slate-300">Bank: {ocrResult.bank}</p>}
                </div>
              )}
            </div>

            {/* Submit Result */}
            {submitResult && (
              <div className={`p-4 rounded-lg flex items-center gap-3 ${
                submitResult.success 
                  ? 'bg-green-500/10 border border-green-500/30' 
                  : 'bg-red-500/10 border border-red-500/30'
              }`}>
                {submitResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
                <p className={submitResult.success ? 'text-green-400' : 'text-red-400'}>
                  {submitResult.message}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Record Payment
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function WebAdminRecordPaymentPage() {
  return (
    <WebAdminGuard>
      <WebAdminNavigation>
        <RecordPaymentContent />
      </WebAdminNavigation>
    </WebAdminGuard>
  );
}

