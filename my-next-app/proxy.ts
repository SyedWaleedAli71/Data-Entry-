// TODO: Add request-level routing checks; keep authorization enforcement in server code too.
import { NextResponse } from "next/server";

export function proxy() {
  return NextResponse.next();
}
