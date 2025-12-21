import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/web-auth';
import { db } from '@/lib/db';
import { webAdminUsers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const session = await getSession();
  
  if (!session || (session.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  try {
    const staff = await db.select().from(webAdminUsers);
    return NextResponse.json({ success: true, data: staff });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  
  if (!session || session.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  try {
    const body = await request.json();
    const { email, role } = body;
    
    if (!email || !role) {
      return NextResponse.json({ error: 'Email and role are required' }, { status: 400 });
    }
    
    const validRoles = ['SUPER_ADMIN', 'APPROVER', 'COLLECTOR', 'VIEWER'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
    
    const existing = await db.select().from(webAdminUsers).where(eq(webAdminUsers.email, email));
    
    if (existing.length > 0) {
      const [updated] = await db
        .update(webAdminUsers)
        .set({ role, active: 'true', updatedAt: new Date() })
        .where(eq(webAdminUsers.email, email))
        .returning();
      return NextResponse.json({ success: true, data: updated });
    }
    
    const [inserted] = await db
      .insert(webAdminUsers)
      .values({
        email,
        role,
        active: 'true',
      })
      .returning();
    
    return NextResponse.json({ success: true, data: inserted });
  } catch (error) {
    console.error('Error creating staff:', error);
    return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  
  if (!session || session.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  try {
    const body = await request.json();
    const { email, role, active } = body;
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    const updates: Record<string, any> = { updatedAt: new Date() };
    if (role) updates.role = role;
    if (active !== undefined) updates.active = active.toString();
    
    const [updated] = await db
      .update(webAdminUsers)
      .set(updates)
      .where(eq(webAdminUsers.email, email))
      .returning();
    
    if (!updated) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating staff:', error);
    return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 });
  }
}
