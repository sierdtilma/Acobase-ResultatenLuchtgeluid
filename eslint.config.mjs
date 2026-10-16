import powerbiVisualsConfigs from "eslint-plugin-powerbi-visuals";

export default [
  powerbiVisualsConfigs.configs.recommended,
  {
    ignores: ["node_modules/**", "dist/**", ".vscode/**", ".tmp/**"]
  },
  {
    files: ["scripts/**/*.js"],
    rules: {
      "powerbi-visuals/non-literal-fs-path": "off",
      "powerbi-visuals/non-literal-require": "off"
    }
  }
];
