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
  current?: NewsDetail; // solo en 409 NEWS_ALREADY_VERIFIED
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

// ===== Noticias (CP4) =====
export type NewsType =
  | "BOUNTY_UPDATE"
  | "BATTLE"
  | "MARINE_OPERATION"
  | "WORLD_GOVERNMENT"
  | "DISCOVERY";
export type NewsPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type NewsStatus = "RUMOR" | "CONFIRMED" | "DEBUNKED";
export type VerifiedStatus = Exclude<NewsStatus, "RUMOR">; // lo que acepta el PATCH

export interface NewsItem {
  id: string;
  type: NewsType;
  priority: NewsPriority;
  status: NewsStatus;
  title: string;
  summary: string;
  source: string;
  island: string;
  relatedWanted: { id: string; name: string } | null;
  publishedAt: string;
  updatedAt: string;
  verifiedAt: string | null;
}

export interface NewsDetail extends NewsItem {
  body: string[]; // párrafos
}

export interface NewsFeed {
  items: NewsItem[];
  nextCursor: string | null; // null = no hay más
  hasMore: boolean;
}

// ===== Sagas (CP5) =====
export interface Palette {
  background: string;
  surface: string;
  primary: string;
  accent: string;
  text: string;
}

export interface SagaSummary {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  synopsis: string;
  stageCount: number;
  totalDistanceNm: number;
  firstIsland: string;
  lastIsland: string;
  palette: Palette;
}

export interface StageMetric {
  key: "distanceNm" | "crewMorale" | "bountyPool" | "marineThreat";
  label: string;
  value: number;
  unit: string;
}

export interface SagaStage {
  id: string;
  order: number;
  slug: string;
  title: string;
  narrative: string[];
  island: { id: string; name: string; x: number; y: number };
  palette: Palette;
  metrics: StageMetric[];
}

export interface SagaStory {
  saga: SagaSummary & { intro: string };
  map: { width: number; height: number };
  stages: SagaStage[];
}
