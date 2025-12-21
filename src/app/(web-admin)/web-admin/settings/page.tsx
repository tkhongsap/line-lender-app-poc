'use client';

import { useEffect, useState } from 'react';
import { WebAdminGuard } from '@/components/web-admin/WebAdminGuard';
import { WebAdminNavigation } from '@/components/web-admin/WebAdminNavigation';
import { useWebAuth } from '@/hooks/use-web-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  Settings,
  DollarSign,
  Bell,
  Building,
  Save,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

function SettingsContent() {
  const { user: currentUser } = useWebAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null);

  // Loan Settings
  const [defaultInterestRate, setDefaultInterestRate] = useState('1.5');
  const [defaultTermMonths, setDefaultTermMonths] = useState('12');
  const [minLoanAmount, setMinLoanAmount] = useState('10000');
  const [maxLoanAmount, setMaxLoanAmount] = useState('1000000');
  const [availableTerms, setAvailableTerms] = useState('6,12,18,24');

  // Notification Settings
  const [reminderDaysBefore, setReminderDaysBefore] = useState('7');
  const [overdueDays, setOverdueDays] = useState('1,7,14,30');
  const [dailyReportEnabled, setDailyReportEnabled] = useState(true);
  const [dailyReportTime, setDailyReportTime] = useState('18:00');

  // Company Info
  const [companyName, setCompanyName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactLineId, setContactLineId] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        
        if (data.success && data.data) {
          const s = data.data;
          // Loan Settings
          if (s.defaultInterestRate) setDefaultInterestRate(s.defaultInterestRate);
          if (s.defaultTermMonths) setDefaultTermMonths(s.defaultTermMonths);
          if (s.minLoanAmount) setMinLoanAmount(s.minLoanAmount);
          if (s.maxLoanAmount) setMaxLoanAmount(s.maxLoanAmount);
          if (s.availableTerms) setAvailableTerms(s.availableTerms);
          
          // Notification Settings
          if (s.reminderDaysBefore) setReminderDaysBefore(s.reminderDaysBefore);
          if (s.overdueDays) setOverdueDays(s.overdueDays);
          if (s.dailyReportEnabled !== undefined) setDailyReportEnabled(s.dailyReportEnabled === 'true');
          if (s.dailyReportTime) setDailyReportTime(s.dailyReportTime);
          
          // Company Info
          if (s.companyName) setCompanyName(s.companyName);
          if (s.contactPhone) setContactPhone(s.contactPhone);
          if (s.contactLineId) setContactLineId(s.contactLineId);
          if (s.companyAddress) setCompanyAddress(s.companyAddress);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveResult(null);

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Loan Settings
          defaultInterestRate,
          defaultTermMonths,
          minLoanAmount,
          maxLoanAmount,
          availableTerms,
          
          // Notification Settings
          reminderDaysBefore,
          overdueDays,
          dailyReportEnabled: dailyReportEnabled.toString(),
          dailyReportTime,
          
          // Company Info
          companyName,
          contactPhone,
          contactLineId,
          companyAddress,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSaveResult({ success: true, message: 'Settings saved successfully!' });
      } else {
        setSaveResult({ success: false, message: data.error || 'Failed to save settings' });
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveResult({ success: false, message: 'Failed to save settings' });
    } finally {
      setIsSaving(false);
    }
  };

  // Check if current user is SUPER_ADMIN
  if (currentUser?.role !== 'SUPER_ADMIN') {
    return (
      <div className="p-6">
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="py-12 text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 text-lg font-medium">Access Denied</p>
            <p className="text-slate-400 mt-2">Only Super Admins can access settings.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Settings className="w-8 h-8 text-green-400" />
          <h1 className="text-2xl font-bold text-white">Settings</h1>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      {/* Save Result */}
      {saveResult && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          saveResult.success 
            ? 'bg-green-500/10 border border-green-500/30' 
            : 'bg-red-500/10 border border-red-500/30'
        }`}>
          {saveResult.success ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-400" />
          )}
          <p className={saveResult.success ? 'text-green-400' : 'text-red-400'}>
            {saveResult.message}
          </p>
        </div>
      )}

      <div className="grid gap-6">
        {/* Loan Settings */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <DollarSign className="w-5 h-5 text-green-400" />
              Loan Settings
            </CardTitle>
            <CardDescription className="text-slate-400">
              Default values for new loan applications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Default Interest Rate (% per month)</Label>
                <Input
                  type="number"
                  value={defaultInterestRate}
                  onChange={(e) => setDefaultInterestRate(e.target.value)}
                  step="0.1"
                  min="0"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Default Term (months)</Label>
                <Input
                  type="number"
                  value={defaultTermMonths}
                  onChange={(e) => setDefaultTermMonths(e.target.value)}
                  min="1"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Minimum Loan Amount (THB)</Label>
                <Input
                  type="number"
                  value={minLoanAmount}
                  onChange={(e) => setMinLoanAmount(e.target.value)}
                  min="0"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Maximum Loan Amount (THB)</Label>
                <Input
                  type="number"
                  value={maxLoanAmount}
                  onChange={(e) => setMaxLoanAmount(e.target.value)}
                  min="0"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Available Term Options (comma-separated)</Label>
              <Input
                value={availableTerms}
                onChange={(e) => setAvailableTerms(e.target.value)}
                placeholder="6,12,18,24"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
              />
              <p className="text-xs text-slate-500">Example: 6,12,18,24</p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Bell className="w-5 h-5 text-green-400" />
              Notification Settings
            </CardTitle>
            <CardDescription className="text-slate-400">
              Configure payment reminders and alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Reminder Days Before Due</Label>
                <Input
                  type="number"
                  value={reminderDaysBefore}
                  onChange={(e) => setReminderDaysBefore(e.target.value)}
                  min="1"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Daily Report Time</Label>
                <Input
                  type="time"
                  value={dailyReportTime}
                  onChange={(e) => setDailyReportTime(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Overdue Alert Days (comma-separated)</Label>
              <Input
                value={overdueDays}
                onChange={(e) => setOverdueDays(e.target.value)}
                placeholder="1,7,14,30"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
              />
              <p className="text-xs text-slate-500">Days after due date to send overdue alerts</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="dailyReportEnabled"
                checked={dailyReportEnabled}
                onChange={(e) => setDailyReportEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-green-500 focus:ring-green-500"
              />
              <Label htmlFor="dailyReportEnabled" className="text-slate-300 cursor-pointer">
                Enable Daily Report
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Company Info */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Building className="w-5 h-5 text-green-400" />
              Company Information
            </CardTitle>
            <CardDescription className="text-slate-400">
              Your company details shown to customers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Company Name</Label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Your Company Name"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Contact Phone</Label>
                <Input
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="02-xxx-xxxx"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">LINE Official Account ID</Label>
                <Input
                  value={contactLineId}
                  onChange={(e) => setContactLineId(e.target.value)}
                  placeholder="@yourcompany"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Company Address</Label>
              <Input
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                placeholder="123 Street Name, District, City"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function WebAdminSettingsPage() {
  return (
    <WebAdminGuard>
      <WebAdminNavigation>
        <SettingsContent />
      </WebAdminNavigation>
    </WebAdminGuard>
  );
}

