import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { apiError } from "@/lib/http";
import { entrySchema } from "@/lib/validations/entry";
import { listEntries } from "@/services/entry.service";
import Entry from "@/models/Entry";
import { connectToDatabase } from "@/lib/db";

export async function GET(request: NextRequest) {
  const auth = await requireUser("admin", request);
  if (auth.response) return auth.response;
  try {
    const params = request.nextUrl.searchParams;
    return NextResponse.json(await listEntries({
      page: Number(params.get("page") ?? 1),
      limit: Number(params.get("limit") ?? 10),
      search: params.get("search") ?? "",
      category: params.get("category") ?? "",
      status: params.get("status") ?? "",
      sort: params.get("sort") === "asc" ? "asc" : "desc",
    }));
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireUser("admin", request);
  if (auth.response) return auth.response;
  try {
    const input = entrySchema.parse(await request.json());
    await connectToDatabase();
    const entry = await Entry.create({ ...input, createdBy: auth.user!.id });
    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
