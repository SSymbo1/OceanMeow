export default {
  content: ['./src/**/*.{vue,ts}'],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        dark: '#141414',
      },
    },
  },
};
