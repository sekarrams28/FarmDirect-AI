/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Warm cream / marketplace surface
        paper: '#FBF7EE',
        paperDeep: '#F3ECD9',
        // Text
        ink: '#1E2A1E',
        inkSoft: '#5B6355',
        soil: '#20291D',
        // Agricultural greens
        leaf: '#2F6B3C',
        leafDeep: '#204B2A',
        leafLight: '#EAF3EA',
        // Turmeric / mustard accent
        turmeric: '#E3A93B',
        turmericDeep: '#B87A20',
        turmericSoft: '#FBEED2',
        // Utility crate brown, kept for legacy references
        crate: '#B4432E',
        // Status colors
        success: '#2F6B3C',
        successSoft: '#E7F3E9',
        warning: '#B87A20',
        warningSoft: '#FBEED2',
        danger: '#B4432E',
        dangerSoft: '#FBE9E6',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(30, 42, 30, 0.06), 0 8px 24px -8px rgba(30, 42, 30, 0.12)',
        softHover: '0 4px 10px rgba(30, 42, 30, 0.08), 0 16px 32px -12px rgba(30, 42, 30, 0.18)',
        card: '0 1px 2px rgba(30, 42, 30, 0.06), 0 8px 24px -8px rgba(30, 42, 30, 0.12)',
      },
      borderRadius: {
        card: '1rem',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
