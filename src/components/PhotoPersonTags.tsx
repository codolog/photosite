"use client";

import Image from "next/image";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Person = { id: string; person_name: string; x_percent: number | null; y_percent: number | null };

export function PhotoPersonTags({
  imageUrl,
  persons,
  photoId,
}: {
  imageUrl: string;
  persons: Person[];
  photoId: string;
}) {
  const [adding, setAdding] = useState(false);
  const [clickPos, setClickPos] = useState<{ x: number; y: number } | null>(null);
  const [personName, setPersonName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleImageClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!adding) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setClickPos({ x, y });
  }

  async function handleAddPerson() {
    if (!personName.trim()) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("photo_persons").insert({
      photo_id: photoId,
      person_name: personName.trim(),
      x_percent: clickPos?.x ?? null,
      y_percent: clickPos?.y ?? null,
    });
    setLoading(false);
    if (error) return;
    setPersonName("");
    setClickPos(null);
    setAdding(false);
    router.refresh();
  }

  return (
    <div className="relative w-full h-full">
      <div
        className="relative w-full h-full cursor-crosshair"
        onClick={handleImageClick}
      >
        <Image
          src={imageUrl}
          alt=""
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 50vw"
          unoptimized={imageUrl.startsWith("http") && imageUrl.includes("supabase")}
        />
        {persons.filter((p) => p.x_percent != null && p.y_percent != null).map((p) => (
          <span
            key={p.id}
            className="absolute text-xs font-medium bg-[var(--color-accent)] text-white px-1.5 py-0.5 rounded -translate-x-1/2 -translate-y-full pointer-events-none"
            style={{
              left: `${p.x_percent}%`,
              top: `${p.y_percent}%`,
            }}
          >
            {p.person_name}
          </span>
        ))}
        {clickPos && (
          <span
            className="absolute w-3 h-3 bg-red-500 rounded-full border-2 border-white -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: `${clickPos.x}%`, top: `${clickPos.y}%` }}
          />
        )}
      </div>
      <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-2 items-center">
        {adding ? (
          <>
            <input
              type="text"
              placeholder="Имя человека"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              className="input py-1 text-sm flex-1 min-w-0"
              autoFocus
            />
            <button
              type="button"
              onClick={handleAddPerson}
              disabled={loading || !personName.trim()}
              className="btn-primary text-sm py-1"
            >
              {loading ? "…" : "Добавить"}
            </button>
            <button
              type="button"
              onClick={() => { setAdding(false); setClickPos(null); setPersonName(""); }}
              className="btn-secondary text-sm py-1"
            >
              Отмена
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="btn-secondary text-sm py-1"
          >
            Отметить человека на фото
          </button>
        )}
      </div>
    </div>
  );
}
