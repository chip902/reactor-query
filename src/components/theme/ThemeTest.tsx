'use client';

import { useTheme } from '@/contexts/ThemeContext';

export function ThemeTest() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Theme Switcher Test</h2>
      
      <div className="space-y-2">
        <p className="text-[var(--color-text-primary)]">
          Current theme: <span className="font-bold">{theme}</span>
        </p>
        <p className="text-[var(--color-text-primary)]">
          Resolved theme: <span className="font-bold">{resolvedTheme}</span>
        </p>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => setTheme('light')}
          className="px-4 py-2 bg-[var(--color-button-primary-bg)] text-[var(--color-button-primary-text)] rounded-md hover:bg-[var(--color-button-primary-hover)] transition-colors"
        >
          Light Mode
        </button>
        <button
          onClick={() => setTheme('dark')}
          className="px-4 py-2 bg-[var(--color-button-primary-bg)] text-[var(--color-button-primary-text)] rounded-md hover:bg-[var(--color-button-primary-hover)] transition-colors"
        >
          Dark Mode
        </button>
        <button
          onClick={() => setTheme('system')}
          className="px-4 py-2 bg-[var(--color-button-primary-bg)] text-[var(--color-button-primary-text)] rounded-md hover:bg-[var(--color-button-primary-hover)] transition-colors"
        >
          System Mode
        </button>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">Card Example</h3>
          <p className="text-[var(--color-text-secondary)]">
            This card demonstrates the theme colors in action. The background, text, and border colors should change based on the selected theme.
          </p>
        </div>

        <div className="p-4 bg-[var(--color-card-secondary)] rounded-lg">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">Secondary Card</h3>
          <p className="text-[var(--color-text-secondary)]">
            This is a secondary card with different background color.
          </p>
        </div>

        <div className="space-x-2">
          <span className="px-2 py-1 bg-[var(--color-accent-green-bg)] text-[var(--color-accent-green-text)] text-sm rounded">
            Success Badge
          </span>
          <span className="px-2 py-1 bg-[var(--color-accent-blue-bg)] text-[var(--color-accent-blue-text)] text-sm rounded">
            Info Badge
          </span>
          <span className="px-2 py-1 bg-[var(--color-accent-red-bg)] text-[var(--color-accent-red-text)] text-sm rounded">
            Error Badge
          </span>
        </div>

        <div className="p-4 bg-[var(--color-code-bg)] text-[var(--color-code-text)] rounded-lg">
          <pre className="text-sm">
{`// Example code block
const theme = {
  background: "var(--color-card)",
  text: "var(--color-text-primary)",
  border: "var(--color-border)"
};`}
          </pre>
        </div>
      </div>
    </div>
  );
}