import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

/**
 * One-time seed route: POST /api/auth/seed
 * Creates the default admin user in MySQL.
 * Remove or disable this route after first use.
 */
export async function POST(req: NextRequest) {
  try {
    const existing = await prisma.user.findUnique({
      where: { email: 'admin@gmail.com' },
    });

    if (existing) {
      return NextResponse.json({ message: 'Admin user already exists' }, { status: 200 });
    }

    const hashedPassword = await bcrypt.hash('12345', 12);

    const user = await prisma.user.create({
      data: {
        email: 'admin@gmail.com',
        password: hashedPassword,
        name: 'Admin',
      },
    });

    return NextResponse.json({ message: 'Admin user created', userId: user.id }, { status: 201 });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed admin user' }, { status: 500 });
  }
}
