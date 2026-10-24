import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { registerSchema } from "@/lib/validations/auth";
import { apiError, messageError } from "@/lib/http";
import { registerUser } from "@/services/auth.service";

export async function POST(request: NextRequest) {
  try {
    const input = registerSchema.parse(await request.json());
    const sessionUser = await registerUser(input);
    await createSession(sessionUser);
    return NextResponse.json({ user: sessionUser }, { status: 201 });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === 11000) return messageError("An account with this email already exists.", 409);
    return apiError(error);
  }
}
