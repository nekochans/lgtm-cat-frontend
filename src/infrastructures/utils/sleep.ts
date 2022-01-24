const millisecond = 1000;

const sleep = (waitSeconds: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, waitSeconds * millisecond);
  });

export default sleep;
