export const isInMaintenance = (): boolean =>
  process.env.IS_IN_MAINTENANCE === '1';
