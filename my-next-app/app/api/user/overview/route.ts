import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { apiError } from "@/lib/http";
import { connectToDatabase } from "@/lib/db";
import Entry from "@/models/Entry";

export async function GET(request: NextRequest) {
  const auth = await requireUser(undefined, request);
  if (auth.response) return auth.response;
  try {
    await connectToDatabase();
    const [total, recent] = await Promise.all([
      Entry.countDocuments({ createdBy: auth.user!.id }),
      Entry.find({ createdBy: auth.user!.id }).sort({ createdAt: -1 }).limit(5).lean(),
    ]);
    return NextResponse.json({ user: auth.user, total, recent });
  } catch (error) {
    return apiError(error);
  }
}
