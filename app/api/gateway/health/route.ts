import { getServerUser } from "@/lib/get-server-user";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

const GATEWAY_URL = process.env.GATEWAY_URL ?? "http://localhost:8001";

export async function GET() {
    const user = await getServerUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate Limit: 20 requests per minute per user
    const limiter = await rateLimit(user.id, {
        maxRequests: 20,
        windowSizeMs: 60000,
    }, "GATEWAY_HEALTH");

    if (limiter.error) {
        return NextResponse.json(
            { error: limiter.error },
            { status: 429, headers: limiter.headers }
        );
    }

    try {
        const response = await fetch(`${GATEWAY_URL}/gateway/health`, {
            cache: "no-store",
            signal: AbortSignal.timeout(15000),
            headers: {
                // Manually spoof the origin so the Express CORS middleware accepts it
                "Origin": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
            },
        });

        // 1. HTTP Boundary Failure
        if (!response.ok) {
            // The gateway actively responded, but with an error status.
            // Attempt to read the payload to see exactly what the gateway complained about.
            const errorText = await response.text();

            console.error(`Gateway HTTP Error (${response.status}):`, errorText);

            return NextResponse.json(
                {
                    error: "Gateway returned an error response",
                    details: errorText,
                    status: response.status
                },
                { status: 502 }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (err) {
        // 2. Network Boundary Failure
        // In a TS catch block, 'err' is of type 'unknown', so we safely extract it.
        const exactMessage = err instanceof Error ? err.message : String(err);

        console.error("Gateway Network Failure:", exactMessage);

        return NextResponse.json(
            {
                error: "Gateway unreachable",
                details: exactMessage // e.g., "fetch failed", "The operation was aborted" (timeout)
            },
            { status: 502 }
        );
    }
}