import { EmailVerified } from "@/components/auth/email-verified";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Email verified",
  description: "Your email has been successfully verified. Welcome to GatewayOS.",
};

export default function EmailVerifiedPage() {
  return <EmailVerified />;
}
