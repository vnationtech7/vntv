/**
 * Theme initialization script
 * 
 * This script runs immediately (blocking) in the <head> to prevent
 * flash of unstyled content (FOUC) when loading the page.
 * 
 * It reads the theme from localStorage and applies it to the <html>
 * element before the page renders.
 */

export function ThemeScript({ storageKey = "vntv-theme" }: { storageKey?: string }) {
  const themeScript = `
    (function() {
      try {
        const theme = localStorage.getItem('${storageKey}');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        let resolvedTheme = 'light';
        
        if (theme === 'dark') {
          resolvedTheme = 'dark';
        } else if (theme === 'light') {
          resolvedTheme = 'light';
        } else if (theme === 'system' || !theme) {
          resolvedTheme = systemPrefersDark ? 'dark' : 'light';
        }
        
        document.documentElement.classList.add(resolvedTheme);
      } catch (e) {
        // Fallback to light theme on error
        document.documentElement.classList.add('light');
      }
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: themeScript }}
      suppressHydrationWarning
    />
  );
}
