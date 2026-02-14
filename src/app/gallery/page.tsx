import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getPhotoUrl } from "@/lib/photo-url";
import { GalleryFilters } from "./GalleryFilters";

type SearchParams = { year?: string; expedition?: string; person?: string; tag?: string };

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const select = "id, image_path, caption, taken_at, place, expedition_id, expeditions (id, year, title)";
  const order = { ascending: false } as const;

  let photos: { id: string; image_path: string; caption: string | null; expeditions?: { year: number; title: string } | null }[];
  if (params.year) {
    const { data: expIds } = await supabase.from("expeditions").select("id").eq("year", parseInt(params.year, 10));
    const ids = (expIds || []).map((e) => e.id);
    if (ids.length === 0) {
      photos = [];
    } else {
      let q = supabase.from("photos").select(select).in("expedition_id", ids).order("taken_at", order).order("created_at", order);
      if (params.expedition) q = q.eq("expedition_id", params.expedition);
      const res = await q;
      photos = res.data ?? [];
    }
  } else {
    let query = supabase.from("photos").select(select).order("taken_at", order).order("created_at", order);
    if (params.expedition) query = query.eq("expedition_id", params.expedition);
    const res = await query;
    photos = res.data ?? [];
  }

  let filtered = photos;
  if (params.person) {
    const { data: personPhotoIds } = await supabase
      .from("photo_persons")
      .select("photo_id")
      .ilike("person_name", `%${params.person}%`);
    const ids = [...new Set((personPhotoIds || []).map((p) => p.photo_id))];
    if (ids.length) filtered = filtered.filter((p) => ids.includes(p.id));
    else filtered = [];
  }
  if (params.tag) {
    const { data: tagPhotoIds } = await supabase
      .from("photo_tags")
      .select("photo_id")
      .ilike("tag", `%${params.tag}%`);
    const ids = [...new Set((tagPhotoIds || []).map((t) => t.photo_id))];
    if (ids.length) filtered = filtered.filter((p) => ids.includes(p.id));
    else filtered = [];
  }

  const { data: expeditions } = await supabase.from("expeditions").select("id, year, title").order("year", { ascending: false });
  const years = [...new Set((expeditions || []).map((e) => e.year))].sort((a, b) => b - a);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Галерея</h1>
      <Suspense fallback={<div className="card h-14 animate-pulse" />}>
        <GalleryFilters
        years={years}
        expeditions={expeditions || []}
        currentYear={params.year}
        currentExpedition={params.expedition}
        currentPerson={params.person}
        currentTag={params.tag}
        />
      </Suspense>
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filtered.map((p) => (
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
            <p className="text-xs text-[var(--color-muted)] mt-1 truncate">
              {p.caption || (p.expeditions && typeof p.expeditions === "object" && "title" in p.expeditions ? (p.expeditions as { title: string }).title : "")}
            </p>
          </li>
        ))}
      </ul>
      {filtered.length === 0 && (
        <p className="text-[var(--color-muted)]">Нет фотографий по выбранным фильтрам.</p>
      )}
    </div>
  );
}
