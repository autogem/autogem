module.exports = {
  prefix: 'autogem-',
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  important: ['.autogem-extension-root'],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
}