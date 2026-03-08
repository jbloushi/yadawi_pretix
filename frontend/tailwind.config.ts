import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5b45b7',
          50: '#f2f3fb',
          100: '#e4e6f6',
        },
        secondary: {
          50: '#f8f9fa',
          100: '#f1f3f5',
          200: '#e9ecf2',
          600: '#6c7284',
          700: '#495057',
          800: '#343a40',
          900: '#1f2430',
        },
        success: '#20a36a',
        warning: '#ff8a3d',
        background: '#eef0f6',
        card: '#ffffff',
        line: '#e7e9f2',
      },
    },
  },
  plugins: [],
};

export default config;
