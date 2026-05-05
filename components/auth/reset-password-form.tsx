"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

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
import { resetPassword } from "@/lib/auth-client";
import useCreateToast from "@/hooks/use-create-toast";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const {  createError } = useCreateToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const { isSubmitting } = form.formState;

  if (!token) return <InvalidTokenState />;
  if (succeeded)
    return <SuccessState onContinue={() => router.push("/login")} />;

  async function onSubmit(values: FormValues) {
      try {
          if (!token) {
              return createError("No token provided");
          }
        
      const result = await resetPassword({
        newPassword: values.password,
        token,
      });

      if (result?.error) {
        form.setError("root", {
          message: result.error.message ?? "Reset failed. Request a new link.",
        });
        return;
      }

      setSucceeded(true);
    } catch (error) {
      console.error("Reset password error:", error);
      form.setError("root", {
        message: "An unexpected error occurred. Please try again.",
      });
    }
  }

  const inputClass =
    "border-border bg-input pr-10 text-foreground placeholder:text-muted-foreground focus-visible:ring-ring";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Set new password
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a strong password for your account
        </p>
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground/80">
                  New password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      autoFocus
                      className={inputClass}
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      aria-label={showPassword ? "Hide" : "Show"}
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

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground/80">
                  Confirm new password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      className={inputClass}
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((p) => !p)}
                      aria-label={showConfirm ? "Hide" : "Show"}
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
                Updating password...
              </>
            ) : (
              "Update password"
            )}
          </Button>
        </form>
      </Form>

      <div className="border-t border-border pt-4 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}

function SuccessState({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-green-900/50">
          <CheckCircle2 className="h-6 w-6 text-green-500" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold text-foreground">
          Password updated
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your password has been changed. You can now sign in with your new
          credentials.
        </p>
      </div>
      <Button
        onClick={onContinue}
        className="w-full bg-primary font-medium text-primary-foreground hover:bg-primary/90"
      >
        Continue to sign in
      </Button>
    </div>
  );
}

function InvalidTokenState() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-yellow-900/50 bg-yellow-950/30">
          <AlertTriangle className="h-6 w-6 text-yellow-500" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold text-foreground">
          Invalid reset link
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This link is invalid or has expired. Reset links are valid for 1 hour.
        </p>
      </div>
      <Link href="/forgot-password">
        <Button className="w-full bg-primary font-medium text-primary-foreground hover:bg-primary/90">
          Request a new link
        </Button>
      </Link>
      <div className="border-t border-border pt-4 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
