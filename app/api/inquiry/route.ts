import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

// GET /api/inquiry — protected (admin only)
export async function GET(req: NextRequest) {
  const { error } = await requireAuth(req);
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '10');
    const skip = (page - 1) * limit;

    const [items, total] = await prisma.$transaction([
      prisma.inquiry.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.inquiry.count(),
    ]);

    return NextResponse.json({
      items,
      total,
      totalPages: Math.ceil(total / limit),
      page,
    });
  } catch (error) {
    console.error('Inquiry GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 });
  }
}

// POST /api/inquiry — open (public form submission)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, phoneNumber, comments } = body;

    if (!fullName || !email || !phoneNumber) {
      return NextResponse.json(
        { error: 'fullName, email, and phoneNumber are required' },
        { status: 400 }
      );
    }

    const inquiry = await prisma.inquiry.create({
      data: { fullName, email, phoneNumber, comments },
    });

    return NextResponse.json(inquiry, { status: 201 });
  } catch (error) {
    console.error('Inquiry POST error:', error);
    return NextResponse.json({ error: 'Failed to submit inquiry' }, { status: 500 });
  }
}
