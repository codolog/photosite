import Link from "next/link";

export default function AdminPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Админ-панель</h1>
      <p className="text-[var(--color-muted)] mb-6">
        Управление контентом сайта: экспедиции, даты, места и списки участников.
      </p>
      <Link href="/admin/expeditions" className="btn-primary">
        Редактировать экспедиции
      </Link>
    </div>
  );
}
