import "@testing-library/jest-dom/vitest";
import { loadEnvConfig } from "@next/env";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

loadEnvConfig(process.cwd());

afterEach(() => {
  cleanup();
});
