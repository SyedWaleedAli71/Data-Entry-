"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ClipboardList, FilePlus2, LoaderCircle, Users, Workflow } from "lucide-react";
import { toast } from "sonner";
import { Status } from "@/components/dashboard/entry-table";

type EntryData = { _id: string; title: string; fullName: string; category: string; status: "new" | "in_progress" | "completed"; createdAt: string };
type AdminOverviewData = {
  users: number;
  entries: number;
  todayEntries: number;
  recentEntries: (EntryData & { createdBy?: { name: string } | null })[];
  recentUsers: { _id: string; name: string; email: string; role: "user" | "admin" }[];
  statuses: { _id: string; count: number }[];
};

export function UserOverview() {
  const [data, setData] = useState<{ user: { name: string }; total: number; recent: EntryData[] }>();
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/user/overview").then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error); setData(d); }).catch((e: unknown) => toast.error(e instanceof Error ? e.message : "Unable to load dashboard.")).finally(() => setLoading(false)); }, []);
  if (loading) return <Loading />;
  if (!data) return <Failure />;
  return <div className="space-y-8">
    <section className="flex flex-col justify-between gap-5 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 p-7 text-white sm:flex-row sm:items-center sm:p-9"><div><p className="text-sm font-medium text-indigo-100">Your workspace</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Welcome, {data.user.name.split(" ")[0]}.</h1><p className="mt-2 max-w-lg text-sm leading-6 text-indigo-100">Keep your records organized, secure, and easy to find.</p></div><Link href="/user/entries/new" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-indigo-700 shadow-sm hover:bg-indigo-50"><FilePlus2 size={17} />Add new entry</Link></section>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><Metric title="Your entries" value={data.total} icon={<ClipboardList size={19} />} note="Records in your workspace" /><Metric title="Recent activity" value={data.recent.length} icon={<Workflow size={19} />} note="Latest entries shown below" /><div className="surface-card flex items-center justify-between p-5"><div><p className="text-sm text-slate-500">Need to add a record?</p><Link href="/user/entries/new" className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600">Create an entry <ArrowRight size={16} /></Link></div><span className="rounded-xl bg-violet-50 p-3 text-violet-600"><FilePlus2 size={20} /></span></div></section>
    <section className="surface-card overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 p-5"><div><h2 className="font-semibold text-slate-900">Recent entries</h2><p className="mt-1 text-sm text-slate-500">The latest records you created</p></div><Link href="/user/entries" className="text-sm font-semibold text-indigo-600">View all</Link></div>{data.recent.length === 0 ? <Empty title="No entries yet" text="Create your first entry to start keeping everything in one place." href="/user/entries/new" /> : <div className="divide-y divide-slate-100">{data.recent.map((entry) => <Link href={`/user/entries/${entry._id}/edit`} key={entry._id} className="flex flex-col gap-3 p-5 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{entry.title}</p><p className="mt-1 text-sm text-slate-500">{entry.fullName} · {entry.category}</p></div><div className="flex items-center gap-4"><Status status={entry.status} /><span className="text-xs text-slate-400">{new Date(entry.createdAt).toLocaleDateString()}</span></div></Link>)}</div>}</section>
  </div>;
}

export function AdminOverview() {
  const [data, setData] = useState<AdminOverviewData>();
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/admin/overview").then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error); setData(d); }).catch((e: unknown) => toast.error(e instanceof Error ? e.message : "Unable to load overview.")).finally(() => setLoading(false)); }, []);
  if (loading) return <Loading />;
  if (!data) return <Failure />;
  const statusCounts = new Map(data.statuses.map((item) => [item._id, item.count]));
  return <div className="space-y-8">
    <div><p className="eyebrow">Overview</p><h1 className="page-title">Admin dashboard</h1><p className="mt-2 text-sm text-slate-500">A clear view of activity across your DataFlow workspace.</p></div>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric title="Registered users" value={data.users} icon={<Users size={19} />} note="All accounts" /><Metric title="Total entries" value={data.entries} icon={<ClipboardList size={19} />} note="Shared records" /><Metric title="Created today" value={data.todayEntries} icon={<Workflow size={19} />} note="Entries added today" /><Metric title="Completed" value={statusCounts.get("completed") ?? 0} icon={<ClipboardList size={19} />} note="Finished entries" /></section>
    <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]"><div className="surface-card overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 p-5"><div><h2 className="font-semibold">Recent entries</h2><p className="mt-1 text-sm text-slate-500">Latest activity across all users</p></div><Link href="/WaleedAdmin/entries" className="text-sm font-semibold text-indigo-600">Manage entries</Link></div>{data.recentEntries.length === 0 ? <Empty title="No entries yet" text="User-created and admin-created records will appear here." /> : <div className="divide-y divide-slate-100">{data.recentEntries.map((item) => <div key={item._id} className="flex items-center justify-between gap-3 p-5"><div className="min-w-0"><p className="truncate font-medium">{item.title}</p><p className="mt-1 text-xs text-slate-500">{item.fullName} · {item.createdBy?.name ?? "Unknown user"}</p></div><Status status={item.status} /></div>)}</div>}</div>
      <div className="surface-card overflow-hidden"><div className="border-b border-slate-100 p-5"><h2 className="font-semibold">Recent users</h2><p className="mt-1 text-sm text-slate-500">Newly registered accounts</p></div>{data.recentUsers.map((item) => <div className="flex items-center justify-between border-b border-slate-50 p-4 last:border-0" key={item._id}><div><p className="text-sm font-semibold">{item.name}</p><p className="text-xs text-slate-500">{item.email}</p></div><span className="status-badge status-blue">{item.role}</span></div>)}<Link href="/WaleedAdmin/users" className="flex items-center gap-2 p-4 text-sm font-semibold text-indigo-600">Manage users <ArrowRight size={15} /></Link></div></section>
    <section className="surface-card p-5"><h2 className="font-semibold">Entry status</h2><div className="mt-4 grid gap-3 sm:grid-cols-3">{([{ key: "new", label: "New", className: "status-blue" }, { key: "in_progress", label: "In progress", className: "status-amber" }, { key: "completed", label: "Completed", className: "status-green" }] as const).map(({ key, label, className }) => <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4" key={key}><span className={`status-badge ${className}`}>{label}</span><span className="text-xl font-bold">{statusCounts.get(key) ?? 0}</span></div>)}</div></section>
  </div>;
}

function Metric({ title, value, icon, note }: { title: string; value: number; icon: React.ReactNode; note: string }) { return <div className="surface-card p-5"><div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-500">{title}</span><span className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">{icon}</span></div><p className="mt-4 text-3xl font-bold tracking-tight">{value.toLocaleString()}</p><p className="mt-1 text-xs text-slate-400">{note}</p></div>; }
function Loading() { return <div className="flex items-center gap-2 py-20 text-sm text-slate-500"><LoaderCircle size={18} className="animate-spin" />Loading dashboard…</div>; }
function Failure() { return <div className="surface-card p-8 text-center"><h2 className="font-semibold">Couldn’t load your dashboard</h2><p className="mt-2 text-sm text-slate-500">Please refresh the page and try again.</p></div>; }
function Empty({ title, text, href }: { title: string; text: string; href?: string }) { return <div className="px-6 py-12 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><ClipboardList size={21} /></span><p className="mt-4 font-semibold">{title}</p><p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">{text}</p>{href && <Link href={href} className="button-primary mt-5 inline-flex"><FilePlus2 size={16} />Create entry</Link>}</div>; }
