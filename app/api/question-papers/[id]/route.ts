import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { unlink } from 'fs/promises';
import path from 'path';

// DELETE /api/question-papers/[id] — protected
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuth(req);
  if (error) return error;

  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const paper = await prisma.questionPaper.findUnique({ where: { id } });

    if (!paper) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Remove file from disk
    if (paper.fileUrl) {
      const filePath = path.join(process.cwd(), 'public', paper.fileUrl);
      try { await unlink(filePath); } catch { /* file may not exist */ }
    }

    await prisma.questionPaper.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('QuestionPaper DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete question paper' }, { status: 500 });
  }
}
