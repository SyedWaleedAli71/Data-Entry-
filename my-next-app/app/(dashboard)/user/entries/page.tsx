import { EntryTable } from "@/components/dashboard/entry-table";

export default function UserEntriesPage() {
  return <div className="space-y-6"><div><p className="eyebrow">Workspace</p><h1 className="page-title">My entries</h1><p className="mt-2 text-sm text-slate-500">Your records, all in one place.</p></div><EntryTable /></div>;
}
