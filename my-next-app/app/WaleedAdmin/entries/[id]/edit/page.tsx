import { Suspense } from "react";
import { EntryForm } from "@/components/forms/entry-form";

export default function AdminEditEntryPage({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<p className="text-sm text-slate-500">Loading entry…</p>}><EditEntry params={params} /></Suspense>;
}

async function EditEntry({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <div className="space-y-6"><div><p className="eyebrow">Management</p><h1 className="page-title">Edit entry</h1><p className="mt-2 text-sm text-slate-500">Update this shared workspace record.</p></div><EntryForm entryId={id} admin /></div>;
}
