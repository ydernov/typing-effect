import { expect, test } from "vitest";
import { substringGenerator } from "./substringGenerator";

const expectedResults = [
  { done: false, value: "S" },
  { done: false, value: "St" },
  { done: false, value: "Str" },
  { done: false, value: "Stri" },
  { done: false, value: "Strin" },
  { done: false, value: "String" },
  { done: false, value: "String " },
  { done: false, value: "String 1" },
  { done: true, value: undefined },
];

const expectedReversedResults = [...expectedResults].reverse();
const doneElem = expectedReversedResults.shift()!;
expectedReversedResults.push({ done: false, value: "" }, doneElem);

test("return string by letter", () => {
  const gen = substringGenerator("String 1");
  expectedResults.forEach((expRes) => {
    expect(gen.next()).toStrictEqual(expRes);
  });
});

test("'untype' string by letter", () => {
  const gen = substringGenerator("String 1", true);
  expectedReversedResults.forEach((expRes) => {
    expect(gen.next()).toStrictEqual(expRes);
  });
});
