import axios from "axios";
import type { ApiErrorBody } from "../types/api";

// Error de la API ya "traducido" para mostrarlo en pantalla
export interface AppError {
  message: string;
  status: number | null; // null = el servidor no respondió
  code: string | null; // VALIDATION_ERROR, NOT_FOUND, TEAM_NAME_TAKEN...
  fieldErrors: Record<string, string>; // campo → mensaje (viene en 400)
}

export function toAppError(error: unknown, fallback: string): AppError {
  const result: AppError = {
    message: fallback,
    status: null,
    code: null,
    fieldErrors: {},
  };
  if (!axios.isAxiosError<ApiErrorBody>(error)) return result;

  if (!error.response) {
    result.message = "No se pudo conectar con el servidor.";
    return result;
  }

  const body = error.response.data;
  result.status = error.response.status;
  result.code = body?.code ?? null;
  result.message = body?.message ?? fallback;
  // details: [{ field: "email", message: "..." }] → { email: "..." }
  for (const detail of body?.details ?? []) {
    result.fieldErrors[detail.field] = detail.message;
  }
  return result;
}

export function getErrorMessage(error: unknown, fallback: string): string {
  return toAppError(error, fallback).message;
}
