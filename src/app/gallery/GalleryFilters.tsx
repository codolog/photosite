"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type Expedition = { id: string; year: number; title: string };

export function GalleryFilters({
  years,
  expeditions,
  currentYear,
  currentExpedition,
  currentPerson,
  currentTag,
}: {
  years: number[];
  expeditions: Expedition[];
  currentYear?: string;
  currentExpedition?: string;
  currentPerson?: string;
  currentTag?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v == null || v === "") next.delete(k);
        else next.set(k, v);
      });
      router.push(`/gallery?${next.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="card flex flex-wrap gap-4 items-end">
      <div>
        <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Год</label>
        <select
          value={currentYear ?? ""}
          onChange={(e) => setParams({ year: e.target.value || undefined, expedition: undefined })}
          className="input py-1.5 text-sm w-28"
        >
          <option value="">Все</option>
          {years.map((y) => (
            <option key={y} value={String(y)}>{y}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Экспедиция</label>
        <select
          value={currentExpedition ?? ""}
          onChange={(e) => setParams({ expedition: e.target.value || undefined })}
          className="input py-1.5 text-sm min-w-[200px]"
        >
          <option value="">Все</option>
          {expeditions.map((e) => (
            <option key={e.id} value={e.id}>{e.year} — {e.title}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Человек</label>
        <input
          type="text"
          placeholder="Поиск по имени"
          value={currentPerson ?? ""}
          onChange={(e) => setParams({ person: e.target.value || undefined })}
          className="input py-1.5 text-sm w-40"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Тег</label>
        <input
          type="text"
          placeholder="Тег"
          value={currentTag ?? ""}
          onChange={(e) => setParams({ tag: e.target.value || undefined })}
          className="input py-1.5 text-sm w-32"
        />
      </div>
    </div>
  );
}
