import Link from "next/link";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="max-w-sm mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center">Вход</h1>
      <LoginForm />
      <p className="text-center text-sm text-[var(--color-muted)]">
        Нет аккаунта?{" "}
        <Link href="/register" className="text-[var(--color-accent)] hover:underline">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
}
