import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// GET /api/question-papers — open
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "10");
    const category = searchParams.get("category");
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {};
    if (category && category !== "all") {
      where.year = category;
    }

    const [items, total] = await prisma.$transaction([
      prisma.questionPaper.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.questionPaper.count({ where }),
    ]);

    return NextResponse.json({ items, total, totalPages: Math.ceil(total / limit), page });
  } catch (error) {
    console.error("QuestionPaper GET error:", error);
    return NextResponse.json({ error: "Failed to fetch question papers" }, { status: 500 });
  }
}

// POST /api/question-papers — protected (file upload)
export async function POST(req: NextRequest) {
  const { error } = await requireAuth(req);
  if (error) return error;

  try {
    const formData = await req.formData();
    const subject = formData.get("subject") as string;
    const year = formData.get("year") as string;
    const file = formData.get("file") as File | null;

    if (!subject || !year || !file) {
      return NextResponse.json({ error: "subject, year, and file are required" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${uuidv4()}-${file.name.replace(/\s+/g, "_")}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    const fileUrl = `/uploads/${filename}`;
    const paper = await prisma.questionPaper.create({
      data: { name: subject, subject, year, fileUrl },
    });

    return NextResponse.json(paper, { status: 201 });
  } catch (error) {
    console.error("QuestionPaper POST error:", error);
    return NextResponse.json({ error: "Failed to upload question paper" }, { status: 500 });
  }
}
