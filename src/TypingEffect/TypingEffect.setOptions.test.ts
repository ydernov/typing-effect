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
      test("scheduled set", () => {});
      test('immediate set - with "now" === true', () => {});
      test("concurrent scheduled set", () => {});
      test('concurrent immediate set - with "now" === true', () => {});
    });
  });
});
