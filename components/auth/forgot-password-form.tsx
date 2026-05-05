"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";

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
import { requestPasswordReset } from "@/lib/auth-client";

const schema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
});

type FormValues = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: FormValues) {
    try {
      const result = await requestPasswordReset({
        email: values.email,
        redirectTo: "/reset-password",
      });

      if (result.error) {
        form.setError("root", {
          message: result.error.message ?? "Failed to send reset link.",
        });
        return;
      }
      setSubmittedEmail(values.email);
    } catch (error) {
      console.error("Forgot password error:", error);
      form.setError("root", {
        message: "An unexpected error occurred. Please try again.",
      });
    }
  }

  if (submittedEmail) {
    return <EmailSentState email={submittedEmail} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Reset password
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email and we will send you a reset link
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

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary font-medium text-primary-foreground hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending link...
              </>
            ) : (
              "Send reset link"
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

function EmailSentState({ email }: { email: string }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-secondary">
          <MailCheck className="h-6 w-6 text-primary" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold text-foreground">
          Check your email
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a password reset link to
        </p>
        <p className="mt-0.5 text-sm font-medium text-foreground">{email}</p>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
        <p className="text-center text-xs text-muted-foreground">
          The link expires in 1 hour. If you don&apos;t see it, check your spam
          folder.
        </p>
      </div>

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
