import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getCountFromServer } from "firebase/firestore";

export async function GET() {
  try {
    const collections = [
      "buzz",
      "inquiry",
      "events",
      "question-papers",
      "exam-circulars",
      "magazines",
    ];

    const result: any = {};

    // Fetch count for each collection
    for (const col of collections) {
      const snap = await getCountFromServer(collection(db, col));
      result[col] = snap.data().count;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Dashboard count error:", error);
    return NextResponse.json({ error: "Failed to load counts" }, { status: 500 });
  }
}
