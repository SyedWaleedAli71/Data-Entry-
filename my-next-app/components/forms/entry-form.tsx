"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { entrySchema, type EntryInput } from "@/lib/validations/entry";

type EntryFormProps = { entryId?: string; admin?: boolean };
const categories = ["General", "Customer", "Finance", "Operations", "Other"];

export function EntryForm({ entryId, admin = false }: EntryFormProps) {
  const router = useRouter();
  const [loadingEntry, setLoadingEntry] = useState(Boolean(entryId));
  const form = useForm<EntryInput>({
    resolver: zodResolver(entrySchema),
    defaultValues: { fullName: "", email: "", phone: "", title: "", category: "General", description: "", status: "new" },
  });

  useEffect(() => {
    if (!entryId) return;
    fetch(`/api/entries/${entryId}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Unable to load entry.");
        form.reset(data.entry);
      })
      .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Unable to load entry."))
      .finally(() => setLoadingEntry(false));
  }, [entryId, form]);

  async function submit(values: EntryInput) {
    try {
      const response = await fetch(admin && !entryId ? "/api/admin/entries" : `/api/entries${entryId ? `/${entryId}` : ""}`, {
        method: entryId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to save this entry.");
      toast.success(entryId ? "Entry updated." : "Entry created.");
      router.push(admin ? "/WaleedAdmin/entries" : "/user/entries");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save this entry.");
    }
  }

  const { register, handleSubmit, formState: { errors, isSubmitting } } = form;
  if (loadingEntry) return <div className="flex items-center gap-2 p-6 text-sm text-slate-500"><LoaderCircle size={18} className="animate-spin" /> Loading entry…</div>;

  return (
    <form className="surface-card max-w-3xl space-y-5 p-6 sm:p-8" onSubmit={handleSubmit(submit)}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" error={errors.fullName?.message}><input className="field-control" {...register("fullName")} placeholder="Jordan Lee" /></Field>
        <Field label="Email address" error={errors.email?.message}><input className="field-control" type="email" {...register("email")} placeholder="jordan@example.com" /></Field>
        <Field label="Phone number" error={errors.phone?.message}><input className="field-control" type="tel" {...register("phone")} placeholder="+1 (555) 000-0000" /></Field>
        <Field label="Entry title" error={errors.title?.message}><input className="field-control" {...register("title")} placeholder="Quarterly client follow-up" /></Field>
        <Field label="Category" error={errors.category?.message}>
          <select className="field-control" {...register("category")}>{categories.map((category) => <option key={category}>{category}</option>)}</select>
        </Field>
        <Field label="Status" error={errors.status?.message}>
          <select className="field-control" {...register("status")}><option value="new">New</option><option value="in_progress">In progress</option><option value="completed">Completed</option></select>
        </Field>
      </div>
      <Field label="Description" error={errors.description?.message}>
        <textarea className="field-control min-h-32 resize-y" {...register("description")} placeholder="Add any useful details…" />
      </Field>
      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
        <button type="button" className="button-secondary" onClick={() => router.back()}>Cancel</button>
        <button type="submit" className="button-primary" disabled={isSubmitting}>
          {isSubmitting ? <LoaderCircle size={17} className="animate-spin" /> : null}
          {isSubmitting ? "Saving…" : entryId ? "Save changes" : "Create entry"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="field-wrap"><span className="field-label">{label}</span>{children}{error && <span className="form-error">{error}</span>}</label>;
}
