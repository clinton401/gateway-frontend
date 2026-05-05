import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Sign in",
  description: "Access your GatewayOS control plane.",
};

export default function LoginPage() {
  return <LoginForm />;
}
