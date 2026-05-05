"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getServerUser } from "@/lib/get-server-user";
import { Redis } from "@upstash/redis"; // 🟢 Swapped to Upstash for serverless compatibility
import { rateLimit } from "@/lib/rate-limit";

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ---------------------------------------------------------------------------
// Rate limit helper for actions
// ---------------------------------------------------------------------------
async function checkActionRateLimit(userId: string) {
    return rateLimit(userId, {
        maxRequests: 10,
        windowSizeMs: 60000,
    }, "SETTINGS_ACTIONS");
}

// 🟢 THE FIX: Safely return object and enforce ADMIN role
async function checkAuth() {
    const user = await getServerUser();
    if (!user || user.role !== "ADMIN") {
        return { success: false, error: "Unauthorized: Admin access required" };
    }
    return { success: true, user };
}

// ---------------------------------------------------------------------------
// 🟢 THE FIX: Delete in batches to prevent Call Stack crashes
// ---------------------------------------------------------------------------
async function scanAndDelete(pattern: string): Promise<number> {
    let cursor = "0";
    let deletedCount = 0;

    do {
        // Upstash SCAN returns [cursor, elements]
        const [nextCursor, batch] = await redis.scan(cursor, {
            match: pattern,
            count: 100,
        });

        cursor = nextCursor;

        if (batch.length > 0) {
            // Safe to spread here because we know batch is max 100 items
            await redis.del(...batch);
            deletedCount += batch.length;
        }
    } while (cursor !== "0");

    return deletedCount;
}

// ---------------------------------------------------------------------------
// General settings
// ---------------------------------------------------------------------------
const settingsSchema = z.object({
    gateway_name: z
        .string()
        .min(1, "Name is required")
        .max(64, "Name must be under 64 characters"),
    gateway_url: z.string().min(1, "URL is required").url("Must be a valid URL"),
});

export async function updateGatewaySettings(
    values: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
    const authCheck = await checkAuth();
    if (!authCheck.success) return { success: false, error: authCheck.error };

    const limiter = await checkActionRateLimit(authCheck.user?.id || "");
    if (limiter.error) return { success: false, error: limiter.error };

    const parsed = settingsSchema.safeParse(values);
    if (!parsed.success) {
        const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
        return { success: false, error: first ?? "Validation failed" };
    }

    await Promise.all(
        Object.entries(parsed.data).map(([key, value]) =>
            prisma.gatewaySetting.upsert({
                where: { key },
                update: { value },
                create: { key, value },
            })
        )
    );

    revalidatePath("/settings");
    return { success: true };
}

// ---------------------------------------------------------------------------
// Flush rate limit counters
// ---------------------------------------------------------------------------
export async function flushRateLimitCounters(): Promise<{
    success: boolean;
    flushed: number;
    error?: string;
}> {
    const authCheck = await checkAuth();
    if (!authCheck.success) return { success: false, flushed: 0, error: authCheck.error };

    const limiter = await checkActionRateLimit(authCheck.user?.id || "");
    if (limiter.error) return { success: false, flushed: 0, error: limiter.error };

    try {
        // Note: If you used @upstash/ratelimit, the prefix might be "@upstash/ratelimit*"
        const deletedCount = await scanAndDelete("rl:*");
        return { success: true, flushed: deletedCount };
    } catch (err) {
        console.error("[settings:flushRateLimits]", err);
        return { success: false, flushed: 0, error: "Failed to clear Redis" };
    }
}

// ---------------------------------------------------------------------------
// Reset all circuit breakers to CLOSED
// ---------------------------------------------------------------------------
export async function resetCircuitBreakers(): Promise<{
    success: boolean;
    reset: number;
    error?: string;
}> {
    const authCheck = await checkAuth();
    if (!authCheck.success) return { success: false, reset: 0, error: authCheck.error };

    const limiter = await checkActionRateLimit(authCheck.user?.id || "");
    if (limiter.error) return { success: false, reset: 0, error: limiter.error };

    try {
        // 1. Delete all tracking keys safely
        await scanAndDelete("cb:outcomes:*");
        await scanAndDelete("cb:probe:*");

        // 2. Set all state keys back to CLOSED
        let cursor = "0";
        let stateResetCount = 0;

        do {
            const [nextCursor, batch] = await redis.scan(cursor, {
                match: "cb:state:*",
                count: 100,
            });
            cursor = nextCursor;

            if (batch.length > 0) {
                const pipeline = redis.pipeline();
                for (const key of batch) {
                    pipeline.set(key, "CLOSED");
                }
                await pipeline.exec();
                stateResetCount += batch.length;
            }
        } while (cursor !== "0");

        return { success: true, reset: stateResetCount };
    } catch (err) {
        console.error("[settings:resetCircuitBreakers]", err);
        return { success: false, reset: 0, error: "Failed to reset circuit breakers" };
    }
}

// ---------------------------------------------------------------------------
// Delete account
// ---------------------------------------------------------------------------
export async function deleteAccount(): Promise<{
    success: boolean;
    error?: string;
}> {
    const authCheck = await checkAuth();
    if (!authCheck.success) return { success: false, error: authCheck.error };

    const limiter = await checkActionRateLimit(authCheck.user?.id || "");
    if (limiter.error) return { success: false, error: limiter.error };

    try {
        await auth.api.deleteUser({
            headers: await headers(),
            body: {}
        });

        redirect("/login");
    } catch (err: unknown) {
        if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
            throw err; // Next.js handles this safely
        }
        console.error("[settings:deleteAccount]", err);
        return { success: false, error: "Failed to delete account" };
    }
}