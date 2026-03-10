import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { unlink } from 'fs/promises';
import path from 'path';

// DELETE /api/exam-circulars/[id] — protected
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuth(req);
  if (error) return error;

  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const circular = await prisma.examCircular.findUnique({ where: { id } });

    if (!circular) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (circular.fileUrl) {
      const filePath = path.join(process.cwd(), 'public', circular.fileUrl);
      try { await unlink(filePath); } catch { /* file may not exist */ }
    }

    await prisma.examCircular.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('ExamCircular DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete exam circular' }, { status: 500 });
  }
}
