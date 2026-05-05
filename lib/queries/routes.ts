import { prisma } from "@/lib/prisma";
import type {
    RouteDTO,
    RequestLogDTO,
    HeaderOperation,
    BodyOperation,
    PathRewriteConfig
} from "@/types";
import { Route, Prisma } from "@prisma/client";
export interface RouteFilters {
    search?: string;
    method?: string;
    status?: string;
}

export async function getRoutes(filters: RouteFilters = {}): Promise<RouteDTO[]> {
    // 1. Build the dynamic WHERE clause
    const where: Prisma.RouteWhereInput = {};

    if (filters.search) {
        where.OR = [
            { path: { contains: filters.search, mode: "insensitive" } },
            { upstream: { contains: filters.search, mode: "insensitive" } },
        ];
    }

    if (filters.method && filters.method !== "all") {
        where.method = filters.method;
    }

    if (filters.status && filters.status !== "all") {
        where.enabled = filters.status === "enabled";
    }

    // 2. Fetch the raw records from Postgres using the filters
    const rawRoutes = await prisma.route.findMany({
        where, // 🟢 Inject the filters here
        orderBy: { createdAt: "desc" },
    });

    // 3. Map the raw Prisma models to your strict RouteDTO format
    return rawRoutes.map((route) => ({
        ...route,

        // Explicitly cast the generic JsonValues to your strict types
        requestHeaderTransform: route.requestHeaderTransform as HeaderOperation[] | null,
        responseHeaderTransform: route.responseHeaderTransform as HeaderOperation[] | null,
        requestBodyTransform: route.requestBodyTransform as BodyOperation[] | null,
        responseBodyTransform: route.responseBodyTransform as BodyOperation[] | null,
        requestPathTransform: route.requestPathTransform as PathRewriteConfig | null,

        // Initialize optional runtime fields
        circuitBreakerState: undefined,
        recentFailureRate: undefined,
    }));
}

export async function getRouteById(id: string): Promise<RouteDTO | null> {
    const route = await prisma.route.findUnique({
        where: { id },
    });

    if (!route) return null;

    // 🟢 THE FIX: Cast the generic JsonValues to your strict DTO types
    return {
        ...route,
        requestHeaderTransform: route.requestHeaderTransform as HeaderOperation[] | null,
        responseHeaderTransform: route.responseHeaderTransform as HeaderOperation[] | null,
        requestBodyTransform: route.requestBodyTransform as BodyOperation[] | null,
        responseBodyTransform: route.responseBodyTransform as BodyOperation[] | null,
        requestPathTransform: route.requestPathTransform as PathRewriteConfig | null,

        // Initialize optional runtime fields
        circuitBreakerState: undefined,
        recentFailureRate: undefined,
    };
}

function mapRouteToDTO(rawRoute: Route): RouteDTO {
    return {
        ...rawRoute,
        requestHeaderTransform: rawRoute.requestHeaderTransform as HeaderOperation[] | null,
        responseHeaderTransform: rawRoute.responseHeaderTransform as HeaderOperation[] | null,
        requestBodyTransform: rawRoute.requestBodyTransform as BodyOperation[] | null,
        responseBodyTransform: rawRoute.responseBodyTransform as BodyOperation[] | null,
        requestPathTransform: rawRoute.requestPathTransform as PathRewriteConfig | null,
        circuitBreakerState: undefined,
        recentFailureRate: undefined,
    };
}

export async function getRouteWithLogs(id: string, logLimit = 20): Promise<{ route: RouteDTO | null, logs: RequestLogDTO[] }> {
    const [rawRoute, rawLogs] = await Promise.all([
        prisma.route.findUnique({ where: { id } }),
        prisma.requestLog.findMany({
            where: { routeId: id },
            orderBy: { timestamp: "desc" },
            take: logLimit,
            // 🟢 CRITICAL: We must include the route to get the path and method for the DTO!
            include: {
                route: { select: { path: true, method: true } },
            },
        }),
    ]);

    if (!rawRoute) {
        return { route: null, logs: [] };
    }

    // 1. Map the route JSON values
    const route = mapRouteToDTO(rawRoute);

    // 2. Map the logs and fill in the missing UI-specific fields
    const logs: RequestLogDTO[] = rawLogs.map((log) => ({
        id: log.id,
        routeId: log.routeId,
        routePath: log.route?.path ?? "Deleted Route",
        method: log.route?.method ?? "UNKNOWN",
        incomingPath: log.incomingPath,
        upstreamUrl: log.upstreamUrl,
        statusCode: log.statusCode,
        latencyMs: log.latencyMs,
        error: log.error,
        timestamp: log.timestamp,

        // Populate runtime UI fields
        rateLimited: log.statusCode === 429,
        circuitOpen: false,
        requestSize: 0,
        responseSize: 0,
        clientIdentity: "anonymous",
    }));

    return { route, logs };
}

export async function getRouteStats(id: string) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [total, errors, latency] = await Promise.all([
        prisma.requestLog.count({
            where: { routeId: id },
        }),
        prisma.requestLog.count({
            where: { routeId: id, statusCode: { gte: 500 } },
        }),
        prisma.requestLog.aggregate({
            where: { routeId: id, timestamp: { gte: since } },
            _avg: { latencyMs: true },
        }),
    ]);

    const successRate =
        total > 0
            ? Number((((total - errors) / total) * 100).toFixed(1))
            : 100;

    return {
        totalRequests: total,
        totalErrors: errors,
        successRate,
        avgLatencyMs: Math.round(latency._avg.latencyMs ?? 0),
    };
}