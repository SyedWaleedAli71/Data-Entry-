import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
