import { useEffect, useState } from "react";
import { Outlet, useSearchParams } from "react-router-dom";
import NewsFeed from "../components/NewsFeed";
import {
  fieldClass,
  isOneOf,
  NEWS_PRIORITIES,
  NEWS_STATUS_LABEL,
  NEWS_STATUSES,
  NEWS_TYPE_LABEL,
  NEWS_TYPES,
  PRIORITY_LABEL,
  secondaryButtonClass,
} from "../lib/catalog";
import {
  parseNewsFilters,
  toNewsSearchParams,
  type NewsFilters,
  type NewsOutletContext,
} from "../lib/newsFilters";
import type { NewsItem } from "../types/api";

function NewsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  // Los filtros salen de la URL (igual que en /wanted)
  const filters = parseNewsFilters(searchParams);
  const filtersKey = toNewsSearchParams(filters).toString();

  // Noticias verificadas en el detalle: se aplican encima de lo que trajo el feed
  const [updatedNews, setUpdatedNews] = useState<Record<string, NewsItem>>({});

  // URL con filtros inválidos → se reemplaza por la versión correcta
  useEffect(() => {
    if (searchParams.toString() !== filtersKey) {
      setSearchParams(new URLSearchParams(filtersKey), { replace: true });
    }
  }, [searchParams, filtersKey, setSearchParams]);

  function updateFilters(changes: Partial<NewsFilters>) {
    const current = parseNewsFilters(
      new URLSearchParams(window.location.search),
    );
    setSearchParams(toNewsSearchParams({ ...current, ...changes }));
  }

  const outletContext: NewsOutletContext = {
    onNewsUpdated: (news) =>
      setUpdatedNews((prev) => ({ ...prev, [news.id]: news })),
  };

  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-bold">Noticias del mundo</h1>

      <div className="grid gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-400">Tipo</span>
          <select
            value={filters.type}
            onChange={(event) => {
              const value = event.target.value;
              updateFilters({ type: isOneOf(NEWS_TYPES, value) ? value : "" });
            }}
            className={fieldClass}
          >
            <option value="">Todos</option>
            {NEWS_TYPES.map((type) => (
              <option key={type} value={type}>
                {NEWS_TYPE_LABEL[type]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-400">Prioridad</span>
          <select
            value={filters.priority}
            onChange={(event) => {
              const value = event.target.value;
              updateFilters({
                priority: isOneOf(NEWS_PRIORITIES, value) ? value : "",
              });
            }}
            className={fieldClass}
          >
            <option value="">Todas</option>
            {NEWS_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_LABEL[priority]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-400">Estado</span>
          <select
            value={filters.status}
            onChange={(event) => {
              const value = event.target.value;
              updateFilters({
                status: isOneOf(NEWS_STATUSES, value) ? value : "",
              });
            }}
            className={fieldClass}
          >
            <option value="">Todos</option>
            {NEWS_STATUSES.map((status) => (
              <option key={status} value={status}>
                {NEWS_STATUS_LABEL[status]}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end">
          <button
            type="button"
            onClick={() => setSearchParams(new URLSearchParams())}
            disabled={filtersKey === ""}
            className={secondaryButtonClass}
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* key: cambiar filtros crea un feed nuevo desde cero (y el viejo
          cancela su carga en vuelo), así nunca se mezclan resultados */}
      <NewsFeed
        key={filtersKey}
        filters={filters}
        filtersKey={filtersKey}
        updatedNews={updatedNews}
      />

      {/* Aquí aparece el detalle (/news/:id) ENCIMA del feed, que sigue montado */}
      <Outlet context={outletContext} />
    </section>
  );
}

export default NewsPage;
