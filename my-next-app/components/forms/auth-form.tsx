"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LoaderCircle, LockKeyhole, UserRound } from "lucide-react";
import { toast } from "sonner";

type AuthFormProps = { mode: "login" | "register" | "admin" };

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const isRegister = mode === "register";
  const isAdmin = mode === "admin";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());
    try {
      const response = await fetch(isAdmin ? "/api/auth/admin/login" : isRegister ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to sign in.");
      toast.success(isRegister ? "Your account is ready." : "Welcome back.");
      router.replace(isAdmin ? "/WaleedAdmin/dashboard" : "/user");
      router.refresh();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to sign in.";
      setError(message);
      toast.error(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {isRegister && (
        <label className="field-wrap">
          <span className="field-label">Full name</span>
          <span className="field-icon"><UserRound size={17} /><input name="name" autoComplete="name" required minLength={2} maxLength={100} placeholder="Your name" /></span>
        </label>
      )}
      <label className="field-wrap">
        <span className="field-label">Email address</span>
        <input className="field-control" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </label>
      <label className="field-wrap">
        <span className="field-label">Password</span>
        <span className="password-control">
          <LockKeyhole size={17} />
          <input name="password" type={showPassword ? "text" : "password"} autoComplete={isRegister ? "new-password" : "current-password"} required minLength={isRegister ? 10 : 1} maxLength={128} placeholder={isRegister ? "At least 10 characters" : "Enter your password"} />
          <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} className="icon-button">
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </span>
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button-primary w-full" type="submit" disabled={pending}>
        {pending ? <LoaderCircle className="animate-spin" size={18} /> : null}
        {pending ? "Please wait…" : isRegister ? "Create account" : isAdmin ? "Sign in to admin" : "Sign in"}
      </button>
      <p className="text-center text-xs text-slate-500">Your password is securely protected and never stored in plain text.</p>
    </form>
  );
}
