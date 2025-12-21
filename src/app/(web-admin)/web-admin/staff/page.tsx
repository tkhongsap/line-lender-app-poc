'use client';

import { useEffect, useState } from 'react';
import { WebAdminGuard } from '@/components/web-admin/WebAdminGuard';
import { WebAdminNavigation } from '@/components/web-admin/WebAdminNavigation';
import { useWebAuth } from '@/hooks/use-web-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Loader2,
  Users,
  Plus,
  Edit,
  Shield,
  ShieldCheck,
  Eye,
  Briefcase,
  UserCheck,
  UserX,
  AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface StaffMember {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  role: string;
  active: string;
  createdAt: string;
  updatedAt: string;
}

const roleIcons: Record<string, React.ReactNode> = {
  SUPER_ADMIN: <ShieldCheck className="w-4 h-4" />,
  APPROVER: <Shield className="w-4 h-4" />,
  COLLECTOR: <Briefcase className="w-4 h-4" />,
  VIEWER: <Eye className="w-4 h-4" />,
};

const roleColors: Record<string, string> = {
  SUPER_ADMIN: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  APPROVER: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  COLLECTOR: 'bg-green-500/20 text-green-400 border-green-500/30',
  VIEWER: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  APPROVER: 'Approver',
  COLLECTOR: 'Collector',
  VIEWER: 'Viewer',
};

function StaffManagementContent() {
  const { user: currentUser } = useWebAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('VIEWER');
  const [editRole, setEditRole] = useState('');
  const [editActive, setEditActive] = useState(true);

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/web-admin/staff');
      const data = await response.json();
      if (data.success) {
        setStaff(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async () => {
    if (!newEmail || !newRole) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/web-admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail, role: newRole }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchStaff();
        setIsAddOpen(false);
        setNewEmail('');
        setNewRole('VIEWER');
      } else {
        alert(data.error || 'Failed to add staff');
      }
    } catch (error) {
      console.error('Failed to add staff:', error);
      alert('Failed to add staff');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStaff = async () => {
    if (!editingStaff) return;

    // Prevent self-deactivation or self-demotion
    if (editingStaff.email === currentUser?.email) {
      if (!editActive) {
        alert('You cannot deactivate your own account');
        return;
      }
      if (editRole !== 'SUPER_ADMIN' && editingStaff.role === 'SUPER_ADMIN') {
        alert('You cannot demote your own role');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/web-admin/staff', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: editingStaff.email,
          role: editRole,
          active: editActive,
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchStaff();
        setEditingStaff(null);
      } else {
        alert(data.error || 'Failed to update staff');
      }
    } catch (error) {
      console.error('Failed to update staff:', error);
      alert('Failed to update staff');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (member: StaffMember) => {
    setEditingStaff(member);
    setEditRole(member.role);
    setEditActive(member.active === 'true');
  };

  // Check if current user is SUPER_ADMIN
  if (currentUser?.role !== 'SUPER_ADMIN') {
    return (
      <div className="p-6">
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="py-12 text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 text-lg font-medium">Access Denied</p>
            <p className="text-slate-400 mt-2">Only Super Admins can access staff management.</p>
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
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-green-400" />
            <h1 className="text-2xl font-bold text-white">Staff Management</h1>
          </div>
          <p className="text-slate-400 mt-1">{staff.length} staff members</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-500 hover:bg-green-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Add New Staff</DialogTitle>
              <DialogDescription className="text-slate-400">
                Enter the email address and role for the new staff member.
                They will be able to login with their Google account.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Email (Google Account)</Label>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="staff@example.com"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Role</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="SUPER_ADMIN" className="text-white">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-purple-400" />
                        Super Admin - Full access
                      </div>
                    </SelectItem>
                    <SelectItem value="APPROVER" className="text-white">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-400" />
                        Approver - Review & approve loans
                      </div>
                    </SelectItem>
                    <SelectItem value="COLLECTOR" className="text-white">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-green-400" />
                        Collector - Manage payments
                      </div>
                    </SelectItem>
                    <SelectItem value="VIEWER" className="text-white">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-slate-400" />
                        Viewer - Read-only access
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddOpen(false)}
                className="border-slate-600 text-slate-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddStaff}
                disabled={isSubmitting || !newEmail}
                className="bg-green-500 hover:bg-green-600"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Add Staff
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Staff List */}
      <div className="space-y-4">
        {staff.map((member) => {
          const isCurrentUser = member.email === currentUser?.email;
          const isActive = member.active === 'true';

          return (
            <Card
              key={member.id}
              className={`border transition-colors ${
                isActive
                  ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                  : 'bg-slate-800/30 border-slate-700/50 opacity-60'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="text-lg font-semibold text-white">
                        {member.firstName && member.lastName
                          ? `${member.firstName} ${member.lastName}`
                          : member.email}
                      </p>
                      <Badge className={`gap-1 ${roleColors[member.role]}`}>
                        {roleIcons[member.role]}
                        {roleLabels[member.role]}
                      </Badge>
                      {isActive ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 gap-1">
                          <UserCheck className="w-3 h-3" />
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 gap-1">
                          <UserX className="w-3 h-3" />
                          Inactive
                        </Badge>
                      )}
                      {isCurrentUser && (
                        <Badge variant="outline" className="border-green-500/50 text-green-400">
                          You
                        </Badge>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm">{member.email}</p>
                    <p className="text-slate-500 text-xs">
                      Added {format(new Date(member.createdAt), 'PP', { locale: th })}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(member)}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingStaff} onOpenChange={() => setEditingStaff(null)}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Staff</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update role and status for {editingStaff?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Role</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="SUPER_ADMIN" className="text-white">Super Admin</SelectItem>
                  <SelectItem value="APPROVER" className="text-white">Approver</SelectItem>
                  <SelectItem value="COLLECTOR" className="text-white">Collector</SelectItem>
                  <SelectItem value="VIEWER" className="text-white">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Status</Label>
              <Select value={editActive ? 'active' : 'inactive'} onValueChange={(v) => setEditActive(v === 'active')}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="active" className="text-white">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-green-400" />
                      Active
                    </div>
                  </SelectItem>
                  <SelectItem value="inactive" className="text-white">
                    <div className="flex items-center gap-2">
                      <UserX className="w-4 h-4 text-red-400" />
                      Inactive
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editingStaff?.email === currentUser?.email && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Note: You cannot deactivate or demote your own account.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingStaff(null)}
              className="border-slate-600 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditStaff}
              disabled={isSubmitting}
              className="bg-green-500 hover:bg-green-600"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Edit className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function WebAdminStaffPage() {
  return (
    <WebAdminGuard>
      <WebAdminNavigation>
        <StaffManagementContent />
      </WebAdminNavigation>
    </WebAdminGuard>
  );
}

