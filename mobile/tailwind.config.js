/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#29a38b",
        secondary: "#10b981",
        surface: "#162c26",
        accent: "#a7f3d0",
        muted: "#737a8d",
        background: "#0d1f1a",
        text: "#fefffe",
        glass: "rgba(255, 255, 255, 0.05)",
      },
      borderRadius: {
        'brand-xl': '40px',
        'brand-2xl': '50px',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}