"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function CommentForm({ photoId }: { photoId: string }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Войдите, чтобы оставить комментарий.");
      setLoading(false);
      return;
    }
    const { error: err } = await supabase.from("comments").insert({
      photo_id: photoId,
      user_id: user.id,
      content: content.trim(),
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setContent("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3">
      {error && (
        <p className="text-sm text-red-600 mb-2">{error}</p>
      )}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Написать комментарий..."
        className="input min-h-[80px] resize-y"
        rows={2}
        maxLength={2000}
      />
      <button type="submit" className="btn-primary mt-2" disabled={loading || !content.trim()}>
        {loading ? "Отправка…" : "Отправить"}
      </button>
    </form>
  );
}
