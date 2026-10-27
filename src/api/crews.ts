import type { Crew } from "../types/api";
import { api } from "./client";

export async function getCrews(signal?: AbortSignal): Promise<Crew[]> {
  const { data } = await api.get<Crew[]>("/crews", { signal });
  return data;
}
