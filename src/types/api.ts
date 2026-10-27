// Tipos copiados del contrato de la API (Swagger: /docs)

// ===== Auth =====
export interface User {
  id: string;
  name: string; // nombre de la tripulación
  email: string;
}

export interface Team {
  code: string; // TEAM-007
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  teamName: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: "Bearer";
  expiresAt: string;
  user: User;
  team: Team;
}

export interface MeResponse {
  user: User;
  team: Team;
  expiresAt: string;
}

// ===== Errores (formato único de toda la API) =====
export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiErrorBody {
  status: number;
  code: string;
  message: string;
  traceId: string;
  details?: ApiFieldError[];
  retryAfterSeconds?: number;
}

// ===== Enums =====
export type WantedStatus = "AT_LARGE" | "CAPTURED" | "MISSING";
export type FruitType = "PARAMECIA" | "ZOAN" | "LOGIA";
export type FruitFilter = FruitType | "NONE"; // NONE = sin fruta
export type CrewRole =
  | "CAPTAIN"
  | "FIRST_MATE"
  | "NAVIGATOR"
  | "SNIPER"
  | "COOK"
  | "DOCTOR"
  | "SHIPWRIGHT"
  | "MUSICIAN"
  | "ARCHAEOLOGIST"
  | "HELMSMAN"
  | "FIGHTER";
export type WantedSort = "bounty,desc" | "name,asc" | "updatedAt,desc";
export type PageSize = 10 | 20 | 50;
export type LogPoseStatus = "LOCKED" | "UNLOCKED";

// ===== Tripulaciones y carteles =====
export interface CrewRef {
  id: string;
  name: string;
}

export interface Crew extends CrewRef {
  shipName: string;
  jollyRogerColor: string; // hexadecimal
  memberCount: number;
  totalBounty: number;
}

export interface DevilFruit {
  name: string;
  type: FruitType;
}

export interface WantedSummary {
  id: string;
  name: string;
  epithet: string;
  bounty: number;
  status: WantedStatus;
  crew: CrewRef;
  role: CrewRole;
  devilFruit: DevilFruit | null;
  threatLevel: number; // 1 a 5
  lastSeenIsland: string;
  updatedAt: string;
}

export interface WantedDetail extends WantedSummary {
  age: number;
  heightCm: number;
  bio: string;
  lastSeen: { island: string; seenAt: string };
  bountyHistory: { amount: number; issuedAt: string }[];
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

// ===== Dashboard y Log Pose =====
export interface DashboardSummary {
  team: Team;
  wanted: {
    total: number;
    totalBounty: number;
    averageBounty: number;
    byStatus: Record<WantedStatus, number>;
    byFruit: Record<FruitFilter, number>;
  };
  crews: {
    total: number;
    mostWanted: Crew | null;
  };
  topBounties: WantedSummary[];
  generatedAt: string;
}

export interface LogPose {
  status: LogPoseStatus;
  grandLineUnlocked: boolean;
  unlockedAt: string | null;
  message: string;
}
