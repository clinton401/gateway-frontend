"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { signUp } from "@/lib/auth-client";
import { OAuthButton } from "./oauth-button";
import useCreateToast from "@/hooks/use-create-toast";

const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Full name is required")
      .min(2, "Name must be at least 2 characters")
      .max(64, "Name must be under 64 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const { createSuccess } = useCreateToast();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: RegisterFormValues) {
    try {
      const result = await signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
        callbackURL: "/email-verified",
      });

      if (result.error) {
        form.setError("root", {
          message: result.error.message ?? "Could not create account",
        });
        return;
      }

      createSuccess("Account created successfully. Please verify your email.");
      form.reset();
      router.push("/verify-email");
    } catch (error) {
      console.error("Registration error:", error);
      form.setError("root", {
        message: "An unexpected error occurred. Please try again.",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Create account
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set up your GatewayOS control plane access
        </p>
      </div>

      <OAuthButton
        disabled={isSubmitting}
        page="signup"
        setError={(message) => form.setError("root", { message })}
        clearError={() => form.clearErrors("root")}
      />

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {form.formState.errors.root && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
              <p className="text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            </div>
          )}

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground/80">Full name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Jane Smith"
                    autoComplete="name"
                    autoFocus
                    className="border-border bg-input text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs text-destructive" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground/80">
                  Email address
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="name@company.com"
                    autoComplete="email"
                    className="border-border bg-input text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs text-destructive" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground/80">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className="border-border bg-input pr-10 text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <PasswordStrength password={field.value} />
                <FormMessage className="text-xs text-destructive" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground/80">
                  Confirm password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      className="border-border bg-input pr-10 text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((p) => !p)}
                      aria-label={
                        showConfirm ? "Hide password" : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {showConfirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-xs text-destructive" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary font-medium text-primary-foreground hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>
      </Form>

      <div className="border-t border-border pt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary transition-colors hover:text-primary/80"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];

  const passed = checks.filter(Boolean).length;

  const barColor =
    passed <= 1
      ? "bg-red-500"
      : passed === 2
        ? "bg-orange-500"
        : passed === 3
          ? "bg-yellow-500"
          : "bg-green-500";

  const label =
    passed <= 1
      ? "Weak"
      : passed === 2
        ? "Fair"
        : passed === 3
          ? "Good"
          : "Strong";

  const labelColor =
    passed <= 1
      ? "text-red-400"
      : passed === 2
        ? "text-orange-400"
        : passed === 3
          ? "text-yellow-400"
          : "text-green-400";

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              passed > i ? barColor : "bg-border"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${labelColor}`}>{label}</p>
    </div>
  );
}
