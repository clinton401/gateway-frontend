"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  useForm,
  useFieldArray,
  type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { createRoute, updateRoute } from "@/actions/routes";
import useCreateToast from "@/hooks/use-create-toast";
import type { RouteDTO as Route } from "@/types";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const formSchema = z.object({
  path: z.string().min(1, "Required").startsWith("/", "Must start with /"),
  method: z.enum([
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
    "HEAD",
    "ALL",
  ]),
  upstream: z.string().min(1, "Required").url("Must be a valid URL"),
  stripPath: z.string().optional(),
  enabled: z.boolean(),

  enableRateLimit: z.boolean(),
  rateLimitMax: z.coerce.number().positive("Must be positive").optional(),
  rateLimitWindowMs: z.coerce.number().positive("Must be positive").optional(),
  rateLimitKeyBy: z.enum(["ip", "apiKey", "header"]).optional(),
  rateLimitKeyHeader: z.string().optional(),

  enableCircuitBreaker: z.boolean(),
  cbFailureThreshold: z.coerce.number().positive("Must be positive").optional(),
  cbWindowSize: z.coerce.number().positive("Must be positive").optional(),
  cbCooldownMs: z.coerce.number().positive("Must be positive").optional(),
  cbSuccessThreshold: z.coerce.number().positive("Must be positive").optional(),

  authMode: z.enum(["none", "apiKey", "jwt"]),
  authJwtSecret: z.string().optional(),
  authJwtRequiredClaims: z.array(
    z.object({ key: z.string(), value: z.string() }),
  ),
  authKeyHeader: z.string().optional(),

  requestHeaderOps: z.array(
    z.object({
      op: z.enum(["set", "remove", "rename"]),
      header: z.string().optional(),
      from: z.string().optional(),
      to: z.string().optional(),
      value: z.string().optional(),
    }),
  ),
  responseHeaderOps: z.array(
    z.object({
      op: z.enum(["set", "remove", "rename"]),
      header: z.string().optional(),
      from: z.string().optional(),
      to: z.string().optional(),
      value: z.string().optional(),
    }),
  ),
  requestBodyOps: z.array(
    z.object({
      op: z.enum(["set", "remove", "rename"]),
      field: z.string().optional(),
      from: z.string().optional(),
      to: z.string().optional(),
      value: z.string().optional(),
    }),
  ),
  responseBodyOps: z.array(
    z.object({
      op: z.enum(["set", "remove", "rename"]),
      field: z.string().optional(),
      from: z.string().optional(),
      to: z.string().optional(),
      value: z.string().optional(),
    }),
  ),
  pathStripPrefix: z.string().optional(),
  pathAddPrefix: z.string().optional(),
  pathRewritePattern: z.string().optional(),
  pathRewriteReplacement: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// 🟢 Add this explicit type alias
type TransformOp = "set" | "remove" | "rename";

// ---------------------------------------------------------------------------
// Helpers to convert between form shape and API shape
// ---------------------------------------------------------------------------
function routeToFormValues(route: Route): Partial<FormValues> {
  return {
    path: route.path,
    method: route.method as FormValues["method"],
    upstream: route.upstream,
    stripPath: route.stripPath ?? "",
    enabled: route.enabled,

    enableRateLimit: route.rateLimitMax != null,
    rateLimitMax: route.rateLimitMax ?? undefined,
    rateLimitWindowMs: route.rateLimitWindowMs ?? undefined,
    rateLimitKeyBy:
      (route.rateLimitKeyBy as FormValues["rateLimitKeyBy"]) ?? "ip",
    rateLimitKeyHeader: route.rateLimitKeyHeader ?? "",

    enableCircuitBreaker: route.cbFailureThreshold != null,
    cbFailureThreshold: route.cbFailureThreshold ?? undefined,
    cbWindowSize: route.cbWindowSize ?? undefined,
    cbCooldownMs: route.cbCooldownMs ?? undefined,
    cbSuccessThreshold: route.cbSuccessThreshold ?? undefined,

    authMode: route.authMode,
    authJwtSecret: route.authJwtSecret ?? "",
    authJwtRequiredClaims: route.authJwtRequiredClaims
      ? Object.entries(route.authJwtRequiredClaims).map(([key, value]) => ({
          key,
          value,
        }))
      : [],
    authKeyHeader: route.authKeyHeader ?? "x-api-key",

    requestHeaderOps: route.requestHeaderTransform ?? [],
    responseHeaderOps: route.responseHeaderTransform ?? [],
    requestBodyOps: route.requestBodyTransform ?? [],
    responseBodyOps: route.responseBodyTransform ?? [],
    pathStripPrefix: route.requestPathTransform?.stripPrefix ?? "",
    pathAddPrefix: route.requestPathTransform?.addPrefix ?? "",
    pathRewritePattern: route.requestPathTransform?.rewrite?.pattern ?? "",
    pathRewriteReplacement:
      route.requestPathTransform?.rewrite?.replacement ?? "",
  };
}

function formValuesToApiValues(data: FormValues) {
  return {
    path: data.path,
    method: data.method,
    upstream: data.upstream,
    stripPath: data.stripPath || null,
    enabled: data.enabled,

    rateLimitMax: data.enableRateLimit ? (data.rateLimitMax ?? null) : null,
    rateLimitWindowMs: data.enableRateLimit
      ? (data.rateLimitWindowMs ?? null)
      : null,
    rateLimitKeyBy: data.enableRateLimit ? (data.rateLimitKeyBy ?? null) : null,
    rateLimitKeyHeader:
      data.enableRateLimit && data.rateLimitKeyBy === "header"
        ? (data.rateLimitKeyHeader ?? null)
        : null,

    cbFailureThreshold: data.enableCircuitBreaker
      ? (data.cbFailureThreshold ?? null)
      : null,
    cbWindowSize: data.enableCircuitBreaker
      ? (data.cbWindowSize ?? null)
      : null,
    cbCooldownMs: data.enableCircuitBreaker
      ? (data.cbCooldownMs ?? null)
      : null,
    cbSuccessThreshold: data.enableCircuitBreaker
      ? (data.cbSuccessThreshold ?? null)
      : null,

    authMode: data.authMode,
    authJwtSecret:
      data.authMode === "jwt" ? (data.authJwtSecret ?? null) : null,
    authJwtRequiredClaims:
      data.authMode === "jwt" && data.authJwtRequiredClaims.length > 0
        ? Object.fromEntries(
            data.authJwtRequiredClaims.map((c) => [c.key, c.value]),
          )
        : null,
    authKeyHeader:
      data.authMode === "apiKey" ? (data.authKeyHeader ?? null) : null,

    requestHeaderTransform:
      data.requestHeaderOps.length > 0 ? data.requestHeaderOps : null,
    responseHeaderTransform:
      data.responseHeaderOps.length > 0 ? data.responseHeaderOps : null,
    requestBodyTransform:
      data.requestBodyOps.length > 0 ? data.requestBodyOps : null,
    responseBodyTransform:
      data.responseBodyOps.length > 0 ? data.responseBodyOps : null,
    requestPathTransform:
      data.pathStripPrefix || data.pathAddPrefix || data.pathRewritePattern
        ? {
            stripPrefix: data.pathStripPrefix || undefined,
            addPrefix: data.pathAddPrefix || undefined,
            rewrite: data.pathRewritePattern
              ? {
                  pattern: data.pathRewritePattern,
                  replacement: data.pathRewriteReplacement ?? "",
                }
              : undefined,
          }
        : null,
  };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function SectionHeader({
  title,
  description,
  icon,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      {icon && (
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-secondary">
          {icon}
        </div>
      )}
      <div>
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
  );
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        {open ? (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>
      {open && <div className="border-t border-border p-4">{children}</div>}
    </div>
  );
}



// ---------------------------------------------------------------------------
// Main form component
// ---------------------------------------------------------------------------
interface RouteFormProps {
  initialData?: Route;
}

const INPUT_CLASS =
  "border-border bg-secondary text-foreground placeholder:text-muted-foreground focus-visible:ring-ring";

export function RouteForm({ initialData }: RouteFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { createSuccess, createError } = useCreateToast();
  const isEditing = !!initialData;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as unknown as Resolver<FormValues>,
    defaultValues: initialData
      ? (routeToFormValues(initialData) as FormValues)
      : {
          path: "",
          method: "ALL",
          upstream: "",
          stripPath: "",
          enabled: true,
          enableRateLimit: false,
          rateLimitMax: undefined,
          rateLimitWindowMs: 60000,
          rateLimitKeyBy: "ip",
          rateLimitKeyHeader: "",
          enableCircuitBreaker: false,
          cbFailureThreshold: 5,
          cbWindowSize: 10,
          cbCooldownMs: 30000,
          cbSuccessThreshold: 1,
          authMode: "none",
          authJwtSecret: "",
          authJwtRequiredClaims: [],
          authKeyHeader: "x-api-key",
          requestHeaderOps: [],
          responseHeaderOps: [],
          requestBodyOps: [],
          responseBodyOps: [],
          pathStripPrefix: "",
          pathAddPrefix: "",
          pathRewritePattern: "",
          pathRewriteReplacement: "",
        },
  });

  const { watch } = form;
  const enableRateLimit = watch("enableRateLimit");
  const enableCircuitBreaker = watch("enableCircuitBreaker");
  const authMode = watch("authMode");
  const rateLimitKeyBy = watch("rateLimitKeyBy");

  const claimsField = useFieldArray({
    control: form.control,
    name: "authJwtRequiredClaims",
  });
  const reqHeaderOps = useFieldArray({
    control: form.control,
    name: "requestHeaderOps",
  });
  const resHeaderOps = useFieldArray({
    control: form.control,
    name: "responseHeaderOps",
  });
  const reqBodyOps = useFieldArray({
    control: form.control,
    name: "requestBodyOps",
  });
  const resBodyOps = useFieldArray({
    control: form.control,
    name: "responseBodyOps",
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const payload = formValuesToApiValues(values);

      const result = isEditing
        ? await updateRoute(initialData.id, payload)
        : await createRoute(payload);

      if (!result.success) {
        createError(result.error);

        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, errors]) => {
            form.setError(field as keyof FormValues, {
              message: errors[0],
            });
          });
        }
        return;
      }

      createSuccess(isEditing ? "Route updated" : "Route created");
      router.push(`/routes/${result.routeId}`);
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Root error */}
        {form.formState.errors.root && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
            <p className="text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Section 1: Basic */}
        {/* ---------------------------------------------------------------- */}
        <div className="space-y-4">
          <SectionHeader
            title="Basic Configuration"
            description="The incoming path and upstream target this route forwards to"
          />

          <FieldRow>
            <FormField
              control={form.control}
              name="path"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Path</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="/api/v1/users"
                      className={INPUT_CLASS}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-muted-foreground">
                    Incoming path to match. Supports prefix matching.
                  </FormDescription>
                  <FormMessage className="text-xs text-destructive" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className={INPUT_CLASS}>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="border-border bg-popover">
                      {[
                        "ALL",
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS",
                        "HEAD",
                      ].map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs text-destructive" />
                </FormItem>
              )}
            />
          </FieldRow>

          <FormField
            control={form.control}
            name="upstream"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground/80">
                  Upstream URL
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="http://user-service:4000"
                    className={INPUT_CLASS}
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs text-muted-foreground">
                  The service this route proxies to.
                </FormDescription>
                <FormMessage className="text-xs text-destructive" />
              </FormItem>
            )}
          />

          <FieldRow>
            <FormField
              control={form.control}
              name="stripPath"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">
                    Strip Prefix{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="/api/v1"
                      className={INPUT_CLASS}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-muted-foreground">
                    Remove this prefix before forwarding.
                  </FormDescription>
                  <FormMessage className="text-xs text-destructive" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Enabled</FormLabel>
                  <div className="flex h-10 items-center">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </div>
                  <FormDescription className="text-xs text-muted-foreground">
                    Disabled routes return 404.
                  </FormDescription>
                </FormItem>
              )}
            />
          </FieldRow>
        </div>

        <Separator className="bg-border" />

        {/* ---------------------------------------------------------------- */}
        {/* Section 2: Rate Limiting */}
        {/* ---------------------------------------------------------------- */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <SectionHeader
              title="Rate Limiting"
              description="Sliding window rate limiting enforced per client"
            />
            <FormField
              control={form.control}
              name="enableRateLimit"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          {enableRateLimit && (
            <div className="space-y-4 rounded-lg border border-border p-4">
              <FieldRow>
                <FormField
                  control={form.control}
                  name="rateLimitMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80">
                        Max Requests
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="100"
                          className={INPUT_CLASS}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-destructive" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rateLimitWindowMs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80">
                        Window (ms)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="60000"
                          className={INPUT_CLASS}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-muted-foreground">
                        60000 = 1 minute
                      </FormDescription>
                      <FormMessage className="text-xs text-destructive" />
                    </FormItem>
                  )}
                />
              </FieldRow>

              <FieldRow>
                <FormField
                  control={form.control}
                  name="rateLimitKeyBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80">
                        Identify Client By
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className={INPUT_CLASS}>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="border-border bg-popover">
                          <SelectItem value="ip">IP Address</SelectItem>
                          <SelectItem value="apiKey">API Key</SelectItem>
                          <SelectItem value="header">Custom Header</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs text-destructive" />
                    </FormItem>
                  )}
                />

                {rateLimitKeyBy === "header" && (
                  <FormField
                    control={form.control}
                    name="rateLimitKeyHeader"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80">
                          Header Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="X-Client-Id"
                            className={INPUT_CLASS}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-destructive" />
                      </FormItem>
                    )}
                  />
                )}
              </FieldRow>
            </div>
          )}
        </div>

        <Separator className="bg-border" />

        {/* ---------------------------------------------------------------- */}
        {/* Section 3: Circuit Breaker */}
        {/* ---------------------------------------------------------------- */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <SectionHeader
              title="Circuit Breaker"
              description="Automatically stop forwarding when the upstream is unhealthy"
            />
            <FormField
              control={form.control}
              name="enableCircuitBreaker"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          {enableCircuitBreaker && (
            <div className="space-y-4 rounded-lg border border-border p-4">
              <FieldRow>
                <FormField
                  control={form.control}
                  name="cbFailureThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80">
                        Failure Threshold
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="5"
                          className={INPUT_CLASS}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-muted-foreground">
                        Failures before opening
                      </FormDescription>
                      <FormMessage className="text-xs text-destructive" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cbWindowSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80">
                        Window Size
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="10"
                          className={INPUT_CLASS}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-muted-foreground">
                        Recent requests to evaluate
                      </FormDescription>
                      <FormMessage className="text-xs text-destructive" />
                    </FormItem>
                  )}
                />
              </FieldRow>

              <FieldRow>
                <FormField
                  control={form.control}
                  name="cbCooldownMs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80">
                        Cooldown (ms)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="30000"
                          className={INPUT_CLASS}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-muted-foreground">
                        Time open before probing
                      </FormDescription>
                      <FormMessage className="text-xs text-destructive" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cbSuccessThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80">
                        Success Threshold
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1"
                          className={INPUT_CLASS}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-muted-foreground">
                        Successes to close from half-open
                      </FormDescription>
                      <FormMessage className="text-xs text-destructive" />
                    </FormItem>
                  )}
                />
              </FieldRow>
            </div>
          )}
        </div>

        <Separator className="bg-border" />

        {/* ---------------------------------------------------------------- */}
        {/* Section 4: Auth */}
        {/* ---------------------------------------------------------------- */}
        <div className="space-y-4">
          <SectionHeader
            title="Authentication"
            description="Enforce auth before forwarding requests"
          />

          <FormField
            control={form.control}
            name="authMode"
            render={({ field }) => (
              <FormItem>
                <div className="grid grid-cols-3 gap-3">
                  {(["none", "apiKey", "jwt"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => field.onChange(mode)}
                      className={`rounded-lg border p-4 text-left transition-colors ${
                        field.value === mode
                          ? "border-primary bg-primary/10"
                          : "border-border bg-secondary hover:bg-accent"
                      }`}
                    >
                      <p className="text-sm font-medium text-foreground">
                        {mode === "none"
                          ? "None"
                          : mode === "apiKey"
                            ? "API Key"
                            : "JWT"}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {mode === "none"
                          ? "All requests pass through"
                          : mode === "apiKey"
                            ? "Validate X-API-Key header"
                            : "Validate Bearer token"}
                      </p>
                    </button>
                  ))}
                </div>
                <FormMessage className="text-xs text-destructive" />
              </FormItem>
            )}
          />

          {authMode === "apiKey" && (
            <FormField
              control={form.control}
              name="authKeyHeader"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">
                    Key Header
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="x-api-key"
                      className={INPUT_CLASS}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-destructive" />
                </FormItem>
              )}
            />
          )}

          {authMode === "jwt" && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="authJwtSecret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">
                      JWT Secret
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Minimum 32 characters"
                        className={INPUT_CLASS}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-destructive" />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-foreground/80">
                    Required Claims{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => claimsField.append({ key: "", value: "" })}
                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Add claim
                  </Button>
                </div>

                {claimsField.fields.map((field, i) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <Input
                      placeholder="key"
                      className={`${INPUT_CLASS} h-8 text-xs`}
                      {...form.register(`authJwtRequiredClaims.${i}.key`)}
                    />
                    <Input
                      placeholder="value"
                      className={`${INPUT_CLASS} h-8 text-xs`}
                      {...form.register(`authJwtRequiredClaims.${i}.value`)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => claimsField.remove(i)}
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator className="bg-border" />

        {/* ---------------------------------------------------------------- */}
        {/* Section 5: Transforms */}
        {/* ---------------------------------------------------------------- */}
        <div className="space-y-4">
          <SectionHeader
            title="Transforms"
            description="Rewrite requests and responses in flight. Changes propagate to the gateway within seconds."
          />

          <div className="space-y-2">
            {/* Request Headers */}
            <CollapsibleSection title="Request Headers">
              <div className="space-y-2">
                {reqHeaderOps.fields.map((f, i) => (
                  <div key={f.id} className="flex items-center gap-2">
                    <Select
                      defaultValue={f.op}
                      onValueChange={(v) =>
                        form.setValue(`requestHeaderOps.${i}.op`, v as TransformOp)
                      }
                    >
                      <SelectTrigger className="h-8 w-24 border-border bg-secondary text-xs text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-border bg-popover">
                        <SelectItem value="set">set</SelectItem>
                        <SelectItem value="remove">remove</SelectItem>
                        <SelectItem value="rename">rename</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="header"
                      className={`${INPUT_CLASS} h-8 text-xs flex-1`}
                      {...form.register(`requestHeaderOps.${i}.header`)}
                    />
                    <Input
                      placeholder="value"
                      className={`${INPUT_CLASS} h-8 text-xs flex-1`}
                      {...form.register(`requestHeaderOps.${i}.value`)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => reqHeaderOps.remove(i)}
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    reqHeaderOps.append({ op: "set", header: "", value: "" })
                  }
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add operation
                </Button>
              </div>
            </CollapsibleSection>

            {/* Response Headers */}
            <CollapsibleSection title="Response Headers">
              <div className="space-y-2">
                {resHeaderOps.fields.map((f, i) => (
                  <div key={f.id} className="flex items-center gap-2">
                    <Select
                      defaultValue={f.op}
                      onValueChange={(v) =>
                        form.setValue(`responseHeaderOps.${i}.op`, v as TransformOp)
                      }
                    >
                      <SelectTrigger className="h-8 w-24 border-border bg-secondary text-xs text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-border bg-popover">
                        <SelectItem value="set">set</SelectItem>
                        <SelectItem value="remove">remove</SelectItem>
                        <SelectItem value="rename">rename</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="header"
                      className={`${INPUT_CLASS} h-8 text-xs flex-1`}
                      {...form.register(`responseHeaderOps.${i}.header`)}
                    />
                    <Input
                      placeholder="value"
                      className={`${INPUT_CLASS} h-8 text-xs flex-1`}
                      {...form.register(`responseHeaderOps.${i}.value`)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => resHeaderOps.remove(i)}
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    resHeaderOps.append({ op: "set", header: "", value: "" })
                  }
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add operation
                </Button>
              </div>
            </CollapsibleSection>

            {/* Request Body */}
            <CollapsibleSection title="Request Body">
              <div className="space-y-2">
                {reqBodyOps.fields.map((f, i) => (
                  <div key={f.id} className="flex items-center gap-2">
                    <Select
                      defaultValue={f.op}
                      onValueChange={(v) =>
                        form.setValue(`requestBodyOps.${i}.op`, v as TransformOp)
                      }
                    >
                      <SelectTrigger className="h-8 w-24 border-border bg-secondary text-xs text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-border bg-popover">
                        <SelectItem value="set">set</SelectItem>
                        <SelectItem value="remove">remove</SelectItem>
                        <SelectItem value="rename">rename</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="field"
                      className={`${INPUT_CLASS} h-8 text-xs flex-1`}
                      {...form.register(`requestBodyOps.${i}.field`)}
                    />
                    <Input
                      placeholder="value"
                      className={`${INPUT_CLASS} h-8 text-xs flex-1`}
                      {...form.register(`requestBodyOps.${i}.value`)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => reqBodyOps.remove(i)}
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    reqBodyOps.append({ op: "set", field: "", value: "" })
                  }
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add operation
                </Button>
              </div>
            </CollapsibleSection>

            {/* Response Body */}
            <CollapsibleSection title="Response Body">
              <div className="space-y-2">
                {resBodyOps.fields.map((f, i) => (
                  <div key={f.id} className="flex items-center gap-2">
                    <Select
                      defaultValue={f.op}
                      onValueChange={(v) =>
                        form.setValue(`responseBodyOps.${i}.op`, v as TransformOp)
                      }
                    >
                      <SelectTrigger className="h-8 w-24 border-border bg-secondary text-xs text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-border bg-popover">
                        <SelectItem value="set">set</SelectItem>
                        <SelectItem value="remove">remove</SelectItem>
                        <SelectItem value="rename">rename</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="field"
                      className={`${INPUT_CLASS} h-8 text-xs flex-1`}
                      {...form.register(`responseBodyOps.${i}.field`)}
                    />
                    <Input
                      placeholder="value"
                      className={`${INPUT_CLASS} h-8 text-xs flex-1`}
                      {...form.register(`responseBodyOps.${i}.value`)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => resBodyOps.remove(i)}
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    resBodyOps.append({ op: "set", field: "", value: "" })
                  }
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add operation
                </Button>
              </div>
            </CollapsibleSection>

            {/* Path Rewrite */}
            <CollapsibleSection title="Path Rewrite">
              <div className="space-y-3">
                <FieldRow>
                  <FormField
                    control={form.control}
                    name="pathStripPrefix"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-foreground/80">
                          Strip Prefix
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="/api/v1"
                            className={`${INPUT_CLASS} h-8 text-xs`}
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pathAddPrefix"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-foreground/80">
                          Add Prefix
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="/internal"
                            className={`${INPUT_CLASS} h-8 text-xs`}
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </FieldRow>
                <FieldRow>
                  <FormField
                    control={form.control}
                    name="pathRewritePattern"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-foreground/80">
                          Regex Pattern
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="^/users/(.*)"
                            className={`${INPUT_CLASS} h-8 font-mono text-xs`}
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pathRewriteReplacement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-foreground/80">
                          Replacement
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="/accounts/$1"
                            className={`${INPUT_CLASS} h-8 font-mono text-xs`}
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </FieldRow>
              </div>
            </CollapsibleSection>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Footer */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
          <Button
            type="button"
            variant="outline"
            className="border-border bg-secondary text-foreground hover:bg-accent"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Saving..." : "Creating..."}
              </>
            ) : isEditing ? (
              "Save changes"
            ) : (
              "Create Route"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
