"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ru">
      <body style={{ fontFamily: "system-ui", padding: "2rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Что-то пошло не так</h1>
        <p style={{ color: "#666", marginBottom: "1rem" }}>
          Ошибка при загрузке. Попробуйте обновить страницу.
        </p>
        <button
          onClick={() => reset()}
          style={{
            padding: "0.5rem 1rem",
            background: "#2d5a3d",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            cursor: "pointer",
          }}
        >
          Обновить страницу
        </button>
      </body>
    </html>
  );
}
