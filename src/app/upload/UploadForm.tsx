"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Expedition = { id: string; year: number; title: string };

export function UploadForm({ expeditions }: { expeditions: Expedition[] }) {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [place, setPlace] = useState("");
  const [takenAt, setTakenAt] = useState("");
  const [expeditionId, setExpeditionId] = useState("");
  const [tagsStr, setTagsStr] = useState("");
  const [personsStr, setPersonsStr] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Выберите файл.");
      return;
    }
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Нужно войти.");
      setLoading(false);
      return;
    }
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from("photos").upload(path, file, { upsert: false });
    if (uploadErr) {
      setError(uploadErr.message);
      setLoading(false);
      return;
    }
    const { data: photo, error: insertErr } = await supabase
      .from("photos")
      .insert({
        uploaded_by: user.id,
        image_path: path,
        caption: caption.trim() || null,
        place: place.trim() || null,
        taken_at: takenAt || null,
        expedition_id: expeditionId || null,
      })
      .select("id")
      .single();
    if (insertErr) {
      setError(insertErr.message);
      setLoading(false);
      return;
    }
    const photoId = photo.id;
    const tags = tagsStr.split(/[,;]/).map((t) => t.trim()).filter(Boolean);
    for (const tag of tags) {
      await supabase.from("photo_tags").insert({ photo_id: photoId, tag });
    }
    const persons = personsStr.split(/[,;]/).map((p) => p.trim()).filter(Boolean);
    for (const name of persons) {
      await supabase.from("photo_persons").insert({ photo_id: photoId, person_name: name });
    }
    setLoading(false);
    router.push(`/photo/${photoId}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium mb-1">Файл фото *</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="input"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Подпись</label>
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="input"
          placeholder="Краткое описание"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Экспедиция</label>
        <select
          value={expeditionId}
          onChange={(e) => setExpeditionId(e.target.value)}
          className="input"
        >
          <option value="">— не выбрано —</option>
          {expeditions.map((e) => (
            <option key={e.id} value={e.id}>{e.year} — {e.title}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Место</label>
        <input
          type="text"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          className="input"
          placeholder="Где сделано фото"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Дата съёмки</label>
        <input
          type="date"
          value={takenAt}
          onChange={(e) => setTakenAt(e.target.value)}
          className="input"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Теги (через запятую)</label>
        <input
          type="text"
          value={tagsStr}
          onChange={(e) => setTagsStr(e.target.value)}
          className="input"
          placeholder="природа, полевой лагерь, ..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Люди на фото (через запятую)</label>
        <input
          type="text"
          value={personsStr}
          onChange={(e) => setPersonsStr(e.target.value)}
          className="input"
          placeholder="Иван Петров, Мария Сидорова"
        />
      </div>
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "Загрузка…" : "Загрузить"}
      </button>
    </form>
  );
}
