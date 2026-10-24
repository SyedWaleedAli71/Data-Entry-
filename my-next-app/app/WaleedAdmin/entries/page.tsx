import { EntryTable } from "@/components/dashboard/entry-table";

export default function AdminEntriesPage() {
  return <div className="space-y-6"><div><p className="eyebrow">Management</p><h1 className="page-title">All entries</h1><p className="mt-2 text-sm text-slate-500">Search and manage records across the shared workspace.</p></div><EntryTable admin /></div>;
}
