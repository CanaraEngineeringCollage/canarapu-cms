import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// PUT /api/non-academic-toppers/[id] — protected (replace image)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth(req);
  if (error) return error;

  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const existing = await prisma.nonAcademicTopper.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "image is required" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${uuidv4()}-${file.name.replace(/\s+/g, "_")}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);
    const imageUrl = `/uploads/${filename}`;

    if (existing.imageUrl) {
      const oldPath = path.join(process.cwd(), "public", existing.imageUrl);
      try {
        await unlink(oldPath);
      } catch {
        /* file may not exist */
      }
    }

    const updated = await prisma.nonAcademicTopper.update({
      where: { id },
      data: { imageUrl },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("NonAcademicTopper PUT error:", err);
    return NextResponse.json({ error: "Failed to update non-academic topper" }, { status: 500 });
  }
}

// DELETE /api/non-academic-toppers/[id] — protected
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth(req);
  if (error) return error;

  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const topper = await prisma.nonAcademicTopper.findUnique({ where: { id } });

    if (!topper) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (topper.imageUrl) {
      const filePath = path.join(process.cwd(), "public", topper.imageUrl);
      try {
        await unlink(filePath);
      } catch {
        /* file may not exist */
      }
    }

    await prisma.nonAcademicTopper.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("NonAcademicTopper DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete non-academic topper" }, { status: 500 });
  }
}
