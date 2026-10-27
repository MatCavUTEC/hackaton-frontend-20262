import type { SagaStory, SagaSummary } from "../types/api";
import { api } from "./client";

export async function getSagas(signal?: AbortSignal): Promise<SagaSummary[]> {
  const { data } = await api.get<SagaSummary[]>("/sagas", { signal });
  return data;
}

export async function getSagaStory(
  id: string,
  signal?: AbortSignal,
): Promise<SagaStory> {
  const { data } = await api.get<SagaStory>(
    `/sagas/${encodeURIComponent(id)}/story`,
    { signal },
  );
  return data;
}
