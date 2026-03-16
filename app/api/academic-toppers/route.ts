import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// GET /api/academic-toppers
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // NEW: Handle optimized unique years fetch directly from the DB
    if (searchParams.get("action") === "getYears") {
      const uniqueYears = await prisma.academicTopper.findMany({
        distinct: ['year'],
        select: { year: true },
        orderBy: { year: 'desc' }
      });
      return NextResponse.json(uniqueYears.map(y => y.year));
    }

    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "10");
    const year = searchParams.get("year") as string | null;
    const search = searchParams.get("search") as string | null; // NEW: Search parameter
    const skip = (page - 1) * limit;

    // Build the query constraints
    const where: any = {};
    if (year) where.year = year;
    if (search) where.name = { contains: search, mode: "insensitive" }; // Case-insensitive DB search

    const [items, total] = await prisma.$transaction([
      prisma.academicTopper.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.academicTopper.count({ where }),
    ]);

    return NextResponse.json({ items, total, totalPages: Math.ceil(total / limit), page });
  } catch (error) {
    console.error("AcademicTopper GET error:", error);
    return NextResponse.json({ error: "Failed to fetch academic toppers" }, { status: 500 });
  }
}

// POST /api/academic-toppers — protected (file upload)
export async function POST(req: NextRequest) {
  const { error } = await requireAuth(req);
  if (error) return error;

  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const year = formData.get("year") as string;
    const file = formData.get("image") as File | null;

    if (!name || !year || !file) {
      return NextResponse.json({ error: "name, year, and image are required" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${uuidv4()}-${file.name.replace(/\s+/g, "_")}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);
    const imageUrl = `/uploads/${filename}`;

    const topper = await prisma.academicTopper.create({
      data: { name, year, imageUrl },
    });

    return NextResponse.json(topper, { status: 201 });
  } catch (error) {
    console.error("AcademicTopper POST error:", error);
    return NextResponse.json({ error: "Failed to upload academic topper" }, { status: 500 });
  }
}