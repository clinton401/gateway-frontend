import type { HttpMethod } from "@/types";

// HTTP method colors are intentional semantic choices -- GET is universally blue,
// DELETE is universally red. Extracted here because they're used across
// route tables, log tables, and badges throughout the dashboard.
export const METHOD_COLORS: Record<HttpMethod, string> = {
    GET: "text-chart-1 border-chart-1/20",
    POST: "text-chart-2 border-chart-2/20",
    PUT: "text-chart-3 border-chart-3/20",
    PATCH: "text-chart-3 border-chart-3/20",
    DELETE: "text-destructive border-destructive/20",
    OPTIONS: "text-muted-foreground border-border",
    HEAD: "text-muted-foreground border-border",
    ALL: "text-muted-foreground border-border",
};

export function getMethodColor(method: string): string {
    return METHOD_COLORS[method as HttpMethod] ?? "text-muted-foreground border-border";
}