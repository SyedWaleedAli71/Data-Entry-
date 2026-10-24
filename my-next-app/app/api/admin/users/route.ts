import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { apiError } from "@/lib/http";
import { listUsers } from "@/services/user.service";

export async function GET(request: NextRequest) {
  const auth = await requireUser("admin", request);
  if (auth.response) return auth.response;
  try {
    const params = request.nextUrl.searchParams;
    return NextResponse.json(await listUsers(Number(params.get("page") ?? 1), Number(params.get("limit") ?? 10), params.get("search") ?? ""));
  } catch (error) {
    return apiError(error);
  }
}
