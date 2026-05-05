"use client";

import { useState, useCallback } from "react";
import { signOut, revokeSessions as revokeEverywhere } from "@/lib/auth-client";
import useCreateToast from "@/hooks/use-create-toast";
import { logError } from "@/lib/server-utils";

type UseAuthActionResult = {
    isPending: boolean;
    run: (everywhere?: boolean) => Promise<void>;
};

export function useLogout(): UseAuthActionResult {
    const [isPending, setIsPending] = useState(false);
    const { createError, createSimple } = useCreateToast();

    const run = useCallback(
        async (everywhere = false) => {
            if (isPending) return;
            setIsPending(true);

            try {
                const action = everywhere ? revokeEverywhere : signOut;
                const { error } = await action();

                if (error) {
                    logError("useLogout:SignOut", error);
                    createError(error.message || "Failed to log out. Please try again.");
                    return;
                }

                const message = everywhere
                    ? "Logged out from all devices"
                    : "Logged out successfully";

                createSimple(message);
                window.location.href = "/login";
            } catch (err) {
                logError("useLogout:Unexpected", err);
                createError("An unknown error occurred while logging out.");
            } finally {
                setIsPending(false);
            }
        },
        [isPending, createError, createSimple]
    );

    return { isPending, run };
}