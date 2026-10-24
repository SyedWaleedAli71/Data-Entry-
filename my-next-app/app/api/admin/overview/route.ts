import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { apiError } from "@/lib/http";
import { getAdminOverview } from "@/services/user.service";

export async function GET(request: NextRequest) {
  const auth = await requireUser("admin", request);
  if (auth.response) return auth.response;
  try {
    return NextResponse.json(await getAdminOverview());
  } catch (error) {
    return apiError(error);
  }
}
