import { expect, test } from "vitest";
import { substringGeneratorForArray } from "./substringGeneratorForArray";

const strings = ["String 1", "String 2", "String 3"];

const expectedResults = [
  { done: false, value: { string: "S", index: 0 } },
  { done: false, value: { string: "St", index: 0 } },
  { done: false, value: { string: "Str", index: 0 } },
  { done: false, value: { string: "Stri", index: 0 } },
  { done: false, value: { string: "Strin", index: 0 } },
  { done: false, value: { string: "String", index: 0 } },
  { done: false, value: { string: "String ", index: 0 } },
  { done: false, value: { string: "String 1", index: 0 } },
  { done: false, value: { stringEnd: true } },

  { done: false, value: { string: "S", index: 1 } },
  { done: false, value: { string: "St", index: 1 } },
  { done: false, value: { string: "Str", index: 1 } },
  { done: false, value: { string: "Stri", index: 1 } },
  { done: false, value: { string: "Strin", index: 1 } },
  { done: false, value: { string: "String", index: 1 } },
  { done: false, value: { string: "String ", index: 1 } },
  { done: false, value: { string: "String 2", index: 1 } },
  { done: false, value: { stringEnd: true } },

  { done: false, value: { string: "S", index: 2 } },
  { done: false, value: { string: "St", index: 2 } },
  { done: false, value: { string: "Str", index: 2 } },
  { done: false, value: { string: "Stri", index: 2 } },
  { done: false, value: { string: "Strin", index: 2 } },
  { done: false, value: { string: "String", index: 2 } },
  { done: false, value: { string: "String ", index: 2 } },
  { done: false, value: { string: "String 3", index: 2 } },
  { done: false, value: { stringEnd: true } },

  { done: true, value: undefined },
];

test("returned results for array of strings", () => {
  const gen = substringGeneratorForArray(strings);
  expectedResults.forEach((expRes) => {
    expect(gen.next()).toStrictEqual(expRes);
  });
});

const expectedResultsWithUntyping = [
  { done: false, value: { string: "S", index: 0 } },
  { done: false, value: { string: "St", index: 0 } },
  { done: false, value: { string: "Str", index: 0 } },
  { done: false, value: { string: "Stri", index: 0 } },
  { done: false, value: { string: "Strin", index: 0 } },
  { done: false, value: { string: "String", index: 0 } },
  { done: false, value: { string: "String ", index: 0 } },
  { done: false, value: { string: "String 1", index: 0 } },
  { done: false, value: { stringEnd: true } },
  { done: false, value: { string: "String 1", index: 0 } },
  { done: false, value: { string: "String ", index: 0 } },
  { done: false, value: { string: "String", index: 0 } },
  { done: false, value: { string: "Strin", index: 0 } },
  { done: false, value: { string: "Stri", index: 0 } },
  { done: false, value: { string: "Str", index: 0 } },
  { done: false, value: { string: "St", index: 0 } },
  { done: false, value: { string: "S", index: 0 } },
  { done: false, value: { string: "", index: 0 } },
  { done: false, value: { stringRewindEnd: true } },

  { done: false, value: { string: "S", index: 1 } },
  { done: false, value: { string: "St", index: 1 } },
  { done: false, value: { string: "Str", index: 1 } },
  { done: false, value: { string: "Stri", index: 1 } },
  { done: false, value: { string: "Strin", index: 1 } },
  { done: false, value: { string: "String", index: 1 } },
  { done: false, value: { string: "String ", index: 1 } },
  { done: false, value: { string: "String 2", index: 1 } },
  { done: false, value: { stringEnd: true } },
  { done: false, value: { string: "String 2", index: 1 } },
  { done: false, value: { string: "String ", index: 1 } },
  { done: false, value: { string: "String", index: 1 } },
  { done: false, value: { string: "Strin", index: 1 } },
  { done: false, value: { string: "Stri", index: 1 } },
  { done: false, value: { string: "Str", index: 1 } },
  { done: false, value: { string: "St", index: 1 } },
  { done: false, value: { string: "S", index: 1 } },
  { done: false, value: { string: "", index: 1 } },
  { done: false, value: { stringRewindEnd: true } },

  { done: false, value: { string: "S", index: 2 } },
  { done: false, value: { string: "St", index: 2 } },
  { done: false, value: { string: "Str", index: 2 } },
  { done: false, value: { string: "Stri", index: 2 } },
  { done: false, value: { string: "Strin", index: 2 } },
  { done: false, value: { string: "String", index: 2 } },
  { done: false, value: { string: "String ", index: 2 } },
  { done: false, value: { string: "String 3", index: 2 } },
  { done: false, value: { stringEnd: true } },
  { done: false, value: { string: "String 3", index: 2 } },
  { done: false, value: { string: "String ", index: 2 } },
  { done: false, value: { string: "String", index: 2 } },
  { done: false, value: { string: "Strin", index: 2 } },
  { done: false, value: { string: "Stri", index: 2 } },
  { done: false, value: { string: "Str", index: 2 } },
  { done: false, value: { string: "St", index: 2 } },
  { done: false, value: { string: "S", index: 2 } },
  { done: false, value: { string: "", index: 2 } },
  { done: false, value: { stringRewindEnd: true } },

  { done: true, value: undefined },
];

test("returned results for array of strings with rewindStringOnFinish option", () => {
  const gen = substringGeneratorForArray(strings, {
    rewindStringOnFinish: true,
  });
  expectedResultsWithUntyping.forEach((expRes) => {
    expect(gen.next()).toStrictEqual(expRes);
  });
});

test("returned results with string index < array.length", () => {
  const gen = substringGeneratorForArray(strings, { startAtString: 2 });
  expectedResults.slice(18).forEach((expRes) => {
    expect(gen.next()).toStrictEqual(expRes);
  });
});

test("returned results with string index < array.length with rewindStringOnFinish option", () => {
  const gen = substringGeneratorForArray(strings, {
    startAtString: 1,
    rewindStringOnFinish: true,
  });
  expectedResultsWithUntyping.slice(19).forEach((expRes) => {
    expect(gen.next()).toStrictEqual(expRes);
  });
});

test("returned results with string index > array.length", () => {
  const gen = substringGeneratorForArray(strings, { startAtString: 4 });
  expectedResults.forEach((expRes) => {
    expect(gen.next()).toStrictEqual(expRes);
  });
});

test("returned results with string index > array.length with rewindStringOnFinish option", () => {
  const gen = substringGeneratorForArray(strings, {
    startAtString: 5,
    rewindStringOnFinish: true,
  });
  expectedResultsWithUntyping.forEach((expRes) => {
    expect(gen.next()).toStrictEqual(expRes);
  });
});

test("returned results with empty strings array", () => {
  const gen = substringGeneratorForArray([]);
  expect(gen.next()).toStrictEqual({ done: true, value: undefined });
});
