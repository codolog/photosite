import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPhotoUrl } from "@/lib/photo-url";

export default async function ExpeditionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: expedition } = await supabase
    .from("expeditions")
    .select("*")
    .eq("id", id)
    .single();

  if (!expedition) notFound();

  const { data: photos } = await supabase
    .from("photos")
    .select("id, image_path, caption, taken_at")
    .eq("expedition_id", id)
    .order("taken_at", { ascending: true });

  const photoList = photos || [];
  const participantList = expedition.participant_list
    ? expedition.participant_list.split("\n").filter(Boolean)
    : [];

  return (
    <div className="space-y-6">
      <nav className="text-sm text-[var(--color-muted)]">
        <Link href="/history" className="hover:text-[var(--color-accent)]">История</Link>
        <span className="mx-2">/</span>
        <span>{expedition.title}</span>
      </nav>

      <header>
        <h1 className="text-2xl font-bold">{expedition.title}</h1>
        <p className="text-[var(--color-muted)]">
          {expedition.year} год
          {expedition.place && ` · ${expedition.place}`}
        </p>
        {(expedition.date_from || expedition.date_to) && (
          <p className="text-sm text-[var(--color-muted)] mt-1">
            {expedition.date_from && new Date(expedition.date_from).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
            {expedition.date_to && expedition.date_to !== expedition.date_from && (
              <> – {new Date(expedition.date_to).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}</>
            )}
          </p>
        )}
      </header>

      {expedition.description && (
        <div className="card prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap">{expedition.description}</div>
        </div>
      )}

      {participantList.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-2">Участники</h2>
          <ul className="list-disc list-inside text-[var(--color-muted)]">
            {participantList.map((name: string, i: number) => (
              <li key={i}>{name.trim()}</li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-4">Фотографии ({photoList.length})</h2>
        {photoList.length === 0 ? (
          <p className="text-[var(--color-muted)]">Пока нет фотографий этой экспедиции.</p>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photoList.map((p) => (
              <li key={p.id}>
                <Link href={`/photo/${p.id}`} className="block aspect-square relative rounded-lg overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-accent)]">
                  <Image
                    src={getPhotoUrl(p.image_path)}
                    alt={p.caption || "Фото"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                </Link>
                {p.caption && <p className="text-xs text-[var(--color-muted)] mt-1 truncate">{p.caption}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
