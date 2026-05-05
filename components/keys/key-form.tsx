"use client";

import { useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver, } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format, addDays } from "date-fns";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createApiKey } from "@/actions/keys";
import useCreateToast from "@/hooks/use-create-toast";
import { cn } from "@/lib/utils";
import type { RouteDTO as Route } from "@/types";

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(64, "Name must be under 64 characters"),
  scopeType: z.enum(["all", "specific"]),
  routeScope: z.array(z.string()),
  expiryType: z.enum(["never", "duration", "custom"]),
  expiryDuration: z.string().optional(),
  expiryDate: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface KeyFormProps {
  routes: Route[];
  onSuccess: (plaintext: string) => void;
}

const INPUT_CLASS =
  "border-border bg-secondary text-foreground placeholder:text-muted-foreground focus-visible:ring-ring";

export function KeyForm({ routes, onSuccess }: KeyFormProps) {
  const [isPending, startTransition] = useTransition();
  const { createError } = useCreateToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      scopeType: "all",
      routeScope: [],
      expiryType: "never",
      expiryDuration: "30",
    },
  });

const scopeType = useWatch({
  control: form.control,
  name: "scopeType",
});

const expiryType = useWatch({
  control: form.control,
  name: "expiryType",
});

  function computeExpiresAt(values: FormValues): Date | null {
    if (values.expiryType === "never") return null;
    if (values.expiryType === "duration") {
      const days = parseInt(values.expiryDuration ?? "30", 10);
      return addDays(new Date(), days);
    }
    return values.expiryDate ?? null;
  }

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await createApiKey({
        name: values.name,
        routeScope: values.scopeType === "all" ? [] : values.routeScope,
        expiresAt: computeExpiresAt(values),
      });

      if (!result.success) {
        createError(result.error);
        return;
      }

      onSuccess(result.plaintext);
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground/80">Key Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="mobile-client"
                  autoFocus
                  className={INPUT_CLASS}
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-xs text-muted-foreground">
                A human-readable name to identify this key.
              </FormDescription>
              <FormMessage className="text-xs text-destructive" />
            </FormItem>
          )}
        />

        {/* Route scope */}
        <FormField
          control={form.control}
          name="scopeType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-foreground/80">Route Scope</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex gap-6"
                >
                  {(["all", "specific"] as const).map((v) => (
                    <div key={v} className="flex items-center gap-2">
                      <RadioGroupItem value={v} id={`scope-${v}`} />
                      <label
                        htmlFor={`scope-${v}`}
                        className="cursor-pointer text-sm text-foreground"
                      >
                        {v === "all" ? "All Routes" : "Specific Routes"}
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />

        {scopeType === "specific" && (
          <FormField
            control={form.control}
            name="routeScope"
            render={() => (
              <FormItem>
                <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-border bg-secondary p-4">
                  {routes
                    .filter((r) => r.enabled)
                    .map((route) => (
                      <FormField
                        key={route.id}
                        control={form.control}
                        name="routeScope"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value.includes(route.id)}
                                onCheckedChange={(checked) => {
                                  field.onChange(
                                    checked
                                      ? [...field.value, route.id]
                                      : field.value.filter(
                                          (id) => id !== route.id,
                                        ),
                                  );
                                }}
                              />
                            </FormControl>
                            <label className="flex cursor-pointer items-center gap-2 text-xs">
                              <span className="font-mono text-foreground">
                                {route.path}
                              </span>
                              <span className="text-muted-foreground">
                                {route.method}
                              </span>
                            </label>
                          </FormItem>
                        )}
                      />
                    ))}
                </div>
                <FormMessage className="text-xs text-destructive" />
              </FormItem>
            )}
          />
        )}

        {/* Expiry */}
        <FormField
          control={form.control}
          name="expiryType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-foreground/80">Expiry</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="space-y-4" // Slightly increased space-y for wrapped items
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="never" id="exp-never" />
                    <label
                      htmlFor="exp-never"
                      className="cursor-pointer text-sm text-foreground"
                    >
                      Never expires
                    </label>
                  </div>

                  {/* 🟢 ADDED: flex-wrap so the dropdown drops to the next line if cramped */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="duration" id="exp-duration" />
                      <label
                        htmlFor="exp-duration"
                        className="cursor-pointer text-sm text-foreground"
                      >
                        Duration
                      </label>
                    </div>
                    {expiryType === "duration" && (
                      <FormField
                        control={form.control}
                        name="expiryDuration"
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="h-8 w-[120px] border-border bg-secondary text-xs text-foreground">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="border-border bg-popover">
                              <SelectItem value="7">7 days</SelectItem>
                              <SelectItem value="30">30 days</SelectItem>
                              <SelectItem value="90">90 days</SelectItem>
                              <SelectItem value="365">1 year</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    )}
                  </div>

                  {/* 🟢 ADDED: flex-wrap to prevent screen stretching */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="custom" id="exp-custom" />
                      <label
                        htmlFor="exp-custom"
                        className="cursor-pointer text-sm text-foreground"
                      >
                        Custom date
                      </label>
                    </div>
                    {expiryType === "custom" && (
                      <FormField
                        control={form.control}
                        name="expiryDate"
                        render={({ field }) => (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                  "h-8 w-[180px] justify-start border-border bg-secondary text-left text-xs font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                                {field.value
                                  ? format(field.value, "PPP")
                                  : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            {/* 🟢 ADDED: align="start" to prevent the calendar from spilling off the right edge */}
                            <PopoverContent
                              align="start"
                              className="w-auto border-border bg-popover p-0 max-w-[calc(100vw-2rem)]"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        )}
                      />
                    )}
                  </div>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 border-t border-border pt-6">
          <Link href="/keys">
            <Button
              type="button"
              variant="outline"
              className="border-border bg-secondary text-foreground hover:bg-accent"
            >
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isPending}
            className="min-w-[140px] bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Key"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
