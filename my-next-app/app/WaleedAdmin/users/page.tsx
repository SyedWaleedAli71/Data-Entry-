import { UsersTable } from "@/components/dashboard/users-table";

export default function AdminUsersPage() {
  return <div className="space-y-6"><div><p className="eyebrow">Workspace</p><h1 className="page-title">User management</h1><p className="mt-2 text-sm text-slate-500">Review account access and activity. Administrator roles are protected.</p></div><UsersTable /></div>;
}
