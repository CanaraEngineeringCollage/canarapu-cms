import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// GET /api/non-academic-toppers — open
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "10");
    const skip = (page - 1) * limit;

    const [items, total] = await prisma.$transaction([
      prisma.nonAcademicTopper.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.nonAcademicTopper.count(),
    ]);

    return NextResponse.json({ items, total, totalPages: Math.ceil(total / limit), page });
  } catch (error) {
    console.error("NonAcademicTopper GET error:", error);
    return NextResponse.json({ error: "Failed to fetch non-academic toppers" }, { status: 500 });
  }
}

// POST /api/non-academic-toppers — protected (file upload)
export async function POST(req: NextRequest) {
  const { error } = await requireAuth(req);
  if (error) return error;

  try {
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

    const topper = await prisma.nonAcademicTopper.create({
      data: { imageUrl },
    });

    return NextResponse.json(topper, { status: 201 });
  } catch (error) {
    console.error("NonAcademicTopper POST error:", error);
    return NextResponse.json({ error: "Failed to upload non-academic topper" }, { status: 500 });
  }
}
