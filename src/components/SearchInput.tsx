import { useEffect, useState } from "react";
import { fieldClass } from "../lib/catalog";

interface SearchInputProps {
  id: string;
  label: string;
  value: string; // el valor que está en la URL
  maxLength: number;
  placeholder?: string;
  onChange: (value: string) => void;
}

// Buscador con "debounce": avisa el cambio recién cuando dejas de escribir
// 350 ms, así no se hace una request por cada tecla.
function SearchInput({
  id,
  label,
  value,
  maxLength,
  placeholder,
  onChange,
}: SearchInputProps) {
  const [text, setText] = useState(value);
  const [syncedValue, setSyncedValue] = useState(value);

  // Si el valor cambia desde afuera (botón Atrás, "Limpiar filtros"),
  // el input se actualiza para mostrar lo mismo que la URL
  if (value !== syncedValue) {
    setSyncedValue(value);
    setText(value);
  }

  useEffect(() => {
    if (text === value) return;
    const timer = window.setTimeout(() => onChange(text), 350);
    // Si se escribe otra letra antes de 350 ms, el timer anterior se cancela
    return () => window.clearTimeout(timer);
  }, [text, value, onChange]);

  return (
    <label htmlFor={id} className="flex flex-col gap-1 text-sm">
      <span className="text-slate-400">{label}</span>
      <input
        id={id}
        type="search"
        value={text}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => setText(event.target.value)}
        className={fieldClass}
      />
    </label>
  );
}

export default SearchInput;
