import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { mkdir, unlink, writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// PUT /api/exam-circulars/[id] — protected (update title, optionally replace file)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuth(req);
  if (error) return error;

  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const existing = await prisma.examCircular.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const file = formData.get('file') as File | null;

    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    let fileUrl = existing.fileUrl;

    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${uuidv4()}-${file.name.replace(/\s+/g, '_')}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), buffer);
      fileUrl = `/uploads/${filename}`;

      if (existing.fileUrl) {
        const oldPath = path.join(process.cwd(), 'public', existing.fileUrl);
        try { await unlink(oldPath); } catch { /* file may not exist */ }
      }
    }

    const updated = await prisma.examCircular.update({
      where: { id },
      data: { title, fileUrl },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error('ExamCircular PUT error:', err);
    return NextResponse.json({ error: 'Failed to update exam circular' }, { status: 500 });
  }
}

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
