"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Eye, LoaderCircle, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

type EntryRecord = {
  _id: string; title: string; fullName: string; email: string; category: string; status: "new" | "in_progress" | "completed";
  createdAt: string; description: string; phone: string; createdBy?: { name: string; email: string } | string;
};

export function EntryTable({ admin = false }: { admin?: boolean }) {
  const [entries, setEntries] = useState<EntryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("desc");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [detail, setDetail] = useState<EntryRecord | null>(null);
  const [loadingId, setLoadingId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), search });
      if (admin) { if (category) params.set("category", category); if (status) params.set("status", status); params.set("sort", sort); }
      const response = await fetch(`${admin ? "/api/admin/entries" : "/api/entries"}?${params}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to load entries.");
      setEntries(data.items); setPages(Math.max(1, data.pages));
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to load entries."); }
    finally { setLoading(false); }
  }, [admin, category, page, search, sort, status]);

  useEffect(() => { const timer = setTimeout(() => void load(), 250); return () => clearTimeout(timer); }, [load]);

  async function remove(id: string) {
    if (!window.confirm("Delete this entry? This action cannot be undone.")) return;
    setLoadingId(id);
    try {
      const response = await fetch(`/api/entries/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to delete entry.");
      toast.success("Entry deleted."); await load();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to delete entry."); }
    finally { setLoadingId(""); }
  }

  async function view(id: string) {
    try {
      const response = await fetch(`/api/entries/${id}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to load entry.");
      setDetail(data.entry);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to load entry."); }
  }

  const newHref = admin ? "/WaleedAdmin/entries/new" : "/user/entries/new";
  return (
    <>
      <div className="surface-card overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="field-control pl-10" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search entries…" /></div>
          {admin && <div className="flex flex-wrap gap-2"><select className="field-control min-w-32" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}><option value="">All categories</option>{["General", "Customer", "Finance", "Operations", "Other"].map((c) => <option key={c}>{c}</option>)}</select><select className="field-control min-w-32" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option value="">All statuses</option><option value="new">New</option><option value="in_progress">In progress</option><option value="completed">Completed</option></select><select aria-label="Sort by creation date" className="field-control min-w-36" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}><option value="desc">Newest first</option><option value="asc">Oldest first</option></select></div>}
          <Link href={newHref} className="button-primary shrink-0"><Plus size={17} />Add entry</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4">Entry</th><th className="px-5 py-4">Contact</th><th className="px-5 py-4">Category</th><th className="px-5 py-4">Status</th>{admin && <th className="px-5 py-4">Created by</th>}<th className="px-5 py-4">Created</th><th className="px-5 py-4 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? <tr><td colSpan={admin ? 7 : 6} className="px-5 py-12 text-center text-slate-500"><LoaderCircle size={20} className="mx-auto mb-2 animate-spin" />Loading entries…</td></tr>
                : entries.length === 0 ? <tr><td colSpan={admin ? 7 : 6} className="px-5 py-14 text-center"><div className="mx-auto max-w-sm"><p className="font-semibold text-slate-900">No entries found</p><p className="mt-1 text-sm text-slate-500">Create a new entry or adjust your search.</p><Link href={newHref} className="button-primary mt-4 inline-flex"><Plus size={16} />Add your first entry</Link></div></td></tr>
                  : entries.map((entry) => <tr key={entry._id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><p className="font-semibold text-slate-900">{entry.title}</p><p className="mt-1 max-w-48 truncate text-xs text-slate-500">{entry.description}</p></td><td className="px-5 py-4"><p>{entry.fullName}</p><p className="text-xs text-slate-500">{entry.email}</p></td><td className="px-5 py-4 text-slate-600">{entry.category}</td><td className="px-5 py-4"><Status status={entry.status} /></td>{admin && <td className="px-5 py-4 text-slate-600">{typeof entry.createdBy === "object" ? entry.createdBy?.name : "—"}</td>}<td className="px-5 py-4 text-slate-500">{new Date(entry.createdAt).toLocaleDateString()}</td><td className="px-5 py-4"><div className="flex justify-end gap-1"><button title="View details" className="icon-button" onClick={() => void view(entry._id)}><Eye size={17} /></button><Link title="Edit entry" className="icon-button" href={`${admin ? "/WaleedAdmin" : "/user"}/entries/${entry._id}/edit`}><Pencil size={17} /></Link><button title="Delete entry" className="icon-button text-rose-600" disabled={loadingId === entry._id} onClick={() => void remove(entry._id)}>{loadingId === entry._id ? <LoaderCircle size={17} className="animate-spin" /> : <Trash2 size={17} />}</button></div></td></tr>)}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-sm text-slate-500"><span>Page {page} of {pages}</span><div className="flex gap-2"><button className="button-secondary px-3 py-2" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><button className="button-secondary px-3 py-2" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button></div></div>
      </div>
      {detail && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onClick={() => setDetail(null)}><section role="dialog" aria-modal="true" className="surface-card w-full max-w-xl p-6" onClick={(e) => e.stopPropagation()}><div className="mb-5 flex items-start justify-between"><div><p className="text-sm text-slate-500">Entry details</p><h2 className="mt-1 text-xl font-bold">{detail.title}</h2></div><button className="button-secondary" onClick={() => setDetail(null)}>Close</button></div><div className="grid gap-4 sm:grid-cols-2"><Detail label="Full name" value={detail.fullName} /><Detail label="Email" value={detail.email} /><Detail label="Phone" value={detail.phone} /><Detail label="Category" value={detail.category} /><Detail label="Status" value={detail.status.replace("_", " ")} /><Detail label="Created" value={new Date(detail.createdAt).toLocaleString()} /></div><div className="mt-4"><Detail label="Description" value={detail.description} /></div></section></div>}
    </>
  );
}

export function Status({ status }: { status: EntryRecord["status"] }) {
  return <span className={`status-badge ${status === "completed" ? "status-green" : status === "in_progress" ? "status-amber" : "status-blue"}`}>{status.replace("_", " ")}</span>;
}
function Detail({ label, value }: { label: string; value: string }) { return <div><p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-sm text-slate-800">{value}</p></div>; }
