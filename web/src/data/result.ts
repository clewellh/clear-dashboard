// web/src/data/result.ts

export type DataResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };
