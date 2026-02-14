"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-xl font-semibold text-[var(--color-text)] mb-2">
        Что-то пошло не так
      </h1>
      <p className="text-[var(--color-muted)] mb-4 max-w-md">
        Ошибка при загрузке страницы. Попробуйте обновить страницу или зайти позже.
      </p>
      <button
        onClick={reset}
        className="btn-primary"
      >
        Обновить страницу
      </button>
    </div>
  );
}
