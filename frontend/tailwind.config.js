/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F7F8FA",
        sidebar: "#FFFFFF",
        card: "#FFFFFF",
        primary: {
          DEFAULT: "#4267A9",
          hover: "#355389",
          light: "#EBF0F8",
          dark: "#2C4675",
        },
        text: {
          primary: "#20242C",
          secondary: "#747B87",
          muted: "#9CA3AF",
        },
        border: "#E5E7EB",
        status: {
          success: {
            text: "#15803D",
            bg: "#DCFCE7",
            border: "#BBF7D0",
          },
          warning: {
            text: "#B45309",
            bg: "#FEF3C7",
            border: "#FDE68A",
          },
          danger: {
            text: "#B91C1C",
            bg: "#FEE2E2",
            border: "#FECACA",
          },
          info: {
            text: "#1D4ED8",
            bg: "#DBEAFE",
            border: "#BFDBFE",
          }
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "8px",
        md: "10px",
        lg: "12px",
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        card: "0 1px 4px 0 rgba(0, 0, 0, 0.04)",
      }
    },
  },
  plugins: [],
};
