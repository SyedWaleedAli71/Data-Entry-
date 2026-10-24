import Link from "next/link";
import { BarChart3, LockKeyhole, ShieldCheck } from "lucide-react";
import { AuthForm } from "@/components/forms/auth-form";

export default function AdminLoginPage() {
  return <main className="auth-page"><div className="w-full max-w-md"><Link href="/" className="mb-8 inline-flex items-center gap-2.5"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white"><BarChart3 size={20} /></span><span className="text-lg font-bold">DataFlow</span></Link><section className="surface-card p-6 sm:p-8"><div className="mb-7"><span className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700"><ShieldCheck size={14} />Administrator portal</span><h1 className="text-2xl font-bold tracking-tight">Admin sign in</h1><p className="mt-2 text-sm text-slate-500">Sign in with an administrator account to manage your workspace.</p></div><AuthForm mode="admin" /></section><p className="mt-5 flex justify-center gap-2 text-xs text-slate-400"><LockKeyhole size={14} />Access is granted only to verified admin accounts.</p></div></main>;
}
