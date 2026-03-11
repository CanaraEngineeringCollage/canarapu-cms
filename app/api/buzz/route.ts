import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

// GET /api/buzz — public, for website display
// GET /api/buzz — public, for website display
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // 1. Get query params
    const category = searchParams.get('category'); // Added this
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '10');
    const skip = (page - 1) * limit;

    // 2. Build the "where" clause for filtering
    const where = category ? { category } : {};

    // 3. Run transaction with the filter applied to BOTH query and count
    const [items, total] = await prisma.$transaction([
      prisma.buzz.findMany({
        where, // Apply filter here
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.buzz.count({ where }), // Apply filter here too for correct pagination
    ]);

    return NextResponse.json({
      items,
      total,
      totalPages: Math.ceil(total / limit),
      page,
    });
  } catch (error) {
    console.error('Buzz GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch buzz' }, { status: 500 });
  }
}

// POST /api/buzz — protected
export async function POST(req: NextRequest) {
  const { error } = await requireAuth(req);
  if (error) return error;

  try {
    const body = await req.json();
    const { name, category, date, content } = body;

    if (!name || !category || !date) {
      return NextResponse.json({ error: 'name, category and date are required' }, { status: 400 });
    }

    const buzz = await prisma.buzz.create({
      data: { name, category, date, content },
    });

    return NextResponse.json(buzz, { status: 201 });
  } catch (error) {
    console.error('Buzz POST error:', error);
    return NextResponse.json({ error: 'Failed to create buzz' }, { status: 500 });
  }
}
