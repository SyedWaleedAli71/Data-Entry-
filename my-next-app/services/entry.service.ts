import { connectToDatabase } from "@/lib/db";
import Entry from "@/models/Entry";

export async function listEntries({
  page = 1,
  limit = 10,
  search = "",
  category = "",
  status = "",
  sort: sortDirection = "desc",
  ownerId,
}: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  sort?: "asc" | "desc";
  ownerId?: string;
}) {
  await connectToDatabase();
  const filter: Record<string, unknown> = {};
  if (ownerId) filter.createdBy = ownerId;
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = ["title", "fullName", "email", "category"].map((field) => ({ [field]: { $regex: escaped, $options: "i" } }));
  }
  const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
  const safeLimit = Number.isFinite(limit) ? Math.min(50, Math.max(1, Math.floor(limit))) : 10;
  const [items, total] = await Promise.all([
    Entry.find(filter).sort({ createdAt: sortDirection === "asc" ? 1 : -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit).populate("createdBy", "name email").lean(),
    Entry.countDocuments(filter),
  ]);
  return { items, page: safePage, limit: safeLimit, total, pages: Math.ceil(total / safeLimit) };
}
