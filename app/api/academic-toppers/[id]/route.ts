import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// PUT /api/academic-toppers/[id] — protected (update name, year, optionally replace image)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth(req);
  if (error) return error;

  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const existing = await prisma.academicTopper.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const year = formData.get("year") as string;
    const file = formData.get("image") as File | null;

    if (!name || !year) {
      return NextResponse.json({ error: "name and year are required" }, { status: 400 });
    }

    let imageUrl = existing.imageUrl;

    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${uuidv4()}-${file.name.replace(/\s+/g, "_")}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), buffer);
      imageUrl = `/uploads/${filename}`;

      if (existing.imageUrl) {
        const oldPath = path.join(process.cwd(), "public", existing.imageUrl);
        try {
          await unlink(oldPath);
        } catch {
          /* file may not exist */
        }
      }
    }

    const updated = await prisma.academicTopper.update({
      where: { id },
      data: { name, year, imageUrl },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("AcademicTopper PUT error:", err);
    return NextResponse.json({ error: "Failed to update academic topper" }, { status: 500 });
  }
}

// DELETE /api/academic-toppers/[id] — protected
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth(req);
  if (error) return error;

  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const topper = await prisma.academicTopper.findUnique({ where: { id } });

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

    await prisma.academicTopper.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("AcademicTopper DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete academic topper" }, { status: 500 });
  }
}
