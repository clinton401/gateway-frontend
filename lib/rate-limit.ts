import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { logError } from "@/lib/server-utils";

// Validate environment variables
if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    throw new Error('Redis environment variables missing.');
}

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// We keep a Map in memory to prevent hitting Redis for users who are already blocked.
// This is critical for defending against DDoS attacks at the edge.
const ephemeralCache = new Map();

type RateLimitOptions = {
    windowSizeMs?: number;
    maxRequests?: number;
};

export const rateLimit = async (
    identifier: string,
    options: RateLimitOptions = {},
    scope: string = "GENERAL"
) => {
    
    // Default to 100 requests per 60 seconds if not provided
    const maxRequests = options.maxRequests ?? 100;
    const windowSizeMs = options.windowSizeMs ?? 60000;

    // Upstash expects the window format as a string like "60 s" or "1000 ms"
    const windowString = `${windowSizeMs} ms` as const;

    // Create a dynamic limiter instance based on the route's specific configuration
    const ratelimit = new Ratelimit({
        redis,
        // Sliding window is the industry standard for gateways. 
        // It prevents bursts that happen at the exact edge of fixed windows.
        limiter: Ratelimit.slidingWindow(maxRequests, windowString),
        ephemeralCache,
        prefix: `@upstash/ratelimit/${scope}`,
    });

    try {
        const { success, limit, remaining, reset } = await ratelimit.limit(identifier);

        if (!success) {
            const timeUntilResetSeconds = Math.ceil((reset - Date.now()) / 1000);
            return {
                success: false,
                error: `Limit reached. Try again in ${timeUntilResetSeconds}s.`,
                headers: {
                    'X-RateLimit-Limit': limit.toString(),
                    'X-RateLimit-Remaining': remaining.toString(),
                    'X-RateLimit-Reset': reset.toString()
                }
            };
        }

        return { success: true, error: null };

    } catch (error) {
        // Failsafe: Let traffic through if Redis is down, but log the alert
        logError('rateLimit_Upstash', error);
        return { success: true, error: null };
    }
};