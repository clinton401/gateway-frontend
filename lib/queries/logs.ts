import { prisma } from "@/lib/prisma";
import { RequestLogDTO } from "@/types";
import { Prisma } from "@prisma/client";

export interface LogFilters {
    search?: string;
    routeId?: string;
    status?: string;
    rateLimited?: string;
    page?: string;
}

const PAGE_SIZE = 50;

export async function getLogs(filters: LogFilters = {}): Promise<{
    logs: RequestLogDTO[],
    total: number,
    page: number,
    pageCount: number,
    pageSize: number
}> {
    const page = Math.max(1, parseInt(filters.page ?? "1", 10));
    const skip = (page - 1) * PAGE_SIZE;

    const where: Prisma.RequestLogWhereInput = {};

    if (filters.search) {
        where.incomingPath = { contains: filters.search, mode: "insensitive" };
    }

    if (filters.routeId && filters.routeId !== "all") {
        where.routeId = filters.routeId;
    }

    if (filters.status && filters.status !== "all") {
        const ranges: Record<string, Prisma.IntFilter> = {
            "2xx": { gte: 200, lt: 300 },
            "4xx": { gte: 400, lt: 500 },
            "5xx": { gte: 500 },
        };
        if (ranges[filters.status]) {
            where.statusCode = ranges[filters.status];
        }
    }

    if (filters.rateLimited === "true") {
        where.rateLimited = true;
    }

    const [rawLogs, total] = await Promise.all([
        prisma.requestLog.findMany({
            where,
            orderBy: { timestamp: "desc" },
            skip,
            take: PAGE_SIZE,
            include: {
                route: { select: { path: true, method: true } },
            },
        }),
        prisma.requestLog.count({ where }),
    ]);

    // 🟢 THE FIX: Map the raw Prisma models to your strict DTO format
    const formattedLogs: RequestLogDTO[] = rawLogs.map((log) => ({
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

        // Inject the required runtime DTO fields
        rateLimited: log.statusCode === 429, // (Or log.rateLimited if you added the column)
        circuitOpen: false,
        requestSize: 0,
        responseSize: 0,
        clientIdentity: "anonymous",
    }));

    return {
        logs: formattedLogs, // Return the formatted array!
        total,
        page,
        pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
        pageSize: PAGE_SIZE,
    };

}