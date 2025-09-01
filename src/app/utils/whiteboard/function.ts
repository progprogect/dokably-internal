export function omitFromStackTrace<Args extends Array<unknown>, Return>(
  fn: (...args: Args) => Return
): (...args: Args) => Return {
  const wrappedFn = (...args: Args) => {
    try {
      return fn(...args);
    } catch (error) {
      if (error instanceof Error && Error.captureStackTrace) {
        Error.captureStackTrace(error, wrappedFn);
      }
      throw error;
    }
  };

  return wrappedFn;
}
