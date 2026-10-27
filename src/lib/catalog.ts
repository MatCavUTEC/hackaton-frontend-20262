import type {
  CrewRole,
  FruitFilter,
  PageSize,
  WantedSort,
  WantedStatus,
} from "../types/api";

// Revisa si un valor (por ejemplo, de la URL) es una de las opciones válidas
export function isOneOf<T>(options: readonly T[], value: unknown): value is T {
  return (options as readonly unknown[]).includes(value);
}

// ===== Opciones válidas (las mismas que acepta la API) =====
export const WANTED_STATUSES: readonly WantedStatus[] = [
  "AT_LARGE",
  "CAPTURED",
  "MISSING",
];
export const FRUIT_FILTERS: readonly FruitFilter[] = [
  "PARAMECIA",
  "ZOAN",
  "LOGIA",
  "NONE",
];
export const WANTED_SORTS: readonly WantedSort[] = [
  "bounty,desc",
  "name,asc",
  "updatedAt,desc",
];
export const PAGE_SIZES: readonly PageSize[] = [10, 20, 50];

// ===== Textos en español =====
export const STATUS_LABEL: Record<WantedStatus, string> = {
  AT_LARGE: "Prófugo",
  CAPTURED: "Capturado",
  MISSING: "Desaparecido",
};
export const FRUIT_LABEL: Record<FruitFilter, string> = {
  PARAMECIA: "Paramecia",
  ZOAN: "Zoan",
  LOGIA: "Logia",
  NONE: "Sin fruta",
};
export const SORT_LABEL: Record<WantedSort, string> = {
  "bounty,desc": "Mayor recompensa",
  "name,asc": "Nombre (A-Z)",
  "updatedAt,desc": "Actualizados recientemente",
};
export const ROLE_LABEL: Record<CrewRole, string> = {
  CAPTAIN: "Capitán",
  FIRST_MATE: "Segundo al mando",
  NAVIGATOR: "Navegante",
  SNIPER: "Francotirador",
  COOK: "Cocinero",
  DOCTOR: "Médico",
  SHIPWRIGHT: "Carpintero",
  MUSICIAN: "Músico",
  ARCHAEOLOGIST: "Arqueólogo",
  HELMSMAN: "Timonel",
  FIGHTER: "Combatiente",
};

// Clases completas (nunca armadas por partes) para que Tailwind las detecte
export const STATUS_BADGE: Record<WantedStatus, string> = {
  AT_LARGE: "bg-rose-950 text-rose-300",
  CAPTURED: "bg-emerald-950 text-emerald-300",
  MISSING: "bg-slate-800 text-slate-300",
};
// ===== Clases compartidas de formularios y botones =====
export const fieldClass =
  "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-amber-400";
export const primaryButtonClass =
  "rounded-lg bg-amber-400 px-4 py-2 font-semibold text-slate-950 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60";
export const secondaryButtonClass =
  "rounded-md border border-slate-700 px-3 py-1.5 text-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40";

// ===== Formatos =====
export function formatBerries(amount: number): string {
  return `฿ ${amount.toLocaleString("es-PE")}`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-PE", { dateStyle: "medium" });
}
