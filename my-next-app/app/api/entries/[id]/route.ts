import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { apiError, messageError, validObjectId } from "@/lib/http";
import { entrySchema } from "@/lib/validations/entry";
import Entry from "@/models/Entry";
import { connectToDatabase } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const auth = await requireUser(undefined, _request);
  if (auth.response) return auth.response;
  const { id } = await params;
  if (!validObjectId(id)) return messageError("Entry not found.", 404);
  try {
    await connectToDatabase();
    const filter = auth.user!.role === "admin" ? { _id: id } : { _id: id, createdBy: auth.user!.id };
    const entry = await Entry.findOne(filter).populate("createdBy", "name email").lean();
    if (!entry) return messageError("Entry not found.", 404);
    return NextResponse.json({ entry });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const auth = await requireUser(undefined, request);
  if (auth.response) return auth.response;
  const { id } = await params;
  if (!validObjectId(id)) return messageError("Entry not found.", 404);
  try {
    const input = entrySchema.parse(await request.json());
    await connectToDatabase();
    const filter = auth.user!.role === "admin" ? { _id: id } : { _id: id, createdBy: auth.user!.id };
    const entry = await Entry.findOneAndUpdate(filter, input, { new: true, runValidators: true });
    if (!entry) return messageError("Entry not found or you do not have permission to edit it.", 404);
    return NextResponse.json({ entry });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const auth = await requireUser(undefined, _request);
  if (auth.response) return auth.response;
  const { id } = await params;
  if (!validObjectId(id)) return messageError("Entry not found.", 404);
  try {
    await connectToDatabase();
    const filter = auth.user!.role === "admin" ? { _id: id } : { _id: id, createdBy: auth.user!.id };
    const entry = await Entry.findOneAndDelete(filter);
    if (!entry) return messageError("Entry not found or you do not have permission to delete it.", 404);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
