"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BarChart3, ChevronDown, ClipboardList, FilePlus2, LayoutDashboard, LogOut, Menu, Settings, ShieldCheck, Users, X } from "lucide-react";
import { toast } from "sonner";

type Props = { admin?: boolean; children: React.ReactNode };
type CurrentUser = { id: string; name: string; email: string; role: "user" | "admin" };

export function DashboardShell({ admin = false, children }: Props) {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [open, setOpen] = useState(false);
  const [checking, setChecking] = useState(true);
  const nav = admin
    ? [
        { href: "/WaleedAdmin/dashboard", label: "Overview", icon: LayoutDashboard },
        { href: "/WaleedAdmin/entries", label: "All entries", icon: ClipboardList },
        { href: "/WaleedAdmin/entries/new", label: "Add entry", icon: FilePlus2 },
        { href: "/WaleedAdmin/users", label: "Users", icon: Users },
        { href: "/WaleedAdmin/settings", label: "Settings", icon: Settings },
      ]
    : [
        { href: "/user", label: "Overview", icon: LayoutDashboard },
        { href: "/user/entries", label: "My entries", icon: ClipboardList },
        { href: "/user/entries/new", label: "Add new entry", icon: FilePlus2 },
        { href: "/user/profile", label: "Profile", icon: Users },
      ];

  useEffect(() => {
    fetch("/api/auth/me").then(async (response) => {
      if (!response.ok) throw new Error("Please sign in to continue.");
      return response.json();
    }).then((data) => {
      if ((data.user.role === "admin") !== admin) throw new Error("You do not have access to this area.");
      setUser(data.user);
    }).catch(() => router.replace(admin ? "/WaleedAdmin" : "/login")).finally(() => setChecking(false));
  }, [admin, router]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("You have signed out.");
    router.replace(admin ? "/WaleedAdmin" : "/login");
    router.refresh();
  }

  if (checking || !user) return <div className="flex min-h-screen items-center justify-center text-slate-500">Loading your workspace…</div>;

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <aside className={`${open ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white px-5 py-6 transition-transform lg:static lg:translate-x-0`}>
        <Link href={admin ? "/WaleedAdmin/dashboard" : "/user"} className="mb-10 flex items-center gap-3 px-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white"><BarChart3 size={21} /></span>
          <span><span className="block text-lg font-bold tracking-tight">DataFlow</span><span className="text-xs text-slate-500">{admin ? "Admin workspace" : "Data workspace"}</span></span>
          <button aria-label="Close navigation" className="ml-auto text-slate-500 lg:hidden" onClick={() => setOpen(false)}><X size={20} /></button>
        </Link>
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Workspace</p>
        <nav className="space-y-1">
          {nav.map(({ href, label, icon: Icon }) => {
            return <Link onClick={() => setOpen(false)} key={href} href={href} className="nav-link"><Icon size={18} />{label}</Link>;
          })}
        </nav>
        <div className="mt-auto rounded-2xl bg-indigo-50 p-4">
          <div className="mb-2 flex items-center gap-2 font-semibold text-indigo-900"><ShieldCheck size={17} />Private by design</div>
          <p className="text-xs leading-5 text-indigo-800/75">Your workspace is protected with server-verified access.</p>
        </div>
        <button onClick={logout} className="nav-link mt-3 text-slate-600"><LogOut size={18} />Sign out</button>
      </aside>
      {open && <button aria-label="Close navigation overlay" className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden" onClick={() => setOpen(false)} />}
      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-8">
          <button aria-label="Open navigation" className="icon-button lg:hidden" onClick={() => setOpen(true)}><Menu size={21} /></button>
          <div className="hidden text-sm text-slate-500 sm:block">{admin ? "Administrator workspace" : "Your personal workspace"} <ChevronDown className="ml-1 inline" size={15} /></div>
          <div className="ml-auto flex items-center gap-3"><div className="hidden text-right sm:block"><p className="text-sm font-semibold">{user.name}</p><p className="text-xs text-slate-500">{admin ? "Administrator" : "Member"}</p></div><span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">{user.name.slice(0, 1).toUpperCase()}</span></div>
        </header>
        <div className="mx-auto w-full max-w-[1440px] p-4 sm:p-8">{children}</div>
      </main>
    </div>
  );
}
