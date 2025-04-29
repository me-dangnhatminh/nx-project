const TailwindConfig = require('../../libs/ui/tailwind.config');

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...TailwindConfig,
  content: [
    ...TailwindConfig.content,
    './{src,pages,components,app}/**/*.{ts,tsx,js,jsx,html}',
    '!./{src,pages,components,app}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}',
    //     ...createGlobPatternsForDependencies(__dirname)
  ],
};
