import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs,cjs}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@system/design-ui/components/*",
                "@system/design-ui/theme-provider",
                "@system/design-ui/use-theme",
                "@system/design-ui/branding",
                "@system/design-ui/lib/cn",
                "@system/design-ui/ThemeProvider",
                "@system/design-ui/useTheme",
              ],
              message: "Import from the root package \"@system/design-ui\" instead.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
