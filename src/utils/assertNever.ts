// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const assertNever = (value: never): never => {
  throw new Error('Unexpected value. Should have been never.');
};
