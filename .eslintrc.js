module.exports = {
  extends: [
    "@flyyer/eslint-config",
    "@flyyer/eslint-config/typescript",
    "@flyyer/eslint-config/react",
    // "@flyyer/eslint-config/jest",
    "@flyyer/eslint-config/prettier",
  ],
  rules: {
    "@typescript-eslint/no-unnecessary-type-constraint": "off",
    "react/react-in-jsx-scope": "off",
  },
};
