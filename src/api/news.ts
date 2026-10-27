import type {
  NewsDetail,
  NewsFeed,
  VerifiedStatus,
} from "../types/api";
import { api } from "./client";

// params trae los filtros, el limit y (desde la 2da carga) el cursor
export async function getNewsFeed(
  params: URLSearchParams,
  signal?: AbortSignal,
): Promise<NewsFeed> {
  const { data } = await api.get<NewsFeed>("/news/feed", { params, signal });
  return data;
}

export async function getNews(
  id: string,
  signal?: AbortSignal,
): Promise<NewsDetail> {
  const { data } = await api.get<NewsDetail>(
    `/news/${encodeURIComponent(id)}`,
    { signal },
  );
  return data;
}

export async function updateNewsStatus(
  id: string,
  status: VerifiedStatus,
): Promise<NewsDetail> {
  const { data } = await api.patch<NewsDetail>(
    `/news/${encodeURIComponent(id)}/status`,
    { status },
  );
  return data;
}
