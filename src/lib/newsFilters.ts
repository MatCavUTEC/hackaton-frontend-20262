import type { NewsItem, NewsPriority, NewsStatus, NewsType } from "../types/api";
import {
  isOneOf,
  NEWS_PRIORITIES,
  NEWS_STATUSES,
  NEWS_TYPES,
} from "./catalog";

// Los filtros del feed viven en la URL (?type=...&priority=...&status=...)
export interface NewsFilters {
  type: NewsType | "";
  priority: NewsPriority | "";
  status: NewsStatus | "";
}

// URL → objeto. Un valor inválido se ignora (queda "Todos")
export function parseNewsFilters(params: URLSearchParams): NewsFilters {
  const type = params.get("type");
  const priority = params.get("priority");
  const status = params.get("status");
  return {
    type: isOneOf(NEWS_TYPES, type) ? type : "",
    priority: isOneOf(NEWS_PRIORITIES, priority) ? priority : "",
    status: isOneOf(NEWS_STATUSES, status) ? status : "",
  };
}

// Objeto → URL, siempre en el mismo orden y sin filtros vacíos
export function toNewsSearchParams(filters: NewsFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.type) params.set("type", filters.type);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.status) params.set("status", filters.status);
  return params;
}

// ¿La noticia cumple los filtros? Sirve para sacarla del feed si al
// verificarla deja de cumplirlos (ej: filtro "Rumor" y la confirmaste)
export function matchesNewsFilters(
  news: NewsItem,
  filters: NewsFilters,
): boolean {
  return (
    (!filters.type || news.type === filters.type) &&
    (!filters.priority || news.priority === filters.priority) &&
    (!filters.status || news.status === filters.status)
  );
}

// Lo que el detalle (/news/:id) le pasa al feed por el <Outlet />
export interface NewsOutletContext {
  onNewsUpdated: (news: NewsItem) => void;
}
