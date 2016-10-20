module.exports = {
  "extends": "airbnb",
  "plugins": [
    "import"
  ],
  rules: {
    //'no-console': 'off',
    'no-mixed-operators': 'off', // 有bug
    "import/no-extraneous-dependencies": [
      "error", { "devDependencies": ["**/*.test.js", "**/*.spec.js"] }
    ],
  },
};
