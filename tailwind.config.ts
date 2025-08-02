import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--color-card)",
          secondary: "var(--color-card-secondary)",
          hover: "var(--color-card-hover)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          muted: "var(--color-text-muted)",
        },
        border: {
          DEFAULT: "var(--color-border)",
          secondary: "var(--color-border-secondary)",
        },
        link: {
          DEFAULT: "var(--color-link)",
          hover: "var(--color-link-hover)",
        },
        badge: {
          DEFAULT: "var(--color-badge-bg)",
          text: "var(--color-badge-text)",
        },
        accent: {
          green: {
            bg: "var(--color-accent-green-bg)",
            text: "var(--color-accent-green-text)",
          },
          blue: {
            bg: "var(--color-accent-blue-bg)",
            text: "var(--color-accent-blue-text)",
          },
          yellow: {
            bg: "var(--color-accent-yellow-bg)",
            text: "var(--color-accent-yellow-text)",
          },
          red: {
            bg: "var(--color-accent-red-bg)",
            text: "var(--color-accent-red-text)",
          },
          purple: {
            bg: "var(--color-accent-purple-bg)",
            text: "var(--color-accent-purple-text)",
          },
        },
        code: {
          bg: "var(--color-code-bg)",
          text: "var(--color-code-text)",
        },
        input: {
          bg: "var(--color-input-bg)",
          border: "var(--color-input-border)",
          focus: "var(--color-input-focus)",
        },
        button: {
          bg: "var(--color-button-bg)",
          hover: "var(--color-button-hover)",
          primary: {
            bg: "var(--color-button-primary-bg)",
            hover: "var(--color-button-primary-hover)",
            text: "var(--color-button-primary-text)",
          },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
