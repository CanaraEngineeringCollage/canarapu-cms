import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

// PUT /api/buzz/[id] — protected
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuth(req);
  if (error) return error;

  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const body = await req.json();
    const { name, category, date, content } = body;

    const buzz = await prisma.buzz.update({
      where: { id },
      data: { name, category, date, content },
    });

    return NextResponse.json(buzz);
  } catch (error) {
    console.error('Buzz PUT error:', error);
    return NextResponse.json({ error: 'Failed to update buzz' }, { status: 500 });
  }
}

// DELETE /api/buzz/[id] — protected
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuth(req);
  if (error) return error;

  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    await prisma.buzz.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Buzz DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete buzz' }, { status: 500 });
  }
}
