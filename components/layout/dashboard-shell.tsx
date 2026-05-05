import { ReactNode } from "react";

interface DashboardShellProps {
  children: ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <main className="flex-1 min-w-0 p-4 lg:p-8 overflow-y-auto">
      {children}
    </main>
  );
}
