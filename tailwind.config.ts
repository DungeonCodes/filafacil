import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        medical: {
          primary: "#005bb5",   // Primary Blue
          accent: "#28a745",    // Soft Green for actions/calls
          light: "#f0f8ff",     // Soft Light background
          dark: "#0b2641",      // Dark Blue Text
          success: "#20c997",
          focus: "#ffc107",     // Focus state for accessibility
        }
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '3rem',
      }
    }
  },
  plugins: [],
};

export default config;
