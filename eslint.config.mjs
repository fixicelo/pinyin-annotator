import js from "@eslint/js"
import eslintConfigPrettier from "eslint-config-prettier"
import reactHooks from "eslint-plugin-react-hooks"
import tseslint from "typescript-eslint"

export default tseslint.config(
  {
    ignores: [
      "build/**",
      ".plasmo/**",
      "coverage/**",
      "node_modules/**",
      "scripts/**",
      "test/**",
      "vitest.config.mts"
    ]
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ]
    }
  },
  {
    files: ["src/**/*.tsx"],
    plugins: {
      "react-hooks": reactHooks
    },
    rules: {
      ...reactHooks.configs.flat.recommended.rules,
      "react-hooks/set-state-in-effect": "warn"
    }
  },
  eslintConfigPrettier
)
