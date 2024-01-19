import { get } from '@vercel/edge-config';

export const isInMaintenance = async (): Promise<boolean> => {
  const isInMaintenanceMode = await get<boolean>('isInMaintenance');

  return isInMaintenanceMode === true;
};
