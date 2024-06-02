import type { Config } from 'tailwindcss';

const brandColors = {
  brandPrimaryOne: '#f8920a',
  brandPrimaryTwo: '#d818ff',
};

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        nexa: ['Nexa', 'sans-serif'], // brand logo primary
        nexaText: ['Nexa Text', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'], // secondary
      },
      colors: {
        brandPrimaryOne: brandColors.brandPrimaryOne,
        brandPrimaryTwo: brandColors.brandPrimaryTwo,
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(to right, #f8920a, #d818ff)', // Custom gradient
      },
    },
  },
  plugins: [require('daisyui'), require('@tailwindcss/typography')],
  daisyui: {
    themes: ['light'],
  },
};
export default config;
