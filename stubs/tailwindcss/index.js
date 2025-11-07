export default function tailwindcss() {
  return {
    postcssPlugin: 'tailwindcss-stub',
    AtRule(atRule) {
      if (atRule.name === 'tailwind') {
        atRule.remove();
      }
    },
  };
}

tailwindcss.postcss = true;
