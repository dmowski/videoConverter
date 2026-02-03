import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";
import globals from "globals";

export default [
  {
    ignores: ["dist", "node_modules", "build"],
  },
  {
    files: ["src/**/*.ts", "tests/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        MessageEvent: "readonly",
        MessagePort: "readonly",
        Worker: "readonly",
        self: "readonly",
        HTMLInputElement: "readonly",
        HTMLDivElement: "readonly",
        HTMLVideoElement: "readonly",
        HTMLButtonElement: "readonly",
        HTMLParagraphElement: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      prettier,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
      "prettier/prettier": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
        },
      ],
      "no-console": [
        "warn",
        {
          allow: ["warn", "error"],
        },
      ],
    },
  },
];
