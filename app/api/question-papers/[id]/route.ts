import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// PUT /api/question-papers/[id] — protected (update fields, optionally replace file)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth(req);
  if (error) return error;

  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const existing = await prisma.questionPaper.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const subject = formData.get("subject") as string;
    const year = formData.get("year") as string;
    const file = formData.get("file") as File | null;

    if (!subject || !year) {
      return NextResponse.json({ error: "subject and year are required" }, { status: 400 });
    }

    let fileUrl = existing.fileUrl;

    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${uuidv4()}-${file.name.replace(/\s+/g, "_")}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), buffer);
      fileUrl = `/uploads/${filename}`;

      if (existing.fileUrl) {
        const oldPath = path.join(process.cwd(), "public", existing.fileUrl);
        try {
          await unlink(oldPath);
        } catch {
          /* file may not exist */
        }
      }
    }

    const updated = await prisma.questionPaper.update({
      where: { id },
      data: { name: subject, subject, year, fileUrl },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("QuestionPaper PUT error:", err);
    return NextResponse.json({ error: "Failed to update question paper" }, { status: 500 });
  }
}

// DELETE /api/question-papers/[id] — protected
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth(req);
  if (error) return error;

  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const paper = await prisma.questionPaper.findUnique({ where: { id } });

    if (!paper) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Remove file from disk
    if (paper.fileUrl) {
      const filePath = path.join(process.cwd(), "public", paper.fileUrl);
      try {
        await unlink(filePath);
      } catch {
        /* file may not exist */
      }
    }

    await prisma.questionPaper.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("QuestionPaper DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete question paper" }, { status: 500 });
  }
}
