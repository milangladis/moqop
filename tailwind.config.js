module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      'transparent': 'transparent',
      'blue': '#2F6EB5',
      'green': '#79D292',
      'red': '#DD9982',
      'blue-darken': '#225B9B',
      'grey': '#EFF0F4',
      'grey-darken': '#E5E7ED',
      'white': '#fff',
      'black': '#38424B',
      'orange': '#E95A29',
    },
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
    },
    fontSize: {
      '12': '1.2rem',
      '14': '1.4rem',
      '16': '1.6rem',
      '18': '1.8rem',
      '20': '2rem',
      '24': ['2.4rem', '120%'],
      '32': ['3.2rem', '120%'],
      '40': ['4rem', '120%'],
      '48': ['4.8rem', '120%'],
      '60': ['6rem', '120%'],
    },
    borderRadius: {
      'DEFAULT': '0.6rem',
      '4': '.4rem',
    },
    spacing: {
      0: '0px',
      4: '4px',
      8: '8px',
      12: '12px',
      16: '16px',
      24: '24px',
      32: '32px',
      48: '48px',
      64: '64px',
      80: '80px'
    },
    container: {
      DEFAULT: '2.4rem',
      center: true,
    },
    aspectRatio: {
      '4/3': '4 / 3',
      '9/16': '9 / 16',
      '16/9': '16 / 9',
    },
    screens: {
      'xs': '380px',
      'sm': '480px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1200px'
    },
    extend: {},
  },
  plugins: [
    'postcss-import',
    'tailwindcss/nesting',
    'tailwindcss',
    'autoprefixer',
  ]
}