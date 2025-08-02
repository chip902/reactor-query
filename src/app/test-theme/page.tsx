'use client';

import { useTheme } from '@/contexts/ThemeContext';

export default function TestThemePage() {
  const { theme, resolvedTheme, toggleTheme } = useTheme();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4 text-[var(--color-text-primary)]">Theme Test</h1>
      <p className="text-[var(--color-text-secondary)]">Current theme: {theme}</p>
      <p className="text-[var(--color-text-secondary)]">Resolved theme: {resolvedTheme}</p>
      <button 
        onClick={toggleTheme}
        className="mt-4 px-4 py-2 bg-[var(--color-button-primary-bg)] text-white rounded hover:bg-[var(--color-button-primary-hover)]"
      >
        Toggle Theme
      </button>
    </div>
  );
}