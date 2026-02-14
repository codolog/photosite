type Comment = { id: string; content: string; created_at: string; user_id: string };

export function CommentList({ comments, profileMap }: { comments: Comment[]; profileMap: Record<string, string> }) {
  if (comments.length === 0) {
    return <p className="text-sm text-[var(--color-muted)]">Пока нет комментариев.</p>;
  }
  return (
    <ul className="space-y-3">
      {comments.map((c) => (
        <li key={c.id} className="text-sm border-b border-[var(--color-border)] pb-2 last:border-0">
          <span className="font-medium text-[var(--color-text)]">{profileMap[c.user_id] ?? "Пользователь"}</span>
          <span className="text-[var(--color-muted)] ml-2 text-xs">
            {new Date(c.created_at).toLocaleString("ru-RU")}
          </span>
          <p className="mt-0.5 whitespace-pre-wrap">{c.content}</p>
        </li>
      ))}
    </ul>
  );
}
