import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

// Note: params is now a Promise in Next.js 16
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    // 1. Await the params to get the filename
    const resolvedParams = await params;
    const filename = resolvedParams.filename;
    
    // 2. Build the path to the file
    const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
    const fileBuffer = await readFile(filePath);

    // 3. Set the correct Content-Type
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.pdf') contentType = 'application/pdf';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';

    return new NextResponse(fileBuffer, {
      headers: { 'Content-Type': contentType },
    });
  } catch (error) {
    console.error('File not found dynamically:', error);
    return new NextResponse('File not found', { status: 404 });
  }
}