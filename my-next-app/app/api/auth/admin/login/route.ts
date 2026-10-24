import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validations/auth";
import { apiError, messageError } from "@/lib/http";
import { allowLoginAttempt } from "@/lib/rate-limit";
import { authenticateCredentials } from "@/services/auth.service";

export async function POST(request: NextRequest) {
  try {
    if (!allowLoginAttempt(`admin:${request.headers.get("x-forwarded-for") ?? "local"}`)) return messageError("Too many attempts. Try again in 15 minutes.", 429);
    const input = loginSchema.parse(await request.json());
    const sessionUser = await authenticateCredentials(input, "admin");
    if (!sessionUser) return messageError("The administrator email or password is incorrect.", 401);
    await createSession(sessionUser);
    return NextResponse.json({ user: sessionUser });
  } catch (error) {
    return apiError(error);
  }
}
