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
  FileCheck,
  Smartphone,
  Zap,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">LINE Lender</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/apply" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              สมัครสินเชื่อ
            </Link>
            <Link href="/status" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ตรวจสอบสถานะ
            </Link>
            <Link href="/web-admin/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              เข้าสู่ระบบ (พนักงาน)
            </Link>
          </nav>
          <Link href="/apply">
            <Button className="hidden sm:flex">
              เริ่มต้นใช้งาน
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section - LINE Developers inspired */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent via-background to-background" />
        <div className="container max-w-6xl mx-auto px-4 py-20 md:py-32 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-medium mb-8 border border-primary/20">
              <Shield className="w-4 h-4" />
              ระบบสินเชื่อบน LINE Platform
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight tracking-tight">
              จัดการสินเชื่อ
              <br />
              <span className="text-primary">ผ่าน LINE</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              ระบบจัดการสินเชื่อและติดตามหนี้ครบวงจรบน LINE LIFF 
              สะดวก รวดเร็ว ปลอดภัย ใช้งานได้ทุกที่ทุกเวลา
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/apply">
                <Button size="lg" className="h-14 px-8 text-base font-semibold line-shadow-lg hover:scale-105 transition-transform">
                  <CreditCard className="w-5 h-5 mr-2" />
                  สมัครสินเชื่อ
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/status">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base font-semibold border-2 hover:bg-accent">
                  ดูสถานะคำขอ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Products/Services Grid - LINE Developers style */}
      <section className="py-20 bg-secondary/30">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              บริการของเรา
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              ครบทุกขั้นตอนการจัดการสินเชื่อ ตั้งแต่สมัครจนถึงชำระครบ
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/apply" className="group">
              <Card className="h-full border-2 border-transparent hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <CreditCard className="w-7 h-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    สมัครสินเชื่อ
                  </CardTitle>
                  <CardDescription className="text-base">
                    ยื่นคำขอสินเชื่อออนไลน์ กรอกข้อมูลง่าย อัปโหลดเอกสารสะดวก รู้ผลเร็ว
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/status" className="group">
              <Card className="h-full border-2 border-transparent hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Clock className="w-7 h-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    ติดตามสถานะ
                  </CardTitle>
                  <CardDescription className="text-base">
                    ตรวจสอบสถานะคำขอแบบเรียลไทม์ ดูรายละเอียดการพิจารณาได้ทุกขั้นตอน
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/contracts" className="group">
              <Card className="h-full border-2 border-transparent hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <FileCheck className="w-7 h-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    สัญญาของฉัน
                  </CardTitle>
                  <CardDescription className="text-base">
                    ดูรายละเอียดสัญญา ยอดคงเหลือ และตารางผ่อนชำระได้ตลอดเวลา
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/payment" className="group">
              <Card className="h-full border-2 border-transparent hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Smartphone className="w-7 h-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    ชำระเงิน
                  </CardTitle>
                  <CardDescription className="text-base">
                    ดูข้อมูลบัญชีสำหรับโอนเงิน สแกน QR Code ชำระได้ทันที
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/slip" className="group">
              <Card className="h-full border-2 border-transparent hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Zap className="w-7 h-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    ส่งสลิป OCR
                  </CardTitle>
                  <CardDescription className="text-base">
                    อัปโหลดสลิปชำระเงิน ระบบ OCR ตรวจสอบอัตโนมัติ ไม่ต้องรอยืนยัน
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/dashboard" className="group">
              <Card className="h-full border-2 border-transparent hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <BarChart3 className="w-7 h-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    สำหรับผู้ดูแล
                  </CardTitle>
                  <CardDescription className="text-base">
                    แดชบอร์ดจัดการ อนุมัติคำขอ ตรวจสอบการชำระ และออกรายงาน
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Features/Benefits */}
      <section className="py-20 bg-background">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              ทำไมต้อง LINE Lender?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              ระบบที่ออกแบบมาเพื่อความสะดวกของทั้งผู้กู้และผู้ให้กู้
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary mx-auto flex items-center justify-center mb-6">
                <MessageCircle className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-lg mb-2">แจ้งเตือนผ่าน LINE</h3>
              <p className="text-muted-foreground text-sm">
                รับการแจ้งเตือนทุกขั้นตอน ไม่พลาดกำหนดชำระ
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary mx-auto flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-lg mb-2">อนุมัติรวดเร็ว</h3>
              <p className="text-muted-foreground text-sm">
                ทราบผลภายใน 1-2 วันทำการ ไม่ต้องรอนาน
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary mx-auto flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-lg mb-2">ปลอดภัย</h3>
              <p className="text-muted-foreground text-sm">
                ข้อมูลถูกเข้ารหัสและจัดเก็บอย่างปลอดภัย
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary mx-auto flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-lg mb-2">ใช้งานง่าย</h3>
              <p className="text-muted-foreground text-sm">
                ออกแบบสำหรับมือถือ ใช้งานได้ทุกที่ทุกเวลา
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Admin Console Section - Dark theme like LINE Developers Console */}
      <section className="py-20 line-gradient-dark">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <BarChart3 className="w-4 h-4" />
                Admin Console
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                ศูนย์กลางการจัดการ
                <br />
                <span className="text-primary">สำหรับผู้ดูแลระบบ</span>
              </h2>
              <p className="text-white/70 text-lg mb-8 leading-relaxed">
                แดชบอร์ดครบครัน ดูภาพรวมสินเชื่อ อนุมัติคำขอ ติดตามหนี้ และออกรายงานได้ในที่เดียว 
                เข้าถึงได้จากทุกอุปกรณ์
              </p>
              <Link href="/web-admin/login">
                <Button size="lg" className="h-14 px-8 text-base font-semibold bg-white text-gray-900 hover:bg-white/90">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  เข้าสู่ระบบพนักงาน
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
            
            <div className="flex-1 grid grid-cols-2 gap-4 w-full max-w-md">
              <Card className="bg-white/10 border-white/10 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <Users className="w-8 h-8 text-primary mb-3" />
                  <p className="text-white font-semibold">จัดการสัญญา</p>
                  <p className="text-sm text-white/60">ดูและจัดการทุกสัญญา</p>
                </CardContent>
              </Card>
              <Card className="bg-white/10 border-white/10 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <FileCheck className="w-8 h-8 text-primary mb-3" />
                  <p className="text-white font-semibold">อนุมัติคำขอ</p>
                  <p className="text-sm text-white/60">พิจารณาอนุมัติออนไลน์</p>
                </CardContent>
              </Card>
              <Card className="bg-white/10 border-white/10 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <CreditCard className="w-8 h-8 text-primary mb-3" />
                  <p className="text-white font-semibold">ตรวจสอบชำระเงิน</p>
                  <p className="text-sm text-white/60">ยืนยันการชำระด้วย OCR</p>
                </CardContent>
              </Card>
              <Card className="bg-white/10 border-white/10 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <BarChart3 className="w-8 h-8 text-primary mb-3" />
                  <p className="text-white font-semibold">รายงาน</p>
                  <p className="text-sm text-white/60">รายงานอัตโนมัติทุกวัน</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-secondary/30 border-t">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            พร้อมเริ่มต้นหรือยัง?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            สมัครสินเชื่อได้ทันที กรอกข้อมูลง่าย รู้ผลเร็ว
          </p>
          <Link href="/apply">
            <Button size="lg" className="h-14 px-10 text-base font-semibold line-shadow-lg hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5 mr-2" />
              สมัครสินเชื่อเลย
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer - Clean like LINE Developers */}
      <footer className="py-12 bg-background border-t">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">LINE Lender</span>
            </div>
            
            <nav className="flex flex-wrap justify-center gap-6">
              <Link href="/apply" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                สมัครสินเชื่อ
              </Link>
              <Link href="/status" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                ตรวจสอบสถานะ
              </Link>
              <Link href="/contracts" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                สัญญา
              </Link>
              <Link href="/web-admin/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                พนักงาน
              </Link>
            </nav>
            
            <p className="text-muted-foreground text-sm">
              © 2024 LINE Lender
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
