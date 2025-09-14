import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Global ignores first
  {
    ignores: [
      ".next/**",
      "node_modules/**", 
      "out/**",
      "dist/**",
      ".vercel/**",
    ],
  },
  // Then extends and rules
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-explicit-any": "warn", // Change from error to warning
      "@typescript-eslint/no-unused-vars": "warn", // Change from error to warning
      "@typescript-eslint/no-empty-object-type": "off", // Disable empty interface errors
      "@typescript-eslint/no-non-null-asserted-optional-chain": "warn", // Change from error to warning
      "@next/next/no-img-element": "warn", // Change from error to warning for now
      "@next/next/no-html-link-for-pages": "warn", // Change from error to warning
      "prefer-const": "warn", // Change from error to warning
      "react-hooks/exhaustive-deps": "warn", // Change from error to warning
      "jsx-a11y/alt-text": "warn", // Change from error to warning
      "@typescript-eslint/no-require-imports": "warn", // Allow require() in specific files
      "@typescript-eslint/no-unsafe-function-type": "warn", // Change Function type errors to warnings
    },
  },
];

export default eslintConfig;
