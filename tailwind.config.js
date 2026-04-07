export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#122117',
        mist: '#f6f3ea',
        moss: '#1b5e4b',
        clay: '#b85c38',
        gold: '#d6a447',
        berry: '#7b274f',
      },
      boxShadow: {
        card: '0 24px 70px rgba(18, 33, 23, 0.12)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      backgroundImage: {
        grain: 'radial-gradient(circle at top, rgba(214, 164, 71, 0.18), transparent 35%), linear-gradient(135deg, rgba(27, 94, 75, 0.08), rgba(184, 92, 56, 0.08))',
      },
    },
  },
  plugins: [],
};
