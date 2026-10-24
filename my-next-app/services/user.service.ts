import { connectToDatabase } from "@/lib/db";
import Entry from "@/models/Entry";
import User from "@/models/User";

export async function getAdminOverview() {
  await connectToDatabase();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [users, entries, todayEntries, recentEntries, recentUsers, statuses] = await Promise.all([
    User.countDocuments(),
    Entry.countDocuments(),
    Entry.countDocuments({ createdAt: { $gte: today } }),
    Entry.find().sort({ createdAt: -1 }).limit(6).populate("createdBy", "name email").lean(),
    User.find().select("name email role accountStatus createdAt").sort({ createdAt: -1 }).limit(5).lean(),
    Entry.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);
  return { users, entries, todayEntries, recentEntries, recentUsers, statuses };
}

export async function listUsers(page: number, limit: number, search: string) {
  await connectToDatabase();
  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const filter = search
    ? { $or: [{ name: { $regex: escaped, $options: "i" } }, { email: { $regex: escaped, $options: "i" } }] }
    : {};
  const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
  const safeLimit = Number.isFinite(limit) ? Math.min(50, Math.max(1, Math.floor(limit))) : 10;
  const [items, total] = await Promise.all([
    User.find(filter).select("name email role accountStatus createdAt").sort({ createdAt: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit).lean(),
    User.countDocuments(filter),
  ]);
  const counts = await Entry.aggregate([{ $group: { _id: "$createdBy", count: { $sum: 1 } } }]);
  const entryCounts = new Map(counts.map((item) => [String(item._id), item.count]));
  return {
    items: items.map((user) => ({ ...user, entryCount: entryCounts.get(String(user._id)) ?? 0 })),
    page: safePage,
    limit: safeLimit,
    total,
    pages: Math.ceil(total / safeLimit),
  };
}
