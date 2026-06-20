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
                "@platform-system/design-ui/components/*",
                "@platform-system/design-ui/theme-provider",
                "@platform-system/design-ui/use-theme",
                "@platform-system/design-ui/branding",
                "@platform-system/design-ui/lib/cn",
                "@platform-system/design-ui/ThemeProvider",
                "@platform-system/design-ui/useTheme",
              ],
              message: "Import from the root package \"@platform-system/design-ui\" instead.",
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
