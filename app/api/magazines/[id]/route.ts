import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { unlink } from 'fs/promises';
import path from 'path';

// DELETE /api/magazines/[id] — protected
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuth(req);
  if (error) return error;

  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const magazine = await prisma.magazine.findUnique({ where: { id } });

    if (!magazine) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (magazine.fileUrl) {
      const filePath = path.join(process.cwd(), 'public', magazine.fileUrl);
      try { await unlink(filePath); } catch { /* ignore if not found */ }
    }
    if (magazine.coverUrl) {
      const coverPath = path.join(process.cwd(), 'public', magazine.coverUrl);
      try { await unlink(coverPath); } catch { /* ignore if not found */ }
    }

    await prisma.magazine.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Magazine DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete magazine' }, { status: 500 });
  }
}
