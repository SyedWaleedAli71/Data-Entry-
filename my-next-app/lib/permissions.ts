import type { SessionUser } from "@/lib/auth";

export function canManageEntry(user: SessionUser, createdBy: string) {
  return user.role === "admin" || user.id === createdBy;
}
