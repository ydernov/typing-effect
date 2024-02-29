export type AddUndefined<T> = { [P in keyof T]?: T[P] | undefined };

export type DeepPartial<T> = {
  [P in keyof T]?:
    | (T[P] extends Record<any, any> ? DeepPartial<T[P]> : T[P])
    | undefined;
};
