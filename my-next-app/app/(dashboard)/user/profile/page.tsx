"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function UserProfilePage() {
  const [user, setUser] = useState<{ name: string; email: string }>();
  useEffect(() => {
    fetch("/api/auth/me").then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setUser(data.user);
    }).catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Unable to load profile."));
  }, []);
  return <div className="space-y-6"><div><p className="eyebrow">Account</p><h1 className="page-title">Profile</h1><p className="mt-2 text-sm text-slate-500">Your account details.</p></div><section className="surface-card max-w-2xl p-6"><dl className="grid gap-5 sm:grid-cols-2"><div><dt className="text-xs font-semibold uppercase text-slate-400">Name</dt><dd className="mt-1 font-medium">{user?.name ?? "Loading…"}</dd></div><div><dt className="text-xs font-semibold uppercase text-slate-400">Email</dt><dd className="mt-1 font-medium">{user?.email ?? "Loading…"}</dd></div><div><dt className="text-xs font-semibold uppercase text-slate-400">Role</dt><dd className="mt-1 font-medium">User</dd></div></dl></section></div>;
}
