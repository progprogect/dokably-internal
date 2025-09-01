export function toDate(input: Date | number | string) {
  if (input instanceof Date) {
    return input;
  }

  if (typeof input === 'number') {
    return new Date(input < 1e12 ? input * 1000 : input);
  }

  if (typeof input === 'string') {
    const parsed = Date.parse(input);
    if (!isNaN(parsed)) {
      return new Date(parsed);
    }
  }

  throw new Error(`Unsupported date format ${input}`);
}
