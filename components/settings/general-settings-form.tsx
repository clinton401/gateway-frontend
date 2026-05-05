"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { updateGatewaySettings } from "@/actions/settings";
import useCreateToast from "@/hooks/use-create-toast";

const schema = z.object({
  gateway_name: z.string().min(1, "Name is required"),
  gateway_url: z.string().min(1, "URL is required").url("Must be a valid URL"),
});

type FormValues = z.infer<typeof schema>;

interface GeneralSettingsFormProps {
  defaultValues: FormValues;
}

const INPUT_CLASS =
  "border-border bg-secondary text-foreground placeholder:text-muted-foreground focus-visible:ring-ring";

export function GeneralSettingsForm({
  defaultValues,
}: GeneralSettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const { createSuccess, createError } = useCreateToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await updateGatewaySettings(values);
      if (result.success) {
        createSuccess("Settings saved");
      } else {
        createError(result.error ?? "Failed to save settings");
      }
    });
  }

  return (
    <section className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground">General</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Basic configuration for this gateway instance.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="gateway_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">
                    Gateway Name
                  </FormLabel>
                  <FormControl>
                    <Input className={INPUT_CLASS} {...field} />
                  </FormControl>
                  <FormMessage className="text-xs text-destructive" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gateway_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">
                    Gateway URL
                  </FormLabel>
                  <FormControl>
                    <Input className={INPUT_CLASS} {...field} />
                  </FormControl>
                  <FormDescription className="text-xs text-muted-foreground">
                    The URL your clients use to reach the gateway.
                  </FormDescription>
                  <FormMessage className="text-xs text-destructive" />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </Form>
    </section>
  );
}
