// 絶対厳守：編集前に必ずAI実装ルールを読む
const millisecond = 1000;

const defaultWaitSeconds = 1;

export async function sleep(
  waitSeconds: number = defaultWaitSeconds
): Promise<void> {
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, waitSeconds * millisecond);
  });
}
