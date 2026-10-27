import { secondaryButtonClass } from "../lib/catalog";

interface PaginationProps {
  page: number; // desde 0
  totalPages: number | null; // null = todavía no se sabe
  disabled: boolean; // mientras carga, para no pedir dos páginas a la vez
  onPageChange: (page: number) => void;
}

function Pagination({
  page,
  totalPages,
  disabled,
  onPageChange,
}: PaginationProps) {
  const isLast = totalPages === null || page >= totalPages - 1;

  return (
    <nav
      aria-label="Paginación"
      className="flex items-center justify-between gap-3 text-sm"
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || page === 0}
        className={secondaryButtonClass}
      >
        ← Anterior
      </button>
      <span className="text-slate-400">
        Página {page + 1}
        {totalPages !== null && ` de ${Math.max(totalPages, 1)}`}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || isLast}
        className={secondaryButtonClass}
      >
        Siguiente →
      </button>
    </nav>
  );
}

export default Pagination;
