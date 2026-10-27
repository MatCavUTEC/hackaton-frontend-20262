import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useSearchParams } from "react-router-dom";
import { getCrews } from "../api/crews";
import { getErrorMessage } from "../api/errors";
import { getWantedPage } from "../api/wanted";
import ErrorState from "../components/ErrorState";
import Pagination from "../components/Pagination";
import SearchInput from "../components/SearchInput";
import {
  fieldClass,
  formatBerries,
  formatDateTime,
  FRUIT_FILTERS,
  FRUIT_LABEL,
  isOneOf,
  PAGE_SIZES,
  secondaryButtonClass,
  SORT_LABEL,
  STATUS_BADGE,
  STATUS_LABEL,
  WANTED_SORTS,
  WANTED_STATUSES,
} from "../lib/catalog";
import {
  DEFAULT_WANTED_QUERY,
  hasActiveFilters,
  MAX_SEARCH_LENGTH,
  parseWantedQuery,
  toWantedSearchParams,
  type WantedQuery,
} from "../lib/wantedQuery";
import type { Crew, Page, WantedSummary } from "../types/api";

const ROW_HEIGHT = 56; // px, igual a la clase h-14 de cada fila
const HEADER_HEIGHT = 44; // px, igual a la clase h-11 del encabezado

interface WantedResult {
  key: string; // a qué request pertenece esta respuesta
  data: Page<WantedSummary> | null;
  error: string | null;
}

function WantedPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // 1) La URL es la única fuente de verdad: de ahí sale todo el estado.
  //    queryKey es la versión "limpia" de la URL (ej: page=0&size=20&sort=bounty,desc)
  const query = parseWantedQuery(searchParams);
  const queryKey = toWantedSearchParams(query).toString();

  const [crews, setCrews] = useState<Crew[]>([]);
  const [attempt, setAttempt] = useState(0); // sube al apretar "Reintentar"
  const [result, setResult] = useState<WantedResult | null>(null);

  // 2) Si la última respuesta guardada no es de la URL actual, estamos cargando.
  //    Así nunca se muestra una respuesta vieja.
  const requestKey = `${queryKey}#${attempt}`;
  const loading = result?.key !== requestKey;
  const data = loading ? null : (result?.data ?? null);
  const error = loading ? null : (result?.error ?? null);
  const totalPages = result?.data?.totalPages ?? null; // último total conocido

  // 3) URL con valores inválidos o incompletos (?size=7&status=PIRATA) →
  //    se reemplaza por la versión correcta, sin agregar entrada al historial
  useEffect(() => {
    if (searchParams.toString() !== queryKey) {
      setSearchParams(new URLSearchParams(queryKey), { replace: true });
    }
  }, [searchParams, queryKey, setSearchParams]);

  // 4) Tripulaciones para el filtro (una sola vez)
  useEffect(() => {
    const controller = new AbortController();
    getCrews(controller.signal)
      .then(setCrews)
      .catch(() => {
        // Si falla, el filtro solo muestra "Todas"; el listado sigue funcionando
      });
    return () => controller.abort();
  }, []);

  // 5) Pedir la página cada vez que cambia la URL (o se reintenta).
  //    Si la URL cambia antes de que llegue la respuesta, el cleanup cancela
  //    la request vieja (abort) y su respuesta nunca se muestra.
  useEffect(() => {
    const controller = new AbortController();
    getWantedPage(new URLSearchParams(queryKey), controller.signal)
      .then((page) => setResult({ key: requestKey, data: page, error: null }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setResult({
          key: requestKey,
          data: null,
          error: getErrorMessage(err, "No se pudieron cargar los carteles."),
        });
      });
    return () => controller.abort();
  }, [queryKey, requestKey]);

  // Cambiar filtros, búsqueda, orden o tamaño vuelve a la página 0:
  // así nunca quedas en una página que ya no existe
  function updateQuery(changes: Partial<WantedQuery>) {
    // Leemos la URL real del navegador (no la del último render): si cambias
    // dos filtros muy rápido, no se pierde ninguno
    const current = parseWantedQuery(
      new URLSearchParams(window.location.search),
    );
    setSearchParams(toWantedSearchParams({ ...current, page: 0, ...changes }));
  }

  function clearFilters() {
    setSearchParams(
      toWantedSearchParams({ ...DEFAULT_WANTED_QUERY, size: query.size }),
    );
  }

  const knownCrew = crews.some((crew) => crew.id === query.crewId);

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-bold">Carteles de "Se Busca"</h1>
        <p className="h-5 text-sm text-slate-400" aria-live="polite">
          {loading ? "Buscando..." : data && `${data.totalElements} carteles`}
        </p>
      </div>

      {/* Filtros: cada cambio se escribe en la URL */}
      <div className="grid gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <SearchInput
            id="wanted-search"
            label="Buscar por nombre o epíteto"
            value={query.q}
            maxLength={MAX_SEARCH_LENGTH}
            onChange={(q) => updateQuery({ q })}
          />
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-400">Estado</span>
          <select
            value={query.status}
            onChange={(event) => {
              const value = event.target.value;
              updateQuery({ status: isOneOf(WANTED_STATUSES, value) ? value : "" });
            }}
            className={fieldClass}
          >
            <option value="">Todos</option>
            {WANTED_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABEL[status]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-400">Fruta del diablo</span>
          <select
            value={query.fruit}
            onChange={(event) => {
              const value = event.target.value;
              updateQuery({ fruit: isOneOf(FRUIT_FILTERS, value) ? value : "" });
            }}
            className={fieldClass}
          >
            <option value="">Todas</option>
            {FRUIT_FILTERS.map((fruit) => (
              <option key={fruit} value={fruit}>
                {FRUIT_LABEL[fruit]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-400">Tripulación</span>
          <select
            value={query.crewId}
            onChange={(event) => updateQuery({ crewId: event.target.value })}
            className={fieldClass}
          >
            <option value="">Todas</option>
            {/* Un id que no está en la lista (URL compartida/vieja) igual se muestra */}
            {query.crewId && !knownCrew && (
              <option value={query.crewId}>Tripulación desconocida</option>
            )}
            {crews.map((crew) => (
              <option key={crew.id} value={crew.id}>
                {crew.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-400">Ordenar por</span>
          <select
            value={query.sort}
            onChange={(event) => {
              const value = event.target.value;
              if (isOneOf(WANTED_SORTS, value)) updateQuery({ sort: value });
            }}
            className={fieldClass}
          >
            {WANTED_SORTS.map((sort) => (
              <option key={sort} value={sort}>
                {SORT_LABEL[sort]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-400">Por página</span>
          <select
            value={query.size}
            onChange={(event) => {
              const size = Number(event.target.value);
              if (isOneOf(PAGE_SIZES, size)) updateQuery({ size });
            }}
            className={fieldClass}
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end">
          <button
            type="button"
            onClick={clearFilters}
            disabled={!hasActiveFilters(query)}
            className={secondaryButtonClass}
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Alto mínimo fijo según el tamaño de página: loading, error y
          "sin resultados" ocupan lo mismo, así el layout no salta */}
      <div
        className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900"
        style={{ minHeight: HEADER_HEIGHT + query.size * ROW_HEIGHT }}
        aria-busy={loading}
      >
        {error ? (
          <div className="p-4">
            <ErrorState
              message={error}
              onRetry={() => setAttempt((n) => n + 1)}
            />
          </div>
        ) : data && data.content.length === 0 ? (
          <div className="space-y-3 p-6 text-slate-400">
            {data.totalPages > 0 ? (
              // La API responde vacío si la página no existe (ej: ?page=99)
              <>
                <p>Esta página no existe.</p>
                <button
                  type="button"
                  onClick={() => updateQuery({ page: data.totalPages - 1 })}
                  className={secondaryButtonClass}
                >
                  Ir a la última página
                </button>
              </>
            ) : (
              <>
                <p>No hay carteles con estos filtros.</p>
                {hasActiveFilters(query) && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className={secondaryButtonClass}
                  >
                    Limpiar filtros
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          // whitespace-nowrap: cada fila mide siempre lo mismo (h-14)
          <table className="w-full min-w-[52rem] text-left text-sm whitespace-nowrap">
            <thead className="h-11 border-b border-slate-800 text-xs text-slate-400 uppercase">
              <tr>
                <th className="px-4 font-medium">Nombre</th>
                <th className="px-4 font-medium">Recompensa</th>
                <th className="px-4 font-medium">Estado</th>
                <th className="px-4 font-medium">Tripulación</th>
                <th className="px-4 font-medium">Fruta</th>
                <th className="px-4 font-medium">Amenaza</th>
                <th className="px-4 font-medium">Actualizado</th>
              </tr>
            </thead>
            <tbody>
              {!data
                ? // Cargando: filas "fantasma" del mismo alto que las reales
                  Array.from({ length: query.size }, (_, index) => (
                    <tr key={index} className="h-14 border-b border-slate-800/60">
                      <td colSpan={7} className="px-4">
                        <div className="h-4 animate-pulse rounded bg-slate-800" />
                      </td>
                    </tr>
                  ))
                : data.content.map((wanted) => (
                    <tr
                      key={wanted.id}
                      className="h-14 border-b border-slate-800/60 last:border-0"
                    >
                      <td className="px-4">
                        {/* Mantiene los filtros en la URL del detalle */}
                        <Link
                          to={{
                            pathname: `/wanted/${wanted.id}`,
                            search: location.search,
                          }}
                          className="font-medium text-amber-400 hover:underline"
                        >
                          {wanted.name}
                        </Link>
                        <p className="text-xs text-slate-500">
                          "{wanted.epithet}"
                        </p>
                      </td>
                      <td className="px-4 whitespace-nowrap">
                        {formatBerries(wanted.bounty)}
                      </td>
                      <td className="px-4">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${STATUS_BADGE[wanted.status]}`}
                        >
                          {STATUS_LABEL[wanted.status]}
                        </span>
                      </td>
                      <td className="px-4">{wanted.crew.name}</td>
                      <td className="px-4">
                        {wanted.devilFruit
                          ? FRUIT_LABEL[wanted.devilFruit.type]
                          : FRUIT_LABEL.NONE}
                      </td>
                      <td className="px-4">{wanted.threatLevel}/5</td>
                      <td className="px-4 text-xs text-slate-400">
                        {formatDateTime(wanted.updatedAt)}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination
        page={query.page}
        totalPages={totalPages}
        disabled={loading}
        onPageChange={(page) => updateQuery({ page })}
      />

      {/* Aquí aparece el detalle (/wanted/:id) ENCIMA del listado, que sigue
          montado: al cerrarlo, todo está exactamente como se dejó */}
      <Outlet />
    </section>
  );
}

export default WantedPage;
