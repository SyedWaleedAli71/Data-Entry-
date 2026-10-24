import { EntryForm } from "@/components/forms/entry-form";

export default function AdminNewEntryPage() {
  return <div className="space-y-6"><div><p className="eyebrow">Management</p><h1 className="page-title">Create an entry</h1><p className="mt-2 text-sm text-slate-500">Add a record to the shared workspace.</p></div><EntryForm admin /></div>;
}
