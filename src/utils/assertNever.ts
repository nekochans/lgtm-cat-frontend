// eslint-disable-next-line unused-imports/no-unused-vars
export function assertNever(value: never): never {
  throw new Error("Unexpected value. Should have been never.");
}
