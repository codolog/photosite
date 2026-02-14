import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: { children: React.ReactNode }) {
  const admin = await isAdmin();
  if (!admin) redirect("/");

  return (
    <div className="space-y-6">
      <nav className="flex gap-4 border-b border-[var(--color-border)] pb-2">
        <Link href="/admin" className="text-[var(--color-accent)] font-medium">Админка</Link>
        <Link href="/admin/expeditions" className="text-[var(--color-text)] hover:text-[var(--color-accent)]">Экспедиции</Link>
      </nav>
      {children}
    </div>
  );
}
