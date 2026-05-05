import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { cache } from "react"

/*
 * getServerUser — cached server-side session + subscription resolver.
 *
 * cache() from React deduplicates this call within a single request tree.
 * Multiple Server Components calling getServerUser() in the same render
 * will share a single database round-trip.
 *
 * Pattern:
 *   const user = await getServerUser()
 *   if (!user) redirect("/login")
 *
 * Never call this from Client Components — use authClient.useSession() there.
 */
export const getServerUser = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user ?? null
})

export type User = Exclude<Awaited<ReturnType<typeof getServerUser>>, null>