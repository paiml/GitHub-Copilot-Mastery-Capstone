// Result type for error handling
export type Result<T, E = Error> = Ok<T> | Err<E>;

export interface Ok<T> {
  readonly ok: true;
  readonly value: T;
  isOk(): this is Ok<T>;
  isErr(): this is never;
}

export interface Err<E> {
  readonly ok: false;
  readonly error: E;
  isOk(): this is never;
  isErr(): this is Err<E>;
}

export function Ok<T>(value: T): Ok<T> {
  return {
    ok: true,
    value,
    isOk(): this is Ok<T> {
      return true;
    },
    isErr(): this is never {
      return false;
    },
  };
}

export function Err<E>(error: E): Err<E> {
  return {
    ok: false,
    error,
    isOk(): this is never {
      return false;
    },
    isErr(): this is Err<E> {
      return true;
    },
  };
}
