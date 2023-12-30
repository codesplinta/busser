var OFF = 0, WARN = 1, ERROR = 2;

module.exports = {
    parserOptions: {
      "sourceType": "module",
      "ecmaVersion": 2020
    },
    env: {
      browser: true,
      node: true,
      es6: true,
      jest: true,
    }, 
    extends: [
      "eslint:recommended",
      "plugin:react/recommended",
      "plugin:jsx-a11y/recommended",
      "plugin:import/recommended"
    ],
    plugins: [
      "react",
      "react-hooks",
      "jsx-a11y",
      "import"
    ],
    rules: {
      strict: OFF,
      "no-unexpected-multiline": ERROR,
      "no-mixed-spaces-and-tabs": OFF,
      "react/prop-types": OFF,
      "react-hooks/rules-of-hooks": ERROR,
      "react-hooks/exhaustive-deps": WARN
    },
    settings: {
      react: {
        version: "detect"
      }
    }
};