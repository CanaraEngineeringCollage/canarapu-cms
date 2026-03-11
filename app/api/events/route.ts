import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

// GET /api/events — open, public website can display events
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const events = await prisma.event.findMany({
      where: category ? { category } : undefined,
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ items: events });
  } catch (error) {
    console.error('Events GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// PUT /api/events — protected (upsert by category)
export async function PUT(req: NextRequest) {
  const { error } = await requireAuth(req);
  if (error) return error;

  try {
    const body = await req.json();
    const { category, heading, description, googleFormUrl, flipbookUrl, timing, getInTouch, googleMapUrl, venue } = body;

    if (!category) {
      return NextResponse.json({ error: 'category is required' }, { status: 400 });
    }

    const event = await prisma.event.upsert({
      where: { category },
      update: { heading, description, googleFormUrl, flipbookUrl, timing, getInTouch, googleMapUrl, venue },
      create: { category, heading: heading ?? '', description, googleFormUrl, flipbookUrl, timing, getInTouch, googleMapUrl, venue },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Events PUT error:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}
