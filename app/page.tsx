"use client";

import { ThemeToggle, ThemeToggleCompact } from "@/components/ui/theme-toggle";
import { useTheme } from "@/lib/theme/theme-provider";

export default function Home() {
  const { resolvedTheme } = useTheme();

  return (
    <main id="main-content" className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-8 text-center">
        {/* Theme Toggle - Top Right */}
        <div className="fixed top-6 right-6 z-10 flex items-center gap-3">
          <ThemeToggleCompact />
          <ThemeToggle />
        </div>

        {/* VNTV Logo */}
        <div className="space-y-2">
          <h1 className="text-6xl font-extrabold tracking-tight">
            VN<span className="text-vntv-red">TV</span>
          </h1>
          <p className="text-xs tracking-[0.2em] text-foreground-muted uppercase">
            Africa. Our Stories. Our Way.
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-background-panel border border-border rounded-md p-8 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-vntv-red-light text-vntv-red text-caption-sm font-extrabold uppercase rounded-xs mb-3">
              <span>⚡</span>
              <span>Milestone 2 In Progress</span>
            </div>
            <h2 className="text-2xl font-bold">
              Design System & Core UI
            </h2>
            <p className="text-foreground-muted">
              Building the reusable design foundation with {resolvedTheme} theme
            </p>
          </div>

          <div className="grid gap-4 text-left">
            <ChecklistItem completed>
              ✅ Design tokens (colors, typography, spacing)
            </ChecklistItem>
            <ChecklistItem completed>
              ✅ Theme system with provider & toggle
            </ChecklistItem>
            <ChecklistItem completed>
              ✅ Light/Dark theme switching
            </ChecklistItem>
            <ChecklistItem completed>
              ✅ System preference detection
            </ChecklistItem>
            <ChecklistItem completed>
              ✅ Theme persistence (localStorage)
            </ChecklistItem>
            <ChecklistItem>
              Base UI components (Button, Input, Card, etc.)
            </ChecklistItem>
            <ChecklistItem>
              Layout components (Container, Grid, Stack)
            </ChecklistItem>
            <ChecklistItem>
              Icon system
            </ChecklistItem>
            <ChecklistItem>
              Accessibility foundation
            </ChecklistItem>
          </div>

          <div className="pt-4 border-t border-border space-y-3">
            <p className="text-sm font-bold text-foreground">
              🎨 Theme System Features:
            </p>
            <ul className="text-sm text-foreground-muted space-y-1 text-left">
              <li>• Smooth transitions between themes</li>
              <li>• No flash of unstyled content (FOUC)</li>
              <li>• Respects system preferences</li>
              <li>• Persists across sessions</li>
              <li>• Three theme toggle variants</li>
              <li>• Will sync with user profile when authenticated</li>
            </ul>
          </div>
        </div>

        {/* Documentation Links */}
        <div className="flex gap-4 justify-center text-sm">
          <a
            href="/Blueprint.md"
            className="text-vntv-red hover:text-vntv-red-hover transition-colors"
          >
            Blueprint →
          </a>
          <a
            href="/milestones.md"
            className="text-vntv-red hover:text-vntv-red-hover transition-colors"
          >
            Milestones →
          </a>
          <a
            href="/MILESTONE_1_STATUS.md"
            className="text-vntv-red hover:text-vntv-red-hover transition-colors"
          >
            M1 Status →
          </a>
        </div>
      </div>
    </main>
  );
}

function ChecklistItem({
  children,
  completed = false,
}: {
  children: React.ReactNode;
  completed?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-colors ${
          completed
            ? "bg-vntv-red border-vntv-red"
            : "border-border"
        }`}
      >
        {completed && (
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M5 13l4 4L19 7"></path>
          </svg>
        )}
      </div>
      <span className={completed ? "text-foreground" : "text-foreground-muted"}>
        {children}
      </span>
    </div>
  );
}
