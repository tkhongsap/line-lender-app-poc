'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useLiffContext } from '@/components/liff/LiffProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Upload, FileCheck, Loader2, CheckCircle2, Send } from 'lucide-react';

// Form validation schema
const applicationSchema = z.object({
  fullName: z.string().min(2, 'กรุณากรอกชื่อ-นามสกุล'),
  nationalId: z.string().regex(/^\d{13}$/, 'เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก'),
  phone: z.string().regex(/^\d{10}$/, 'เบอร์โทรต้องเป็นตัวเลข 10 หลัก'),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').optional().or(z.literal('')),
  requestedAmount: z.number().min(10000, 'วงเงินขั้นต่ำ 10,000 บาท').max(1000000, 'วงเงินสูงสุด 1,000,000 บาท'),
  purpose: z.enum(['BUSINESS', 'PERSONAL', 'EDUCATION', 'MEDICAL', 'OTHER']),
  purposeDetail: z.string().optional(),
  collateralType: z.enum(['LAND', 'HOUSE', 'CONDO', 'CAR', 'GOLD', 'OTHER']),
  collateralValue: z.number().min(1, 'กรุณาระบุมูลค่าหลักทรัพย์'),
  collateralAddress: z.string().min(1, 'กรุณาระบุที่อยู่หลักทรัพย์'),
  collateralDescription: z.string().optional(),
  pdpaConsent: z.boolean().refine(v => v === true, 'กรุณายอมรับเงื่อนไข'),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

const PURPOSE_OPTIONS = [
  { value: 'BUSINESS', label: 'ธุรกิจ' },
  { value: 'PERSONAL', label: 'ใช้จ่ายส่วนตัว' },
  { value: 'EDUCATION', label: 'การศึกษา' },
  { value: 'MEDICAL', label: 'การแพทย์' },
  { value: 'OTHER', label: 'อื่นๆ' },
];

const COLLATERAL_OPTIONS = [
  { value: 'LAND', label: 'ที่ดิน' },
  { value: 'HOUSE', label: 'บ้าน' },
  { value: 'CONDO', label: 'คอนโด' },
  { value: 'CAR', label: 'รถยนต์' },
  { value: 'GOLD', label: 'ทองคำ' },
  { value: 'OTHER', label: 'อื่นๆ' },
];

interface FilePreview {
  type: string;
  fileName: string;
  base64Data: string;
  mimeType: string;
  preview?: string;
}

export default function ApplyPage() {
  const liff = useLiffContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [files, setFiles] = useState<FilePreview[]>([]);

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      fullName: liff.user?.displayName || '',
      nationalId: '',
      phone: '',
      email: '',
      requestedAmount: 100000,
      purpose: 'PERSONAL',
      purposeDetail: '',
      collateralType: 'LAND',
      collateralValue: 0,
      collateralAddress: '',
      collateralDescription: '',
      pdpaConsent: false,
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
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
      const existing = files.filter(f => f.type !== fileType);
      setFiles([
        ...existing,
        {
          type: fileType,
          fileName: file.name,
          base64Data: base64,
          mimeType: file.type,
          preview: base64,
        },
      ]);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: ApplicationFormData) => {
    if (!liff.user?.userId) {
      toast.error('ไม่พบข้อมูลผู้ใช้');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-line-userid': liff.user.userId,
        },
        body: JSON.stringify({
          ...data,
          lineUserId: liff.user.userId,
          documents: files,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsSuccess(true);
        toast.success('ส่งคำขอสินเชื่อเรียบร้อยแล้ว');
      } else {
        toast.error(result.error || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('ไม่สามารถส่งคำขอได้');
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
            <h2 className="text-xl font-semibold text-emerald-700">ส่งคำขอเรียบร้อย!</h2>
            <p className="text-gray-600">
              เราจะพิจารณาคำขอของคุณและแจ้งผลผ่าน LINE
              <br />ภายใน 1-2 วันทำการ
            </p>
            <Button
              onClick={() => {
                setIsSuccess(false);
                form.reset();
                setFiles([]);
              }}
              variant="outline"
              className="mt-4"
            >
              ส่งคำขอใหม่
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-lg mx-auto py-6 px-4 pb-20">
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
          <CardTitle className="text-xl">สมัครสินเชื่อ</CardTitle>
          <CardDescription className="text-emerald-100">
            กรอกข้อมูลเพื่อยื่นคำขอสินเชื่อ
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                  ข้อมูลส่วนตัว
                </h3>

                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ชื่อ-นามสกุล *</FormLabel>
                      <FormControl>
                        <Input placeholder="สมชาย ใจดี" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nationalId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>เลขบัตรประชาชน *</FormLabel>
                      <FormControl>
                        <Input placeholder="1234567890123" maxLength={13} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>เบอร์โทรศัพท์ *</FormLabel>
                      <FormControl>
                        <Input placeholder="0812345678" maxLength={10} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>อีเมล</FormLabel>
                      <FormControl>
                        <Input placeholder="email@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Loan Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                  ข้อมูลสินเชื่อ
                </h3>

                <FormField
                  control={form.control}
                  name="requestedAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>วงเงินที่ต้องการ (บาท) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={10000} 
                          max={1000000} 
                          step={1000} 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>วัตถุประสงค์ *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกวัตถุประสงค์" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PURPOSE_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purposeDetail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>รายละเอียดเพิ่มเติม</FormLabel>
                      <FormControl>
                        <Textarea placeholder="อธิบายวัตถุประสงค์เพิ่มเติม..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Collateral Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
                  ข้อมูลหลักทรัพย์ค้ำประกัน
                </h3>

                <FormField
                  control={form.control}
                  name="collateralType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ประเภทหลักทรัพย์ *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกประเภท" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COLLATERAL_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="collateralValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>มูลค่าหลักทรัพย์ (บาท) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1} 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="collateralAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ที่อยู่หลักทรัพย์ *</FormLabel>
                      <FormControl>
                        <Textarea placeholder="ที่อยู่หรือรายละเอียดตำแหน่ง..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="collateralDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>รายละเอียดหลักทรัพย์</FormLabel>
                      <FormControl>
                        <Textarea placeholder="รายละเอียดเพิ่มเติม เช่น เลขโฉนด ทะเบียนรถ..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Document Upload */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">4</span>
                  อัปโหลดเอกสาร
                </h3>

                <div className="grid gap-3">
                  {[
                    { type: 'ID_CARD', label: 'บัตรประชาชน' },
                    { type: 'HOUSE_REGISTRATION', label: 'ทะเบียนบ้าน' },
                    { type: 'COLLATERAL_DOC', label: 'เอกสารหลักทรัพย์' },
                    { type: 'COLLATERAL_PHOTO', label: 'รูปหลักทรัพย์' },
                  ].map(doc => {
                    const uploaded = files.find(f => f.type === doc.type);
                    return (
                      <div key={doc.type} className="flex items-center gap-3">
                        <Label
                          htmlFor={`file-${doc.type}`}
                          className={`flex-1 flex items-center justify-between p-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                            uploaded ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-emerald-400'
                          }`}
                        >
                          <span className="text-sm">{doc.label}</span>
                          {uploaded ? (
                            <FileCheck className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Upload className="w-5 h-5 text-gray-400" />
                          )}
                        </Label>
                        <input
                          id={`file-${doc.type}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, doc.type)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* PDPA Consent */}
              <FormField
                control={form.control}
                name="pdpaConsent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 text-emerald-600 border-gray-300 rounded"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm text-gray-700">
                        ข้าพเจ้ายินยอมให้เก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคล
                        ตาม <a href="#" className="text-emerald-600 underline">นโยบายความเป็นส่วนตัว</a>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 h-12 text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    กำลังส่ง...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    ส่งคำขอสินเชื่อ
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

