import type { InputHTMLAttributes } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string; // mensaje del servidor para ESTE campo
}

// Input con su label y, si hay, su error justo debajo
function FormField({ id, label, error, ...inputProps }: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm text-slate-300">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full rounded-lg border bg-slate-950 px-3 py-2 outline-none ${error ? "border-rose-500" : "border-slate-700 focus:border-amber-400"}`}
        {...inputProps}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}

export default FormField;
