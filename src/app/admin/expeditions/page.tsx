import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminExpeditionsPage() {
  const supabase = await createClient();
  const { data: expeditions } = await supabase
    .from("expeditions")
    .select("id, year, title, place, date_from, date_to")
    .order("year", { ascending: false })
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Экспедиции</h1>
        <Link href="/admin/expeditions/new" className="btn-primary">
          Добавить экспедицию
        </Link>
      </div>
      {!expeditions?.length ? (
        <p className="text-[var(--color-muted)]">Нет экспедиций. Добавьте первую.</p>
      ) : (
        <ul className="space-y-2">
          {expeditions.map((e) => (
            <li key={e.id} className="card flex justify-between items-center">
              <div>
                <span className="font-medium">{e.title}</span>
                <span className="text-[var(--color-muted)] text-sm ml-2">
                  {e.year}
                  {e.place && ` · ${e.place}`}
                  {e.date_from && ` · ${new Date(e.date_from).toLocaleDateString("ru-RU")}`}
                </span>
              </div>
              <Link href={`/admin/expeditions/${e.id}/edit`} className="btn-secondary text-sm">
                Редактировать
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
