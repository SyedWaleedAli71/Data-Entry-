import Link from "next/link";
import { BarChart3, ShieldCheck } from "lucide-react";
import { AuthForm } from "@/components/forms/auth-form";

export default function LoginPage() {
  return <main className="auth-page"><div className="w-full max-w-md"><Link href="/" className="mb-8 inline-flex items-center gap-2.5"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white"><BarChart3 size={20} /></span><span className="text-lg font-bold">DataFlow</span></Link><section className="surface-card p-6 sm:p-8"><div className="mb-7"><p className="eyebrow">Welcome back</p><h1 className="mt-2 text-2xl font-bold tracking-tight">Sign in to your account</h1><p className="mt-2 text-sm text-slate-500">Your organized workspace is waiting for you.</p></div><AuthForm mode="login" /><p className="mt-6 text-center text-sm text-slate-500">New to DataFlow? <Link href="/register" className="font-semibold text-indigo-600">Create an account</Link></p></section><p className="mt-5 flex justify-center gap-2 text-xs text-slate-400"><ShieldCheck size={14} /> Secure sign-in with protected sessions</p></div></main>;
}
