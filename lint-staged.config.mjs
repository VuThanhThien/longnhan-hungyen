export default {
  '**/*.{js,jsx,ts,tsx,json,md,yml,yaml,css,scss}': ['prettier --write'],
  'apps/api/**/*.{js,ts}': ['pnpm --filter @longnhan/api lint:fix'],
  'apps/web/**/*.{js,jsx,ts,tsx}': ['pnpm --filter @longnhan/web lint:fix'],
  'apps/admin/**/*.{js,jsx,ts,tsx}': ['pnpm --filter @longnhan/admin lint:fix'],
};

