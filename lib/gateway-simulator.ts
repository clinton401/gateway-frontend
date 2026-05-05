import type { RouteDTO } from "@/types";

export interface SimRequest {
    method: string;
    path: string;
    headers: Record<string, string>;
    body: string;
}

export type StageStatus = "idle" | "running" | "passed" | "failed" | "skipped";

export interface PipelineStage {
    id: string;
    name: string;
    status: StageStatus;
    summary: string;
    detail: string | null;
}

export interface SimResult {
    stages: PipelineStage[];
    blocked: boolean;
    blockStage: string | null;
    upstreamRequest: {
        method: string;
        url: string;
        headers: Record<string, string>;
        body: string;
    } | null;
    clientResponse: {
        statusCode: number;
        statusText: string;
        body: string;
    };
}

// Simulate the gateway pipeline synchronously -- returns the full result.
// The UI drives the animation by revealing stages one at a time.
export function simulateGateway(
    route: RouteDTO,
    req: SimRequest
): SimResult {
    const stages: PipelineStage[] = [];
    let blocked = false;
    let blockStage: string | null = null;

    // Mutable copies for transformation
    const upstreamHeaders: Record<string, string> = {
        ...req.headers,
        "x-forwarded-for": "203.0.113.42",
        "x-gateway-request-id": crypto.randomUUID(),
    };
    let upstreamBody = req.body;
    let upstreamPath = req.path;

    // -------------------------------------------------------------------------
    // Stage 1: Route Matching
    // -------------------------------------------------------------------------
    if (!route.enabled) {
        stages.push({
            id: "route",
            name: "Route Matching",
            status: "failed",
            summary: "Route is disabled",
            detail: `The route ${route.method} ${route.path} has been disabled. The gateway returns 404 immediately without forwarding.`,
        });
        blocked = true;
        blockStage = "Route Matching";
    } else {
        stages.push({
            id: "route",
            name: "Route Matching",
            status: "passed",
            summary: `Matched ${route.method} ${route.path}`,
            detail: `Upstream: ${route.upstream}${route.stripPath ? `. Strip prefix: ${route.stripPath}` : ""}`,
        });

        if (route.stripPath) {
            upstreamPath = upstreamPath.replace(route.stripPath, "") || "/";
        }
    }

    // -------------------------------------------------------------------------
    // Stage 2: Rate Limiter
    // -------------------------------------------------------------------------
    if (!blocked) {
        if (!route.rateLimitMax || !route.rateLimitWindowMs) {
            stages.push({
                id: "ratelimit",
                name: "Rate Limiter",
                status: "skipped",
                summary: "Not configured",
                detail: "No rate limiting is configured for this route. All requests pass through.",
            });
        } else {
            const keyBy = route.rateLimitKeyBy ?? "ip";
            const keyHeader = route.rateLimitKeyBy === "header"
                ? route.rateLimitKeyHeader
                : keyBy === "apiKey"
                    ? "x-api-key"
                    : null;

            stages.push({
                id: "ratelimit",
                name: "Rate Limiter",
                status: "passed",
                summary: `Within limit: ${route.rateLimitMax} req / ${route.rateLimitWindowMs / 1000}s`,
                detail: `Sliding window algorithm. Client identified by: ${keyBy}${keyHeader ? ` (header: ${keyHeader})` : ""}. Counter incremented. Remaining: ${route.rateLimitMax - 1}.`,
            });
        }
    }

    // -------------------------------------------------------------------------
    // Stage 3: Auth Enforcer
    // -------------------------------------------------------------------------
    if (!blocked) {
        if (route.authMode === "none") {
            stages.push({
                id: "auth",
                name: "Auth Enforcer",
                status: "skipped",
                summary: "No auth required",
                detail: "This route is publicly accessible. All requests pass through regardless of credentials.",
            });
        } else if (route.authMode === "apiKey") {
            const keyHeader = route.authKeyHeader ?? "x-api-key";
            const providedKey = req.headers[keyHeader] ?? req.headers[keyHeader.toLowerCase()];

            if (!providedKey) {
                stages.push({
                    id: "auth",
                    name: "Auth Enforcer",
                    status: "failed",
                    summary: `Missing API key: ${keyHeader}`,
                    detail: `This route requires an API key in the ${keyHeader} header. No key was provided. Gateway returns 401 MISSING_API_KEY.`,
                });
                blocked = true;
                blockStage = "Auth Enforcer";
            } else {
                stages.push({
                    id: "auth",
                    name: "Auth Enforcer",
                    status: "passed",
                    summary: "API key validated",
                    detail: `Key hash matched against database. Identity injected as X-Gateway-Key-Id and X-Gateway-Key-Scopes headers. Raw ${keyHeader} header stripped before forwarding.`,
                });
                delete upstreamHeaders[keyHeader];
                upstreamHeaders["x-gateway-key-id"] = "key_demo_abc123";
                upstreamHeaders["x-gateway-key-scopes"] = "all";
            }
        } else if (route.authMode === "jwt") {
            const authHeader = req.headers["authorization"] ?? req.headers["Authorization"];

            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                stages.push({
                    id: "auth",
                    name: "Auth Enforcer",
                    status: "failed",
                    summary: "Missing Bearer token",
                    detail: "This route requires a JWT in the Authorization header as: Bearer <token>. No valid header was found. Gateway returns 401 MISSING_TOKEN.",
                });
                blocked = true;
                blockStage = "Auth Enforcer";
            } else {
                const token = authHeader.replace("Bearer ", "");
                const parts = token.split(".");

                if (parts.length !== 3) {
                    stages.push({
                        id: "auth",
                        name: "Auth Enforcer",
                        status: "failed",
                        summary: "Malformed JWT",
                        detail: "The token does not have the standard header.payload.signature structure. Gateway returns 401 INVALID_TOKEN.",
                    });
                    blocked = true;
                    blockStage = "Auth Enforcer";
                } else {
                    const claims = route.authJwtRequiredClaims;
                    const claimText = claims
                        ? Object.entries(claims)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(", ")
                        : null;

                    stages.push({
                        id: "auth",
                        name: "Auth Enforcer",
                        status: "passed",
                        summary: "JWT signature verified",
                        detail: `Token structure valid. Signature verified against HS256 secret.${claimText ? ` Required claims checked: ${claimText}.` : ""} Authorization header stripped. X-Gateway-User-Id injected.`,
                    });
                    delete upstreamHeaders["authorization"];
                    delete upstreamHeaders["Authorization"];
                    upstreamHeaders["x-gateway-user-id"] = "user_demo_xyz789";
                    upstreamHeaders["x-gateway-token-exp"] = String(
                        Math.floor(Date.now() / 1000) + 3600
                    );
                }
            }
        }
    }

    // -------------------------------------------------------------------------
    // Stage 4: Circuit Breaker
    // -------------------------------------------------------------------------
    if (!blocked) {
        const cbState = route.circuitBreakerState;

        if (!route.cbFailureThreshold) {
            stages.push({
                id: "cb",
                name: "Circuit Breaker",
                status: "skipped",
                summary: "Not configured",
                detail: "No circuit breaker is configured for this route.",
            });
        } else if (cbState === "OPEN") {
            stages.push({
                id: "cb",
                name: "Circuit Breaker",
                status: "failed",
                summary: "Circuit is OPEN -- upstream blocked",
                detail: `The upstream has exceeded the failure threshold (${route.cbFailureThreshold}/${route.cbWindowSize} failures). The gateway returns 503 immediately without contacting the upstream. Cooldown: ${(route.cbCooldownMs ?? 0) / 1000}s.`,
            });
            blocked = true;
            blockStage = "Circuit Breaker";
        } else if (cbState === "HALF_OPEN") {
            stages.push({
                id: "cb",
                name: "Circuit Breaker",
                status: "passed",
                summary: "Circuit is HALF_OPEN -- probe request allowed",
                detail: `Cooldown expired. This request is the probe. If it succeeds, the breaker transitions to CLOSED. If it fails, it returns to OPEN. Only one probe can be active at a time (enforced via Redis SET NX).`,
            });
        } else {
            stages.push({
                id: "cb",
                name: "Circuit Breaker",
                status: "passed",
                summary: "Circuit is CLOSED -- upstream healthy",
                detail: `Recent failure rate: ${((route.recentFailureRate ?? 0) * 100).toFixed(0)}%. Below threshold of ${route.cbFailureThreshold}/${route.cbWindowSize}.`,
            });
        }
    }

    // -------------------------------------------------------------------------
    // Stage 5: Request Transform
    // -------------------------------------------------------------------------
    if (!blocked) {
        const headerOps = route.requestHeaderTransform ?? [];
        const bodyOps = route.requestBodyTransform ?? [];
        const pathTransform = route.requestPathTransform;
        const hasTransforms =
            headerOps.length > 0 || bodyOps.length > 0 || pathTransform != null;

        if (!hasTransforms) {
            stages.push({
                id: "req-transform",
                name: "Request Transform",
                status: "skipped",
                summary: "No transforms configured",
                detail: "Request passes through unmodified.",
            });
        } else {
            const applied: string[] = [];

            for (const op of headerOps) {
                if (op.op === "set" && op.header && op.value) {
                    upstreamHeaders[op.header.toLowerCase()] = op.value;
                    applied.push(`Header SET ${op.header}: ${op.value}`);
                } else if (op.op === "remove" && op.header) {
                    delete upstreamHeaders[op.header.toLowerCase()];
                    applied.push(`Header REMOVE ${op.header}`);
                } else if (op.op === "rename" && op.from && op.to) {
                    const val = upstreamHeaders[op.from.toLowerCase()];
                    if (val) {
                        upstreamHeaders[op.to.toLowerCase()] = val;
                        delete upstreamHeaders[op.from.toLowerCase()];
                    }
                    applied.push(`Header RENAME ${op.from} → ${op.to}`);
                }
            }

            if (bodyOps.length > 0 && upstreamBody) {
                try {
                    const parsed = JSON.parse(upstreamBody);
                    for (const op of bodyOps) {
                        if (op.op === "set" && op.field && op.value) {
                            parsed[op.field] = op.value;
                            applied.push(`Body SET ${op.field}: ${op.value}`);
                        } else if (op.op === "remove" && op.field) {
                            delete parsed[op.field];
                            applied.push(`Body REMOVE ${op.field}`);
                        } else if (op.op === "rename" && op.from && op.to) {
                            parsed[op.to] = parsed[op.from];
                            delete parsed[op.from];
                            applied.push(`Body RENAME ${op.from} → ${op.to}`);
                        }
                    }
                    upstreamBody = JSON.stringify(parsed, null, 2);
                } catch {
                    applied.push("Body transform skipped: request body is not valid JSON");
                }
            }

            if (pathTransform) {
                if (pathTransform.stripPrefix) {
                    upstreamPath = upstreamPath.replace(pathTransform.stripPrefix, "") || "/";
                    applied.push(`Path STRIP ${pathTransform.stripPrefix}`);
                }
                if (pathTransform.addPrefix) {
                    upstreamPath = pathTransform.addPrefix + upstreamPath;
                    applied.push(`Path ADD prefix ${pathTransform.addPrefix}`);
                }
            }

            stages.push({
                id: "req-transform",
                name: "Request Transform",
                status: "passed",
                summary: `${applied.length} operation${applied.length !== 1 ? "s" : ""} applied`,
                detail: applied.join("\n"),
            });
        }
    }

    // -------------------------------------------------------------------------
    // Stage 6: Upstream Proxy
    // -------------------------------------------------------------------------
    if (!blocked) {
        const upstreamUrl = route.upstream + upstreamPath;
        stages.push({
            id: "proxy",
            name: "Upstream Proxy",
            status: "passed",
            summary: `Forwarded to ${route.upstream}`,
            detail: `Full URL: ${upstreamUrl}\nTimeout: 10s. Response proxied back to client. Outcome recorded for circuit breaker.`,
        });
    }

    // -------------------------------------------------------------------------
    // Build the upstream request object (for the diff panel)
    // -------------------------------------------------------------------------
    const upstreamRequest = blocked
        ? null
        : {
            method: req.method,
            url: route.upstream + upstreamPath,
            headers: upstreamHeaders,
            body: upstreamBody,
        };

    // -------------------------------------------------------------------------
    // Build the client response
    // -------------------------------------------------------------------------
    let clientResponse: SimResult["clientResponse"];

    if (!blocked) {
        clientResponse = {
            statusCode: 200,
            statusText: "OK",
            body: JSON.stringify(
                {
                    message: "Request forwarded to upstream successfully",
                    upstream: route.upstream + upstreamPath,
                    gatewayRequestId:
                        upstreamHeaders["x-gateway-request-id"] ?? "generated",
                },
                null,
                2
            ),
        };
    } else {
        const statusMap: Record<string, { code: number; text: string; body: object }> = {
            "Route Matching": {
                code: 404,
                text: "Not Found",
                body: { error: "NO_ROUTE_FOUND", message: `No enabled route for ${req.method} ${req.path}` },
            },
            "Auth Enforcer": {
                code: 401,
                text: "Unauthorized",
                body: {
                    error: "AUTH_FAILED",
                    message:
                        route.authMode === "apiKey"
                            ? "Missing or invalid API key"
                            : "Missing or invalid JWT",
                },
            },
            "Circuit Breaker": {
                code: 503,
                text: "Service Unavailable",
                body: {
                    error: "CIRCUIT_OPEN",
                    message: "Upstream service is unavailable. Try again later.",
                    retryAfter: route.cbCooldownMs
                        ? Math.floor(route.cbCooldownMs / 1000)
                        : 30,
                },
            },
        };

        const match = blockStage ? statusMap[blockStage] : null;
        clientResponse = {
            statusCode: match?.code ?? 500,
            statusText: match?.text ?? "Internal Server Error",
            body: JSON.stringify(match?.body ?? { error: "GATEWAY_ERROR" }, null, 2),
        };
    }

    return { stages, blocked, blockStage, upstreamRequest, clientResponse };
}