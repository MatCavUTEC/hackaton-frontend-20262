import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, Navigate, useLocation, type Location } from "react-router-dom";
import { toAppError } from "../api/errors";
import FormField from "../components/FormField";
import { CheckingSession } from "../components/PrivateRoute";
import { useAuth } from "../hooks/useAuth";
import { primaryButtonClass } from "../lib/catalog";
import type { RegisterRequest } from "../types/api";

// Errores 409 del servidor y el campo al que pertenecen
const FIELD_BY_CODE: Record<string, keyof RegisterRequest> = {
  TEAM_NAME_TAKEN: "teamName",
  EMAIL_ALREADY_REGISTERED: "email",
};

function RegisterPage() {
  const { status, register } = useAuth();
  const location = useLocation();
  const [form, setForm] = useState<RegisterRequest>({
    teamName: "",
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const from = (location.state as { from?: Location } | null)?.from;
  const redirectTo = from
    ? `${from.pathname}${from.search}${from.hash}`
    : "/dashboard";

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" })); // al corregir, se borra su error
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFieldErrors({});
    setFormError(null);
    try {
      // Registro devuelve la sesión ya iniciada → entra directo a la app
      await register(form);
    } catch (err) {
      const error = toAppError(err, "No se pudo registrar la tripulación.");
      const field = error.code ? FIELD_BY_CODE[error.code] : undefined;

      if (field) {
        // 409: email o nombre ya usados → mensaje debajo de ese campo
        setFieldErrors({ [field]: error.message });
      } else if (Object.keys(error.fieldErrors).length > 0) {
        // 400: "details" dice qué campo está mal → mensaje debajo de cada uno
        setFieldErrors(error.fieldErrors);
      } else {
        // Otros errores (cupo lleno, servidor caído...) → mensaje general
        setFormError(error.message);
      }
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
          <h1 className="text-2xl font-bold">Registrar tripulación</h1>
          <p className="text-sm text-slate-400">
            Una cuenta por equipo: los tres usan este email y contraseña
          </p>
        </div>

        <FormField
          id="register-teamName"
          name="teamName"
          label="Nombre de la tripulación"
          value={form.teamName}
          onChange={handleChange}
          error={fieldErrors.teamName}
          required
          minLength={3}
          maxLength={40}
        />
        <FormField
          id="register-email"
          name="email"
          type="email"
          label="Email"
          value={form.email}
          onChange={handleChange}
          error={fieldErrors.email}
          required
          maxLength={120}
          autoComplete="email"
        />
        <FormField
          id="register-password"
          name="password"
          type="password"
          label="Contraseña (8 a 72 caracteres)"
          value={form.password}
          onChange={handleChange}
          error={fieldErrors.password}
          required
          minLength={8}
          maxLength={72}
          autoComplete="new-password"
        />

        {formError && (
          <p
            role="alert"
            className="rounded-lg bg-rose-950 px-3 py-2 text-sm text-rose-300"
          >
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className={`w-full ${primaryButtonClass}`}
        >
          {submitting ? "Registrando..." : "Registrar"}
        </button>

        <p className="text-center text-sm text-slate-400">
          ¿Ya tienen cuenta?{" "}
          <Link
            to="/login"
            state={location.state}
            className="text-amber-400 hover:underline"
          >
            Inicia sesión
          </Link>
        </p>
      </form>
    </main>
  );
}

export default RegisterPage;
