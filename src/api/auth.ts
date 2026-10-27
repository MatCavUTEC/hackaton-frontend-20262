import type {
  LoginRequest,
  LoginResponse,
  MeResponse,
  RegisterRequest,
} from "../types/api";
import { api } from "./client";

export async function register(body: RegisterRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/register", body);
  return data;
}

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", credentials);
  return data;
}

export async function getMe(signal?: AbortSignal): Promise<MeResponse> {
  const { data } = await api.get<MeResponse>("/auth/me", { signal });
  return data;
}
