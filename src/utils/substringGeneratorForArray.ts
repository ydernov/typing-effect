import { substringGenerator } from "./substringGenerator";

type Options = {
  /**
   * Adds a reverce substring cycle after the main cycle for the string is finished
   */
  rewindStringOnFinish?: boolean;
  /**
   * Start array cycling from the provided string index
   */
  startAtString?: number;
};

/**
 * @generator Cycles through strings in array generates substrings for each string,
 * switching to the next when substringGenerator yields done
 *
 * @param {string[]} strings - The array of strings to generate substrings for.
 * @param {Options} options - { rewindStringOnFinish, startAtString } :
 * - rewindStringOnFinish - Adds a reverce substring cycle after the main cycle for the string is finished
 * - startAtString - Start array cycling from the provided string index
 *
 * @yields  { string: string, index: number } - The current substring and the index of the string in the array.
 * @yields { stringEnd: true } - Signals that string is finished (the substring is full string).
 * @yields  { stringRewindEnd: true } - Signals that rewind cycle is finished (the substring is empty string).
 */

export function* substringGeneratorForArray(
  strings: string[],
  options?: Options
): Generator<
  | { string: string; index: number }
  | { stringEnd: true }
  | { stringRewindEnd: true },
  void,
  void
> {
  const rewindStringOnFinish = options?.rewindStringOnFinish,
    startAt = options?.startAtString ?? 0;

  let index = startAt < strings.length ? startAt : 0;

  while (strings.length > index) {
    const currentString = strings[index] || "";
    const stringIterator = substringGenerator(currentString);
    let result = stringIterator.next();

    while (!result.done) {
      yield { string: result.value, index } as const;
      result = stringIterator.next();
    }
    yield { stringEnd: true };

    if (rewindStringOnFinish) {
      const stringIterator = substringGenerator(currentString, true);
      let result = stringIterator.next();
      while (!result.done) {
        yield { string: result.value, index } as const;
        result = stringIterator.next();
      }

      yield { stringRewindEnd: true };
    }
    index++;
  }
}
