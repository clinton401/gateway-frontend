import {
    emailChangeConfirmationTemplate,
    passwordResetEmailTemplate,
    verificationEmailTemplate,
    welcomeEmailTemplate,
} from "@/lib/email-templates";
import { sendEmail } from "@/lib/mailer";
import { logError, logUsage } from "@/lib/server-utils"; // Import your server utils
import { passwordSchema } from "@/validations";
import { prisma } from "./prisma";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";

// =============================================================================
// Environment validation — fail fast at startup, never at request time
// =============================================================================

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET


if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    throw new Error(
        "[auth] Missing GitHub OAuth env vars: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET"
    )
}

const isProduction = process.env.NODE_ENV === "production"

const TRUSTED_ORIGINS = [
    "http://localhost:3000",
    process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean) as string[]

// Social providers whose account.create hook triggers onboarding
const SOCIAL_PROVIDERS = ["google", "github"] as const
type SocialProvider = (typeof SOCIAL_PROVIDERS)[number]

// =============================================================================
// Auth config
// =============================================================================

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    trustedOrigins: TRUSTED_ORIGINS,
    enableUserDeletion: true,

    // ── Social providers ────────────────────────────────────────────────────────
    socialProviders: {
    
        github: {
            clientId: GITHUB_CLIENT_ID,
            clientSecret: GITHUB_CLIENT_SECRET,
        },
    },

    // ── Email + password ─────────────────────────────────────────────────────────
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 8,
        maxPasswordLength: 128,

        async sendResetPassword({ user, url }) {
            const { subject, text, template } = passwordResetEmailTemplate(url)
            sendEmail(user.email, subject, text, template).catch(err =>
                logError("auth:sendResetPassword", err, { email: user.email, userId: user.id })
            )
            logUsage("auth:password_reset_requested", { userId: user.id, email: user.email })
        },
    },

    // ── Email verification ───────────────────────────────────────────────────────
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        expiresIn: 3600, // 1 hour

        async sendVerificationEmail({ user, url }) {
            const { subject, text, template } = verificationEmailTemplate(url)
            sendEmail(user.email, subject, text, template).catch(err =>
                logError("auth:sendVerificationEmail", err, { email: user.email, userId: user.id })
            )
            logUsage("auth:verification_email_sent", { userId: user.id, email: user.email })
        },
    },

    // ── User config ──────────────────────────────────────────────────────────────
    user: {
        deleteUser: {
            enabled: true,
        },

        changeEmail: {
            enabled: true,
            async sendChangeEmailVerification({
                user,
                newEmail,
                url
            }: {
                user: { email: string, id: string };
                newEmail: string;
                url: string
            }) {
                const { subject, text, template } = emailChangeConfirmationTemplate(newEmail, url)
                sendEmail(user.email, subject, text, template).catch(err =>
                    logError("auth:sendChangeEmailVerification", err, { email: user.email, newEmail })
                )
                logUsage("auth:email_change_requested", { userId: user.id, newEmail })
            },
        },
        additionalFields: {
            role: {
                type: "string",
                required: true,
                defaultValue: "USER",
            },
        }

    },

    // ── Database hooks ────────────────────────────────────────────────────────────
    databaseHooks: {
        account: {
            create: {
                async after(account) {
                    if (!SOCIAL_PROVIDERS.includes(account.providerId as SocialProvider)) return

                    const [user, accountCount] = await Promise.all([
                        prisma.user.findUnique({ where: { id: account.userId } }),
                        prisma.account.count({ where: { userId: account.userId } }),
                    ])

                    if (!user) return

                    const isFirstAccount = accountCount === 1

                    if (isFirstAccount) {
                        const { subject, text, template } = welcomeEmailTemplate(user.name)
                        sendEmail(user.email, subject, text, template).catch(err =>
                            logError("auth:welcome_social", err, { userId: user.id })
                        )
                        logUsage("auth:social_signup_success", { userId: user.id, provider: account.providerId })
                    }
                },
            },
        },
    },

    // ── Request-level hooks ───────────────────────────────────────────────────────
    hooks: {
        before: createAuthMiddleware(async ctx => {
            const passwordPaths = new Set([
                "/sign-up/email",
                "/reset-password",
                "/change-password",
            ])

            if (!passwordPaths.has(ctx.path)) return

            const password = (ctx.body as Record<string, unknown>).password
                ?? (ctx.body as Record<string, unknown>).newPassword

            const { error } = passwordSchema.safeParse(password)
            if (error) {
                throw new APIError("BAD_REQUEST", {
                    message: error.issues[0]?.message ?? "Password not strong enough",
                });
            }
        }),

        after: createAuthMiddleware(async ctx => {
            if (ctx.path !== "/verify-email") return

            const newSession = ctx.context.newSession
            if (!newSession?.user) return

            const { user } = newSession

            const { subject, text, template } = welcomeEmailTemplate(user.name)
            sendEmail(user.email, subject, text, template).catch(err =>
                logError("auth:welcome:emailVerified", err, { userId: user.id })
            )
            logUsage("auth:email_verified_success", { userId: user.id, email: user.email })
        }),
    },

    // ── Cookie config ─────────────────────────────────────────────────────────────
    advanced: {
        cookiePrefix: "gatewayos",
        cookies: {
            session_token: {
                attributes: {
                    sameSite: isProduction ? "none" : "lax",
                    secure: isProduction,
                },
            },
        },
    },
})

export type AuthUser = typeof auth.$Infer.Session.user