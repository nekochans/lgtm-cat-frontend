const millisecond = 1000;

const defaultWaitSeconds = 1;

export const sleep = async (
  waitSeconds: number = defaultWaitSeconds,
): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, waitSeconds * millisecond);
  });
};
