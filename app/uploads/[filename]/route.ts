import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    
    // Look for the file dynamically on the server's hard drive
    const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
    const fileBuffer = await readFile(filePath);

    // Determine the correct file type so the browser displays it properly
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.pdf') contentType = 'application/pdf';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';

    // Serve the file to the user
    return new NextResponse(fileBuffer, {
      headers: { 'Content-Type': contentType },
    });
  } catch (error) {
    console.error('File not found dynamically:', error);
    return new NextResponse('File not found', { status: 404 });
  }
}