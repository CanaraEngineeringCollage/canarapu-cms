import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// GET /api/magazines — open
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '10');
    const skip = (page - 1) * limit;

    const [items, total] = await prisma.$transaction([
      prisma.magazine.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.magazine.count(),
    ]);

    return NextResponse.json({ items, total, totalPages: Math.ceil(total / limit), page });
  } catch (error) {
    console.error('Magazine GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch magazines' }, { status: 500 });
  }
}

// POST /api/magazines — protected (file upload or URL)
export async function POST(req: NextRequest) {
  const { error } = await requireAuth(req);
  if (error) return error;

  try {
    const contentType = req.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
      // URL-based magazine (no file upload)
      const body = await req.json();
      const { title, fileUrl, year } = body;
      if (!title || !fileUrl) {
        return NextResponse.json({ error: 'title and fileUrl are required' }, { status: 400 });
      }
      const magazine = await prisma.magazine.create({
        data: { title, fileUrl, year: year ?? null },
      });
      return NextResponse.json(magazine, { status: 201 });
    }

    // Form-data file upload
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const year = formData.get('year') as string | null;
    const file = formData.get('file') as File | null;
    const coverFile = formData.get('cover') as File | null;

    if (!title || !file) {
      return NextResponse.json({ error: 'title and file are required' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const fileBytes = await file.arrayBuffer();
    const filename = `${uuidv4()}-${file.name.replace(/\s+/g, '_')}`;
    await writeFile(path.join(uploadDir, filename), Buffer.from(fileBytes));
    const fileUrl = `/uploads/${filename}`;

    let coverUrl: string | null = null;
    if (coverFile) {
      const coverBytes = await coverFile.arrayBuffer();
      const coverFilename = `${uuidv4()}-${coverFile.name.replace(/\s+/g, '_')}`;
      await writeFile(path.join(uploadDir, coverFilename), Buffer.from(coverBytes));
      coverUrl = `/uploads/${coverFilename}`;
    }

    const magazine = await prisma.magazine.create({
      data: { title, fileUrl, coverUrl, year: year ?? null },
    });

    return NextResponse.json(magazine, { status: 201 });
  } catch (error) {
    console.error('Magazine POST error:', error);
    return NextResponse.json({ error: 'Failed to upload magazine' }, { status: 500 });
  }
}
