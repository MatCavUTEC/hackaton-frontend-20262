import type { Page, WantedDetail, WantedSummary } from "../types/api";
import { api } from "./client";

// Los params llegan ya validados desde la URL (lib/wantedQuery.ts)
export async function getWantedPage(
  params: URLSearchParams,
  signal?: AbortSignal,
): Promise<Page<WantedSummary>> {
  const { data } = await api.get<Page<WantedSummary>>("/wanted", {
    params,
    signal,
  });
  return data;
}

export async function getWanted(
  id: string,
  signal?: AbortSignal,
): Promise<WantedDetail> {
  const { data } = await api.get<WantedDetail>(
    `/wanted/${encodeURIComponent(id)}`,
    { signal },
  );
  return data;
}
