import { Suspense } from "react";
import { redirect } from "next/navigation";

export default function EditAdminEntryPage({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={null}><RedirectEntry params={params} /></Suspense>;
}

async function RedirectEntry({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return redirect(`/WaleedAdmin/entries/${id}/edit`);
}
