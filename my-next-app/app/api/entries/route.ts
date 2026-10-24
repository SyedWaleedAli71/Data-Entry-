import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { apiError } from "@/lib/http";
import { entrySchema } from "@/lib/validations/entry";
import Entry from "@/models/Entry";
import { listEntries } from "@/services/entry.service";
import { connectToDatabase } from "@/lib/db";

export async function GET(request: NextRequest) {
  const auth = await requireUser(undefined, request);
  if (auth.response) return auth.response;
  try {
    const params = request.nextUrl.searchParams;
    const data = await listEntries({
      ownerId: auth.user!.id,
      page: Number(params.get("page") ?? 1),
      limit: Number(params.get("limit") ?? 10),
      search: params.get("search") ?? "",
    });
    return NextResponse.json(data);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireUser(undefined, request);
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
