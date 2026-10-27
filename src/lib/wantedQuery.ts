import type {
  FruitFilter,
  PageSize,
  WantedSort,
  WantedStatus,
} from "../types/api";
import {
  FRUIT_FILTERS,
  isOneOf,
  PAGE_SIZES,
  WANTED_SORTS,
  WANTED_STATUSES,
} from "./catalog";

// Todo el estado del listado vive en la URL; este objeto es su versión tipada.
// Los nombres son los mismos que los parámetros de GET /wanted.
export interface WantedQuery {
  page: number;
  size: PageSize;
  status: WantedStatus | "";
  crewId: string;
  fruit: FruitFilter | "";
  q: string;
  sort: WantedSort;
}

export const DEFAULT_WANTED_QUERY: WantedQuery = {
  page: 0,
  size: 20,
  status: "",
  crewId: "",
  fruit: "",
  q: "",
  sort: "bounty,desc",
};

export const MAX_SEARCH_LENGTH = 100;

// URL → objeto. Cualquier valor inválido se reemplaza por el valor por defecto,
// así una URL rota (?size=7&status=PIRATA) nunca llega a la API ni rompe la vista
export function parseWantedQuery(params: URLSearchParams): WantedQuery {
  const rawPage = params.get("page") ?? "0";
  const page = /^\d+$/.test(rawPage) ? Number(rawPage) : 0;
  const size = Number(params.get("size") ?? DEFAULT_WANTED_QUERY.size);
  const status = params.get("status");
  const fruit = params.get("fruit");
  const sort = params.get("sort");
  const crewId = params.get("crewId") ?? "";

  return {
    page: Number.isSafeInteger(page) ? page : 0,
    size: isOneOf(PAGE_SIZES, size) ? size : DEFAULT_WANTED_QUERY.size,
    status: isOneOf(WANTED_STATUSES, status) ? status : "",
    crewId: crewId.length <= 200 ? crewId : "",
    fruit: isOneOf(FRUIT_FILTERS, fruit) ? fruit : "",
    q: (params.get("q") ?? "").slice(0, MAX_SEARCH_LENGTH),
    sort: isOneOf(WANTED_SORTS, sort) ? sort : DEFAULT_WANTED_QUERY.sort,
  };
}

// Objeto → URL. Siempre en el mismo orden y sin filtros vacíos: así cada
// estado tiene una sola URL posible (y una sola "llave" para la request)
export function toWantedSearchParams(query: WantedQuery): URLSearchParams {
  const params = new URLSearchParams();
  params.set("page", String(query.page));
  params.set("size", String(query.size));
  params.set("sort", query.sort);
  if (query.status) params.set("status", query.status);
  if (query.crewId) params.set("crewId", query.crewId);
  if (query.fruit) params.set("fruit", query.fruit);
  if (query.q) params.set("q", query.q);
  return params;
}

export function hasActiveFilters(query: WantedQuery): boolean {
  return Boolean(query.status || query.crewId || query.fruit || query.q);
}
