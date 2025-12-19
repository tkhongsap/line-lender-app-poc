import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  CreditCard, 
  Shield, 
  Clock, 
  MessageCircle,
  ChevronRight,
  Users,
  BarChart3,
  FileCheck
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-teal-600/10" />
        <div className="container max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              ระบบจัดการสินเชื่ออัตโนมัติ
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              ระบบสินเชื่อ
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                {' '}LINE LIFF
              </span>
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              ระบบจัดการสินเชื่อและติดตามหนี้ครบวงจร 
              ผ่าน LINE ใช้งานง่าย สะดวก ปลอดภัย
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/apply">
                <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 h-12 px-8">
                  <CreditCard className="w-5 h-5 mr-2" />
                  สมัครสินเชื่อ
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/status">
                <Button size="lg" variant="outline" className="h-12 px-8 border-emerald-600 text-emerald-700 hover:bg-emerald-50">
                  ดูสถานะคำขอ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
            ทำไมต้องใช้ระบบของเรา?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle>แจ้งเตือนผ่าน LINE</CardTitle>
                <CardDescription>
                  รับการแจ้งเตือนทุกขั้นตอน ตั้งแต่ยื่นคำขอจนถึงครบกำหนดชำระ ไม่พลาดทุกข้อมูลสำคัญ
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-teal-600" />
                </div>
                <CardTitle>อนุมัติรวดเร็ว</CardTitle>
                <CardDescription>
                  ระบบพิจารณาอัตโนมัติ ทราบผลภายใน 1-2 วันทำการ ไม่ต้องรอนาน
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                  <FileCheck className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle>ส่งสลิปง่าย</CardTitle>
                <CardDescription>
                  อัปโหลดสลิปชำระเงินผ่านแอป ระบบ OCR ตรวจสอบอัตโนมัติ ไม่ต้องโทรแจ้ง
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Admin Section */}
      <section className="py-16 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                สำหรับผู้ดูแลระบบ
              </h2>
              <p className="text-slate-300 mb-6">
                แดชบอร์ดครบครัน ดูภาพรวมสินเชื่อ อนุมัติคำขอ ติดตามหนี้ และออกรายงานได้ในที่เดียว
              </p>
              <Link href="/admin/dashboard">
                <Button size="lg" variant="outline" className="border-emerald-500 text-emerald-400 hover:bg-emerald-500/10">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  เข้าสู่แดชบอร์ด
                </Button>
              </Link>
            </div>
            
            <div className="flex-1 grid grid-cols-2 gap-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <Users className="w-8 h-8 text-emerald-400 mb-2" />
                  <p className="text-white font-semibold">จัดการสัญญา</p>
                  <p className="text-sm text-slate-400">ดูและจัดการทุกสัญญา</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <FileCheck className="w-8 h-8 text-teal-400 mb-2" />
                  <p className="text-white font-semibold">อนุมัติคำขอ</p>
                  <p className="text-sm text-slate-400">พิจารณาอนุมัติออนไลน์</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <CreditCard className="w-8 h-8 text-emerald-400 mb-2" />
                  <p className="text-white font-semibold">ตรวจสอบชำระเงิน</p>
                  <p className="text-sm text-slate-400">ยืนยันการชำระด้วย OCR</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <BarChart3 className="w-8 h-8 text-teal-400 mb-2" />
                  <p className="text-white font-semibold">รายงาน</p>
                  <p className="text-sm text-slate-400">รายงานอัตโนมัติทุกวัน</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white border-t">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            ระบบจัดการสินเชื่อ | LINE LIFF + Next.js
          </p>
          <p className="text-gray-400 text-xs mt-2">
            Powered by Google Sheets, LINE Messaging API, Vercel
          </p>
        </div>
      </footer>
    </div>
  );
}
