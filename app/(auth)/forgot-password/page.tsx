import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Recover access to your account by resetting your password.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
