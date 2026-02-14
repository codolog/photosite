import Link from "next/link";
import { RegisterForm } from "./RegisterForm";

export default function RegisterPage() {
  return (
    <div className="max-w-sm mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center">Регистрация</h1>
      <RegisterForm />
      <p className="text-center text-sm text-[var(--color-muted)]">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="text-[var(--color-accent)] hover:underline">
          Войти
        </Link>
      </p>
    </div>
  );
}
