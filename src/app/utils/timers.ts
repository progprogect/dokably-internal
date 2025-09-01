export const startTimer = (func: () => void, interval: number) => {
  let current = 0;
  const end = interval || 300; // 5 min

  const timerId = setInterval(function () {
    if (current === end) {
      func();
      clearInterval(timerId);
    }
    current++;
  }, 1000);
};
