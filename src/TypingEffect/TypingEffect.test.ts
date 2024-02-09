import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import { TypingEffect } from ".";

beforeEach(() => {
  vi.useFakeTimers({
    toFake: ["performance", "requestAnimationFrame"],
  });
});

afterAll(() => {
  vi.useRealTimers();
});

describe(`instance and running states with various strings and callback values`, () => {
  const cb = vi.fn();
  const strings = ["strings1", "strings2"];

  test.each([
    {
      description: "creating instance without arguments",
      callback: undefined,
      strings: undefined,
      expectedCallback: null,
      expectedStrings: [],
      expectedInstanceState: "initialized",
      expectedRunningState: "idle",
    },

    {
      description: "creating instance without strings",
      callback: cb,
      strings: undefined,
      expectedCallback: cb,
      expectedStrings: [],
      expectedInstanceState: "initialized",
      expectedRunningState: "idle",
    },

    {
      description: "creating instance without callback",
      callback: undefined,
      strings: strings,
      expectedCallback: null,
      expectedStrings: strings,
      expectedInstanceState: "initialized",
      expectedRunningState: "idle",
    },

    {
      description: "creating instance with emptyStrings",
      callback: undefined,
      strings: [],
      expectedCallback: null,
      expectedStrings: [],
      expectedInstanceState: "initialized",
      expectedRunningState: "idle",
    },

    {
      description: "creating instance with callback and emptyStrings",
      callback: cb,
      strings: [],
      expectedCallback: cb,
      expectedStrings: [],
      expectedInstanceState: "initialized",
      expectedRunningState: "idle",
    },

    {
      description: "creating instance with strings and callbakck",
      callback: cb,
      strings: strings,
      expectedCallback: cb,
      expectedStrings: strings,
      expectedInstanceState: "ready",
      expectedRunningState: "idle",
    },
  ])(
    `$description`,
    ({
      strings,
      callback,
      expectedStrings,
      expectedCallback,
      expectedInstanceState,
      expectedRunningState,
    }) => {
      const te = new TypingEffect(strings, callback);

      expect(te.strings).toEqual(expectedStrings);
      expect(te.callback).toEqual(expectedCallback);

      expect(te.instanceState).toBe(expectedInstanceState);
      expect(te.runningState).toBe(expectedRunningState);

      te.dispose();
    }
  );
});

test("default option values", () => {
  const te = new TypingEffect();

  expect(te.options).toEqual({
    typingDelay: 100,
    untypingDelay: 30,
    delayBeforeTyping: 1600,
    delayBeforeUntyping: 3000,
    untypeString: true,
    typingVariation: 100,
    showCursor: true,
    cursorSymbol: {
      typing: "|",
      untyping: "|",
      blinking: "|",
    },
    cursorBlinkRate: 500,
    loop: true,
  });

  te.dispose();
});

test("method calls on initialized instance", () => {
  const te = new TypingEffect();

  expect(() => te.start()).toThrowError(
    `The method "start" could not be called on the instance of TypingEffect - the current state "initialized" does not match the allowed states "running, ready". Provide the "strings" and "callback" arguments.`
  );
  expect(te.instanceState).toBe("initialized");
  expect(te.runningState).toBe("idle");

  expect(() => te.pause()).toThrowError(
    `The method "pause" could not be called on the instance of TypingEffect - the current state "initialized" does not match the allowed state "running". Provide the "strings" and "callback" arguments.`
  );
  expect(te.instanceState).toBe("initialized");
  expect(te.runningState).toBe("idle");

  expect(() => te.resume()).toThrowError(
    `The method "resume" could not be called on the instance of TypingEffect - the current state "initialized" does not match the allowed state "running". Provide the "strings" and "callback" arguments.`
  );
  expect(te.instanceState).toBe("initialized");
  expect(te.runningState).toBe("idle");

  expect(() => te.stop()).not.toThrow();
  expect(te.instanceState).toBe("initialized");
  expect(te.runningState).toBe("idle");

  expect(() => te.jumpTo()).toThrowError(
    `The method "jumpTo" could not be called on the instance of TypingEffect - the current state "initialized" does not match the allowed state "running". Provide the "strings" and "callback" arguments.`
  );
  expect(te.instanceState).toBe("initialized");
  expect(te.runningState).toBe("idle");

  expect(() => te.dispose()).not.toThrow();
  expect(te.instanceState).toBe("disposed");
  expect(te.runningState).toBe("idle");
});

