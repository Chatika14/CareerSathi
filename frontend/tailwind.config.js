/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: {
          DEFAULT: "var(--surface)",
          muted: "var(--surface-muted)",
        },
        text: {
          DEFAULT: "var(--text)",
          muted: "var(--text-muted)",
        },
        border: "var(--border)",
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          50: "#eef2ff",
          100: "#e0e7ff",
          500: "#3659c9",
          600: "#2949ad",
          700: "#1e3a8a",
        },
        success: {
          DEFAULT: "var(--success)",
          50: "#ecfdf5",
          100: "#d1fae5",
          600: "#23845b",
        },
        warning: {
          DEFAULT: "var(--warning)",
          50: "#fffbeb",
          100: "#fef3c7",
          600: "#a96b13",
        },
        danger: {
          DEFAULT: "var(--danger)",
          50: "#fef2f2",
          100: "#fee2e2",
          600: "#c04444",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
}
