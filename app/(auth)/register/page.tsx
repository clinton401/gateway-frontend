import { RegisterForm } from "@/components/auth/register-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create account",
  description: "Get started with GatewayOS and deploy your first API gateway.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
