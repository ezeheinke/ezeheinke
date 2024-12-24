const tsconfig = require("./tsconfig.json");
const moduleNameMapper = require("tsconfig-paths-jest")(tsconfig);

const baseConfig = {
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  modulePaths: ["<rootDir>/src"],
  moduleDirectories: ["node_modules"],
  moduleFileExtensions: ["js", "ts", "json", "node"],
  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        jsc: {
          parser: {
            syntax: "typescript",
            tsx: false,
            decorators: false,
            dynamicImport: true,
          },
          target: tsconfig.compilerOptions.target,
          transform: null,
          loose: false,
          keepClassNames: true,
          externalHelpers: true,
        },
      },
    ],
  },
  moduleNameMapper,
  clearMocks: true,
};
