module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  moduleNameMapper: {
    "^@lines/(.*)$": "<rootDir>/src/lines/$1",
    "^@shapes/(.*)$": "<rootDir>/src/shapes/$1",
    "^@panels/(.*)$": "<rootDir>/src/panels/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@plugins/(.*)$": "<rootDir>/src/plugins/$1",
  }
};