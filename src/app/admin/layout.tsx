import { AdminShell } from "@/components/admin-shell";
import { hasAdminSession } from "@/lib/admin-auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await hasAdminSession())) redirect("/connexion");
  return <AdminShell>{children}</AdminShell>;
}
