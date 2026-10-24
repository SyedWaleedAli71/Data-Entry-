import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

const cookieName = "dataflow_session";
const sessionDuration = 60 * 60 * 24 * 7;

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET must contain at least 32 characters.");
  return new TextEncoder().encode(secret);
}

export type SessionUser = { id: string; name: string; email: string; role: "user" | "admin" };

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ name: user.name, email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${sessionDuration}s`)
    .sign(secretKey());
  const store = await cookies();
  store.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionDuration,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.set(cookieName, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
}

export async function getCurrentUser(token?: string | null): Promise<SessionUser | null> {
  const sessionToken = token === undefined ? (await cookies()).get(cookieName)?.value : token;
  if (!sessionToken) return null;
  const key = secretKey();
  let payload;
  try {
    ({ payload } = await jwtVerify(sessionToken, key));
  } catch {
    return null;
  }
  if (!payload.sub) return null;
  await connectToDatabase();
  const user = await User.findById(payload.sub).select("name email role accountStatus").lean();
  if (!user || user.accountStatus !== "active") return null;
  return { id: String(user._id), name: user.name, email: user.email, role: user.role };
}

export async function requireUser(role?: "user" | "admin", request?: NextRequest) {
  let user: SessionUser | null;
  try {
    user = await getCurrentUser(request ? request.cookies.get(cookieName)?.value ?? null : undefined);
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error && String(error.digest).startsWith("NEXT_PRERENDER")) {
      throw error;
    }
    console.error("Unable to verify the current session:", error);
    return { user: null, response: Response.json({ error: "Authentication is temporarily unavailable. Check the database configuration." }, { status: 503 }) };
  }
  if (!user) return { user: null, response: Response.json({ error: "Sign in to continue." }, { status: 401 }) };
  if (role && user.role !== role) return { user: null, response: Response.json({ error: "You do not have permission to do that." }, { status: 403 }) };
  return { user, response: null };
}
