import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, email, currentPassword, newPassword } = body;

    if (!email || !currentPassword) {
      return NextResponse.json(
        { error: 'Email and current password are required' },
        { status: 400 }
      );
    }

    // Find the user by ID
    const user = await prisma.user.findUnique({
      where: { id: parseInt((session.user as any).id) },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid current password' },
        { status: 401 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    // Check if updating name
    if (name !== undefined && name !== user.name) {
      updateData.name = name;
    }

    // Check if updating email
    if (email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email is already in use by another account' },
          { status: 400 }
        );
      }
      updateData.email = email;
    }

    // Check if updating password
    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'New password must be at least 6 characters long' },
          { status: 400 }
        );
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    // Update user if there are changes
    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });
    }

    return NextResponse.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
