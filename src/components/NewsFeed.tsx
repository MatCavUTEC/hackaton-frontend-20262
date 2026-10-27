import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getErrorMessage } from "../api/errors";
import { getNewsFeed } from "../api/news";
import {
  formatDateTime,
  NEWS_STATUS_BADGE,
  NEWS_STATUS_LABEL,
  NEWS_TYPE_LABEL,
  PRIORITY_BADGE,
  PRIORITY_LABEL,
} from "../lib/catalog";
import { matchesNewsFilters, type NewsFilters } from "../lib/newsFilters";
import type { NewsItem } from "../types/api";
import ErrorState from "./ErrorState";

const PAGE_LIMIT = 20;

interface NewsFeedProps {
  filters: NewsFilters;
  filtersKey: string; // los filtros como texto de URL (type=BATTLE&...)
  updatedNews: Record<string, NewsItem>; // noticias cambiadas en el detalle
}

// Feed con scroll infinito. NewsPage le pone key={filtersKey}: si cambian
// los filtros, este componente se destruye y nace uno nuevo, vacío.
function NewsFeed({ filters, filtersKey, updatedNews }: NewsFeedProps) {
  const location = useLocation();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false); // candado: una sola carga en vuelo
  const controllerRef = useRef<AbortController | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null); // marca el final de la lista

  const loadMore = useCallback(() => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    // Mismos filtros + el cursor que devolvió la carga anterior
    const params = new URLSearchParams(filtersKey);
    params.set("limit", String(PAGE_LIMIT));
    if (cursor) params.set("cursor", cursor);

    const controller = new AbortController();
    controllerRef.current = controller;
    getNewsFeed(params, controller.signal)
      .then((page) => {
        // Regla de Nami: si una noticia ya está en la lista, no se agrega otra vez
        setItems((prev) => {
          const seen = new Set(prev.map((news) => news.id));
          return [...prev, ...page.items.filter((news) => !seen.has(news.id))];
        });
        setCursor(page.nextCursor);
        setHasMore(page.hasMore);
        loadingRef.current = false;
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        // Las noticias ya cargadas se quedan; solo se muestra el error
        setError(getErrorMessage(err, "No se pudieron cargar las noticias."));
        loadingRef.current = false;
        setLoading(false);
      });
  }, [cursor, hasMore, filtersKey]);

  // Si el componente se desmonta (cambiaron los filtros), se cancela la
  // carga en vuelo: su respuesta nunca se mezcla con los filtros nuevos
  useEffect(() => {
    return () => controllerRef.current?.abort();
  }, []);

  // Cuando el final de la lista se acerca a la pantalla, cargar más.
  // Mientras carga (o si hubo error o no hay más) no se observa nada.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || loading || error || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "0px 0px 400px 0px" }, // empieza 400px antes del final
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loading, error, hasMore, loadMore]);

  // Lo cambiado en el detalle reemplaza a lo que trajo el feed; si ya no
  // cumple los filtros (ej: filtro "Rumor" y la confirmaste), sale de la lista
  const visibleNews = items
    .map((news) => updatedNews[news.id] ?? news)
    .filter((news) => matchesNewsFilters(news, filters));

  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {visibleNews.map((news) => (
          <li key={news.id}>
            <Link
              to={{ pathname: `/news/${news.id}`, search: location.search }}
              className="block space-y-2 rounded-xl border border-slate-800 bg-slate-900 p-4 hover:border-amber-700"
            >
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-slate-800 px-2 py-0.5">
                  {NEWS_TYPE_LABEL[news.type]}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 ${PRIORITY_BADGE[news.priority]}`}
                >
                  Prioridad {PRIORITY_LABEL[news.priority]}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 ${NEWS_STATUS_BADGE[news.status]}`}
                >
                  {NEWS_STATUS_LABEL[news.status]}
                </span>
              </div>
              <h2 className="font-semibold">{news.title}</h2>
              <p className="text-sm text-slate-400">{news.summary}</p>
              <p className="text-xs text-slate-500">
                {news.island} · {news.source} ·{" "}
                {formatDateTime(news.publishedAt)}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      {loading && (
        <div aria-busy="true" className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 animate-pulse rounded-xl bg-slate-800" />
          ))}
        </div>
      )}

      {error && <ErrorState message={error} onRetry={loadMore} />}

      {!hasMore && !loading && (
        <p className="py-6 text-center text-sm text-slate-500">
          {visibleNews.length > 0
            ? "Llegaste al final de las noticias."
            : "No hay noticias con estos filtros."}
        </p>
      )}

      {/* Elemento invisible al final: cuando aparece en pantalla, carga más */}
      <div ref={sentinelRef} className="h-px" />
    </div>
  );
}

export default NewsFeed;
