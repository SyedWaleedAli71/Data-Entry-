import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function apiError(error: unknown) {
  if (error instanceof SyntaxError) {
    return NextResponse.json({ error: "The request body must contain valid JSON." }, { status: 400 });
  }
  if (error instanceof ZodError) {
    return NextResponse.json({ error: "Please check the fields and try again.", details: error.flatten().fieldErrors }, { status: 400 });
  }
  console.error("API request failed:", error);
  if (error instanceof Error && (error.message === "MONGODB_URI is not configured." || error.name.includes("ServerSelectionError"))) {
    return NextResponse.json({ error: "The database is unavailable. Check MONGODB_URI and your MongoDB network access." }, { status: 503 });
  }
  return NextResponse.json({ error: "The request could not be completed. Please try again." }, { status: 500 });
}

export function messageError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function validObjectId(value: string) {
  return /^[a-f\d]{24}$/i.test(value);
}
