/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input:  "hsl(var(--input))",
        ring:   "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // ── Liquid Glass Theme Palette ──
        "glass-olive":  "#556B2F",  // Deep Olive
        "glass-gold":   "#C2A15A",  // Muted Gold
        "glass-cream":  "#FAF8F5",  // Warm Cream
        "glass-white":  "#FFFFFF",  // Soft White
        "glass-charcoal": "#1F1F1F",// Charcoal
        "glass-bronze": "#8B6B4A",  // Muted Bronze

        // To map exactly to previous class names used in search/upload/review/diagnosis pages (e-brand, w-stone, etc.):
        // We will keep them here but point them to the new palette to avoid totally breaking existing layouts before we rewrite them.
        "e-brand": "#556B2F", 
        "e-dark":  "#3f4f22", 
        "e-mid":   "#556B2F", 
        "e-mist":  "#FAF8F5", // Map mist to cream for now
        "w-stone": "#FFFFFF", 
        "w-border":"#e5e3de", 
      },
      fontFamily: {
        display: ['var(--font-lora)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%":      { transform: "translateY(-12px) rotate(1deg)" },
          "66%":      { transform: "translateY(-6px) rotate(-1deg)" },
        },
        drift: {
          "0%, 100%": { transform: "translate(0px, 0px)" },
          "25%":      { transform: "translate(8px, -4px)" },
          "50%":      { transform: "translate(-4px, 8px)" },
          "75%":      { transform: "translate(-8px, -4px)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        morph: {
          "0%, 100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
          "50%": { borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" }
        },
      },
      animation: {
        "accordion-down":  "accordion-down 0.2s ease-out",
        "accordion-up":    "accordion-up 0.2s ease-out",
        "float":           "float 6s ease-in-out infinite",
        "drift":           "drift 12s ease-in-out infinite",
        "shimmer":         "shimmer 2s linear infinite",
        "fade-up":         "fade-up 0.5s ease-out both",
        "morph":           "morph 8s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
