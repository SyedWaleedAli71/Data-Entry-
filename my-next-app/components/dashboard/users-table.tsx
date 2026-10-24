"use client";

import { useCallback, useEffect, useState } from "react";
import { LoaderCircle, Search } from "lucide-react";
import { toast } from "sonner";

type User = { _id: string; name: string; email: string; role: "user" | "admin"; accountStatus: "active" | "suspended"; createdAt: string; entryCount: number };

export function UsersTable() {
  const [items, setItems] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to load users.");
      setItems(data.items);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to load users."); }
    finally { setLoading(false); }
  }, [search]);
  useEffect(() => { const timer = setTimeout(() => void load(), 250); return () => clearTimeout(timer); }, [load]);

  async function changeStatus(user: User) {
    const accountStatus = user.accountStatus === "active" ? "suspended" : "active";
    if (!window.confirm(`${accountStatus === "suspended" ? "Suspend" : "Reactivate"} ${user.name}'s account?`)) return;
    setPending(user._id);
    try {
      const response = await fetch(`/api/admin/users/${user._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accountStatus }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to update account.");
      toast.success(`Account ${accountStatus}.`);
      await load();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to update account."); }
    finally { setPending(""); }
  }

  async function changeRole(user: User, role: User["role"]) {
    if (role === user.role) return;
    if (!window.confirm(`Change ${user.name}'s role to ${role}?`)) return;
    setPending(user._id);
    try {
      const response = await fetch(`/api/admin/users/${user._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to update role.");
      toast.success("User role updated.");
      await load();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to update role."); }
    finally { setPending(""); }
  }

  return     <div className="surface-card overflow-hidden"><div className="border-b border-slate-100 p-5"><div className="relative max-w-sm"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="field-control pl-10" placeholder="Search people…" value={search} onChange={(e) => setSearch(e.target.value)} /></div></div><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{["User", "Role", "Entries", "Registered", "Account", "Actions"].map((label) => <th key={label} className="px-5 py-4">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{loading ? <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-500"><LoaderCircle size={20} className="mx-auto mb-2 animate-spin" />Loading users…</td></tr> : items.length === 0 ? <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-500">No users found.</td></tr> : items.map((user) => <tr key={user._id}><td className="px-5 py-4"><p className="font-semibold">{user.name}</p><p className="text-xs text-slate-500">{user.email}</p></td><td className="px-5 py-4"><span className={`status-badge ${user.role === "admin" ? "status-violet" : "status-blue"}`}>{user.role}</span></td><td className="px-5 py-4">{user.entryCount}</td><td className="px-5 py-4 text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td><td className="px-5 py-4"><span className={`status-badge ${user.accountStatus === "active" ? "status-green" : "status-rose"}`}>{user.accountStatus}</span></td><td className="flex gap-2 px-5 py-4"><select aria-label={`Change role for ${user.name}`} className="field-control min-w-24 py-2" value={user.role} disabled={pending === user._id} onChange={(e) => void changeRole(user, e.target.value === "admin" ? "admin" : "user")}><option value="user">User</option><option value="admin">Admin</option></select><button disabled={pending === user._id} onClick={() => void changeStatus(user)} className="button-secondary px-3 py-2">{pending === user._id ? <LoaderCircle size={15} className="animate-spin" /> : user.accountStatus === "active" ? "Suspend" : "Reactivate"}</button></td></tr>)}</tbody></table></div></div>;
}
