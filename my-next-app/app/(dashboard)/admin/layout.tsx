import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell admin>{children}</DashboardShell>;
}
