module.exports = {
  preset: "react-native",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native|@react-native|@react-native-community|@react-navigation)",
  ],
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
  testMatch: ["**/tests/**/**/*.test.js", "**/tests/**/*.test.js"],
};
