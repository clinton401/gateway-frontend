import {
  Route as PrismaRoute,
  ApiKey as PrismaApiKey,
  RequestLog as PrismaRequestLog
} from "@prisma/client";

// --- 1. STRICT JSON SUB-TYPES ---
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD" | "ALL";
export type AuthMode = "none" | "apiKey" | "jwt";
export type CircuitBreakerState = "CLOSED" | "OPEN" | "HALF_OPEN";
export type RateLimitKeyBy = "ip" | "apiKey" | "header";

export interface HeaderOperation {
  op: "set" | "remove" | "rename";
  header?: string;
  from?: string;
  to?: string;
  value?: string;
}

export interface BodyOperation {
  op: "set" | "remove" | "rename";
  field?: string;
  from?: string;
  to?: string;
  value?: string;
}

export interface PathRewriteConfig {
  stripPrefix?: string;
  addPrefix?: string;
  rewrite?: {
    pattern: string;
    replacement: string;
  };
}

// --- 2. FRONTEND DTOs (Data Transfer Objects) ---

// ROUTE DTO: Strip weak Prisma JSON fields, inject strict TS fields + runtime state
export type RouteDTO = Omit<
  PrismaRoute,
  | "requestHeaderTransform"
  | "responseHeaderTransform"
  | "requestBodyTransform"
  | "responseBodyTransform"
  | "requestPathTransform"
> & {
  requestHeaderTransform: HeaderOperation[] | null;
  responseHeaderTransform: HeaderOperation[] | null;
  requestBodyTransform: BodyOperation[] | null;
  responseBodyTransform: BodyOperation[] | null;
  requestPathTransform: PathRewriteConfig | null;

  // Runtime/UI fields not in Postgres
  circuitBreakerState?: CircuitBreakerState;
  recentFailureRate?: number;
};

// API KEY DTO: Prisma perfectly matches the UI, just alias it.
export type ApiKeyDTO = PrismaApiKey;

// REQUEST LOG DTO: Keep Prisma fields, but EXTEND it with flattened relations and runtime data
export interface RequestLogDTO extends PrismaRequestLog {
  routePath: string;      // Flattened from the Prisma relation mapping
  rateLimited: boolean;   // Runtime metric
  circuitOpen: boolean;   // Runtime metric
  requestSize: number;    // Runtime metric
  responseSize: number;   // Runtime metric
  clientIdentity: string; // Extracted at runtime
}


// --- 3. UI AGGREGATION STATS ---
export interface OverviewStats {
  totalRequestsToday: number;
  totalRequestsDelta: number;
  errorRateToday: number;
  errorRateDelta: number;
  avgLatencyMs: number;
  avgLatencyDelta: number;
  activeRoutes: number;
  totalRoutes: number;
}

export interface TrafficDataPoint {
  time: string;
  requests: number;
  errors: number;
}

export interface LatencyDataPoint {
  time: string;
  p50: number;
  p95: number;
  p99: number;
}