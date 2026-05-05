"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/get-server-user";
import { Prisma } from "@prisma/client";
import { rateLimit } from "@/lib/rate-limit";

// ---------------------------------------------------------------------------
// Rate limit helper for actions
// ---------------------------------------------------------------------------
async function checkActionRateLimit(userId: string) {
    return rateLimit(userId, {
        maxRequests: 10,
        windowSizeMs: 60000,
    }, "ADMIN_ACTIONS");
}

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------
const routeSchema = z.object({
    path: z
        .string()
        .min(1, "Path is required")
        .startsWith("/", "Path must start with /"),
    method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD", "ALL"]),
    upstream: z
        .string()
        .min(1, "Upstream URL is required")
        .url("Upstream must be a valid URL"),
    stripPath: z.string().optional().nullable(),
    enabled: z.boolean().default(true),

    rateLimitMax: z.coerce.number().positive().optional().nullable(),
    rateLimitWindowMs: z.coerce.number().positive().optional().nullable(),
    rateLimitKeyBy: z.enum(["ip", "apiKey", "header"]).optional().nullable(),
    rateLimitKeyHeader: z.string().optional().nullable(),

    cbFailureThreshold: z.coerce.number().positive().optional().nullable(),
    cbWindowSize: z.coerce.number().positive().optional().nullable(),
    cbCooldownMs: z.coerce.number().positive().optional().nullable(),
    cbSuccessThreshold: z.coerce.number().positive().optional().nullable(),

    authMode: z.enum(["none", "apiKey", "jwt"]).default("none"),
    authJwtSecret: z.string().optional().nullable(),
    authJwtRequiredClaims: z.record(z.string(), z.string()).optional().nullable(),
    authKeyHeader: z.string().optional().nullable(),

    requestHeaderTransform: z.array(z.any()).optional().nullable(),
    responseHeaderTransform: z.array(z.any()).optional().nullable(),
    requestBodyTransform: z.array(z.any()).optional().nullable(),
    responseBodyTransform: z.array(z.any()).optional().nullable(),
    requestPathTransform: z.record(z.string(), z.any()).optional().nullable(),
});

export type RouteFormValues = z.infer<typeof routeSchema>;

// ---------------------------------------------------------------------------
// Action result type
// ---------------------------------------------------------------------------
type ActionResult =
    | { success: true; routeId: string }
    | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// ---------------------------------------------------------------------------
// Create route
// ---------------------------------------------------------------------------
export async function createRoute(
    values: RouteFormValues
): Promise<ActionResult> {
    try {
        // 1. Auth & Admin check -- Return gracefully, do not throw
        const user = await getServerUser();
        if (!user || user.role !== "ADMIN") {
            return { success: false, error: "Forbidden: Administrator privileges required." };
        }

        const limiter = await checkActionRateLimit(user.id);
        if (limiter.error) {
            return { success: false, error: limiter.error };
        }

        // 2. Validation
        const parsed = routeSchema.safeParse(values);
        if (!parsed.success) {
            return {
                success: false,
                error: "Validation failed",
                fieldErrors: parsed.error.flatten().fieldErrors,
            };
        }

        const data = parsed.data;

        // 3. Duplicate check
        const existing = await prisma.route.findUnique({
            where: { path_method: { path: data.path, method: data.method } },
        });

        if (existing) {
            return {
                success: false,
                error: `A route for ${data.method} ${data.path} already exists`,
                fieldErrors: { path: [`${data.method} ${data.path} is already configured`] },
            };
        }

        // 4. Database mutation
        const route = await prisma.route.create({
            data: {
                path: data.path,
                method: data.method,
                upstream: data.upstream,
                stripPath: data.stripPath || null,
                enabled: data.enabled,
                rateLimitMax: data.rateLimitMax ?? null,
                rateLimitWindowMs: data.rateLimitWindowMs ?? null,
                rateLimitKeyBy: data.rateLimitKeyBy ?? null,
                rateLimitKeyHeader: data.rateLimitKeyHeader ?? null,
                cbFailureThreshold: data.cbFailureThreshold ?? null,
                cbWindowSize: data.cbWindowSize ?? null,
                cbCooldownMs: data.cbCooldownMs ?? null,
                cbSuccessThreshold: data.cbSuccessThreshold ?? null,
                authMode: data.authMode,
                authJwtSecret: data.authJwtSecret ?? null,
                authKeyHeader: data.authKeyHeader ?? null,

                authJwtRequiredClaims: data.authJwtRequiredClaims
                    ? (data.authJwtRequiredClaims as Prisma.InputJsonObject)
                    : undefined,
                requestHeaderTransform: data.requestHeaderTransform
                    ? (data.requestHeaderTransform as Prisma.InputJsonArray)
                    : undefined,
                responseHeaderTransform: data.responseHeaderTransform
                    ? (data.responseHeaderTransform as Prisma.InputJsonArray)
                    : undefined,
                requestBodyTransform: data.requestBodyTransform
                    ? (data.requestBodyTransform as Prisma.InputJsonArray)
                    : undefined,
                responseBodyTransform: data.responseBodyTransform
                    ? (data.responseBodyTransform as Prisma.InputJsonArray)
                    : undefined,
                requestPathTransform: data.requestPathTransform
                    ? (data.requestPathTransform as Prisma.InputJsonObject)
                    : undefined,
            },
        });

        revalidatePath("/routes");
        return { success: true, routeId: route.id };

    } catch (error) {
        console.error("Failed to create route:", error);
        return { success: false, error: "An unexpected internal error occurred." };
    }
}

