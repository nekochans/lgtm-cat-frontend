// 絶対厳守：編集前に必ずAI実装ルールを読む
import { get } from "@vercel/edge-config";

export async function isInMaintenance(): Promise<boolean> {
  const isInMaintenanceMode = await get<boolean>("isInMaintenance");

  return isInMaintenanceMode === true;
}
