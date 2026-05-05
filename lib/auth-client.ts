import { createAuthClient } from 'better-auth/react';
import { nextCookies } from "better-auth/next-js";
import { inferAdditionalFields } from "better-auth/client/plugins"
import { auth } from "./auth";
export const { signIn, signUp, signOut, useSession, sendVerificationEmail, requestPasswordReset, resetPassword, updateUser, changeEmail, changePassword, deleteUser, revokeSessions } = createAuthClient({
    plugins: [inferAdditionalFields<typeof auth>(), nextCookies()]
})