"use client";

import { useTheme } from "@/lib/theme/theme-provider";

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
      <svg
        className={`absolute w-5 h-5 transition-all duration-base ${
          resolvedTheme === "dark"
            ? "rotate-0 scale-100 opacity-100"
            : "rotate-90 scale-0 opacity-0"
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>

      {/* Moon icon (visible in light mode) */}
      <svg
        className={`absolute w-5 h-5 transition-all duration-base ${
          resolvedTheme === "light"
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-0 opacity-0"
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
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
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
          <span>Light</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
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
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
        <span>Light</span>
      </button>
      
      <button
        onClick={() => setTheme("dark")}
        className={`flex items-center gap-3 px-3 py-2 rounded-sm text-body-sm hover:bg-background-panel-2 transition-colors ${
          theme === "dark" ? "bg-background-panel-2 text-vntv-red font-bold" : ""
        }`}
        type="button"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
        <span>Dark</span>
      </button>
      
      <button
        onClick={() => setTheme("system")}
        className={`flex items-center gap-3 px-3 py-2 rounded-sm text-body-sm hover:bg-background-panel-2 transition-colors ${
          theme === "system" ? "bg-background-panel-2 text-vntv-red font-bold" : ""
        }`}
        type="button"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
        <span>System {theme === "system" && `(${resolvedTheme})`}</span>
      </button>
    </div>
  );
}
