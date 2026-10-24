import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { AuthForm } from "@/components/forms/auth-form";

export default function RegisterPage() {
  return <main className="auth-page"><div className="w-full max-w-md"><Link href="/" className="mb-8 inline-flex items-center gap-2.5"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white"><BarChart3 size={20} /></span><span className="text-lg font-bold">DataFlow</span></Link><section className="surface-card p-6 sm:p-8"><div className="mb-7"><p className="eyebrow">Create your workspace</p><h1 className="mt-2 text-2xl font-bold tracking-tight">Get started with DataFlow</h1><p className="mt-2 text-sm text-slate-500">Set up your account and start organizing your entries.</p></div><AuthForm mode="register" /><p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link href="/login" className="font-semibold text-indigo-600">Sign in</Link></p></section></div></main>;
}
