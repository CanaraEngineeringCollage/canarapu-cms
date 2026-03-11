import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// GET /api/exam-circulars — open
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '10');
    const skip = (page - 1) * limit;

    const [items, total] = await prisma.$transaction([
      prisma.examCircular.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.examCircular.count(),
    ]);

    return NextResponse.json({ items, total, totalPages: Math.ceil(total / limit), page });
  } catch (error) {
    console.error('ExamCircular GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch exam circulars' }, { status: 500 });
  }
}

// POST /api/exam-circulars — protected (file upload)
export async function POST(req: NextRequest) {
  const { error } = await requireAuth(req);
  if (error) return error;

  try {
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const file = formData.get('file') as File | null;

    if (!title || !file) {
      return NextResponse.json({ error: 'title and file are required' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${uuidv4()}-${file.name.replace(/\s+/g, '_')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    const fileUrl = `/uploads/${filename}`;
    const circular = await prisma.examCircular.create({
      data: { title, fileUrl },
    });

    return NextResponse.json(circular, { status: 201 });
  } catch (error) {
    console.error('ExamCircular POST error:', error);
    return NextResponse.json({ error: 'Failed to upload exam circular' }, { status: 500 });
  }
}
