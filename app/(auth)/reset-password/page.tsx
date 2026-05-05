import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Set new password",
  description: "Secure your account with a new, strong password.",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
