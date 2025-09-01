import { omitFromStackTrace } from './function';

export function exhaustiveSwitchError(value: never, property?: string): never {
  const debugValue =
    property && value && typeof value === 'object' && property in value
      ? value[property]
      : value;
  throw new Error(`Unknown switch case ${debugValue}`);
}

export const assert: (value: unknown, message?: string) => asserts value =
  omitFromStackTrace((value, message) => {
    if (!value) {
      throw new Error(message || 'Assertion Error');
    }
  });

export const assertExists = omitFromStackTrace(
  <T>(value: T, message?: string): NonNullable<T> => {
    // note that value == null is equivilent to value === null || value === undefined
    if (value == null) {
      throw new Error(message ?? 'value must be defined');
    }
    return value as NonNullable<T>;
  }
);
