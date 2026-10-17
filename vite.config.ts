import { defineConfig } from "vite-plus";

export default defineConfig({
  fmt: {
    // Session output is kept as the composing agent wrote it.
    ignorePatterns: ["compositions/pieces/**"],
    printWidth: 80,
    sortImports: {
      newlinesBetween: false,
      partitionByNewline: true,
      groups: [["builtin"], ["external"]],
    },
  },
  lint: {
    ignorePatterns: ["compositions/pieces/**"],
    categories: {
      correctness: "off",
    },
    rules: {
      curly: "error",
    },
  },
  staged: {
    "*": "vp check --fix",
  },
});
