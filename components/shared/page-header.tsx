import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="mb-8 border-b border-border pb-6">
      {/* 
        🟢 THE FIX: 
        1. Default to flex-col (stacked) and gap-4 for mobile.
        2. Snap to sm:flex-row (side-by-side) on larger screens. 
      */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        {/* 🟢 Added min-w-0 and w-full so text truncates safely on small screens if needed */}
        <div className="min-w-0 w-full sm:w-auto">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {/* 🟢 Added shrink-0 so your action buttons never get squished by a long title */}
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