test("tests all needs redo", () => {
  const cb = vi.fn();
  const TE = new TypingEffect(["Hello", "World"], cb, {
    typingVariation: 0,
  }).start();

  expect(TE.runningState).toBe(1);

  // delayBeforeTyping 1600ms, cursor blinkimg 500ms
  vi.advanceTimersByTime(512);
  expect(cb).toHaveBeenCalledTimes(1);
  expect(cb).toHaveBeenCalledWith("|");
  cb.mockClear();

  vi.advanceTimersByTime(512);
  expect(cb).toHaveBeenCalledTimes(1);
  expect(cb).toHaveBeenCalledWith("");
  cb.mockClear();

  vi.advanceTimersByTime(512);
  expect(cb).toHaveBeenCalledTimes(1);
  expect(cb).toHaveBeenCalledWith("|");
  cb.mockClear();

  // current time 1536, add to 1600
  vi.advanceTimersByTime(64);
  expect(performance.now()).toBe(1600);
  expect(cb).toHaveBeenCalledTimes(0);
  cb.mockClear();

  // typing Hello
  [..."Hello"].reduce((acc, letter, i) => {
    vi.advanceTimersByTime(112);
    expect(cb).toHaveBeenCalledTimes(1 + i);
    expect(cb).toHaveBeenNthCalledWith(1 + i, acc + letter + "|");
    return acc + letter;
  }, "");
  cb.mockClear();
  // last entry in typing to get stringEnd
  vi.advanceTimersByTime(112);
  expect(cb).toHaveBeenCalledTimes(0);
  cb.mockClear();
  expect(performance.now()).toBe(2272);

  // +16ms to get over afterTyping stage
  vi.advanceTimersByTime(16);
  expect(cb).toHaveBeenCalledTimes(0);
  cb.mockClear();
  expect(performance.now()).toBe(2288);

  // delayAfterTyping, delayBeforeUntyping 3000ms
  // (closest multiple of 16 - 3008) counts from 2272, so 3008 - 16 = 2992
  vi.advanceTimersByTime(16);
  expect(cb).toHaveBeenCalledTimes(1);
  expect(cb).toHaveBeenCalledWith("Hello");
  cb.mockClear();

  vi.advanceTimersByTime(512);
  expect(cb).toHaveBeenCalledTimes(1);
  expect(cb).toHaveBeenCalledWith("Hello|");
  cb.mockClear();

  vi.advanceTimersByTime(512);
  expect(cb).toHaveBeenCalledTimes(1);
  expect(cb).toHaveBeenCalledWith("Hello");
  cb.mockClear();

  vi.advanceTimersByTime(512);
  expect(cb).toHaveBeenCalledTimes(1);
  expect(cb).toHaveBeenCalledWith("Hello|");
  cb.mockClear();

  vi.advanceTimersByTime(512);
  expect(cb).toHaveBeenCalledTimes(1);
  expect(cb).toHaveBeenCalledWith("Hello");
  cb.mockClear();

  vi.advanceTimersByTime(512);
  expect(cb).toHaveBeenCalledTimes(1);
  expect(cb).toHaveBeenCalledWith("Hello|");
  cb.mockClear();

  expect(performance.now()).toBe(4864);
  // to get to the end of the stage add: 2992 - 16 - 5 * 512 = 416
  vi.advanceTimersByTime(416);
  expect(cb).toHaveBeenCalledTimes(0);
  cb.mockClear();

  // +16ms to get over beforeUntyping stage
  vi.advanceTimersByTime(16);
  expect(cb).toHaveBeenCalledTimes(0);
  cb.mockClear();
  expect(performance.now()).toBe(5296);

  // starting untyping stage
  vi.advanceTimersByTime(16);
  expect(cb).toHaveBeenCalledTimes(0);
  cb.mockClear();

  //  untyping Hello
  [..."Hello"].reduce((acc, _, i) => {
    vi.advanceTimersByTime(32);
    expect(cb).toHaveBeenCalledTimes(1 + i);
    const newAcc = acc.slice(0, acc.length - 1);
    expect(cb).toHaveBeenNthCalledWith(1 + i, newAcc + "|");
    return newAcc;
  }, "Hello");
  cb.mockClear();

  // getting in untyping stringRewindEnd
  vi.advanceTimersByTime(32);
  expect(cb).toHaveBeenCalledTimes(0);
  cb.mockClear();
  expect(performance.now()).toBe(5504);

  //   vi.advanceTimersByTime(16);
  //   expect(cb).toHaveBeenCalledTimes(0);

  vi.advanceTimersByTime(16);
  expect(cb).toHaveBeenCalledTimes(0);

  //   vi.advanceTimersByTime(112);
  //   expect(cb).toHaveBeenCalledTimes(1);
  //   expect(cb).toHaveBeenNthCalledWith(4, "H|");

  //   vi.advanceTimersByTime(112);
  //   expect(cb).toHaveBeenNthCalledWith(5, "He|");

  //   expect(cb).toHaveBeenNthCalledWith(4, "");
  //   expect(cb).toHaveBeenNthCalledWith(5, "|");
  //   expect(cb).toHaveBeenNthCalledWith(6, "");

  //   expect(cb).toHaveBeenNthCalledWith(7, "|");
  //   expect(cb).toHaveBeenNthCalledWith(8, "");
  //   expect(cb).toHaveBeenNthCalledWith(9, "|");
  //   expect(cb).toHaveBeenNthCalledWith(10, "");

  //   vi.advanceTimersToNextTimer()
  //     .advanceTimersToNextTimer()
  //     .advanceTimersToNextTimer()
  //     .advanceTimersToNextTimer();

  //   await vi.waitFor(
  //     async () => {
  //       //   console.log("hello");
  //       await expect(cb).toHaveBeenCalledTimes(333);
  //       //   await expect(cb).toHaveBeenNthCalledWith(42, "");
  //     },
  //     {
  //       timeout: 5000,
  //     }
  //   );

  //   expect(cb).toHaveBeenNthCalledWith(1, "|");
  //   expect(cb).toHaveBeenNthCalledWith(2, "");
  //   expect(cb).toHaveBeenCalledTimes(3);

  //   expect(2);
});
