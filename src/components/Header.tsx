import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";

export async function Header() {
  let user: { id: string; email?: string } | null = null;
  let admin = false;
  try {
    const supabase = await createClient();
    const { data: { user: u } } = await supabase.auth.getUser();
    user = u;
    admin = await isAdmin();
  } catch {
    // Без Supabase показываем шапку без входа
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur">
      <div className="container mx-auto max-w-5xl px-4 flex h-14 items-center justify-between">
        <Link href="/" className="font-bold text-lg text-[var(--color-accent)]">
          Экспедиции ДТЮ
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/" className="text-sm text-[var(--color-text)] hover:text-[var(--color-accent)]">
            Главная
          </Link>
          <Link href="/history" className="text-sm text-[var(--color-text)] hover:text-[var(--color-accent)]">
            История
          </Link>
          <Link href="/gallery" className="text-sm text-[var(--color-text)] hover:text-[var(--color-accent)]">
            Галерея
          </Link>
          {user ? (
            <>
              <Link href="/upload" className="text-sm text-[var(--color-text)] hover:text-[var(--color-accent)]">
                Загрузить фото
              </Link>
              {admin && (
                <Link href="/admin" className="text-sm text-amber-700 hover:text-amber-800">
                  Админка
                </Link>
              )}
              <form action="/auth/signout" method="post">
                <button type="submit" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]">
                  Выйти
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="btn-primary text-sm">
              Войти
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
