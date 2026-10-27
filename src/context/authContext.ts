import { createContext } from "react";
import type {
  LoginRequest,
  MeResponse,
  RegisterRequest,
} from "../types/api";

// checking = hay un token guardado y se está verificando con GET /auth/me
export type AuthStatus = "checking" | "authenticated" | "unauthenticated";

// La sesión es lo mismo que responde /auth/me: usuario, equipo y vencimiento
export type Session = MeResponse;

export interface AuthContextValue {
  status: AuthStatus;
  session: Session | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (body: RegisterRequest) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
