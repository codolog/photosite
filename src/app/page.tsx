import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  let expeditions: { id: string; year: number; title: string; place: string | null }[] | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("expeditions")
      .select("id, year, title, place")
      .order("year", { ascending: false })
      .limit(6);
    expeditions = data;
  } catch {
    expeditions = [];
  }

  return (
    <div className="space-y-10">
      <section className="text-center py-8">
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
          Экспедиционное движение
        </h1>
        <p className="text-xl text-[var(--color-muted)]">
          Биологический отдел Дворца Творчества Юных города Ижевска
        </p>
      </section>

      <section className="card max-w-2xl mx-auto">
        <p className="text-[var(--color-text)] leading-relaxed">
          Здесь хранится история экспедиций биологического отдела ДТЮ: походы, полевые выезды,
          исследования и воспоминания участников. Вы можете просматривать фотографии по годам и
          экспедициям, оставлять комментарии и — после регистрации — загружать свои снимки и
          отмечать на них людей.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Последние экспедиции</h2>
        {expeditions && expeditions.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {expeditions.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/history/${e.year}#exp-${e.id}`}
                  className="card block hover:border-[var(--color-accent)] transition-colors"
                >
                  <span className="font-medium">{e.title}</span>
                  <span className="text-[var(--color-muted)] text-sm ml-2">
                    {e.year}{e.place ? ` · ${e.place}` : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[var(--color-muted)]">Пока нет добавленных экспедиций. Они появятся после настройки админом.</p>
        )}
        <div className="mt-4">
          <Link href="/history" className="btn-primary">
            Вся история →
          </Link>
        </div>
      </section>

      <section className="flex flex-wrap gap-4 justify-center">
        <Link href="/history" className="btn-secondary">
          История по годам
        </Link>
        <Link href="/gallery" className="btn-primary">
          Галерея фото
        </Link>
      </section>
    </div>
  );
}
