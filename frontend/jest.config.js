export default {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^.+\\.css$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|svg)(\\?url)?$":
      "<rootDir>/src/__mocks__/fileMock.js",
  },
  transformIgnorePatterns: ["node_modules/(?!(leaflet)/)"],
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react-jsx",
        },
      },
    ],
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
};
