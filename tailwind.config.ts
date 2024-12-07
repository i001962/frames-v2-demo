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
        background: '#181424',
        foreground: '#FEA282',
        deepPink: '#BD195D',
        purplePanel: '#010513',
        darkPurple: '#181424',
        limeGreen: '#32CD32', //'#A2E634', // defifa '#32CD32', #8cc929
        limeGreenOpacity: 'rgba(162, 230, 52, 0.7)',
        lightPurple: '#C0B2F0',
        fontRed: '#EC017C',
        notWhite: '#FEA282',
      },
    },
  },
  plugins: [],
} satisfies Config;
