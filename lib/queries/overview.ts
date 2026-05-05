import { prisma } from "@/lib/prisma";
import { startOfDay } from "date-fns";
import type { OverviewStats, TrafficDataPoint, LatencyDataPoint, RequestLogDTO } from "@/types";

export async function getOverviewStats(): Promise<OverviewStats> {
    const today = startOfDay(new Date());

    const [totalToday, errorsToday, latencyResult, routeCounts] =
        await Promise.all([
            prisma.requestLog.count({
                where: { timestamp: { gte: today } },
            }),
            prisma.requestLog.count({
                where: {
                    timestamp: { gte: today },
                    statusCode: { gte: 500 },
                },
            }),
            prisma.requestLog.aggregate({
                where: { timestamp: { gte: today } },
                _avg: { latencyMs: true },
            }),
            prisma.route.groupBy({
                by: ["enabled"],
                _count: true,
            }),
        ]);

    const totalRoutes = routeCounts.reduce((sum, r) => sum + r._count, 0);
    const activeRoutes =
        routeCounts.find((r) => r.enabled)?._count ?? 0;

    const errorRate =
        totalToday > 0
            ? Number(((errorsToday / totalToday) * 100).toFixed(1))
            : 0;

    return {
        totalRequestsToday: totalToday,
        totalRequestsDelta: 12,      // placeholder -- needs yesterday's count to compute
        errorRateToday: errorRate,
        errorRateDelta: 0,           // placeholder
        avgLatencyMs: Math.round(latencyResult._avg.latencyMs ?? 0),
        avgLatencyDelta: 0,          // placeholder
        activeRoutes,
        totalRoutes,
    };
}

export async function getTrafficChartData(): Promise<TrafficDataPoint[]> {
    // Group logs by hour for the last 24 hours
    const rows = await prisma.$queryRaw<{ hour: number; requests: bigint; errors: bigint }[]>`
    SELECT
      EXTRACT(HOUR FROM timestamp)::int AS hour,
      COUNT(*)                          AS requests,
      COUNT(*) FILTER (WHERE "statusCode" >= 500) AS errors
    FROM request_logs
    WHERE timestamp >= NOW() - INTERVAL '24 hours'
    GROUP BY hour
    ORDER BY hour ASC
  `;

    return rows.map((r) => ({
        time: `${r.hour}:00`,
        requests: Number(r.requests),
        errors: Number(r.errors),
    }));
}

export async function getLatencyChartData(): Promise<LatencyDataPoint[]> {
    const rows = await prisma.$queryRaw<{ hour: number; p50: number; p95: number; p99: number }[]>`
    SELECT
      EXTRACT(HOUR FROM timestamp)::int                         AS hour,
      PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY "latencyMs") AS p50,
      PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY "latencyMs") AS p95,
      PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY "latencyMs") AS p99
    FROM request_logs
    WHERE timestamp >= NOW() - INTERVAL '24 hours'
    GROUP BY hour
    ORDER BY hour ASC
  `;

    return rows.map((r) => ({
        time: `${r.hour}:00`,
        p50: Math.round(r.p50 ?? 0),
        p95: Math.round(r.p95 ?? 0),
        p99: Math.round(r.p99 ?? 0),
    }));
}

export async function getRecentLogs(limit = 10): Promise<RequestLogDTO[]> {
    const rawLogs = await prisma.requestLog.findMany({
        take: limit,
        orderBy: { timestamp: "desc" },
        include: {
            route: {
                select: { path: true, method: true },
            },
        },
    });

    return rawLogs.map((log) => ({
        // 1. Database Fields (Prisma provides these)
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

        // 2. 🟢 THE FIX: Runtime/Missing Fields
        // Because these aren't in Postgres, we provide safe defaults for the UI.
        // Later, you might pull these from Redis, or you might decide to actually 
        // add them as columns in your schema.prisma!
        rateLimited: log.statusCode === 429, // We can infer this! 429 means rate limited
        circuitOpen: false,
        requestSize: 0,
        responseSize: 0,
        clientIdentity: "anonymous",
    }));
}

export async function getRouteHealthSummary() {
    return prisma.route.findMany({
        select: {
            id: true,
            path: true,
            method: true,
            enabled: true,
        },
        orderBy: { createdAt: "asc" },
    });
}