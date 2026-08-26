"use client";

import { useTheme } from "@/lib/theme/theme-provider";
import { Sun, Moon, Monitor } from "@/components/icons";

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-background-panel border border-border hover:bg-background-panel-2 transition-colors duration-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-vntv-red focus-visible:outline-offset-2"
      aria-label={`Switch to ${resolvedTheme === "light" ? "dark" : "light"} theme`}
      type="button"
    >
      {/* Sun icon (visible in dark mode) */}
      <Sun
        className={`absolute w-5 h-5 transition-all duration-base ${
          resolvedTheme === "dark"
            ? "rotate-0 scale-100 opacity-100"
            : "rotate-90 scale-0 opacity-0"
        }`}
        aria-hidden="true"
      />

      {/* Moon icon (visible in light mode) */}
      <Moon
        className={`absolute w-5 h-5 transition-all duration-base ${
          resolvedTheme === "light"
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-0 opacity-0"
        }`}
        aria-hidden="true"
      />
    </button>
  );
}

export function ThemeToggleCompact() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-background-panel border border-border hover:bg-background-panel-2 transition-colors duration-base text-caption-sm font-bold uppercase tracking-wide focus-visible:outline focus-visible:outline-2 focus-visible:outline-vntv-red focus-visible:outline-offset-2"
      aria-label={`Switch to ${resolvedTheme === "light" ? "dark" : "light"} theme`}
      type="button"
    >
      {resolvedTheme === "dark" ? (
        <>
          <Sun className="w-4 h-4" />
          <span>Light</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4" />
          <span>Dark</span>
        </>
      )}
    </button>
  );
}

export function ThemeToggleDropdown() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <div className="inline-flex flex-col gap-1 p-2 bg-background-panel border border-border rounded-md shadow-lg">
      <button
        onClick={() => setTheme("light")}
        className={`flex items-center gap-3 px-3 py-2 rounded-sm text-body-sm hover:bg-background-panel-2 transition-colors ${
          theme === "light" ? "bg-background-panel-2 text-vntv-red font-bold" : ""
        }`}
        type="button"
      >
        <Sun className="w-4 h-4" />
        <span>Light</span>
      </button>
      
      <button
        onClick={() => setTheme("dark")}
        className={`flex items-center gap-3 px-3 py-2 rounded-sm text-body-sm hover:bg-background-panel-2 transition-colors ${
          theme === "dark" ? "bg-background-panel-2 text-vntv-red font-bold" : ""
        }`}
        type="button"
      >
        <Moon className="w-4 h-4" />
        <span>Dark</span>
      </button>
      
      <button
        onClick={() => setTheme("system")}
        className={`flex items-center gap-3 px-3 py-2 rounded-sm text-body-sm hover:bg-background-panel-2 transition-colors ${
          theme === "system" ? "bg-background-panel-2 text-vntv-red font-bold" : ""
        }`}
        type="button"
      >
        <Monitor className="w-4 h-4" />
        <span>System {theme === "system" && `(${resolvedTheme})`}</span>
      </button>
    </div>
  );
}
