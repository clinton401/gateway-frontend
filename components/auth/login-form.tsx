"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { signIn } from "@/lib/auth-client";
import { OAuthButton } from "./oauth-button";
import useCreateToast from "@/hooks/use-create-toast";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Enter a valid email address" }),

  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { createSuccess } = useCreateToast();

const searchParams = useSearchParams();
const redirect = searchParams.get("redirect");
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: LoginFormValues) {
    try {
      const result = await signIn.email({
        email: values.email,
        password: values.password,
      });

      if (result.error) {
        form.setError("root", {
          message: result.error.message ?? "Unable to sign in. Please try again.",
        });
        return;
      }

      createSuccess("Signed in successfully.");
      form.reset();
      router.push(redirect || "/overview");
    } catch (error) {
      console.error("Login error:", error);
      form.setError("root", {
        message: "An unexpected error occurred. Please try again.",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your credentials to access the control plane
        </p>
      </div>

      <OAuthButton
        disabled={isSubmitting}
        page="login"
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-foreground/80">Password</FormLabel>
                  <Link
                    href="/forgot-password"
                    tabIndex={-1}
                    className="text-xs text-muted-foreground transition-colors hover:text-primary"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
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
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </Form>

      <div className="border-t border-border pt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-primary transition-colors hover:text-primary/80"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
