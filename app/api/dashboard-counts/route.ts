import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAuth(req);
    if (error) return error;

    const [buzz, inquiry, events, questionPapers, examCirculars, magazines] =
      await prisma.$transaction([
        prisma.buzz.count(),
        prisma.inquiry.count(),
        prisma.event.count(),
        prisma.questionPaper.count(),
        prisma.examCircular.count(),
        prisma.magazine.count(),
      ]);

    return NextResponse.json({
      buzz,
      inquiry,
      events,
      'question-papers': questionPapers,
      'exam-circulars': examCirculars,
      magazines,
    });
  } catch (error) {
    console.error('Dashboard count error:', error);
    return NextResponse.json({ error: 'Failed to load counts' }, { status: 500 });
  }
}
