"use client";

import { Monitor, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const THEMES = [
  { id: "light", icon: Sun, label: "Light" },
  { id: "dark", icon: Moon, label: "Dark" },
  { id: "system", icon: Monitor, label: "System" },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Suppress the React warning. This double-render is structurally mandatory
    // to safely resolve the Next.js hydration mismatch between server and client themes.
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  return (
    <nav
      aria-label="Select color theme"
      className="relative flex w-fit items-center gap-1 rounded-full border border-border bg-muted/50 p-1"
    >
      {THEMES.map(({ id, icon: Icon, label }) => {
        const isActive =
          mounted && (theme === id || (theme === "system" && id === "system"));

        return (
          <button
            key={id}
            onClick={() => setTheme(id)}
            className={cn(
              "group relative flex h-8 w-8 items-center justify-center rounded-full transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {/* The "Big Tech" Touch: Layout Projection */}
            {isActive && (
              <motion.div
                layoutId="active-pill"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                className="absolute inset-0 z-0 rounded-full bg-background shadow-sm"
              />
            )}

            <Icon
              className="relative z-10"
              size={15}
              strokeWidth={isActive ? 2.2 : 1.8}
            />

            <span className="sr-only">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
