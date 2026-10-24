import { EntryForm } from "@/components/forms/entry-form";

export default function NewUserEntryPage() {
  return <div className="space-y-6"><div><p className="eyebrow">My entries</p><h1 className="page-title">Create an entry</h1><p className="mt-2 text-sm text-slate-500">Add the details you need to keep on record.</p></div><EntryForm /></div>;
}
