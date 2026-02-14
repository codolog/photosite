"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createExpedition, updateExpedition, deleteExpedition } from "@/app/admin/actions";

type Expedition = {
  id: string;
  year: number;
  title: string;
  date_from: string | null;
  date_to: string | null;
  place: string | null;
  participant_list: string | null;
  description: string | null;
  sort_order: number;
};

export function ExpeditionForm({ expedition }: { expedition?: Expedition }) {
  const isEdit = !!expedition;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState(expedition?.year ?? new Date().getFullYear());
  const [title, setTitle] = useState(expedition?.title ?? "");
  const [dateFrom, setDateFrom] = useState(expedition?.date_from ?? "");
  const [dateTo, setDateTo] = useState(expedition?.date_to ?? "");
  const [place, setPlace] = useState(expedition?.place ?? "");
  const [participantList, setParticipantList] = useState(expedition?.participant_list ?? "");
  const [description, setDescription] = useState(expedition?.description ?? "");
  const [sortOrder, setSortOrder] = useState(expedition?.sort_order ?? 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const payload = {
      year,
      title: title.trim(),
      date_from: dateFrom || null,
      date_to: dateTo || null,
      place: place.trim() || null,
      participant_list: participantList.trim() || null,
      description: description.trim() || null,
      sort_order: sortOrder,
    };
    if (isEdit && expedition) {
      const res = await updateExpedition(expedition.id, payload);
      if (res.error) setError(res.error);
      else {
        router.push("/admin/expeditions");
        router.refresh();
      }
    } else {
      const res = await createExpedition(payload);
      if (res.error) setError(res.error);
      else {
        router.push("/admin/expeditions");
        router.refresh();
      }
    }
    setLoading(false);
  }

  async function handleDelete() {
    if (!isEdit || !expedition || !confirm("Удалить экспедицию? Фото останутся, но будут без привязки.")) return;
    setLoading(true);
    await deleteExpedition(expedition.id);
    router.push("/admin/expeditions");
    router.refresh();
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="card max-w-xl space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Год *</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value, 10) || 0)}
            className="input"
            min={1900}
            max={2100}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Название *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Дата начала</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Дата окончания</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="input"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Место</label>
        <input
          type="text"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          className="input"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Участники (каждая строка — имя)</label>
        <textarea
          value={participantList}
          onChange={(e) => setParticipantList(e.target.value)}
          className="input min-h-[120px]"
          placeholder="Иванов Иван&#10;Петрова Мария"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Описание</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input min-h-[100px]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Порядок (число для сортировки)</label>
        <input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
          className="input w-24"
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Сохранение…" : isEdit ? "Сохранить" : "Добавить"}
        </button>
        <Link href="/admin/expeditions" className="btn-secondary">
          Отмена
        </Link>
        {isEdit && (
          <button type="button" onClick={handleDelete} className="btn-secondary text-red-600 ml-auto" disabled={loading}>
            Удалить
          </button>
        )}
      </div>
    </form>
  );
}
