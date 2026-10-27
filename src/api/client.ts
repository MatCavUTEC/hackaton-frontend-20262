import axios from "axios";

const TOKEN_KEY = "logpose.token";

// El token se guarda en localStorage para que sobreviva a una recarga (F5)
export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

// La URL base sale de VITE_API_BASE_URL (.env.local), no se escribe en el código
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Antes de cada request: si hay token guardado, lo agrega al header
api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
