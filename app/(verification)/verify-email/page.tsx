import { VerifyEmailNotice } from "@/components/auth/verify-email-notice";
import { getServerUser } from "@/lib/get-server-user";
import type { Metadata } from "next";
import { unauthorized } from "next/navigation";

export const metadata: Metadata = {
  title: "Verify your email",
  description: "Confirm your email address to activate your GatewayOS account.",
};

export default async function VerifyEmailPage() {
  const user = await getServerUser();
  if (!user) return unauthorized();
  return <VerifyEmailNotice user={user} />;
}
