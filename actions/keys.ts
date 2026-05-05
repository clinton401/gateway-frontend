"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/get-server-user";
import { rateLimit } from "@/lib/rate-limit";

// ---------------------------------------------------------------------------
// Rate limit helper for actions
// ---------------------------------------------------------------------------
async function checkActionRateLimit(userId: string) {
    return rateLimit(userId, {
        maxRequests: 10,
        windowSizeMs: 60000,
    }, "API_KEY_ACTIONS");
}

// 🟢 THE FIX: Return a structured object instead of throwing
async function checkAuth() {
    const user = await getServerUser();
    if (!user || user.role !== "ADMIN") {
        return { success: false, error: "Unauthorized: Admin access required" };
    }
    return { success: true, user };
}

const createKeySchema = z.object({
    name: z
        .string()
        .min(1, "Name is required")
        .max(64, "Name must be under 64 characters"),
    routeScope: z.array(z.string()).default([]),
    expiresAt: z.coerce.date().optional().nullable(),
});

export type CreateKeyValues = z.infer<typeof createKeySchema>;

type CreateKeyResult =
    | { success: true; plaintext: string; keyId: string }
    | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createApiKey(
    values: CreateKeyValues
): Promise<CreateKeyResult> {
    // 🟢 Catch the returned auth state and halt if failed
    const auth = await checkAuth();
    if (!auth.success) return { success: false, error: auth.error || "An unexpected error occurred" };

    const limiter = await checkActionRateLimit(auth.user.id);
    if (limiter.error) return { success: false, error: limiter.error };

    const parsed = createKeySchema.safeParse(values);
    if (!parsed.success) {
        return {
            success: false,
            error: "Validation failed",
            fieldErrors: parsed.error.flatten().fieldErrors,
        };
    }

    const { name, routeScope, expiresAt } = parsed.data;

    // Generate plaintext key
    const random = randomBytes(32).toString("hex");
    const plaintext = `gw_live_${random}`;
    const keyHash = createHash("sha256").update(plaintext).digest("hex");
    const keyPrefix = plaintext.slice(0, 20);

    const key = await prisma.apiKey.create({
        data: {
            name,
            keyHash,
            keyPrefix,
            routeScope,
            expiresAt: expiresAt ?? null,
            enabled: true,
        },
    });

    revalidatePath("/keys");
    // Plaintext returned once -- never stored, never logged
    return { success: true, plaintext, keyId: key.id };
}

export async function toggleApiKeyEnabled(
    id: string,
    enabled: boolean
): Promise<{ success: boolean; error?: string }> {
    // 🟢 Catch the returned auth state
    const auth = await checkAuth();
    if (!auth.success) return { success: false, error: auth.error };

    const limiter = await checkActionRateLimit(auth.user.id);
    if (limiter.error) return { success: false, error: limiter.error };

    const key = await prisma.apiKey.findUnique({ where: { id } });
    if (!key) return { success: false, error: "Key not found" };

    await prisma.apiKey.update({ where: { id }, data: { enabled } });
    revalidatePath("/keys");
    return { success: true };
}

export async function deleteApiKey(
    id: string
): Promise<{ success: boolean; error?: string }> {
    // 🟢 Catch the returned auth state
    const auth = await checkAuth();
    if (!auth.success) return { success: false, error: auth.error };

    const limiter = await checkActionRateLimit(auth.user.id);
    if (limiter.error) return { success: false, error: limiter.error };

    const key = await prisma.apiKey.findUnique({ where: { id } });
    if (!key) return { success: false, error: "Key not found" };

    await prisma.apiKey.delete({ where: { id } });
    revalidatePath("/keys");
    return { success: true };
}

export async function updateApiKeyName(
    id: string,
    name: string
): Promise<{ success: boolean; error?: string }> {
    // 🟢 Catch the returned auth state
    const auth = await checkAuth();
    if (!auth.success) return { success: false, error: auth.error };

    const limiter = await checkActionRateLimit(auth.user.id);
    if (limiter.error) return { success: false, error: limiter.error };

    if (!name.trim()) return { success: false, error: "Name is required" };

    await prisma.apiKey.update({
        where: { id },
        data: { name: name.trim() },
    });

    revalidatePath("/keys");
    return { success: true };
}