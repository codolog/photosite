import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: expeditions } = await supabase
    .from("expeditions")
    .select("id, year, title, date_from, date_to, place, sort_order")
    .order("year", { ascending: false })
    .order("sort_order", { ascending: true });

  const byYear = (expeditions || []).reduce<Record<number, typeof expeditions>>((acc, e) => {
    const list = acc[e.year] || [];
    list.push(e);
    acc[e.year] = list;
    return acc;
  }, {});
  const years = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">История экспедиций</h1>
      <p className="text-[var(--color-muted)]">
        Разделы по годам: даты, места и участники экспедиций биологического отдела ДТЮ.
      </p>

      {years.length === 0 ? (
        <p className="text-[var(--color-muted)]">Пока нет данных. Экспедиции добавятся в админ-панели.</p>
      ) : (
        <div className="space-y-10">
          {years.map((year) => (
            <section key={year} id={`year-${year}`}>
              <h2 className="text-xl font-semibold text-[var(--color-accent)] mb-4">{year} год</h2>
              <ul className="space-y-3">
                {(byYear[year] || []).map((e) => (
                  <li key={e.id} id={`exp-${e.id}`}>
                    <Link
                      href={`/expedition/${e.id}`}
                      className="card block hover:border-[var(--color-accent)] transition-colors"
                    >
                      <div className="font-medium">{e.title}</div>
                      <div className="text-sm text-[var(--color-muted)] mt-1">
                        {e.date_from && (
                          <span>
                            {new Date(e.date_from).toLocaleDateString("ru-RU")}
                            {e.date_to && e.date_to !== e.date_from && ` – ${new Date(e.date_to).toLocaleDateString("ru-RU")}`}
                          </span>
                        )}
                        {e.place && (
                          <span>{e.date_from ? " · " : ""}{e.place}</span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