// ---------------------------------------------------------------------------
// Update route
// ---------------------------------------------------------------------------
export async function updateRoute(
    id: string,
    values: RouteFormValues
): Promise<ActionResult> {
    try{
    const user = await getServerUser();
    if (!user || user.role !== "ADMIN") {
        return { success: false, error: "Forbidden: Administrator privileges required." };
    }

    const limiter = await checkActionRateLimit(user.id);
    if (limiter.error) {
        return { success: false, error: limiter.error };
    }

    // 2. Validation
        const parsed = routeSchema.safeParse(values);
        if (!parsed.success) {
            return {
                success: false,
                error: "Validation failed",
                fieldErrors: parsed.error.flatten().fieldErrors,
            };
        }

        const data = parsed.data;

        const current = await prisma.route.findUnique({ where: { id } });
        if (!current) return { success: false, error: "Route not found" };

        if (current.path !== data.path || current.method !== data.method) {
            const conflict = await prisma.route.findUnique({
                where: { path_method: { path: data.path, method: data.method } },
            });
            if (conflict && conflict.id !== id) {
                return {
                    success: false,
                    error: `A route for ${data.method} ${data.path} already exists`,
                    fieldErrors: {
                        path: [`${data.method} ${data.path} is already configured`],
                    },
                };
            }
        }

        await prisma.route.update({
            where: { id },
            data: {
                path: data.path,
                method: data.method,
                upstream: data.upstream,
                stripPath: data.stripPath || null,
                enabled: data.enabled,
                rateLimitMax: data.rateLimitMax ?? null,
                rateLimitWindowMs: data.rateLimitWindowMs ?? null,
                rateLimitKeyBy: data.rateLimitKeyBy ?? null,
                rateLimitKeyHeader: data.rateLimitKeyHeader ?? null,
                cbFailureThreshold: data.cbFailureThreshold ?? null,
                cbWindowSize: data.cbWindowSize ?? null,
                cbCooldownMs: data.cbCooldownMs ?? null,
                cbSuccessThreshold: data.cbSuccessThreshold ?? null,
                authMode: data.authMode,
                authJwtSecret: data.authJwtSecret ?? null,
                authKeyHeader: data.authKeyHeader ?? null,
                authJwtRequiredClaims: data.authJwtRequiredClaims
                    ? (data.authJwtRequiredClaims as Prisma.InputJsonObject)
                    : undefined,
                requestHeaderTransform: data.requestHeaderTransform
                    ? (data.requestHeaderTransform as Prisma.InputJsonArray)
                    : undefined,
                responseHeaderTransform: data.responseHeaderTransform
                    ? (data.responseHeaderTransform as Prisma.InputJsonArray)
                    : undefined,
                requestBodyTransform: data.requestBodyTransform
                    ? (data.requestBodyTransform as Prisma.InputJsonArray)
                    : undefined,
                responseBodyTransform: data.responseBodyTransform
                    ? (data.responseBodyTransform as Prisma.InputJsonArray)
                    : undefined,
                requestPathTransform: data.requestPathTransform
                    ? (data.requestPathTransform as Prisma.InputJsonObject)
                    : undefined,
            },
        });

        revalidatePath("/routes");
        revalidatePath(`/routes/${id}`);
        return { success: true, routeId: id };

    } catch (error) {
        console.error("Failed to update route:", error);
        return { success: false, error: "An unexpected internal error occurred." };
    }
}

// ---------------------------------------------------------------------------
// Toggle enabled
// ---------------------------------------------------------------------------
export async function toggleRouteEnabled(
    id: string,
    enabled: boolean
): Promise<{ success: boolean; error?: string }> {
    try {
    const user = await getServerUser();
    if (!user || user.role !== "ADMIN") {
        return { success: false, error: "Forbidden: Administrator privileges required." };
    }

    const limiter = await checkActionRateLimit(user.id);
    if (limiter.error) {
        return { success: false, error: limiter.error };
    }

    // 2. Validation
        const route = await prisma.route.findUnique({ where: { id } });
        if (!route) return { success: false, error: "Route not found" };

        await prisma.route.update({
            where: { id },
            data: { enabled },
        });

        revalidatePath("/routes");
        revalidatePath(`/routes/${id}`);
        return { success: true };

    } catch (error) {
        console.error("Failed to toggle route:", error);
        return { success: false, error: "An unexpected internal error occurred." };
    }
}

// ---------------------------------------------------------------------------
// Delete route
// ---------------------------------------------------------------------------
export async function deleteRoute(
    id: string
): Promise<{ success: boolean; error?: string }> {
    try {

    const user = await getServerUser();
    if (!user || user.role !== "ADMIN") {
        return { success: false, error: "Forbidden: Administrator privileges required." };
    }

    const limiter = await checkActionRateLimit(user.id);
    if (limiter.error) {
        return { success: false, error: limiter.error };
    }

    // 2. Validation
        const logCount = await prisma.requestLog.count({ where: { routeId: id } });

        if (logCount > 0) {
            await prisma.$transaction([
                prisma.requestLog.deleteMany({ where: { routeId: id } }),
                prisma.route.delete({ where: { id } }),
            ]);
        } else {
            await prisma.route.delete({ where: { id } });
        }

        revalidatePath("/routes");
        return {
            success: true
        };
    } catch (error) {
        console.error("Failed to delete route:", error);
        return { success: false, error: "An unexpected internal error occurred." };
    }

 
}