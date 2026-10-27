import axios from "axios";
import { useEffect, useState, type ReactNode } from "react";
import {
  getMe,
  login as loginRequest,
  register as registerRequest,
} from "../api/auth";
import { api, tokenStorage } from "../api/client";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from "../types/api";
import { AuthContext, type AuthStatus, type Session } from "./authContext";

function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => tokenStorage.get());
  const [session, setSession] = useState<Session | null>(null);

  // El estado se deduce de token + session, no se guarda aparte:
  // sin token → afuera; con token y sesión → adentro; con token sin sesión → verificando
  const status: AuthStatus = !token
    ? "unauthenticated"
    : session
      ? "authenticated"
      : "checking";

  // 1) Restaurar la sesión al recargar: si hay token, preguntar quién soy
  useEffect(() => {
    if (!tokenStorage.get()) return;
    const controller = new AbortController();
    getMe(controller.signal)
      .then(setSession)
      .catch(() => {
        if (controller.signal.aborted) return;
        tokenStorage.clear(); // token inválido o vencido → al login
        setToken(null);
      });
    return () => controller.abort();
  }, []);

  // 2) Si CUALQUIER request responde 401, la sesión ya no vale → al login
  useEffect(() => {
    const interceptorId = api.interceptors.response.use(
      (response) => response,
      (error: unknown) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          tokenStorage.clear();
          setToken(null);
          setSession(null);
        }
        return Promise.reject(error);
      },
    );
    return () => api.interceptors.response.eject(interceptorId);
  }, []);

  // Registro y login responden lo mismo: guardar token y sesión
  function startSession(data: LoginResponse) {
    tokenStorage.set(data.token);
    setToken(data.token);
    setSession({ user: data.user, team: data.team, expiresAt: data.expiresAt });
  }

  async function login(credentials: LoginRequest) {
    startSession(await loginRequest(credentials));
  }

  async function register(body: RegisterRequest) {
    startSession(await registerRequest(body));
  }

  function logout() {
    tokenStorage.clear();
    setToken(null);
    setSession(null);
  }

  return (
    <AuthContext.Provider value={{ status, session, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
