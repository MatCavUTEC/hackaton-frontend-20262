import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, Navigate, useLocation, type Location } from "react-router-dom";
import { getErrorMessage } from "../api/errors";
import FormField from "../components/FormField";
import { CheckingSession } from "../components/PrivateRoute";
import { useAuth } from "../hooks/useAuth";
import { primaryButtonClass } from "../lib/catalog";
import type { LoginRequest } from "../types/api";

function LoginPage() {
  const { status, login } = useAuth();
  const location = useLocation();
  const [form, setForm] = useState<LoginRequest>({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Si PrivateRoute nos mandó aquí, "from" dice a qué ruta quería ir
  const from = (location.state as { from?: Location } | null)?.from;
  const redirectTo = from
    ? `${from.pathname}${from.search}${from.hash}`
    : "/dashboard";

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(form);
      // Si sale bien, status pasa a "authenticated" y el <Navigate> de abajo
      // nos lleva a redirectTo
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo iniciar sesión."));
      setSubmitting(false);
    }
  }

  if (status === "authenticated") return <Navigate to={redirectTo} replace />;
  if (status === "checking") return <CheckingSession />;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6"
      >
        <div>
          <h1 className="text-2xl font-bold">Log Pose Console</h1>
          <p className="text-sm text-slate-400">
            Ingresa con el email y la contraseña de tu tripulación
          </p>
        </div>

        <FormField
          id="login-email"
          name="email"
          type="email"
          label="Email"
          value={form.email}
          onChange={handleChange}
          required
          autoComplete="username"
        />
        <FormField
          id="login-password"
          name="password"
          type="password"
          label="Contraseña"
          value={form.password}
          onChange={handleChange}
          required
          autoComplete="current-password"
        />

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-rose-950 px-3 py-2 text-sm text-rose-300"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className={`w-full ${primaryButtonClass}`}
        >
          {submitting ? "Ingresando..." : "Ingresar"}
        </button>

        <p className="text-center text-sm text-slate-400">
          ¿Primera vez?{" "}
          {/* Pasamos el mismo state para no perder el "from" */}
          <Link
            to="/register"
            state={location.state}
            className="text-amber-400 hover:underline"
          >
            Registra tu tripulación
          </Link>
        </p>
      </form>
    </main>
  );
}

export default LoginPage;
