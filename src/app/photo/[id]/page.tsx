import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPhotoUrl } from "@/lib/photo-url";
import { CommentForm } from "@/components/CommentForm";
import { CommentList } from "@/components/CommentList";
import { PhotoPersonTags } from "@/components/PhotoPersonTags";

export default async function PhotoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: photo } = await supabase
    .from("photos")
    .select(`
      *,
      expeditions (id, year, title, place),
      profiles:uploaded_by (display_name)
    `)
    .eq("id", id)
    .single();

  if (!photo) notFound();

  const [{ data: tags }, { data: persons }, { data: comments }] = await Promise.all([
    supabase.from("photo_tags").select("id, tag").eq("photo_id", id),
    supabase.from("photo_persons").select("id, person_name, x_percent, y_percent").eq("photo_id", id),
    supabase.from("comments").select("id, content, created_at, user_id").eq("photo_id", id).order("created_at", { ascending: true }),
  ]);

  const profileIds = [...new Set((comments || []).map((c) => c.user_id))];
  const { data: profiles } = profileIds.length
    ? await supabase.from("profiles").select("id, display_name").in("id", profileIds)
    : { data: [] };
  const profileMap = (profiles || []).reduce<Record<string, string>>((acc, p) => {
    acc[p.id] = p.display_name || "Пользователь";
    return acc;
  }, {});

  const expedition = Array.isArray(photo.expeditions) ? photo.expeditions[0] : photo.expeditions;

  return (
    <div className="space-y-6">
      <nav className="text-sm text-[var(--color-muted)]">
        <Link href="/gallery" className="hover:text-[var(--color-accent)]">Галерея</Link>
        {expedition && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/expedition/${(expedition as { id: string }).id}`} className="hover:text-[var(--color-accent)]">
              {(expedition as { year: number; title: string }).year} — {(expedition as { title: string }).title}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span>Фото</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="relative">
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-[var(--color-border)] bg-black">
            <PhotoPersonTags
              imageUrl={getPhotoUrl(photo.image_path)}
              persons={persons || []}
              photoId={id}
            />
          </div>
          {(photo.place || photo.taken_at) && (
            <p className="text-sm text-[var(--color-muted)] mt-2">
              {photo.place}
              {photo.place && photo.taken_at && " · "}
              {photo.taken_at && new Date(photo.taken_at).toLocaleDateString("ru-RU")}
            </p>
          )}
        </div>
        <div className="space-y-4">
          {photo.caption && <p className="text-[var(--color-text)]">{photo.caption}</p>}
          {(tags?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-2">
              {(tags || []).map((t) => (
                <Link
                  key={t.id}
                  href={`/gallery?tag=${encodeURIComponent(t.tag)}`}
                  className="text-sm px-2 py-0.5 rounded bg-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-accent)] hover:text-white"
                >
                  {t.tag}
                </Link>
              ))}
            </div>
          )}
          {(persons?.length ?? 0) > 0 && (
            <div>
              <span className="text-sm font-medium text-[var(--color-muted)]">На фото: </span>
              <span className="text-sm">
                {(persons || []).map((p) => (
                  <Link
                    key={p.id}
                    href={`/gallery?person=${encodeURIComponent(p.person_name)}`}
                    className="text-[var(--color-accent)] hover:underline mr-1"
                  >
                    {p.person_name}
                  </Link>
                ))}
              </span>
            </div>
          )}
          {photo.profiles && (
            <p className="text-sm text-[var(--color-muted)]">
              Загрузил: {(photo.profiles as { display_name: string | null }[])?.[0]?.display_name ?? "Участник"}
            </p>
          )}

          <section>
            <h3 className="font-semibold mb-2">Комментарии ({(comments?.length ?? 0)})</h3>
            <CommentList comments={comments || []} profileMap={profileMap} />
            <CommentForm photoId={id} />
          </section>
        </div>
      </div>
    </div>
  );
}
