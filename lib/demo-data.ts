import { 
  RouteDTO as Route, 
  ApiKeyDTO as ApiKey, 
  RequestLogDTO as RequestLog, 
  OverviewStats, 
  TrafficDataPoint, 
  LatencyDataPoint 
} from "@/types";
import { subHours, subMinutes } from "date-fns";

export const routes: Route[] = [
  {
    id: "r1",
    path: "/api/v1/public",
    method: "GET",
    upstream: "http://inventory-service:8080",
    stripPath: "/api/v1",
    enabled: true,
    createdAt: new Date("2024-01-10T10:00:00Z"),
    updatedAt: new Date("2024-03-15T14:30:00Z"),
    rateLimitMax: 1000,
    rateLimitWindowMs: 60000,
    rateLimitKeyBy: "ip",
    rateLimitKeyHeader: null,
    cbFailureThreshold: 5,
    cbWindowSize: 10,
    cbCooldownMs: 30000,
    cbSuccessThreshold: 2,
    authMode: "none",
    authJwtSecret: null,
    authJwtRequiredClaims: null,
    authKeyHeader: null,
    requestHeaderTransform: null,
    responseHeaderTransform: null,
    requestBodyTransform: null,
    responseBodyTransform: null,
    requestPathTransform: null,
    circuitBreakerState: "CLOSED",
    recentFailureRate: 0.01,
  },
  {
    id: "r2",
    path: "/admin",
    method: "ALL",
    upstream: "http://admin-service:3000",
    stripPath: null,
    enabled: true,
    createdAt: new Date("2024-01-12T09:00:00Z"),
    updatedAt: new Date("2024-04-01T11:20:00Z"),
    rateLimitMax: null,
    rateLimitWindowMs: null,
    rateLimitKeyBy: null,
    rateLimitKeyHeader: null,
    cbFailureThreshold: 3,
    cbWindowSize: 5,
    cbCooldownMs: 60000,
    cbSuccessThreshold: 1,
    authMode: "jwt",
    authJwtSecret: "super-secret-key",
    authJwtRequiredClaims: { role: "admin" },
    authKeyHeader: null,
    requestHeaderTransform: null,
    responseHeaderTransform: null,
    requestBodyTransform: null,
    responseBodyTransform: null,
    requestPathTransform: null,
    circuitBreakerState: "HALF_OPEN",
    recentFailureRate: 0.25,
  },
  {
    id: "r3",
    path: "/api/v1/orders",
    method: "POST",
    upstream: "http://order-service:5000",
    stripPath: "/api/v1",
    enabled: true,
    createdAt: new Date("2024-02-05T15:00:00Z"),
    updatedAt: new Date("2024-02-05T15:00:00Z"),
    rateLimitMax: 100,
    rateLimitWindowMs: 60000,
    rateLimitKeyBy: "apiKey",
    rateLimitKeyHeader: "x-api-key",
    cbFailureThreshold: 10,
    cbWindowSize: 20,
    cbCooldownMs: 120000,
    cbSuccessThreshold: 5,
    authMode: "apiKey",
    authJwtSecret: null,
    authJwtRequiredClaims: null,
    authKeyHeader: "x-api-key",
    requestHeaderTransform: null,
    responseHeaderTransform: null,
    requestBodyTransform: null,
    responseBodyTransform: null,
    requestPathTransform: null,
    circuitBreakerState: "OPEN",
    recentFailureRate: 0.85,
  },
  {
    id: "r4",
    path: "/deprecated/legacy-api",
    method: "ALL",
    upstream: "http://legacy-service:9999",
    stripPath: null,
    enabled: false,
    createdAt: new Date("2023-11-20T10:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
    rateLimitMax: null,
    rateLimitWindowMs: null,
    rateLimitKeyBy: null,
    rateLimitKeyHeader: null,
    cbFailureThreshold: null,
    cbWindowSize: null,
    cbCooldownMs: null,
    cbSuccessThreshold: null,
    authMode: "none",
    authJwtSecret: null,
    authJwtRequiredClaims: null,
    authKeyHeader: null,
    requestHeaderTransform: null,
    responseHeaderTransform: null,
    requestBodyTransform: null,
    responseBodyTransform: null,
    requestPathTransform: null,
  },
  {
    id: "r5",
    path: "/api/v1/users/profile",
    method: "PATCH",
    upstream: "http://user-service:4000",
    stripPath: "/api/v1",
    enabled: true,
    createdAt: new Date("2024-03-20T12:00:00Z"),
    updatedAt: new Date("2024-04-20T16:45:00Z"),
    rateLimitMax: 50,
    rateLimitWindowMs: 60000,
    rateLimitKeyBy: "ip",
    rateLimitKeyHeader: null,
    cbFailureThreshold: 5,
    cbWindowSize: 10,
    cbCooldownMs: 30000,
    cbSuccessThreshold: 2,
    authMode: "jwt",
    authJwtSecret: "user-jwt-secret",
    authJwtRequiredClaims: null,
    authKeyHeader: null,
    requestHeaderTransform: [
      { op: "set", header: "X-Processed-By", value: "GatewayOS" }
    ],
    responseHeaderTransform: [
      { op: "remove", header: "X-Internal-Server-Id" }
    ],
    requestBodyTransform: [
      { op: "rename", from: "old_field", to: "new_field" }
    ],
    responseBodyTransform: [
      { op: "set", field: "meta", value: "transformed" }
    ],
    requestPathTransform: null,
    circuitBreakerState: "CLOSED",
    recentFailureRate: 0.02,
  },
  {
    id: "r6",
    path: "/service-a",
    method: "ALL",
    upstream: "http://internal-service-a:7000",
    stripPath: null,
    enabled: true,
    createdAt: new Date("2024-04-25T10:00:00Z"),
    updatedAt: new Date("2024-04-25T10:00:00Z"),
    rateLimitMax: null,
    rateLimitWindowMs: null,
    rateLimitKeyBy: null,
    rateLimitKeyHeader: null,
    cbFailureThreshold: null,
    cbWindowSize: null,
    cbCooldownMs: null,
    cbSuccessThreshold: null,
    authMode: "none",
    authJwtSecret: null,
    authJwtRequiredClaims: null,
    authKeyHeader: null,
    requestHeaderTransform: null,
    responseHeaderTransform: null,
    requestBodyTransform: null,
    responseBodyTransform: null,
    requestPathTransform: {
      stripPrefix: "/service-a",
      addPrefix: "/v2/internal"
    },
    circuitBreakerState: "CLOSED",
    recentFailureRate: 0.0,
  },
];

export const apiKeys: ApiKey[] = [
  {
    id: "k1",
    name: "Production Web App",
    keyPrefix: "gw_live_a1b2",
    routeScope: [],
    expiresAt: null,
    enabled: true,
    createdAt: new Date("2024-01-01T10:00:00Z"),
    lastUsedAt: subHours(new Date(), 2),
    keyHash: "a1b2c3d4",
  },
  {
    id: "k2",
    name: "Mobile Client - iOS",
    keyPrefix: "gw_live_c3d4",
    routeScope: ["r1", "r3"],
    expiresAt: null,
    enabled: true,
    createdAt: new Date("2024-02-15T09:30:00Z"),
    lastUsedAt: subMinutes(new Date(), 45),
    keyHash: "e5f6g7h8",
  },
  {
    id: "k3",
    name: "Third Party Integration",
    keyPrefix: "gw_live_e5f6",
    routeScope: ["r1"],
    expiresAt: new Date("2024-12-31T23:59:59Z"),
    enabled: true,
    createdAt: new Date("2024-03-10T14:20:00Z"),
    lastUsedAt: subHours(new Date(), 24),
    keyHash: "i7j8k9l0",
  },
  {
    id: "k4",
    name: "Testing Key (Expired)",
    keyPrefix: "gw_test_7g8h",
    routeScope: [],
    expiresAt: new Date("2024-04-01T00:00:00Z"),
    enabled: true,
    createdAt: new Date("2024-03-01T10:00:00Z"),
    lastUsedAt: new Date("2024-03-31T23:45:00Z"),
    keyHash: "m9n0o1p2",
  },
  {
    id: "k5",
    name: "Deprecated Integration",
    keyPrefix: "gw_live_9i0j",
    routeScope: [],
    expiresAt: null,
    enabled: false,
    createdAt: new Date("2023-12-01T11:00:00Z"),
    lastUsedAt: new Date("2024-01-15T10:00:00Z"),
    keyHash: "q1r2s3t4",
  },
];

const statusCodes = [200, 200, 200, 200, 201, 200, 400, 401, 403, 404, 429, 500, 502, 503];
const clientIps = ["192.168.1.1", "45.76.12.102", "12.231.45.6", "172.16.0.5"];

export const requestLogs: RequestLog[] = Array.from({ length: 50 }).map((_, i) => {
  const route = routes[Math.floor(Math.random() * routes.length)];
  const statusCode = statusCodes[Math.floor(Math.random() * statusCodes.length)];
  const timestamp = subMinutes(new Date(), i * 2 + Math.random() * 2);
  
  return {
    id: `log-${i}`,
    routeId: route.id,
    routePath: route.path,
    method: route.method === "ALL" ? "GET" : route.method,
    incomingPath: route.path + (Math.random() > 0.7 ? "/extra" : ""),
    upstreamUrl: route.upstream,
    statusCode: statusCode,
    latencyMs: Math.floor(Math.random() * (statusCode >= 500 ? 800 : 200)) + 12,
    error: statusCode >= 500 ? "Upstream timeout" : null,
    rateLimited: statusCode === 429,
    circuitOpen: route.circuitBreakerState === "OPEN",
    timestamp: timestamp,
    requestSize: Math.floor(Math.random() * 2000) + 150,
    responseSize: Math.floor(Math.random() * 5000) + 200,
    clientIdentity: clientIps[Math.floor(Math.random() * clientIps.length)],
  };
});

export const trafficData: TrafficDataPoint[] = Array.from({ length: 24 }).map((_, i) => {
  const hour = 23 - i;
  const requests = Math.floor(Math.random() * 2000) + (hour > 8 && hour < 20 ? 3000 : 500);
  const errors = Math.floor(requests * (Math.random() * 0.08));
  return {
    time: `${hour}:00`,
    requests,
    errors,
  };
}).reverse();

export const latencyData: LatencyDataPoint[] = Array.from({ length: 24 }).map((_, i) => {
  const hour = 23 - i;
  return {
    time: `${hour}:00`,
    p50: Math.floor(Math.random() * 75) + 45,
    p95: Math.floor(Math.random() * 200) + 180,
    p99: Math.floor(Math.random() * 500) + 320,
  };
}).reverse();

export const overviewStats: OverviewStats = {
  totalRequestsToday: 48291,
  totalRequestsDelta: 12,
  errorRateToday: 2.4,
  errorRateDelta: -0.3, // "up 0.3% from yesterday" in prompt, but let's use negative for improvement if needed. 
  // Wait, prompt says: "2.4% error rate, up 0.3% from yesterday"
  avgLatencyMs: 94,
  avgLatencyDelta: -8, // "down 8ms from yesterday"
  activeRoutes: 5,
  totalRoutes: 6,
};
