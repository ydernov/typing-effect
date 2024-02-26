import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import { TypingEffect } from ".";
import type { TypingEffectOptions } from "./TypingEffect";
import { roundUpToSixteen } from "../utils/roundUpToSixteen";

const getDefaultOptions = () => ({
  cursorBlinkRate: 500,
  cursorSymbol: {
    blinking: "|",
    typing: "|",
    untyping: "|",
  },
  delayBeforeTyping: 1600,
  delayAfterTyping: 3000,
  loop: true,
  showCursor: true,
  typingDelay: 100,
  typingVariation: 100,
  untypeString: true,
  untypingDelay: 30,
});

describe(`setOptions method tests`, () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ["performance", "requestAnimationFrame"],
    }).clearAllTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  describe('calls when instanceState === "initialized", with and w/o "now" should produce the same result', () => {
    test.each([
      {
        useNow: false,
      },
      { useNow: true },
    ])(
      `with now === $useNow;
        - should merge options,
        - should not affect instanceState and runningState,
        - calling should return instance`,
      ({ useNow }) => {
        const strings = ["str1, str2"];
        const te = new TypingEffect(strings);
        const options: TypingEffectOptions = {
          loop: false,
          typingDelay: 50,
          untypeString: false,
          cursorSymbol: {
            blinking: "blink",
          },
        };

        const defaultOptions = getDefaultOptions();

        expect(te.options).toEqual(defaultOptions);
        expect(te.instanceState).toBe("initialized");
        expect(te.runningState).toBe("idle");

        expect(te.setOptions(options, useNow)).toBe(te);

        const expectedOptions = {
          ...defaultOptions,
          loop: false,
          typingDelay: 50,
          untypeString: false,
        };

        expectedOptions.cursorSymbol.blinking = "blink";

        expect(te.options).toEqual(expectedOptions);
        expect(te.options.cursorSymbol.typing).toEqual("|");
        expect(te.options.cursorSymbol.untyping).toEqual("|");

        expect(te.instanceState).toBe("initialized");
        expect(te.runningState).toBe("idle");
        te.dispose();
      }
    );

    test.each([
      {
        useNow: false,
      },
      { useNow: true },
    ])(
      `cuncurrent calls with now === $useNow;
        - should only use the last,
        - should merge options,
        - should not affect instanceState and runningState,
        - calling should return instance`,
      ({ useNow }) => {
        const strings = ["str1, str2"];
        const te = new TypingEffect(strings);

        const options1: TypingEffectOptions = {
          loop: false,
          typingDelay: 50,
          untypeString: false,
          cursorSymbol: {
            blinking: "blink",
          },
        };

        const options2: TypingEffectOptions = {
          loop: true,
          typingDelay: 500,
          cursorSymbol: {
            typing: "//",
          },
        };

        const options3: TypingEffectOptions = {
          typingVariation: 0,
          showCursor: false,
        };

        const defaultOptions = getDefaultOptions();

        expect(te.options).toEqual(defaultOptions);
        expect(te.instanceState).toBe("initialized");
        expect(te.runningState).toBe("idle");

        expect(
          te
            .setOptions(options1, useNow)
            .setOptions(options2, useNow)
            .setOptions(options3, useNow)
        ).toBe(te);

        const expectedOptions = {
          ...defaultOptions,
          ...options1,
          ...options2,
          ...options3,

          cursorSymbol: {
            blinking: "blink",
            typing: "//",
            untyping: "|",
          },
        };

        expect(te.options).toEqual(expectedOptions);
        expect(te.instanceState).toBe("initialized");
        expect(te.runningState).toBe("idle");

        te.dispose();
      }
    );
  });

  describe('calls when instanceState === "ready", with and w/o "now" should produce the same result', () => {
    test.each([
      {
        useNow: false,
      },
      { useNow: true },
    ])(
      `with now === $useNow;
        - should merge options,
        - should not affect instanceState and runningState,
        - calling should return instance`,
      ({ useNow }) => {
        const strings = ["str1, str2"];
        const te = new TypingEffect(strings, vi.fn());
        const options: TypingEffectOptions = {
          loop: false,
          typingDelay: 50,
          untypeString: false,
          cursorSymbol: {
            blinking: "blink",
          },
        };

        const defaultOptions = getDefaultOptions();

        expect(te.options).toEqual(defaultOptions);
        expect(te.instanceState).toBe("ready");
        expect(te.runningState).toBe("idle");

        expect(te.setOptions(options, useNow)).toBe(te);

        const expectedOptions = {
          ...defaultOptions,
          loop: false,
          typingDelay: 50,
          untypeString: false,
        };

        expectedOptions.cursorSymbol.blinking = "blink";

        expect(te.options).toEqual(expectedOptions);
        expect(te.options.cursorSymbol.typing).toEqual("|");
        expect(te.options.cursorSymbol.untyping).toEqual("|");

        expect(te.instanceState).toBe("ready");
        expect(te.runningState).toBe("idle");
        te.dispose();
      }
    );

    test.each([
      {
        useNow: false,
      },
      { useNow: true },
    ])(
      `cuncurrent calls with now === $useNow;
        - should only use the last,
        - should merge options,
        - should not affect instanceState and runningState,
        - calling should return instance`,
      ({ useNow }) => {
        const strings = ["str1, str2"];
        const te = new TypingEffect(strings, vi.fn());

        te.options.cursorSymbol.untyping = "44";

        const options1: TypingEffectOptions = {
          loop: false,
          typingDelay: 50,
          untypeString: false,
          cursorSymbol: {
            blinking: "blink",
          },
        };

        const options2: TypingEffectOptions = {
          loop: true,
          typingDelay: 500,
          cursorSymbol: {
            typing: "//",
          },
        };

        const options3: TypingEffectOptions = {
          typingVariation: 0,
          showCursor: false,
        };

        const defaultOptions = getDefaultOptions();

        expect(te.options).toEqual(defaultOptions);
        expect(te.instanceState).toBe("ready");
        expect(te.runningState).toBe("idle");

        expect(
          te
            .setOptions(options1, useNow)
            .setOptions(options2, useNow)
            .setOptions(options3, useNow)
        ).toBe(te);

        const expectedOptions = {
          ...defaultOptions,
          ...options1,
          ...options2,
          ...options3,

          cursorSymbol: {
            blinking: "blink",
            typing: "//",
            untyping: "|",
          },
        };

        expect(te.options).toEqual(expectedOptions);
        expect(te.instanceState).toBe("ready");
        expect(te.runningState).toBe("idle");

        te.dispose();
      }
    );
  });

  describe('calls when instanceState === "running"', () => {
    describe("set typingDelay and typingVariation during typing test cases", () => {
      test("scheduled set", () => {
        const strings = ["first", "second", "third"];
        const cb = vi.fn();
        const te = new TypingEffect(strings, cb, {
          untypeString: false,
          delayBeforeTyping: 0,
          delayAfterTyping: 0,
          showCursor: false,

          typingDelay: 0,
          typingVariation: 0,
        }).start();

        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * 3);
        expect(cb).toHaveBeenLastCalledWith("fir");
        te.setOptions({ typingDelay: 200, typingVariation: 40 });
        expect(te.options.typingDelay).toBe(0);
        expect(te.options.typingVariation).toBe(0);

        vi.advanceTimersByTime(16 * 2);
        expect(cb).toHaveBeenLastCalledWith("first");

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);

        expect(te.options.typingDelay).toBe(200);
        expect(te.options.typingVariation).toBe(40);

        cb.mockClear();

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        const mathRandomSpy = vi
          .spyOn(Math, "random")
          .mockReturnValueOnce(1)
          .mockReturnValueOnce(1)
          .mockReturnValueOnce(1)
          .mockReturnValueOnce(0.1);

        // typing delay of 200
        vi.advanceTimersByTime(roundUpToSixteen(200) - 16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(0);
        expect(cb).toHaveBeenCalledTimes(0);

        vi.advanceTimersByTime(16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(0);
        mathRandomSpy.mockClear();

        vi.advanceTimersByTime(16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(0);
        mathRandomSpy.mockClear();

        vi.advanceTimersByTime(16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith("s");
        mathRandomSpy.mockClear();
        cb.mockClear();

        // typing delay of 200
        vi.advanceTimersByTime(roundUpToSixteen(200) - 16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(0);
        expect(cb).toHaveBeenCalledTimes(0);

        vi.advanceTimersByTime(16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith("se");
        mathRandomSpy.mockClear();
        cb.mockClear();

        // typing delay of 200
        vi.advanceTimersByTime(roundUpToSixteen(200) - 16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(0);
        expect(cb).toHaveBeenCalledTimes(0);

        mathRandomSpy.mockReturnValueOnce(0.3);
        vi.advanceTimersByTime(16);
        // for cb to be called here mathRandomSpy must return value < 0.225
        // with rounding it gives typingVariation of 8, current timestamp is roundUpToSixteen(200) = 208
        // 208 - typingDelay = 8;
        // cb would be called untill 208 - typingDelay + typingVariation <= 16
        // but here typingVariation is 0.3 * 40 = 12 so 8 + 12 > 16 and cb is not called

        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(0);
        mathRandomSpy.mockClear();

        mathRandomSpy.mockReturnValueOnce(0.1);

        vi.advanceTimersByTime(16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith("sec");
        mathRandomSpy.mockClear();
        cb.mockClear();

        // typing delay of 200
        vi.advanceTimersByTime(roundUpToSixteen(200) - 16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(0);
        expect(cb).toHaveBeenCalledTimes(0);

        mathRandomSpy.mockReturnValueOnce(0.224);
        vi.advanceTimersByTime(16);
        // same as above, but here we meet the condidtion, so  cb is called

        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(1);
        mathRandomSpy.mockClear();

        vi.restoreAllMocks();
        te.dispose();
      });

      test('immediate set - with "now" === true', () => {
        const strings = ["first", "second", "third"];
        const cb = vi.fn();
        const te = new TypingEffect(strings, cb, {
          untypeString: false,
          delayBeforeTyping: 0,
          delayAfterTyping: 0,
          showCursor: false,

          typingDelay: 0,
          typingVariation: 0,
        }).start();

        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * 3);
        expect(cb).toHaveBeenLastCalledWith("fir");

        te.setOptions({ typingDelay: 300, typingVariation: 70 }, true);
        expect(te.options.typingDelay).toBe(300);
        expect(te.options.typingVariation).toBe(70);
        cb.mockClear();

        // string update timestamp
        expect(performance.now()).toBe(96);

        const mathRandomSpy = vi.spyOn(Math, "random");

        // typing delay of 300
        vi.advanceTimersByTime(roundUpToSixteen(300) - 16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(0);
        expect(cb).toHaveBeenCalledTimes(0);

        mathRandomSpy.mockReturnValueOnce(0.1);
        vi.advanceTimersByTime(16);
        // current timestamp
        expect(performance.now()).toBe(400);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        // string update timestamp + 300 = 396, typing variation 0.1 * 70 = 7
        // 396 + 7 > 400 so cb is not called here
        expect(cb).toHaveBeenCalledTimes(0);
        mathRandomSpy.mockClear();

        mathRandomSpy.mockReturnValueOnce(0.1);
        vi.advanceTimersByTime(16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith("firs");
        mathRandomSpy.mockClear();
        cb.mockClear();

        // typing delay of 300
        vi.advanceTimersByTime(roundUpToSixteen(300) - 16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(0);
        expect(cb).toHaveBeenCalledTimes(0);

        mathRandomSpy.mockReturnValueOnce(0.1);
        vi.advanceTimersByTime(16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(0);
        mathRandomSpy.mockClear();

        mathRandomSpy.mockReturnValueOnce(0.1);
        vi.advanceTimersByTime(16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith("first");
        mathRandomSpy.mockClear();
        cb.mockClear();

        te.setOptions({ typingDelay: 0, typingVariation: 200 }, true);
        expect(te.options.typingDelay).toBe(0);
        expect(te.options.typingVariation).toBe(200);

        // typing delay of 0, and end of string
        mathRandomSpy.mockReturnValueOnce(0);
        vi.advanceTimersByTime(16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(0);
        mathRandomSpy.mockClear();

        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        // typing delay of 0
        mathRandomSpy.mockReturnValueOnce(0.5);
        vi.advanceTimersByTime(16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(0);
        mathRandomSpy.mockClear();

        mathRandomSpy.mockReturnValueOnce(0.5);
        vi.advanceTimersByTime(16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(0);
        mathRandomSpy.mockClear();

        mathRandomSpy.mockReturnValueOnce(0.5);
        vi.advanceTimersByTime(16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(0);
        mathRandomSpy.mockClear();

        mathRandomSpy.mockReturnValueOnce(0.5);
        vi.advanceTimersByTime(16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(0);
        mathRandomSpy.mockClear();

        mathRandomSpy.mockReturnValueOnce(0.5);
        vi.advanceTimersByTime(16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(0);
        mathRandomSpy.mockClear();

        mathRandomSpy.mockReturnValueOnce(0.5);
        vi.advanceTimersByTime(16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(0);
        mathRandomSpy.mockClear();

        mathRandomSpy.mockReturnValueOnce(0.5);
        vi.advanceTimersByTime(16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith("s");
        mathRandomSpy.mockClear();
        cb.mockClear();

        mathRandomSpy.mockReturnValueOnce(0.1);
        vi.advanceTimersByTime(16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(0);
        mathRandomSpy.mockClear();

        mathRandomSpy.mockReturnValueOnce(0.1);
        vi.advanceTimersByTime(16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith("se");
        mathRandomSpy.mockClear();
        cb.mockClear();

        vi.restoreAllMocks();
        te.dispose();
      });

      test("concurrent scheduled set", () => {
        const strings = ["first", "second", "third"];
        const cb = vi.fn();
        const te = new TypingEffect(strings, cb, {
          untypeString: false,
          delayBeforeTyping: 0,
          delayAfterTyping: 0,
          showCursor: false,

          typingDelay: 0,
          typingVariation: 0,
        }).start();

        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * 3);
        expect(cb).toHaveBeenLastCalledWith("fir");
        te.setOptions({ typingDelay: 200, typingVariation: 40 })
          .setOptions({
            typingDelay: 500,
            typingVariation: 10,
          })
          .setOptions({ typingDelay: 100, typingVariation: 100 });
        expect(te.options.typingDelay).toBe(0);
        expect(te.options.typingVariation).toBe(0);

        vi.advanceTimersByTime(16 * 2);
        expect(cb).toHaveBeenLastCalledWith("first");

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);

        expect(te.options.typingDelay).toBe(100);
        expect(te.options.typingVariation).toBe(100);

        cb.mockClear();

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        const mathRandomSpy = vi.spyOn(Math, "random");

        // typing delay of 100
        vi.advanceTimersByTime(roundUpToSixteen(100) - 16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(0);
        expect(cb).toHaveBeenCalledTimes(0);

        mathRandomSpy.mockReturnValueOnce(1);
        vi.advanceTimersByTime(16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(0);
        mathRandomSpy.mockClear();

        mathRandomSpy.mockReturnValueOnce(1);
        vi.advanceTimersByTime(16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(0);
        mathRandomSpy.mockClear();

        mathRandomSpy.mockReturnValueOnce(0.5);
        vi.advanceTimersByTime(16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(0);
        mathRandomSpy.mockClear();

        mathRandomSpy.mockReturnValueOnce(0.5);
        vi.advanceTimersByTime(16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith("s");
        mathRandomSpy.mockClear();
        cb.mockClear();

        // typing delay of 100
        vi.advanceTimersByTime(roundUpToSixteen(100) - 16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(0);
        expect(cb).toHaveBeenCalledTimes(0);

        mathRandomSpy.mockReturnValueOnce(0.1);
        vi.advanceTimersByTime(16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith("se");
        mathRandomSpy.mockClear();
        cb.mockClear();

        // typing delay of 100
        vi.advanceTimersByTime(roundUpToSixteen(100) - 16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(0);
        expect(cb).toHaveBeenCalledTimes(0);

        mathRandomSpy.mockReturnValueOnce(0.3);
        vi.advanceTimersByTime(16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(0);
        mathRandomSpy.mockClear();

        mathRandomSpy.mockReturnValueOnce(0.1);

        vi.advanceTimersByTime(16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith("sec");
        mathRandomSpy.mockClear();
        cb.mockClear();

        // typing delay of 100
        vi.advanceTimersByTime(roundUpToSixteen(100) - 16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(0);
        expect(cb).toHaveBeenCalledTimes(0);

        mathRandomSpy.mockReturnValueOnce(0.3);
        vi.advanceTimersByTime(16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(0);
        mathRandomSpy.mockClear();

        mathRandomSpy.mockReturnValueOnce(0.2);
        vi.advanceTimersByTime(16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith("seco");
        mathRandomSpy.mockClear();

        vi.restoreAllMocks();
        te.dispose();
      });

      test('concurrent immediate set - with "now" === true', () => {
        const strings = ["first", "second", "third"];
        const cb = vi.fn();
        const te = new TypingEffect(strings, cb, {
          untypeString: false,
          delayBeforeTyping: 0,
          delayAfterTyping: 0,
          showCursor: false,

          typingDelay: 0,
          typingVariation: 0,
        }).start();

        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * 3);
        expect(cb).toHaveBeenLastCalledWith("fir");

        te.setOptions({ typingDelay: 120, typingVariation: 120 }, true)
          .setOptions({ typingDelay: 30, typingVariation: 700 }, true)
          .setOptions({ typingDelay: 300, typingVariation: 70 }, true);
        expect(te.options.typingDelay).toBe(300);
        expect(te.options.typingVariation).toBe(70);
        cb.mockClear();

        // string update timestamp
        expect(performance.now()).toBe(96);

        const mathRandomSpy = vi.spyOn(Math, "random");

        // typing delay of 300
        vi.advanceTimersByTime(roundUpToSixteen(300) - 16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(0);
        expect(cb).toHaveBeenCalledTimes(0);

        mathRandomSpy.mockReturnValueOnce(0.1);
        vi.advanceTimersByTime(16);
        // current timestamp
        expect(performance.now()).toBe(400);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        // string update timestamp + 300 = 396, typing variation 0.1 * 70 = 7
        // 396 + 7 > 400 so cb is not called here
        expect(cb).toHaveBeenCalledTimes(0);
        mathRandomSpy.mockClear();

        mathRandomSpy.mockReturnValueOnce(0.1);
        vi.advanceTimersByTime(16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith("firs");
        mathRandomSpy.mockClear();
        cb.mockClear();

        // typing delay of 300
        vi.advanceTimersByTime(roundUpToSixteen(300) - 16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(0);
        expect(cb).toHaveBeenCalledTimes(0);

        mathRandomSpy.mockReturnValueOnce(0.1);
        vi.advanceTimersByTime(16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(0);
        mathRandomSpy.mockClear();

        mathRandomSpy.mockReturnValueOnce(0.1);
        vi.advanceTimersByTime(16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith("first");
        mathRandomSpy.mockClear();
        cb.mockClear();

        te.setOptions({ typingDelay: 200, typingVariation: 155 }, true)
          .setOptions({ typingDelay: 40, typingVariation: 60 }, true)
          .setOptions({ typingDelay: 0, typingVariation: 200 }, true);
        expect(te.options.typingDelay).toBe(0);
        expect(te.options.typingVariation).toBe(200);

        // typing delay of 0, and end of string
        mathRandomSpy.mockReturnValueOnce(0);
        vi.advanceTimersByTime(16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(0);
        mathRandomSpy.mockClear();

        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        // typing delay of 0
        mathRandomSpy.mockReturnValueOnce(0.5);
        vi.advanceTimersByTime(16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(0);
        mathRandomSpy.mockClear();

        mathRandomSpy.mockReturnValueOnce(0.5);
        vi.advanceTimersByTime(16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(0);
        mathRandomSpy.mockClear();

        mathRandomSpy.mockReturnValueOnce(0.5);
        vi.advanceTimersByTime(16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(0);
        mathRandomSpy.mockClear();

        mathRandomSpy.mockReturnValueOnce(0.5);
        vi.advanceTimersByTime(16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(0);
        mathRandomSpy.mockClear();

        mathRandomSpy.mockReturnValueOnce(0.5);
        vi.advanceTimersByTime(16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(0);
        mathRandomSpy.mockClear();

        mathRandomSpy.mockReturnValueOnce(0.5);
        vi.advanceTimersByTime(16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(0);
        mathRandomSpy.mockClear();

        mathRandomSpy.mockReturnValueOnce(0.5);
        vi.advanceTimersByTime(16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith("s");
        mathRandomSpy.mockClear();
        cb.mockClear();

        mathRandomSpy.mockReturnValueOnce(0.1);
        vi.advanceTimersByTime(16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(0);
        mathRandomSpy.mockClear();

        mathRandomSpy.mockReturnValueOnce(0.1);
        vi.advanceTimersByTime(16);
        expect(mathRandomSpy).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith("se");
        mathRandomSpy.mockClear();
        cb.mockClear();

        vi.restoreAllMocks();
        te.dispose();
      });
    });

    describe("set untypingDelay during untyping test cases", () => {
      test("scheduled set", () => {
        const strings = ["first", "second", "third"];
        const cb = vi.fn();
        const te = new TypingEffect(strings, cb, {
          delayBeforeTyping: 0,
          delayAfterTyping: 0,
          showCursor: false,
          typingDelay: 0,
          typingVariation: 0,
          untypingDelay: 0,
        }).start();

        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * "first".length);
        expect(cb).toHaveBeenLastCalledWith("first");
        cb.mockClear();

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeUntyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("untyping");
        vi.advanceTimersByTime(16);

        vi.advanceTimersByTime(16 * 3);
        expect(cb).toHaveBeenLastCalledWith("fi");

        te.setOptions({ untypingDelay: 200 });
        expect(te.options.untypingDelay).toBe(0);

        vi.advanceTimersByTime(16 * 2);
        expect(cb).toHaveBeenLastCalledWith("");

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterUntyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);

        expect(te.options.untypingDelay).toBe(200);

        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * "second".length);
        expect(cb).toHaveBeenLastCalledWith("second");
        cb.mockClear();

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeUntyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("untyping");

        vi.advanceTimersByTime(roundUpToSixteen(200));
        expect(cb).toHaveBeenCalledTimes(0);

        vi.advanceTimersByTime(roundUpToSixteen(200));
        expect(cb).toHaveBeenLastCalledWith("secon");
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(200));
        expect(cb).toHaveBeenLastCalledWith("seco");
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(200));
        expect(cb).toHaveBeenLastCalledWith("sec");
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(200));
        expect(cb).toHaveBeenLastCalledWith("se");
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(200));
        expect(cb).toHaveBeenLastCalledWith("s");
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(200));
        expect(cb).toHaveBeenLastCalledWith("");
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(200));
        expect(cb).toHaveBeenCalledTimes(0);
        cb.mockClear();
        expect(te.runningState).toBe("afterUntyping");

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("cycleStart");

        te.dispose();
      });
      test('immediate set - with "now" === true', () => {
        const strings = ["first", "second", "third"];
        const cb = vi.fn();
        const te = new TypingEffect(strings, cb, {
          delayBeforeTyping: 0,
          delayAfterTyping: 0,
          showCursor: false,
          typingDelay: 0,
          typingVariation: 0,
          untypingDelay: 0,
        }).start();

        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * "first".length);
        expect(cb).toHaveBeenLastCalledWith("first");
        cb.mockClear();

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeUntyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("untyping");
        vi.advanceTimersByTime(16);

        vi.advanceTimersByTime(16 * 3);
        expect(cb).toHaveBeenLastCalledWith("fi");
        cb.mockClear();

        te.setOptions({ untypingDelay: 200 }, true);
        expect(te.options.untypingDelay).toBe(200);

        vi.advanceTimersByTime(roundUpToSixteen(200));
        expect(cb).toHaveBeenLastCalledWith("f");
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(200));
        expect(cb).toHaveBeenLastCalledWith("");
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(200));
        expect(cb).toHaveBeenCalledTimes(0);
        cb.mockClear();

        expect(te.runningState).toBe("afterUntyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * "second".length);
        expect(cb).toHaveBeenLastCalledWith("second");
        cb.mockClear();

        te.setOptions({ untypingDelay: 100 }, true);
        expect(te.options.untypingDelay).toBe(100);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeUntyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("untyping");

        vi.advanceTimersByTime(roundUpToSixteen(100));
        expect(cb).toHaveBeenCalledTimes(0);

        vi.advanceTimersByTime(roundUpToSixteen(100));
        expect(cb).toHaveBeenLastCalledWith("secon");
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(100));
        expect(cb).toHaveBeenLastCalledWith("seco");
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(100));
        expect(cb).toHaveBeenLastCalledWith("sec");
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        te.setOptions({ untypingDelay: 500 }, true);
        expect(te.options.untypingDelay).toBe(500);

        vi.advanceTimersByTime(roundUpToSixteen(500));
        expect(cb).toHaveBeenLastCalledWith("se");
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(500));
        expect(cb).toHaveBeenLastCalledWith("s");
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(500));
        expect(cb).toHaveBeenLastCalledWith("");
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(500));
        expect(cb).toHaveBeenCalledTimes(0);
        cb.mockClear();
        expect(te.runningState).toBe("afterUntyping");

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("cycleStart");

        te.dispose();
      });
      test("concurrent scheduled set", () => {
        const strings = ["first", "second", "third"];
        const cb = vi.fn();
        const te = new TypingEffect(strings, cb, {
          delayBeforeTyping: 0,
          delayAfterTyping: 0,
          showCursor: false,
          typingDelay: 0,
          typingVariation: 0,
          untypingDelay: 0,
        }).start();

        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * "first".length);
        expect(cb).toHaveBeenLastCalledWith("first");
        cb.mockClear();

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeUntyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("untyping");
        vi.advanceTimersByTime(16);

        vi.advanceTimersByTime(16 * 3);
        expect(cb).toHaveBeenLastCalledWith("fi");

        te.setOptions({ untypingDelay: 400 })
          .setOptions({ untypingDelay: 100 })
          .setOptions({ untypingDelay: 200 });
        expect(te.options.untypingDelay).toBe(0);

        vi.advanceTimersByTime(16 * 2);
        expect(cb).toHaveBeenLastCalledWith("");

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterUntyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);

        expect(te.options.untypingDelay).toBe(200);

        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * "second".length);
        expect(cb).toHaveBeenLastCalledWith("second");
        cb.mockClear();

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeUntyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("untyping");

        vi.advanceTimersByTime(roundUpToSixteen(200));
        expect(cb).toHaveBeenCalledTimes(0);

        vi.advanceTimersByTime(roundUpToSixteen(200));
        expect(cb).toHaveBeenLastCalledWith("secon");
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(200));
        expect(cb).toHaveBeenLastCalledWith("seco");
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(200));
        expect(cb).toHaveBeenLastCalledWith("sec");
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(200));
        expect(cb).toHaveBeenLastCalledWith("se");
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(200));
        expect(cb).toHaveBeenLastCalledWith("s");
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(200));
        expect(cb).toHaveBeenLastCalledWith("");
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(200));
        expect(cb).toHaveBeenCalledTimes(0);
        cb.mockClear();
        expect(te.runningState).toBe("afterUntyping");

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("cycleStart");

        te.dispose();
      });
      test('concurrent immediate set - with "now" === true', () => {
        const strings = ["first", "second", "third"];
        const cb = vi.fn();
        const te = new TypingEffect(strings, cb, {
          delayBeforeTyping: 0,
          delayAfterTyping: 0,
          showCursor: false,
          typingDelay: 0,
          typingVariation: 0,
          untypingDelay: 0,
        }).start();

        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * "first".length);
        expect(cb).toHaveBeenLastCalledWith("first");
        cb.mockClear();

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeUntyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("untyping");
        vi.advanceTimersByTime(16);

        vi.advanceTimersByTime(16 * 3);
        expect(cb).toHaveBeenLastCalledWith("fi");
        cb.mockClear();

        te.setOptions({ untypingDelay: 500 }, true)
          .setOptions({ untypingDelay: 0 }, true)
          .setOptions({ untypingDelay: 200 }, true);
        expect(te.options.untypingDelay).toBe(200);

        vi.advanceTimersByTime(roundUpToSixteen(200));
        expect(cb).toHaveBeenLastCalledWith("f");
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(200));
        expect(cb).toHaveBeenLastCalledWith("");
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(200));
        expect(cb).toHaveBeenCalledTimes(0);
        cb.mockClear();

        expect(te.runningState).toBe("afterUntyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * "second".length);
        expect(cb).toHaveBeenLastCalledWith("second");
        cb.mockClear();

        te.setOptions({ untypingDelay: 600 }, true)
          .setOptions({ untypingDelay: 1000 }, true)
          .setOptions({ untypingDelay: 100 }, true);
        expect(te.options.untypingDelay).toBe(100);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeUntyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("untyping");

        vi.advanceTimersByTime(roundUpToSixteen(100));
        expect(cb).toHaveBeenCalledTimes(0);

        vi.advanceTimersByTime(roundUpToSixteen(100));
        expect(cb).toHaveBeenLastCalledWith("secon");
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(100));
        expect(cb).toHaveBeenLastCalledWith("seco");
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(100));
        expect(cb).toHaveBeenLastCalledWith("sec");
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        te.setOptions({ untypingDelay: 5 }, true)
          .setOptions({ untypingDelay: 50 }, true)
          .setOptions({ untypingDelay: 500 }, true);
        expect(te.options.untypingDelay).toBe(500);

        vi.advanceTimersByTime(roundUpToSixteen(500));
        expect(cb).toHaveBeenLastCalledWith("se");
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(500));
        expect(cb).toHaveBeenLastCalledWith("s");
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(500));
        expect(cb).toHaveBeenLastCalledWith("");
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(500));
        expect(cb).toHaveBeenCalledTimes(0);
        cb.mockClear();
        expect(te.runningState).toBe("afterUntyping");

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("cycleStart");

        te.dispose();
      });
    });

    describe("set delayBeforeTyping during delayBeforeTyping test cases", () => {
      test("scheduled set", () => {
        const strings = ["first", "second", "third"];
        const cb = vi.fn();
        const te = new TypingEffect(strings, cb, {
          delayBeforeTyping: 0,
          delayAfterTyping: 0,
          showCursor: false,
          typingDelay: 0,
          typingVariation: 0,
          untypeString: false,
        }).start();

        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");

        te.setOptions({ delayBeforeTyping: 1000 });
        expect(te.options.delayBeforeTyping).toBe(0);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * strings[0]!.length);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);

        expect(te.runningState).toBe("delayBeforeTyping");
        expect(te.options.delayBeforeTyping).toBe(1000);

        vi.advanceTimersByTime(roundUpToSixteen(1000) - 16);
        expect(te.runningState).toBe("delayBeforeTyping");

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        te.dispose();
      });
      test('immediate set - with "now" === true', () => {
        const strings = ["first", "second", "third"];
        const cb = vi.fn();
        const te = new TypingEffect(strings, cb, {
          delayBeforeTyping: 0,
          delayAfterTyping: 0,
          showCursor: false,
          typingDelay: 0,
          typingVariation: 0,
          untypeString: false,
        }).start();

        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");

        te.setOptions({ delayBeforeTyping: 1000 }, true);
        expect(te.options.delayBeforeTyping).toBe(1000);

        vi.advanceTimersByTime(roundUpToSixteen(1000) - 16);
        expect(te.runningState).toBe("delayBeforeTyping");

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * strings[0]!.length);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);

        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(roundUpToSixteen(1000));

        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * strings[1]!.length);

        te.setOptions({ delayBeforeTyping: 66 }, true);
        expect(te.options.delayBeforeTyping).toBe(66);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");

        vi.advanceTimersByTime(roundUpToSixteen(66) - 16);
        expect(te.runningState).toBe("delayBeforeTyping");

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        te.dispose();
      });
      test("concurrent scheduled set", () => {
        const strings = ["first", "second", "third"];
        const cb = vi.fn();
        const te = new TypingEffect(strings, cb, {
          delayBeforeTyping: 0,
          delayAfterTyping: 0,
          showCursor: false,
          typingDelay: 0,
          typingVariation: 0,
          untypeString: false,
        }).start();

        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");

        te.setOptions({ delayBeforeTyping: 100 })
          .setOptions({ delayBeforeTyping: 10 })
          .setOptions({ delayBeforeTyping: 1000 });
        expect(te.options.delayBeforeTyping).toBe(0);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * strings[0]!.length);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);

        expect(te.runningState).toBe("delayBeforeTyping");
        expect(te.options.delayBeforeTyping).toBe(1000);

        vi.advanceTimersByTime(roundUpToSixteen(1000) - 16);
        expect(te.runningState).toBe("delayBeforeTyping");

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        te.dispose();
      });
      test('concurrent immediate set - with "now" === true', () => {
        const strings = ["first", "second", "third"];
        const cb = vi.fn();
        const te = new TypingEffect(strings, cb, {
          delayBeforeTyping: 0,
          delayAfterTyping: 0,
          showCursor: false,
          typingDelay: 0,
          typingVariation: 0,
          untypeString: false,
        }).start();

        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");

        te.setOptions({ delayBeforeTyping: 100 }, true)
          .setOptions({ delayBeforeTyping: 2000 }, true)
          .setOptions({ delayBeforeTyping: 1000 }, true);
        expect(te.options.delayBeforeTyping).toBe(1000);

        vi.advanceTimersByTime(roundUpToSixteen(1000) - 16);
        expect(te.runningState).toBe("delayBeforeTyping");

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * strings[0]!.length);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);

        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(roundUpToSixteen(1000));

        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * strings[1]!.length);

        te.setOptions({ delayBeforeTyping: 0 }, true)
          .setOptions({ delayBeforeTyping: 250 }, true)
          .setOptions({ delayBeforeTyping: 66 }, true);
        expect(te.options.delayBeforeTyping).toBe(66);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");

        vi.advanceTimersByTime(roundUpToSixteen(66) - 16);
        expect(te.runningState).toBe("delayBeforeTyping");

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        te.dispose();
      });
    });

    describe("set delayAfterTyping during delayAfterTyping test cases", () => {
      test("scheduled set", () => {
        const strings = ["first", "second", "third"];
        const cb = vi.fn();
        const te = new TypingEffect(strings, cb, {
          delayBeforeTyping: 0,
          delayAfterTyping: 0,
          showCursor: false,
          typingDelay: 0,
          typingVariation: 0,
          untypeString: false,
        }).start();

        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * strings[0]!.length);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");

        te.setOptions({ delayAfterTyping: 1000 });
        expect(te.options.delayAfterTyping).toBe(0);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);

        expect(te.options.delayAfterTyping).toBe(1000);

        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * strings[1]!.length);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");

        vi.advanceTimersByTime(roundUpToSixteen(1000) - 16);
        expect(te.runningState).toBe("delayAfterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("cycleStart");

        te.dispose();
      });
      test('immediate set - with "now" === true', () => {
        const strings = ["first", "second", "third"];
        const cb = vi.fn();
        const te = new TypingEffect(strings, cb, {
          delayBeforeTyping: 0,
          delayAfterTyping: 0,
          showCursor: false,
          typingDelay: 0,
          typingVariation: 0,
          untypeString: false,
        }).start();

        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * strings[0]!.length);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);

        te.setOptions({ delayAfterTyping: 1000 }, true);
        expect(te.options.delayAfterTyping).toBe(1000);

        vi.advanceTimersByTime(roundUpToSixteen(1000) - 16);

        expect(te.runningState).toBe("delayAfterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * strings[1]!.length);

        te.setOptions({ delayAfterTyping: 66 }, true);
        expect(te.options.delayAfterTyping).toBe(66);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");

        vi.advanceTimersByTime(roundUpToSixteen(66) - 16);
        expect(te.runningState).toBe("delayAfterTyping");

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        te.dispose();
      });
      test("concurrent scheduled set", () => {
        const strings = ["first", "second", "third"];
        const cb = vi.fn();
        const te = new TypingEffect(strings, cb, {
          delayBeforeTyping: 0,
          delayAfterTyping: 0,
          showCursor: false,
          typingDelay: 0,
          typingVariation: 0,
          untypeString: false,
        }).start();

        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * strings[0]!.length);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");

        te.setOptions({ delayAfterTyping: 100 })
          .setOptions({ delayAfterTyping: 10 })
          .setOptions({ delayAfterTyping: 1000 });
        expect(te.options.delayAfterTyping).toBe(0);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);

        expect(te.options.delayAfterTyping).toBe(1000);

        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * strings[1]!.length);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");

        vi.advanceTimersByTime(roundUpToSixteen(1000) - 16);
        expect(te.runningState).toBe("delayAfterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("cycleStart");

        te.dispose();
      });
      test('concurrent immediate set - with "now" === true', () => {
        const strings = ["first", "second", "third"];
        const cb = vi.fn();
        const te = new TypingEffect(strings, cb, {
          delayBeforeTyping: 0,
          delayAfterTyping: 0,
          showCursor: false,
          typingDelay: 0,
          typingVariation: 0,
          untypeString: false,
        }).start();

        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * strings[0]!.length);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);

        te.setOptions({ delayAfterTyping: 100 }, true)
          .setOptions({ delayAfterTyping: 2000 }, true)
          .setOptions({ delayAfterTyping: 1000 }, true);
        expect(te.options.delayAfterTyping).toBe(1000);

        vi.advanceTimersByTime(roundUpToSixteen(1000) - 16);

        expect(te.runningState).toBe("delayAfterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * strings[1]!.length);

        te.setOptions({ delayAfterTyping: 0 }, true)
          .setOptions({ delayAfterTyping: 250 }, true)
          .setOptions({ delayAfterTyping: 66 }, true);
        expect(te.options.delayAfterTyping).toBe(66);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");

        vi.advanceTimersByTime(roundUpToSixteen(66) - 16);
        expect(te.runningState).toBe("delayAfterTyping");

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        te.dispose();
      });
    });

    describe("set untypeString test cases, resets iterator", () => {
      test("scheduled set", () => {
        const strings = ["first", "second", "third"];
        const cb = vi.fn();
        const te = new TypingEffect(strings, cb, {
          delayBeforeTyping: 0,
          delayAfterTyping: 0,
          showCursor: false,
          typingDelay: 0,
          typingVariation: 0,
          untypingDelay: 0,
        }).start();

        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * strings[0]!.length);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeUntyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("untyping");
        vi.advanceTimersByTime(16);

        te.setOptions({ untypeString: false });
        expect(te.options.untypeString).toBe(true);
        vi.advanceTimersByTime(16 * strings[0]!.length);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterUntyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.options.untypeString).toBe(false);

        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        // go back to string 1
        vi.advanceTimersByTime(16 * strings[0]!.length);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");
        vi.advanceTimersByTime(16);

        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * strings[1]!.length);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("cycleStart");

        te.dispose();
      });

      test('immediate set - with "now" === true', () => {
        const strings = ["first", "second", "third"];
        const cb = vi.fn();
        const te = new TypingEffect(strings, cb, {
          delayBeforeTyping: 0,
          delayAfterTyping: 0,
          showCursor: false,
          typingDelay: 0,
          typingVariation: 0,
          untypingDelay: 0,
        }).start();

        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * strings[0]!.length);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeUntyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("untyping");
        vi.advanceTimersByTime(16);

        te.setOptions({ untypeString: false }, true);
        expect(te.options.untypeString).toBe(false);

        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * strings[0]!.length);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");
        vi.advanceTimersByTime(16);

        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * strings[1]!.length);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");

        te.setOptions({ untypeString: true }, true);
        expect(te.options.untypeString).toBe(true);

        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * strings[0]!.length);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeUntyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("untyping");

        te.dispose();
      });

      test("concurrent scheduled set", () => {
        const strings = ["first", "second", "third"];
        const cb = vi.fn();
        const te = new TypingEffect(strings, cb, {
          delayBeforeTyping: 0,
          delayAfterTyping: 0,
          showCursor: false,
          typingDelay: 0,
          typingVariation: 0,
          untypingDelay: 0,
        }).start();

        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * strings[0]!.length);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeUntyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("untyping");
        vi.advanceTimersByTime(16);

        te.setOptions({ untypeString: undefined })
          .setOptions({ untypeString: true })
          .setOptions({ untypeString: false });
        expect(te.options.untypeString).toBe(true);
        vi.advanceTimersByTime(16 * strings[0]!.length);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterUntyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.options.untypeString).toBe(false);

        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        // go back to string 1
        vi.advanceTimersByTime(16 * strings[0]!.length);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");
        vi.advanceTimersByTime(16);

        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * strings[1]!.length);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("cycleStart");

        te.dispose();
      });

      test('concurrent immediate set - with "now" === true', () => {
        const strings = ["first", "second", "third"];
        const cb = vi.fn();
        const te = new TypingEffect(strings, cb, {
          delayBeforeTyping: 0,
          delayAfterTyping: 0,
          showCursor: false,
          typingDelay: 0,
          typingVariation: 0,
          untypingDelay: 0,
        }).start();

        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * strings[0]!.length);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeUntyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("untyping");
        vi.advanceTimersByTime(16);

        te.setOptions({ untypeString: undefined }, true)
          .setOptions({ untypeString: true }, true)
          .setOptions({ untypeString: false }, true);
        expect(te.options.untypeString).toBe(false);

        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * strings[0]!.length);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");
        vi.advanceTimersByTime(16);

        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * strings[1]!.length);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");

        te.setOptions({ untypeString: false }, true)
          .setOptions({ untypeString: undefined }, true)
          .setOptions({ untypeString: true }, true);
        expect(te.options.untypeString).toBe(true);

        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * strings[0]!.length);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeUntyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("untyping");

        te.dispose();
      });

      test("setting to the same value should not reset iterator", () => {
        const strings = ["first", "second", "third"];
        const cb = vi.fn();
        const te = new TypingEffect(strings, cb, {
          delayBeforeTyping: 0,
          delayAfterTyping: 0,
          showCursor: false,
          typingDelay: 0,
          typingVariation: 0,
          untypingDelay: 0,
        }).start();

        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * strings[0]!.length);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeUntyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("untyping");
        vi.advanceTimersByTime(16);

        expect(te.options.untypeString).toBe(true);
        te.setOptions({ untypeString: true }, true);
        expect(te.options.untypeString).toBe(true);

        expect(te.runningState).toBe("untyping");
        vi.advanceTimersByTime(16 * strings[0]!.length);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterUntyping");
        vi.advanceTimersByTime(16);

        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * strings[1]!.length);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeUntyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("untyping");

        te.dispose();
      });
    });

    describe("set showCursor and cursorSymbol test cases", () => {
      test.each([
        {
          cursorSymbol: "$",
          desc: "string $",
          expected: {
            typing: "$",
            untyping: "$",
            blinking: "$",
          },
        },
        {
          cursorSymbol: {
            typing: " @type/",
            untyping: " @untype/",
            blinking: " @blink/",
          },
          desc: "object { typing: type, untyping: untype, blinking: blink }",
          expected: {
            typing: " @type/",
            untyping: " @untype/",
            blinking: " @blink/",
          },
        },
      ])(
        `scheduled set with cursorSymbol === $desc`,
        ({ cursorSymbol, expected }) => {
          const strings = ["first", "second", "third"];
          const cb = vi.fn();
          const te = new TypingEffect(strings, cb, {
            delayBeforeTyping: 1200,
            delayAfterTyping: 1200,
            showCursor: false,
            typingDelay: 0,
            typingVariation: 0,
            untypingDelay: 0,
          }).start();

          expect(te.runningState).toBe("cycleStart");
          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("delayBeforeTyping");
          vi.advanceTimersByTime(roundUpToSixteen(1200));
          // no blinking because showCursor is false
          expect(cb).toHaveBeenCalledTimes(0);
          cb.mockClear();

          expect(te.runningState).toBe("beforeTyping");
          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("typing");

          vi.advanceTimersByTime(16 * strings[0]!.length);
          expect(cb).toHaveBeenLastCalledWith(strings[0]);
          cb.mockClear();

          te.setOptions({ showCursor: true, cursorSymbol: cursorSymbol });
          expect(te.options.showCursor).toBe(false);
          expect(te.options.cursorSymbol.typing).toBe("|");
          expect(te.options.cursorSymbol.untyping).toBe("|");
          expect(te.options.cursorSymbol.blinking).toBe("|");

          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("afterTyping");
          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("delayAfterTyping");

          vi.advanceTimersByTime(roundUpToSixteen(1200));
          // no blinking because showCursor is false
          expect(cb).toHaveBeenCalledTimes(0);
          cb.mockClear();

          expect(te.runningState).toBe("beforeUntyping");
          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("untyping");
          vi.advanceTimersByTime(16);

          te.pause();
          expect(te.runningState).toBe("idle");
          vi.advanceTimersByTime(roundUpToSixteen(1200));
          // no blinking because showCursor is false
          expect(cb).toHaveBeenCalledTimes(0);
          expect(te.runningState).toBe("idle");
          cb.mockClear();
          te.resume();

          vi.advanceTimersByTime(16 * strings[0]!.length);
          expect(cb).toHaveBeenLastCalledWith("");
          cb.mockClear();

          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("afterUntyping");

          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("cycleStart");
          vi.advanceTimersByTime(16);

          expect(te.options.showCursor).toBe(true);
          expect(te.options.cursorSymbol.typing).toBe(expected.typing);
          expect(te.options.cursorSymbol.untyping).toBe(expected.untyping);
          expect(te.options.cursorSymbol.blinking).toBe(expected.blinking);

          expect(te.runningState).toBe("delayBeforeTyping");
          vi.advanceTimersByTime(roundUpToSixteen(1200));
          // twice here because blinking starts w/o cursor
          // previous string state was empty string, thus 1st callback call here is ignored
          expect(cb).toHaveBeenCalledTimes(2);
          expect(cb).toHaveBeenNthCalledWith(1, expected.blinking);
          expect(cb).toHaveBeenNthCalledWith(2, "");
          cb.mockClear();

          expect(te.runningState).toBe("beforeTyping");
          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("typing");

          vi.advanceTimersByTime(16 * strings[1]!.length);
          expect(cb).toHaveBeenLastCalledWith(strings[1] + expected.typing);
          cb.mockClear();

          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("afterTyping");
          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("delayAfterTyping");

          vi.advanceTimersByTime(roundUpToSixteen(1200));
          expect(cb).toHaveBeenCalledTimes(3);
          expect(cb).toHaveBeenNthCalledWith(1, strings[1]);
          expect(cb).toHaveBeenNthCalledWith(2, strings[1] + expected.blinking);
          expect(cb).toHaveBeenNthCalledWith(3, strings[1]);
          cb.mockClear();

          expect(te.runningState).toBe("beforeUntyping");
          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("untyping");
          vi.advanceTimersByTime(16);

          vi.advanceTimersByTime(16 * 3);
          expect(cb).toHaveBeenLastCalledWith("sec" + expected.untyping);
          cb.mockClear();

          te.pause();
          expect(te.runningState).toBe("idle");
          vi.advanceTimersByTime(roundUpToSixteen(1200));
          expect(cb).toHaveBeenCalledTimes(3);
          expect(cb).toHaveBeenNthCalledWith(1, "sec");
          expect(cb).toHaveBeenNthCalledWith(2, "sec" + expected.blinking);
          expect(cb).toHaveBeenNthCalledWith(3, "sec");
          expect(te.runningState).toBe("idle");
          cb.mockClear();
          te.resume();

          vi.advanceTimersByTime(16 * 3);
          expect(cb).toHaveBeenLastCalledWith(expected.untyping);
          cb.mockClear();

          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("afterUntyping");

          te.dispose();
        }
      );

      test.each([
        {
          desc: "string",
          delayBeforeTypingSet: {
            cursorSymbol: "!",
            expected: {
              typing: "!",
              untyping: "!",
              blinking: "!",
            },
          },
          delayAfterTypingSet: {
            cursorSymbol: "@",
            expected: {
              typing: "@",
              untyping: "@",
              blinking: "@",
            },
          },
          typingSet: {
            cursorSymbol: "#",
            expected: {
              typing: "#",
              untyping: "#",
              blinking: "#",
            },
          },
          untypingSet: {
            cursorSymbol: "$",
            expected: {
              typing: "$",
              untyping: "$",
              blinking: "$",
            },
          },
          idleSet: {
            cursorSymbol: "%",
            expected: {
              typing: "%",
              untyping: "%",
              blinking: "%",
            },
          },
        },
        {
          desc: "object",
          delayBeforeTypingSet: {
            cursorSymbol: {
              typing: "!type",
              untyping: "!untype",
              blinking: "!blink",
            },
            expected: {
              typing: "!type",
              untyping: "!untype",
              blinking: "!blink",
            },
          },
          delayAfterTypingSet: {
            cursorSymbol: {
              typing: "@type",
              untyping: "@untype",
              blinking: "@blink",
            },
            expected: {
              typing: "@type",
              untyping: "@untype",
              blinking: "@blink",
            },
          },
          typingSet: {
            cursorSymbol: {
              typing: "#type",
              untyping: "#untype",
              blinking: "#blink",
            },
            expected: {
              typing: "#type",
              untyping: "#untype",
              blinking: "#blink",
            },
          },
          untypingSet: {
            cursorSymbol: {
              typing: "$type",
              untyping: "$untype",
              blinking: "$blink",
            },
            expected: {
              typing: "$type",
              untyping: "$untype",
              blinking: "$blink",
            },
          },
          idleSet: {
            cursorSymbol: {
              typing: "%type",
              untyping: "%untype",
              blinking: "%blink",
            },
            expected: {
              typing: "%type",
              untyping: "%untype",
              blinking: "%blink",
            },
          },
        },
      ])(
        `multiple immediate setters - with "now" === true and cursorSymbol === $desc`,
        ({
          delayBeforeTypingSet,
          delayAfterTypingSet,
          typingSet,
          untypingSet,
          idleSet,
        }) => {
          const strings = ["first", "second", "third"];
          const cb = vi.fn();
          const te = new TypingEffect(strings, cb, {
            delayBeforeTyping: 3000,
            delayAfterTyping: 3000,
            showCursor: false,
            typingDelay: 0,
            typingVariation: 0,
            untypingDelay: 0,
          }).start();

          // begining without cursor
          expect(te.runningState).toBe("cycleStart");
          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("delayBeforeTyping");
          vi.advanceTimersByTime(roundUpToSixteen(3000));
          // no blinking because showCursor is false
          expect(cb).toHaveBeenCalledTimes(0);
          cb.mockClear();

          expect(te.runningState).toBe("beforeTyping");
          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("typing");

          vi.advanceTimersByTime(16 * strings[0]!.length);
          expect(cb).toHaveBeenLastCalledWith(strings[0]);
          cb.mockClear();

          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("afterTyping");
          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("delayAfterTyping");

          vi.advanceTimersByTime(roundUpToSixteen(3000));
          expect(cb).toHaveBeenCalledTimes(0);
          cb.mockClear();

          expect(te.runningState).toBe("beforeUntyping");
          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("untyping");
          vi.advanceTimersByTime(16);

          te.pause();
          expect(te.runningState).toBe("idle");
          vi.advanceTimersByTime(roundUpToSixteen(3000));
          expect(cb).toHaveBeenCalledTimes(0);
          expect(te.runningState).toBe("idle");
          cb.mockClear();
          te.resume();

          vi.advanceTimersByTime(16 * strings[0]!.length);
          expect(cb).toHaveBeenLastCalledWith("");
          cb.mockClear();

          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("afterUntyping");

          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("cycleStart");
          vi.advanceTimersByTime(16);

          expect(te.runningState).toBe("delayBeforeTyping");
          vi.advanceTimersByTime(roundUpToSixteen(1100));
          expect(cb).toHaveBeenCalledTimes(0);
          cb.mockClear();

          // end of no cursor - set while delayBeforeTyping, so about half time no cb calls
          expect(te.options.showCursor).toBe(false);
          expect(te.options.cursorSymbol.typing).toBe("|");
          expect(te.options.cursorSymbol.untyping).toBe("|");
          expect(te.options.cursorSymbol.blinking).toBe("|");
          te.setOptions(
            {
              showCursor: true,
              cursorSymbol: delayBeforeTypingSet.cursorSymbol,
            },
            true
          );
          expect(te.options.showCursor).toBe(true);
          expect(te.options.cursorSymbol.typing).toBe(
            delayBeforeTypingSet.expected.typing
          );
          expect(te.options.cursorSymbol.untyping).toBe(
            delayBeforeTypingSet.expected.untyping
          );
          expect(te.options.cursorSymbol.blinking).toBe(
            delayBeforeTypingSet.expected.blinking
          );

          vi.advanceTimersByTime(
            roundUpToSixteen(3000 - roundUpToSixteen(1100) - 16)
          );

          expect(cb).toHaveBeenCalledTimes(4);
          expect(cb).toHaveBeenNthCalledWith(
            1,
            delayBeforeTypingSet.expected.blinking
          );
          expect(cb).toHaveBeenNthCalledWith(2, "");
          expect(cb).toHaveBeenNthCalledWith(
            3,
            delayBeforeTypingSet.expected.blinking
          );
          expect(cb).toHaveBeenNthCalledWith(4, "");
          cb.mockClear();

          expect(te.runningState).toBe("delayBeforeTyping");
          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("beforeTyping");
          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("typing");

          // let 'half' of typing to have cursor previously set in delayBeforeTyping
          const secondString_firstPart = Math.floor(strings[1]!.length / 2);
          const secondString_restPart =
            strings[1]!.length - secondString_firstPart;

          vi.advanceTimersByTime(16 * secondString_firstPart);
          expect(cb).toHaveBeenLastCalledWith(
            strings[1]!.substring(0, secondString_firstPart) +
              delayBeforeTypingSet.expected.typing
          );
          cb.mockClear();

          te.setOptions(
            {
              cursorSymbol: typingSet.cursorSymbol,
            },
            true
          );
          expect(te.options.showCursor).toBe(true);
          expect(te.options.cursorSymbol.typing).toBe(
            typingSet.expected.typing
          );
          expect(te.options.cursorSymbol.untyping).toBe(
            typingSet.expected.untyping
          );
          expect(te.options.cursorSymbol.blinking).toBe(
            typingSet.expected.blinking
          );

          vi.advanceTimersByTime(16 * secondString_restPart);
          expect(cb).toHaveBeenLastCalledWith(
            strings[1] + typingSet.expected.typing
          );
          cb.mockClear();

          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("afterTyping");
          vi.advanceTimersByTime(16);

          // let 'half' of delayAfterTyping to have cursor previously set in typing
          expect(te.runningState).toBe("delayAfterTyping");
          vi.advanceTimersByTime(roundUpToSixteen(1100));

          expect(cb).toHaveBeenCalledTimes(3);
          expect(cb).toHaveBeenNthCalledWith(1, strings[1]);
          expect(cb).toHaveBeenNthCalledWith(
            2,
            strings[1] + typingSet.expected.blinking
          );
          expect(cb).toHaveBeenNthCalledWith(3, strings[1]);
          cb.mockClear();

          te.setOptions(
            {
              cursorSymbol: delayAfterTypingSet.cursorSymbol,
            },
            true
          );
          expect(te.options.showCursor).toBe(true);
          expect(te.options.cursorSymbol.typing).toBe(
            delayAfterTypingSet.expected.typing
          );
          expect(te.options.cursorSymbol.untyping).toBe(
            delayAfterTypingSet.expected.untyping
          );
          expect(te.options.cursorSymbol.blinking).toBe(
            delayAfterTypingSet.expected.blinking
          );

          vi.advanceTimersByTime(
            roundUpToSixteen(3000 - roundUpToSixteen(1100) - 16)
          );

          expect(cb).toHaveBeenCalledTimes(3);
          expect(cb).toHaveBeenNthCalledWith(
            1,
            strings[1] + delayAfterTypingSet.expected.blinking
          );
          expect(cb).toHaveBeenNthCalledWith(2, strings[1]);
          expect(cb).toHaveBeenNthCalledWith(
            3,
            strings[1] + delayAfterTypingSet.expected.blinking
          );
          cb.mockClear();
          expect(te.runningState).toBe("delayAfterTyping");

          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("beforeUntyping");
          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("untyping");
          vi.advanceTimersByTime(16);

          // let 'half' of untyping to have cursor previously set in delayAfterTyping
          vi.advanceTimersByTime(16 * secondString_firstPart);

          expect(cb).toHaveBeenLastCalledWith(
            strings[1]!.substring(0, secondString_firstPart) +
              delayAfterTypingSet.expected.untyping
          );

          cb.mockClear();

          te.setOptions(
            {
              cursorSymbol: untypingSet.cursorSymbol,
            },
            true
          );
          expect(te.options.showCursor).toBe(true);
          expect(te.options.cursorSymbol.typing).toBe(
            untypingSet.expected.typing
          );
          expect(te.options.cursorSymbol.untyping).toBe(
            untypingSet.expected.untyping
          );
          expect(te.options.cursorSymbol.blinking).toBe(
            untypingSet.expected.blinking
          );

          vi.advanceTimersByTime(16 * secondString_restPart);
          expect(cb).toHaveBeenLastCalledWith(untypingSet.expected.untyping);
          cb.mockClear();

          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("afterUntyping");
          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("cycleStart");
          vi.advanceTimersByTime(16);

          // uses cursor set in untyping
          expect(te.runningState).toBe("delayBeforeTyping");
          vi.advanceTimersByTime(roundUpToSixteen(3000));
          expect(te.runningState).toBe("beforeTyping");
          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("typing");

          vi.advanceTimersByTime(16 * strings[2]!.length);
          expect(cb).toHaveBeenLastCalledWith(
            strings[2] + untypingSet.expected.typing
          );
          cb.mockClear();

          // uses cursor set in untyping for some amount of idle time
          te.pause();
          expect(te.runningState).toBe("idle");
          vi.advanceTimersByTime(1200);
          expect(cb).toHaveBeenCalledTimes(3);
          expect(cb).toHaveBeenNthCalledWith(1, strings[2]);
          expect(cb).toHaveBeenNthCalledWith(
            2,
            strings[2] + untypingSet.expected.blinking
          );
          expect(cb).toHaveBeenNthCalledWith(3, strings[2]);
          cb.mockClear();

          te.setOptions(
            {
              cursorSymbol: idleSet.cursorSymbol,
            },
            true
          );
          expect(te.options.showCursor).toBe(true);
          expect(te.options.cursorSymbol.typing).toBe(idleSet.expected.typing);
          expect(te.options.cursorSymbol.untyping).toBe(
            idleSet.expected.untyping
          );
          expect(te.options.cursorSymbol.blinking).toBe(
            idleSet.expected.blinking
          );

          vi.advanceTimersByTime(1200);
          // 2 times because of 336ms of spare blink time from above
          expect(cb).toHaveBeenCalledTimes(2);
          expect(cb).toHaveBeenNthCalledWith(
            1,
            strings[2] + idleSet.expected.blinking
          );
          expect(cb).toHaveBeenNthCalledWith(2, strings[2]);
          cb.mockClear();

          // 1200 - 336 - 512 = 352 time of the last blink
          // 512 - 352 = 160 rest time untill new blink
          vi.advanceTimersByTime(160);
          expect(cb).toHaveBeenCalledTimes(1);
          expect(cb).toHaveBeenCalledWith(
            strings[2] + idleSet.expected.blinking
          );
          cb.mockClear();

          te.setOptions({ showCursor: false }, true);
          expect(te.options.showCursor).toBe(false);

          vi.advanceTimersByTime(1200);
          // no calls because no cursor
          expect(cb).toHaveBeenCalledTimes(0);
          cb.mockClear();

          te.resume();

          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("afterTyping");

          te.dispose();
        }
      );

      test.each([
        {
          cursorSymbol: "$",
          desc: "string $",
          expected: {
            typing: "$",
            untyping: "$",
            blinking: "$",
          },
        },
        {
          cursorSymbol: {
            typing: " @type/",
            untyping: " @untype/",
            blinking: " @blink/",
          },
          desc: "object { typing: type, untyping: untype, blinking: blink }",
          expected: {
            typing: " @type/",
            untyping: " @untype/",
            blinking: " @blink/",
          },
        },
      ])(
        `concurrent scheduled set with cursorSymbol === $desc`,
        ({ cursorSymbol, expected }) => {
          const strings = ["first", "second", "third"];
          const cb = vi.fn();
          const te = new TypingEffect(strings, cb, {
            delayBeforeTyping: 1200,
            delayAfterTyping: 1200,
            showCursor: false,
            typingDelay: 0,
            typingVariation: 0,
            untypingDelay: 0,
          }).start();

          expect(te.runningState).toBe("cycleStart");
          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("delayBeforeTyping");
          vi.advanceTimersByTime(roundUpToSixteen(1200));
          // no blinking because showCursor is false
          expect(cb).toHaveBeenCalledTimes(0);
          cb.mockClear();

          expect(te.runningState).toBe("beforeTyping");
          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("typing");

          vi.advanceTimersByTime(16 * strings[0]!.length);
          expect(cb).toHaveBeenLastCalledWith(strings[0]);
          cb.mockClear();

          te.setOptions({ showCursor: undefined, cursorSymbol: "__" })
            .setOptions({ showCursor: false, cursorSymbol: "" })
            .setOptions({ showCursor: true, cursorSymbol: cursorSymbol });

          expect(te.options.showCursor).toBe(false);
          expect(te.options.cursorSymbol.typing).toBe("|");
          expect(te.options.cursorSymbol.untyping).toBe("|");
          expect(te.options.cursorSymbol.blinking).toBe("|");

          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("afterTyping");
          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("delayAfterTyping");

          vi.advanceTimersByTime(roundUpToSixteen(1200));
          // no blinking because showCursor is false
          expect(cb).toHaveBeenCalledTimes(0);
          cb.mockClear();

          expect(te.runningState).toBe("beforeUntyping");
          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("untyping");
          vi.advanceTimersByTime(16);

          te.pause();
          expect(te.runningState).toBe("idle");
          vi.advanceTimersByTime(roundUpToSixteen(1200));
          // no blinking because showCursor is false
          expect(cb).toHaveBeenCalledTimes(0);
          expect(te.runningState).toBe("idle");
          cb.mockClear();
          te.resume();

          vi.advanceTimersByTime(16 * strings[0]!.length);
          expect(cb).toHaveBeenLastCalledWith("");
          cb.mockClear();

          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("afterUntyping");

          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("cycleStart");
          vi.advanceTimersByTime(16);

          expect(te.options.showCursor).toBe(true);
          expect(te.options.cursorSymbol.typing).toBe(expected.typing);
          expect(te.options.cursorSymbol.untyping).toBe(expected.untyping);
          expect(te.options.cursorSymbol.blinking).toBe(expected.blinking);

          expect(te.runningState).toBe("delayBeforeTyping");
          vi.advanceTimersByTime(roundUpToSixteen(1200));
          // twice here because blinking starts w/o cursor
          // previous string state was empty string, thus 1st callback call here is ignored
          expect(cb).toHaveBeenCalledTimes(2);
          expect(cb).toHaveBeenNthCalledWith(1, expected.blinking);
          expect(cb).toHaveBeenNthCalledWith(2, "");
          cb.mockClear();

          expect(te.runningState).toBe("beforeTyping");
          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("typing");

          vi.advanceTimersByTime(16 * strings[1]!.length);
          expect(cb).toHaveBeenLastCalledWith(strings[1] + expected.typing);
          cb.mockClear();

          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("afterTyping");
          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("delayAfterTyping");

          vi.advanceTimersByTime(roundUpToSixteen(1200));
          expect(cb).toHaveBeenCalledTimes(3);
          expect(cb).toHaveBeenNthCalledWith(1, strings[1]);
          expect(cb).toHaveBeenNthCalledWith(2, strings[1] + expected.blinking);
          expect(cb).toHaveBeenNthCalledWith(3, strings[1]);
          cb.mockClear();

          expect(te.runningState).toBe("beforeUntyping");
          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("untyping");
          vi.advanceTimersByTime(16);

          vi.advanceTimersByTime(16 * 3);
          expect(cb).toHaveBeenLastCalledWith("sec" + expected.untyping);
          cb.mockClear();

          te.pause();
          expect(te.runningState).toBe("idle");
          vi.advanceTimersByTime(roundUpToSixteen(1200));
          expect(cb).toHaveBeenCalledTimes(3);
          expect(cb).toHaveBeenNthCalledWith(1, "sec");
          expect(cb).toHaveBeenNthCalledWith(2, "sec" + expected.blinking);
          expect(cb).toHaveBeenNthCalledWith(3, "sec");
          expect(te.runningState).toBe("idle");
          cb.mockClear();
          te.resume();

          vi.advanceTimersByTime(16 * 3);
          expect(cb).toHaveBeenLastCalledWith(expected.untyping);
          cb.mockClear();

          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("afterUntyping");

          te.dispose();
        }
      );

      test.each([
        {
          desc: "string",
          delayBeforeTypingSet: {
            cursorSymbol: "!",
            expected: {
              typing: "!",
              untyping: "!",
              blinking: "!",
            },
          },
          delayAfterTypingSet: {
            cursorSymbol: "@",
            expected: {
              typing: "@",
              untyping: "@",
              blinking: "@",
            },
          },
          typingSet: {
            cursorSymbol: "#",
            expected: {
              typing: "#",
              untyping: "#",
              blinking: "#",
            },
          },
          untypingSet: {
            cursorSymbol: "$",
            expected: {
              typing: "$",
              untyping: "$",
              blinking: "$",
            },
          },
          idleSet: {
            cursorSymbol: "%",
            expected: {
              typing: "%",
              untyping: "%",
              blinking: "%",
            },
          },
        },
        {
          desc: "object",
          delayBeforeTypingSet: {
            cursorSymbol: {
              typing: "!type",
              untyping: "!untype",
              blinking: "!blink",
            },
            expected: {
              typing: "!type",
              untyping: "!untype",
              blinking: "!blink",
            },
          },
          delayAfterTypingSet: {
            cursorSymbol: {
              typing: "@type",
              untyping: "@untype",
              blinking: "@blink",
            },
            expected: {
              typing: "@type",
              untyping: "@untype",
              blinking: "@blink",
            },
          },
          typingSet: {
            cursorSymbol: {
              typing: "#type",
              untyping: "#untype",
              blinking: "#blink",
            },
            expected: {
              typing: "#type",
              untyping: "#untype",
              blinking: "#blink",
            },
          },
          untypingSet: {
            cursorSymbol: {
              typing: "$type",
              untyping: "$untype",
              blinking: "$blink",
            },
            expected: {
              typing: "$type",
              untyping: "$untype",
              blinking: "$blink",
            },
          },
          idleSet: {
            cursorSymbol: {
              typing: "%type",
              untyping: "%untype",
              blinking: "%blink",
            },
            expected: {
              typing: "%type",
              untyping: "%untype",
              blinking: "%blink",
            },
          },
        },
      ])(
        `multiple concurrent immediate setters - with "now" === true and cursorSymbol === $desc`,
        ({
          delayBeforeTypingSet,
          delayAfterTypingSet,
          typingSet,
          untypingSet,
          idleSet,
        }) => {
          const strings = ["first", "second", "third"];
          const cb = vi.fn();
          const te = new TypingEffect(strings, cb, {
            delayBeforeTyping: 3000,
            delayAfterTyping: 3000,
            showCursor: false,
            typingDelay: 0,
            typingVariation: 0,
            untypingDelay: 0,
          }).start();

          // begining without cursor
          expect(te.runningState).toBe("cycleStart");
          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("delayBeforeTyping");
          vi.advanceTimersByTime(roundUpToSixteen(3000));
          // no blinking because showCursor is false
          expect(cb).toHaveBeenCalledTimes(0);
          cb.mockClear();

          expect(te.runningState).toBe("beforeTyping");
          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("typing");

          vi.advanceTimersByTime(16 * strings[0]!.length);
          expect(cb).toHaveBeenLastCalledWith(strings[0]);
          cb.mockClear();

          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("afterTyping");
          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("delayAfterTyping");

          vi.advanceTimersByTime(roundUpToSixteen(3000));
          expect(cb).toHaveBeenCalledTimes(0);
          cb.mockClear();

          expect(te.runningState).toBe("beforeUntyping");
          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("untyping");
          vi.advanceTimersByTime(16);

          te.pause();
          expect(te.runningState).toBe("idle");
          vi.advanceTimersByTime(roundUpToSixteen(3000));
          expect(cb).toHaveBeenCalledTimes(0);
          expect(te.runningState).toBe("idle");
          cb.mockClear();
          te.resume();

          vi.advanceTimersByTime(16 * strings[0]!.length);
          expect(cb).toHaveBeenLastCalledWith("");
          cb.mockClear();

          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("afterUntyping");

          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("cycleStart");
          vi.advanceTimersByTime(16);

          expect(te.runningState).toBe("delayBeforeTyping");
          vi.advanceTimersByTime(roundUpToSixteen(1100));
          expect(cb).toHaveBeenCalledTimes(0);
          cb.mockClear();

          // end of no cursor - set while delayBeforeTyping, so about half time no cb calls
          expect(te.options.showCursor).toBe(false);
          expect(te.options.cursorSymbol.typing).toBe("|");
          expect(te.options.cursorSymbol.untyping).toBe("|");
          expect(te.options.cursorSymbol.blinking).toBe("|");
          te.setOptions(
            {
              showCursor: undefined,
              cursorSymbol: "1",
            },
            true
          )
            .setOptions(
              {
                showCursor: false,
                cursorSymbol: "2",
              },
              true
            )
            .setOptions(
              {
                showCursor: true,
                cursorSymbol: delayBeforeTypingSet.cursorSymbol,
              },
              true
            );
          expect(te.options.showCursor).toBe(true);
          expect(te.options.cursorSymbol.typing).toBe(
            delayBeforeTypingSet.expected.typing
          );
          expect(te.options.cursorSymbol.untyping).toBe(
            delayBeforeTypingSet.expected.untyping
          );
          expect(te.options.cursorSymbol.blinking).toBe(
            delayBeforeTypingSet.expected.blinking
          );

          vi.advanceTimersByTime(
            roundUpToSixteen(3000 - roundUpToSixteen(1100) - 16)
          );

          expect(cb).toHaveBeenCalledTimes(4);
          expect(cb).toHaveBeenNthCalledWith(
            1,
            delayBeforeTypingSet.expected.blinking
          );
          expect(cb).toHaveBeenNthCalledWith(2, "");
          expect(cb).toHaveBeenNthCalledWith(
            3,
            delayBeforeTypingSet.expected.blinking
          );
          expect(cb).toHaveBeenNthCalledWith(4, "");
          cb.mockClear();

          expect(te.runningState).toBe("delayBeforeTyping");
          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("beforeTyping");
          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("typing");

          // let 'half' of typing to have cursor previously set in delayBeforeTyping
          const secondString_firstPart = Math.floor(strings[1]!.length / 2);
          const secondString_restPart =
            strings[1]!.length - secondString_firstPart;

          vi.advanceTimersByTime(16 * secondString_firstPart);
          expect(cb).toHaveBeenLastCalledWith(
            strings[1]!.substring(0, secondString_firstPart) +
              delayBeforeTypingSet.expected.typing
          );
          cb.mockClear();

          te.setOptions(
            {
              cursorSymbol: "3",
            },
            true
          )
            .setOptions(
              {
                cursorSymbol: "4",
              },
              true
            )
            .setOptions(
              {
                cursorSymbol: typingSet.cursorSymbol,
              },
              true
            );
          expect(te.options.showCursor).toBe(true);
          expect(te.options.cursorSymbol.typing).toBe(
            typingSet.expected.typing
          );
          expect(te.options.cursorSymbol.untyping).toBe(
            typingSet.expected.untyping
          );
          expect(te.options.cursorSymbol.blinking).toBe(
            typingSet.expected.blinking
          );

          vi.advanceTimersByTime(16 * secondString_restPart);
          expect(cb).toHaveBeenLastCalledWith(
            strings[1] + typingSet.expected.typing
          );
          cb.mockClear();

          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("afterTyping");
          vi.advanceTimersByTime(16);

          // let 'half' of delayAfterTyping to have cursor previously set in typing
          expect(te.runningState).toBe("delayAfterTyping");
          vi.advanceTimersByTime(roundUpToSixteen(1100));

          expect(cb).toHaveBeenCalledTimes(3);
          expect(cb).toHaveBeenNthCalledWith(1, strings[1]);
          expect(cb).toHaveBeenNthCalledWith(
            2,
            strings[1] + typingSet.expected.blinking
          );
          expect(cb).toHaveBeenNthCalledWith(3, strings[1]);
          cb.mockClear();

          te.setOptions(
            {
              cursorSymbol: "5",
            },
            true
          )
            .setOptions(
              {
                cursorSymbol: "5",
              },
              true
            )
            .setOptions(
              {
                cursorSymbol: delayAfterTypingSet.cursorSymbol,
              },
              true
            );
          expect(te.options.showCursor).toBe(true);
          expect(te.options.cursorSymbol.typing).toBe(
            delayAfterTypingSet.expected.typing
          );
          expect(te.options.cursorSymbol.untyping).toBe(
            delayAfterTypingSet.expected.untyping
          );
          expect(te.options.cursorSymbol.blinking).toBe(
            delayAfterTypingSet.expected.blinking
          );

          vi.advanceTimersByTime(
            roundUpToSixteen(3000 - roundUpToSixteen(1100) - 16)
          );

          expect(cb).toHaveBeenCalledTimes(3);
          expect(cb).toHaveBeenNthCalledWith(
            1,
            strings[1] + delayAfterTypingSet.expected.blinking
          );
          expect(cb).toHaveBeenNthCalledWith(2, strings[1]);
          expect(cb).toHaveBeenNthCalledWith(
            3,
            strings[1] + delayAfterTypingSet.expected.blinking
          );
          cb.mockClear();
          expect(te.runningState).toBe("delayAfterTyping");

          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("beforeUntyping");
          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("untyping");
          vi.advanceTimersByTime(16);

          // let 'half' of untyping to have cursor previously set in delayAfterTyping
          vi.advanceTimersByTime(16 * secondString_firstPart);

          expect(cb).toHaveBeenLastCalledWith(
            strings[1]!.substring(0, secondString_firstPart) +
              delayAfterTypingSet.expected.untyping
          );

          cb.mockClear();

          te.setOptions(
            {
              cursorSymbol: "6",
            },
            true
          )
            .setOptions(
              {
                cursorSymbol: "7",
              },
              true
            )
            .setOptions(
              {
                cursorSymbol: untypingSet.cursorSymbol,
              },
              true
            );
          expect(te.options.showCursor).toBe(true);
          expect(te.options.cursorSymbol.typing).toBe(
            untypingSet.expected.typing
          );
          expect(te.options.cursorSymbol.untyping).toBe(
            untypingSet.expected.untyping
          );
          expect(te.options.cursorSymbol.blinking).toBe(
            untypingSet.expected.blinking
          );

          vi.advanceTimersByTime(16 * secondString_restPart);
          expect(cb).toHaveBeenLastCalledWith(untypingSet.expected.untyping);
          cb.mockClear();

          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("afterUntyping");
          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("cycleStart");
          vi.advanceTimersByTime(16);

          // uses cursor set in untyping
          expect(te.runningState).toBe("delayBeforeTyping");
          vi.advanceTimersByTime(roundUpToSixteen(3000));
          expect(te.runningState).toBe("beforeTyping");
          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("typing");

          vi.advanceTimersByTime(16 * strings[2]!.length);
          expect(cb).toHaveBeenLastCalledWith(
            strings[2] + untypingSet.expected.typing
          );
          cb.mockClear();

          // uses cursor set in untyping for some amount of idle time
          te.pause();
          expect(te.runningState).toBe("idle");
          vi.advanceTimersByTime(1200);
          expect(cb).toHaveBeenCalledTimes(3);
          expect(cb).toHaveBeenNthCalledWith(1, strings[2]);
          expect(cb).toHaveBeenNthCalledWith(
            2,
            strings[2] + untypingSet.expected.blinking
          );
          expect(cb).toHaveBeenNthCalledWith(3, strings[2]);
          cb.mockClear();

          te.setOptions(
            {
              cursorSymbol: "8",
            },
            true
          )
            .setOptions(
              {
                cursorSymbol: "9",
              },
              true
            )
            .setOptions(
              {
                cursorSymbol: idleSet.cursorSymbol,
              },
              true
            );

          expect(te.options.showCursor).toBe(true);
          expect(te.options.cursorSymbol.typing).toBe(idleSet.expected.typing);
          expect(te.options.cursorSymbol.untyping).toBe(
            idleSet.expected.untyping
          );
          expect(te.options.cursorSymbol.blinking).toBe(
            idleSet.expected.blinking
          );

          vi.advanceTimersByTime(1200);
          // 2 times because of 336ms of spare blink time from above
          expect(cb).toHaveBeenCalledTimes(2);
          expect(cb).toHaveBeenNthCalledWith(
            1,
            strings[2] + idleSet.expected.blinking
          );
          expect(cb).toHaveBeenNthCalledWith(2, strings[2]);
          cb.mockClear();

          // 1200 - 336 - 512 = 352 time of the last blink
          // 512 - 352 = 160 rest time untill new blink
          vi.advanceTimersByTime(160);
          expect(cb).toHaveBeenCalledTimes(1);
          expect(cb).toHaveBeenCalledWith(
            strings[2] + idleSet.expected.blinking
          );
          cb.mockClear();

          te.setOptions({ showCursor: undefined }, true)
            .setOptions({ showCursor: true }, true)
            .setOptions({ showCursor: false }, true);
          expect(te.options.showCursor).toBe(false);

          vi.advanceTimersByTime(1200);
          // no calls because no cursor
          expect(cb).toHaveBeenCalledTimes(0);
          cb.mockClear();

          te.resume();

          vi.advanceTimersByTime(16);
          expect(te.runningState).toBe("afterTyping");

          te.dispose();
        }
      );
    });

    describe("set cursorBlinkRate test cases", () => {
      const checkRestBlinks = ({
        stageName,
        stageDuration,
        stageTimePassed,
        blinkRate,
        cbString = "",
        startWithCursor = false,
        cb,
        te,
      }: {
        stageName: string;
        stageDuration: number;
        stageTimePassed: number;
        blinkRate: number;
        cbString?: string;
        startWithCursor?: boolean;
        cb: ReturnType<typeof vi.fn>;
        te: TypingEffect;
      }) => {
        const restStageTime = roundUpToSixteen(stageDuration - stageTimePassed);
        const roundedBlinkRate = roundUpToSixteen(blinkRate);
        // reduce blink count by one if restStageTime can be exactly divided by roundedBlinkRate
        // the exact last blink does not go through because of the condition in runningStagesStateMachine
        // "timestamp >= 'time condition'" '>=' and not '>'
        const blinkCrop = restStageTime % roundedBlinkRate === 0 ? -1 : 0;
        const blinkCount =
          Math.floor(restStageTime / roundedBlinkRate) + blinkCrop;
        const stageRemainderTime =
          restStageTime - blinkCount * roundedBlinkRate;

        const getBlink = (blinkNum: number) => {
          if (startWithCursor) {
            return blinkNum % 2 === 0 ? "" : "|";
          } else {
            return blinkNum % 2 === 0 ? "|" : "";
          }
        };

        for (let blinkNum = 1; blinkNum <= blinkCount; blinkNum++) {
          const str = cbString + getBlink(blinkNum);
          console.log(
            "vi.advanceTimersByTime(roundedBlinkRate);",
            roundedBlinkRate
          );
          console.log(
            "expect(cb).toHaveBeenNthCalledWith(blinkNum, str);",
            blinkNum,
            str
          );
          vi.advanceTimersByTime(roundedBlinkRate);
          expect(cb).toHaveBeenNthCalledWith(blinkNum, str);
        }
        cb.mockClear();

        vi.advanceTimersByTime(
          stageRemainderTime < 16 ? 0 : stageRemainderTime - 16
        );
        expect(te.runningState).toBe(stageName);
      };

      test("scheduled set", () => {
        const strings = ["first", "second", "third"];
        const cb = vi.fn();
        const te = new TypingEffect(strings, cb, {
          delayBeforeTyping: 3000,
          delayAfterTyping: 3000,
          typingDelay: 0,
          typingVariation: 0,
          untypingDelay: 0,
        }).start();

        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");

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

        te.setOptions({ cursorBlinkRate: 100 });
        expect(te.options.cursorBlinkRate).toBe(500);

        vi.advanceTimersByTime(512);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith("");
        cb.mockClear();

        vi.advanceTimersByTime(512);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith("|");
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(3000 - 512 * 5));
        expect(te.runningState).toBe("beforeTyping");
        expect(cb).toHaveBeenCalledTimes(0);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * strings[0]!.length);
        cb.mockClear();

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");

        vi.advanceTimersByTime(512);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith(strings[0]);
        cb.mockClear();

        vi.advanceTimersByTime(512);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith(strings[0] + "|");
        cb.mockClear();

        vi.advanceTimersByTime(512);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith(strings[0]);
        cb.mockClear();

        vi.advanceTimersByTime(512);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith(strings[0] + "|");
        cb.mockClear();

        vi.advanceTimersByTime(512);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith(strings[0]);
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(3000 - 512 * 5));
        expect(te.runningState).toBe("beforeUntyping");
        expect(cb).toHaveBeenCalledTimes(0);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("untyping");
        vi.advanceTimersByTime(16);

        vi.advanceTimersByTime(16 * strings[0]!.length);
        cb.mockClear();

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterUntyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);

        expect(te.options.cursorBlinkRate).toBe(100);

        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(roundUpToSixteen(16));
        // has cb here with emty string because last cb string value was "|" in untyping
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith("");
        cb.mockClear();

        checkRestBlinks({
          te,
          cb,
          stageName: "delayBeforeTyping",
          stageDuration: 3000,
          stageTimePassed: 16,
          blinkRate: 100,
          startWithCursor: true,
        });

        vi.advanceTimersByTime(16);

        expect(cb).toHaveBeenCalledTimes(0);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * strings[1]!.length);
        cb.mockClear();

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");

        vi.advanceTimersByTime(16);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith(strings[1]);
        cb.mockClear();

        checkRestBlinks({
          te,
          cb,
          stageName: "delayAfterTyping",
          stageDuration: 3000,
          stageTimePassed: 16,
          blinkRate: 100,
          startWithCursor: true,
          cbString: strings[1],
        });

        expect(te.runningState).toBe("delayAfterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeUntyping");
        te.dispose();
      });

      test('immediate set - with "now" === true', () => {
        const strings = ["first", "second", "third"];
        const cb = vi.fn();
        const te = new TypingEffect(strings, cb, {
          delayBeforeTyping: 3000,
          delayAfterTyping: 3000,
          typingDelay: 0,
          typingVariation: 0,
          untypingDelay: 0,
        }).start();

        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");

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

        te.setOptions({ cursorBlinkRate: 100 }, true);
        expect(te.options.cursorBlinkRate).toBe(100);

        checkRestBlinks({
          te,
          cb,
          stageName: "delayBeforeTyping",
          stageDuration: 3000,
          stageTimePassed: 512 * 3,
          blinkRate: 100,
        });

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        expect(cb).toHaveBeenCalledTimes(0);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * strings[0]!.length);
        cb.mockClear();

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");
        cb.mockClear();

        vi.advanceTimersByTime(16);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith(strings[0]);
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(100) - 16);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith(strings[0] + "|");
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(100));
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith(strings[0]);
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(100));
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith(strings[0] + "|");
        cb.mockClear();

        te.setOptions({ cursorBlinkRate: 350 }, true);
        expect(te.options.cursorBlinkRate).toBe(350);

        checkRestBlinks({
          te,
          cb,
          stageName: "delayAfterTyping",
          stageDuration: 3000,
          stageTimePassed: roundUpToSixteen(100) * 3,
          blinkRate: 350,
          cbString: strings[0],
        });

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeUntyping");

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("untyping");
        vi.advanceTimersByTime(16);

        vi.advanceTimersByTime(16 * strings[0]!.length);
        cb.mockClear();

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterUntyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);

        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith("");
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(3000) - 16);
        expect(cb).toHaveBeenCalledTimes(
          Math.floor((3000 - 16) / roundUpToSixteen(350))
        );
        expect(cb).toHaveBeenLastCalledWith("");
        cb.mockClear();

        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * strings[1]!.length);
        expect(cb).toHaveBeenLastCalledWith(strings[1] + "|");
        cb.mockClear();

        te.pause();
        expect(te.runningState).toBe("idle");
        vi.advanceTimersByTime(roundUpToSixteen(350));
        expect(cb).toHaveBeenNthCalledWith(1, strings[1]);
        expect(cb).toHaveBeenNthCalledWith(2, strings[1] + "|");
        expect(cb).toHaveBeenCalledTimes(2);
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(350));
        expect(cb).toHaveBeenCalledWith(strings[1]);
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(350));
        expect(cb).toHaveBeenCalledWith(strings[1] + "|");
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        te.setOptions({ cursorBlinkRate: 1000 }, true);
        expect(te.options.cursorBlinkRate).toBe(1000);

        vi.advanceTimersByTime(roundUpToSixteen(1000));
        expect(cb).toHaveBeenCalledWith(strings[1]);
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(1000));
        expect(cb).toHaveBeenCalledWith(strings[1] + "|");
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        te.setOptions({ cursorBlinkRate: 5000 }, true);
        expect(te.options.cursorBlinkRate).toBe(5000);

        vi.advanceTimersByTime(roundUpToSixteen(5000));
        expect(cb).toHaveBeenCalledWith(strings[1]);
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(5000));
        expect(cb).toHaveBeenCalledWith(strings[1] + "|");
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        te.setOptions({ cursorBlinkRate: 0 }, true);
        expect(te.options.cursorBlinkRate).toBe(0);

        vi.advanceTimersByTime(16);
        expect(cb).toHaveBeenCalledWith(strings[1]);
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        vi.advanceTimersByTime(16);
        expect(cb).toHaveBeenCalledWith(strings[1] + "|");
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        vi.advanceTimersByTime(16);
        expect(cb).toHaveBeenCalledWith(strings[1]);
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        vi.advanceTimersByTime(16);
        expect(cb).toHaveBeenCalledWith(strings[1] + "|");
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        te.resume();

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");

        checkRestBlinks({
          te,
          cb,
          stageName: "delayAfterTyping",
          stageDuration: 3000,
          stageTimePassed: 0,
          blinkRate: 16,
          cbString: strings[1],
        });

        expect(te.runningState).toBe("delayAfterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeUntyping");

        te.dispose();
      });

      test("concurrent scheduled set", () => {
        const strings = ["first", "second", "third"];
        const cb = vi.fn();
        const te = new TypingEffect(strings, cb, {
          delayBeforeTyping: 3000,
          delayAfterTyping: 3000,
          typingDelay: 0,
          typingVariation: 0,
          untypingDelay: 0,
        }).start();

        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");

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

        te.setOptions({ cursorBlinkRate: 1000 })
          .setOptions({ cursorBlinkRate: 40 })
          .setOptions({ cursorBlinkRate: 100 });
        expect(te.options.cursorBlinkRate).toBe(500);

        vi.advanceTimersByTime(512);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith("");
        cb.mockClear();

        vi.advanceTimersByTime(512);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith("|");
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(3000 - 512 * 5));
        expect(te.runningState).toBe("beforeTyping");
        expect(cb).toHaveBeenCalledTimes(0);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * strings[0]!.length);
        cb.mockClear();

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");

        vi.advanceTimersByTime(512);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith(strings[0]);
        cb.mockClear();

        vi.advanceTimersByTime(512);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith(strings[0] + "|");
        cb.mockClear();

        vi.advanceTimersByTime(512);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith(strings[0]);
        cb.mockClear();

        vi.advanceTimersByTime(512);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith(strings[0] + "|");
        cb.mockClear();

        vi.advanceTimersByTime(512);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith(strings[0]);
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(3000 - 512 * 5));
        expect(te.runningState).toBe("beforeUntyping");
        expect(cb).toHaveBeenCalledTimes(0);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("untyping");
        vi.advanceTimersByTime(16);

        vi.advanceTimersByTime(16 * strings[0]!.length);
        cb.mockClear();

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterUntyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);

        expect(te.options.cursorBlinkRate).toBe(100);

        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(roundUpToSixteen(16));
        // has cb here with emty string because last cb string value was "|" in untyping
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith("");
        cb.mockClear();

        checkRestBlinks({
          te,
          cb,
          stageName: "delayBeforeTyping",
          stageDuration: 3000,
          stageTimePassed: 16,
          blinkRate: 100,
          startWithCursor: true,
        });

        vi.advanceTimersByTime(16);

        expect(cb).toHaveBeenCalledTimes(0);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * strings[1]!.length);
        cb.mockClear();

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");

        vi.advanceTimersByTime(16);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith(strings[1]);
        cb.mockClear();

        checkRestBlinks({
          te,
          cb,
          stageName: "delayAfterTyping",
          stageDuration: 3000,
          stageTimePassed: 16,
          blinkRate: 100,
          startWithCursor: true,
          cbString: strings[1],
        });

        expect(te.runningState).toBe("delayAfterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeUntyping");
        te.dispose();
      });

      test('concurrent immediate set - with "now" === true', () => {
        const strings = ["first", "second", "third"];
        const cb = vi.fn();
        const te = new TypingEffect(strings, cb, {
          delayBeforeTyping: 3000,
          delayAfterTyping: 3000,
          typingDelay: 0,
          typingVariation: 0,
          untypingDelay: 0,
        }).start();

        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");

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

        te.setOptions({ cursorBlinkRate: 3300 }, true)
          .setOptions({ cursorBlinkRate: 0 }, true)
          .setOptions({ cursorBlinkRate: 100 }, true);
        expect(te.options.cursorBlinkRate).toBe(100);

        checkRestBlinks({
          te,
          cb,
          stageName: "delayBeforeTyping",
          stageDuration: 3000,
          stageTimePassed: 512 * 3,
          blinkRate: 100,
        });

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        expect(cb).toHaveBeenCalledTimes(0);

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * strings[0]!.length);
        cb.mockClear();

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");
        cb.mockClear();

        vi.advanceTimersByTime(16);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith(strings[0]);
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(100) - 16);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith(strings[0] + "|");
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(100));
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith(strings[0]);
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(100));
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith(strings[0] + "|");
        cb.mockClear();

        te.setOptions({ cursorBlinkRate: 30 }, true)
          .setOptions({ cursorBlinkRate: 3500 }, true)
          .setOptions({ cursorBlinkRate: 350 }, true);
        expect(te.options.cursorBlinkRate).toBe(350);

        checkRestBlinks({
          te,
          cb,
          stageName: "delayAfterTyping",
          stageDuration: 3000,
          stageTimePassed: roundUpToSixteen(100) * 3,
          blinkRate: 350,
          cbString: strings[0],
        });

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeUntyping");

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("untyping");
        vi.advanceTimersByTime(16);

        vi.advanceTimersByTime(16 * strings[0]!.length);
        cb.mockClear();

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterUntyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("cycleStart");
        vi.advanceTimersByTime(16);

        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith("");
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(3000) - 16);
        expect(cb).toHaveBeenCalledTimes(
          Math.floor((3000 - 16) / roundUpToSixteen(350))
        );
        expect(cb).toHaveBeenLastCalledWith("");
        cb.mockClear();

        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * strings[1]!.length);
        expect(cb).toHaveBeenLastCalledWith(strings[1] + "|");
        cb.mockClear();

        te.pause();
        expect(te.runningState).toBe("idle");
        vi.advanceTimersByTime(roundUpToSixteen(350));
        expect(cb).toHaveBeenNthCalledWith(1, strings[1]);
        expect(cb).toHaveBeenNthCalledWith(2, strings[1] + "|");
        expect(cb).toHaveBeenCalledTimes(2);
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(350));
        expect(cb).toHaveBeenCalledWith(strings[1]);
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(350));
        expect(cb).toHaveBeenCalledWith(strings[1] + "|");
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        te.setOptions({ cursorBlinkRate: 100 }, true)
          .setOptions({ cursorBlinkRate: 4000 }, true)
          .setOptions({ cursorBlinkRate: 1000 }, true);
        expect(te.options.cursorBlinkRate).toBe(1000);

        vi.advanceTimersByTime(roundUpToSixteen(1000));
        expect(cb).toHaveBeenCalledWith(strings[1]);
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(1000));
        expect(cb).toHaveBeenCalledWith(strings[1] + "|");
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        te.setOptions({ cursorBlinkRate: 50 }, true)
          .setOptions({ cursorBlinkRate: 0 }, true)
          .setOptions({ cursorBlinkRate: 5000 }, true);
        expect(te.options.cursorBlinkRate).toBe(5000);

        vi.advanceTimersByTime(roundUpToSixteen(5000));
        expect(cb).toHaveBeenCalledWith(strings[1]);
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        vi.advanceTimersByTime(roundUpToSixteen(5000));
        expect(cb).toHaveBeenCalledWith(strings[1] + "|");
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        te.setOptions({ cursorBlinkRate: 400 }, true)
          .setOptions({ cursorBlinkRate: 90 }, true)
          .setOptions({ cursorBlinkRate: 0 }, true);
        expect(te.options.cursorBlinkRate).toBe(0);

        vi.advanceTimersByTime(16);
        expect(cb).toHaveBeenCalledWith(strings[1]);
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        vi.advanceTimersByTime(16);
        expect(cb).toHaveBeenCalledWith(strings[1] + "|");
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        vi.advanceTimersByTime(16);
        expect(cb).toHaveBeenCalledWith(strings[1]);
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        vi.advanceTimersByTime(16);
        expect(cb).toHaveBeenCalledWith(strings[1] + "|");
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        te.resume();

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("afterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayAfterTyping");

        checkRestBlinks({
          te,
          cb,
          stageName: "delayAfterTyping",
          stageDuration: 3000,
          stageTimePassed: 0,
          blinkRate: 16,
          cbString: strings[1],
        });

        expect(te.runningState).toBe("delayAfterTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeUntyping");

        te.dispose();
      });
    });

    describe("set loop test cases", () => {
      test("scheduled set", () => {});
      test('immediate set - with "now" === true', () => {});
      test("concurrent scheduled set", () => {});
      test('concurrent immediate set - with "now" === true', () => {});
    });
  });
});
