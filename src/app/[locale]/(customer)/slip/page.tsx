'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useLiffContext } from '@/components/liff/LiffProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Upload, 
  Camera, 
  Image as ImageIcon, 
  Loader2, 
  CheckCircle2,
  X
} from 'lucide-react';

export default function SlipPage() {
  const liff = useLiffContext();
  const searchParams = useSearchParams();
  const contractId = searchParams.get('contractId') || '';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [slipImage, setSlipImage] = useState<{
    base64: string;
    mimeType: string;
    fileName: string;
    preview: string;
  } | null>(null);
  const [contractIdInput, setContractIdInput] = useState(contractId);
  const [ocrResult, setOcrResult] = useState<{
    amount: number;
    date: string;
    bank: string;
  } | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    const file = fileList[0];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (file.size > maxSize) {
      toast.error('ไฟล์ใหญ่เกินไป (สูงสุด 5MB)');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setSlipImage({
        base64,
        mimeType: file.type,
        fileName: file.name,
        preview: base64,
      });
      setOcrResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleVerifySlip = async () => {
    if (!slipImage || !contractIdInput) {
      toast.error('กรุณาเลือกรูปสลิปและระบุเลขสัญญา');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/slip/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-line-userid': liff.user?.userId || '',
        },
        body: JSON.stringify({
          contractId: contractIdInput,
          image: {
            base64Data: slipImage.base64,
            mimeType: slipImage.mimeType,
          },
        }),
      });

      const result = await response.json();

      if (result.success && result.data?.slipData) {
        setOcrResult(result.data.slipData);
        toast.success('อ่านข้อมูลสลิปสำเร็จ');
      } else {
        toast.error(result.error || 'ไม่สามารถอ่านข้อมูลสลิปได้');
      }
    } catch (error) {
      console.error('Verify error:', error);
      toast.error('เกิดข้อผิดพลาด');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!slipImage || !contractIdInput || !liff.user?.userId) {
      toast.error('กรุณากรอกข้อมูลให้ครบ');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-line-userid': liff.user.userId,
        },
        body: JSON.stringify({
          contractId: contractIdInput,
          amount: ocrResult?.amount || 0,
          paymentMethod: 'TRANSFER',
          slipImage: {
            fileName: slipImage.fileName,
            base64Data: slipImage.base64,
            mimeType: slipImage.mimeType,
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsSuccess(true);
        toast.success('ส่งหลักฐานเรียบร้อยแล้ว');
      } else {
        toast.error(result.error || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('ไม่สามารถส่งข้อมูลได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="container max-w-lg mx-auto py-8 px-4">
        <Card className="border-emerald-200 shadow-lg">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
            <h2 className="text-xl font-semibold text-emerald-700">ส่งหลักฐานเรียบร้อย!</h2>
            <p className="text-gray-600">
              เราจะตรวจสอบและยืนยันการชำระเงินของคุณ
              <br />และแจ้งผลผ่าน LINE
            </p>
            <Button
              onClick={() => {
                setIsSuccess(false);
                setSlipImage(null);
                setOcrResult(null);
              }}
              variant="outline"
              className="mt-4"
            >
              ส่งหลักฐานใหม่
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-lg mx-auto py-6 px-4">
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            ส่งหลักฐานการชำระเงิน
          </CardTitle>
          <CardDescription className="text-emerald-100">
            อัปโหลดสลิปโอนเงินเพื่อยืนยันการชำระ
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Contract ID */}
          <div className="space-y-2">
            <Label htmlFor="contractId">เลขสัญญา</Label>
            <Input
              id="contractId"
              placeholder="CON001"
              value={contractIdInput}
              onChange={(e) => setContractIdInput(e.target.value)}
            />
          </div>

          {/* Slip Upload */}
          <div className="space-y-2">
            <Label>รูปสลิป</Label>
            
            {slipImage ? (
              <div className="relative">
                <img
                  src={slipImage.preview}
                  alt="Slip preview"
                  className="w-full rounded-lg border"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setSlipImage(null);
                    setOcrResult(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-emerald-400 transition-colors"
                >
                  <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">เลือกรูป</span>
                </Label>
                <Label
                  htmlFor="camera-upload"
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-emerald-400 transition-colors"
                >
                  <Camera className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">ถ่ายรูป</span>
                </Label>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <input
                  id="camera-upload"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            )}
          </div>

          {/* OCR Result */}
          {ocrResult && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <h4 className="font-medium text-emerald-800 mb-2">ข้อมูลจากสลิป:</h4>
              <div className="space-y-1 text-sm">
                <p>จำนวนเงิน: <span className="font-semibold">฿{ocrResult.amount.toLocaleString()}</span></p>
                <p>วันที่: <span className="font-semibold">{ocrResult.date}</span></p>
                <p>ธนาคาร: <span className="font-semibold">{ocrResult.bank}</span></p>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-3">
            {slipImage && !ocrResult && (
              <Button
                onClick={handleVerifySlip}
                variant="outline"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังตรวจสอบ...
                  </>
                ) : (
                  'ตรวจสอบสลิป (OCR)'
                )}
              </Button>
            )}

            <Button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              disabled={!slipImage || !contractIdInput || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังส่ง...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  ส่งหลักฐาน
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

