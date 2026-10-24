import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireUser } from "@/lib/auth";
import { apiError, messageError, validObjectId } from "@/lib/http";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const auth = await requireUser("admin", request);
  if (auth.response) return auth.response;
  const { id } = await params;
  if (!validObjectId(id)) return messageError("User not found.", 404);
  try {
    const body = await request.json();
    if (!body || (body.accountStatus === undefined && body.role === undefined)) return messageError("Provide an account status or role.", 400);
    if (body.accountStatus !== undefined && !["active", "suspended"].includes(body.accountStatus)) return messageError("Invalid account status.", 400);
    if (body.role !== undefined && !["user", "admin"].includes(body.role)) return messageError("Invalid account role.", 400);
    if (auth.user!.id === id && (body.accountStatus === "suspended" || body.role === "user")) return messageError("You cannot disable or demote your own administrator account.", 400);
    await connectToDatabase();
    const session = await mongoose.startSession();
    let updated;
    try {
      await session.withTransaction(async () => {
        const existing = await User.findById(id).session(session);
        if (!existing) throw new Error("USER_NOT_FOUND");
        const nextRole = body.role ?? existing.role;
        const nextStatus = body.accountStatus ?? existing.accountStatus;
        if (existing.role === "admin" && existing.accountStatus === "active" && (nextRole !== "admin" || nextStatus !== "active")) {
          const activeAdmins = await User.countDocuments({ role: "admin", accountStatus: "active" }).session(session);
          if (activeAdmins <= 1) throw new Error("LAST_ADMIN");
        }
        const update: Record<string, string> = {};
        if (body.role !== undefined) update.role = body.role;
        if (body.accountStatus !== undefined) update.accountStatus = body.accountStatus;
        updated = await User.findByIdAndUpdate(id, update, { new: true, session })
          .select("name email role accountStatus createdAt");
      });
    } finally {
      await session.endSession();
    }
    return NextResponse.json({ user: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "USER_NOT_FOUND") return messageError("User not found.", 404);
    if (error instanceof Error && error.message === "LAST_ADMIN") return messageError("The last active administrator cannot be suspended.", 409);
    return apiError(error);
  }
}
