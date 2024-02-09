/**
 * @generator Generate incremental (decremental if `reverse` is true) substrings of `string`
 * @param string
 * @param reverse
 * @yields { string } - substring
 */

export function* substringGenerator(
  string: string,
  reverse?: boolean
): Generator<string, void, void> {
  if (reverse) {
    let index = string.length;
    while (index >= 0) {
      yield string.substring(0, index);
      index--;
    }
  } else {
    let index = 1;
    while (string.length >= index) {
      yield string.substring(0, index);
      index++;
    }
  }
}
