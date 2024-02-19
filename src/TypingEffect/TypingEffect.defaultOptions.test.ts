import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import { TypingEffect } from ".";
import { roundUpToSixteen } from "../utils/roundUpToSixteen";

describe("default options tests", () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ["performance", "requestAnimationFrame"],
    }).clearAllTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  test("default options values", () => {
    const te = new TypingEffect();

    expect(te.options.typingDelay).toBe(100);
    expect(te.options.untypingDelay).toBe(30);
    expect(te.options.delayBeforeTyping).toBe(1600);
    expect(te.options.delayBeforeUntyping).toBe(3000);
    expect(te.options.untypeString).toBe(true);
    expect(te.options.typingVariation).toBe(100);
    expect(te.options.showCursor).toBe(true);
    expect(te.options.cursorSymbol.typing).toBe("|");
    expect(te.options.cursorSymbol.untyping).toBe("|");
    expect(te.options.cursorSymbol.blinking).toBe("|");
    expect(te.options.cursorBlinkRate).toBe(500);
    expect(te.options.loop).toBe(true);

    te.dispose();
  });

  test("typing delay", () => {
    const strings = ["first", "second", "third"];
    const cb = vi.fn();
    const te = new TypingEffect(strings, cb, {
      delayBeforeTyping: 0,
      delayBeforeUntyping: 0,
      untypingDelay: 0,
      typingVariation: 0,
    }).start();

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayBeforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("beforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("typing");

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("typing");

    vi.advanceTimersByTime(
      "first".length * roundUpToSixteen(te.options.typingDelay)
    );
    expect(te.runningState).toBe("typing");
    expect(cb).toBeCalledTimes("first".length);
    expect(cb).toHaveBeenLastCalledWith("first|");

    te.dispose();
  });

  test("untyping delay", () => {
    const strings = ["first", "second", "third"];
    const cb = vi.fn();
    const te = new TypingEffect(strings, cb, {
      typingDelay: 0,
      delayBeforeTyping: 0,
      delayBeforeUntyping: 0,
      typingVariation: 0,
    }).start();

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayBeforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("beforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("typing");

    vi.advanceTimersByTime(16 * "first".length);
    expect(cb).toBeCalledTimes("first".length);
    expect(cb).toHaveBeenLastCalledWith("first|");
    cb.mockClear();

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("afterTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayAfterTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("beforeUntyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("untyping");

    // skip one untyping iteration
    vi.advanceTimersByTime(roundUpToSixteen(te.options.untypingDelay));
    vi.advanceTimersByTime(
      "first".length * roundUpToSixteen(te.options.untypingDelay)
    );

    expect(cb).toBeCalledTimes("first".length);
    expect(cb).toHaveBeenLastCalledWith("|");

    te.dispose();
  });

  test("delayBeforeTyping", () => {
    const strings = ["first", "second", "third"];
    const cb = vi.fn();
    const te = new TypingEffect(strings, cb, {
      typingDelay: 0,
      untypingDelay: 0,
      delayBeforeUntyping: 0,
      typingVariation: 0,
    }).start();

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayBeforeTyping");

    vi.advanceTimersByTime(roundUpToSixteen(te.options.delayBeforeTyping));
    expect(cb).toBeCalledTimes(3);
    expect(cb).nthCalledWith(1, "|");
    expect(cb).nthCalledWith(2, "");
    expect(cb).nthCalledWith(3, "|");

    expect(te.runningState).toBe("beforeTyping");

    te.dispose();
  });

  test("delayBeforeUntyping", () => {
    const strings = ["first", "second", "third"];
    const cb = vi.fn();
    const te = new TypingEffect(strings, cb, {
      typingDelay: 0,
      untypingDelay: 0,
      delayBeforeTyping: 0,
      typingVariation: 0,
    }).start();

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayBeforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("beforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("typing");

    vi.advanceTimersByTime(16 * "first".length);
    cb.mockClear();

    expect(te.runningState).toBe("typing");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("afterTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayAfterTyping");

    vi.advanceTimersByTime(roundUpToSixteen(te.options.delayBeforeUntyping));
    expect(te.runningState).toBe("beforeUntyping");

    expect(cb).toBeCalledTimes(6);
    expect(cb).nthCalledWith(1, "first");
    expect(cb).nthCalledWith(2, "first|");
    expect(cb).nthCalledWith(3, "first");
    expect(cb).nthCalledWith(4, "first|");
    expect(cb).nthCalledWith(5, "first");
    expect(cb).nthCalledWith(6, "first|");

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("untyping");

    te.dispose();
  });

  test("untypeString - expect untyping of strings", () => {
    const strings = ["first", "second", "third"];
    const cb = vi.fn();
    const te = new TypingEffect(strings, cb, {
      typingDelay: 0,
      untypingDelay: 0,
      delayBeforeUntyping: 0,
      typingVariation: 0,
      delayBeforeTyping: 0,
    }).start();

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayBeforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("beforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("typing");

    vi.advanceTimersByTime(16 * "first".length);
    expect(cb).toBeCalledTimes("first".length);
    expect(cb).toHaveBeenLastCalledWith("first|");
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
    vi.advanceTimersByTime(16 * "first".length);
    expect(cb).toBeCalledTimes("first".length);
    expect(cb).toHaveBeenLastCalledWith("|");
    cb.mockClear();

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

    vi.advanceTimersByTime(16 * "second".length);
    expect(cb).toBeCalledTimes("second".length);
    expect(cb).toHaveBeenLastCalledWith("second|");
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
    vi.advanceTimersByTime(16 * "second".length);
    expect(cb).toBeCalledTimes("second".length);
    expect(cb).toHaveBeenLastCalledWith("|");
    cb.mockClear();

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

    vi.advanceTimersByTime(16 * "third".length);
    expect(cb).toBeCalledTimes("third".length);
    expect(cb).toHaveBeenLastCalledWith("third|");
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
    vi.advanceTimersByTime(16 * "third".length);
    expect(cb).toBeCalledTimes("third".length);
    expect(cb).toHaveBeenLastCalledWith("|");
    cb.mockClear();

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("afterUntyping");

    // looping
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("cycleStart");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayBeforeTyping");

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("cycleStart");

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayBeforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("beforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("typing");

    vi.advanceTimersByTime(16 * "first".length);
    expect(cb).toBeCalledTimes("first".length);
    expect(cb).toHaveBeenLastCalledWith("first|");
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
    vi.advanceTimersByTime(16 * "first".length);
    expect(cb).toBeCalledTimes("first".length);
    expect(cb).toHaveBeenLastCalledWith("|");
    cb.mockClear();

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("afterUntyping");

    te.dispose();
  });

  test("typingVariation", () => {
    const strings = ["first", "second", "third"];
    const cb = vi.fn();
    const te = new TypingEffect(strings, cb, {
      typingDelay: 0,
      untypingDelay: 0,
      delayBeforeTyping: 0,
      delayBeforeUntyping: 0,
    }).start();

    const mathRandomSpy = vi
      .spyOn(Math, "random")
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.4)
      .mockReturnValueOnce(0.2)
      // expect 4 returns with 0.5
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.5)
      //
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.3)
      .mockReturnValueOnce(0.4)
      .mockReturnValueOnce(0.6)
      .mockReturnValueOnce(0.8)
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(1)
      // end of string
      .mockReturnValueOnce(0.2)
      .mockReturnValueOnce(0.1);

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayBeforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("beforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("typing");

    // first goes through - 0.1 * 100 < 16
    vi.advanceTimersByTime(16);
    expect(cb).toHaveBeenLastCalledWith("f|");
    expect(cb).toHaveBeenCalledTimes(1);
    expect(mathRandomSpy).toBeCalledTimes(1);
    cb.mockClear();
    mathRandomSpy.mockClear();
    // lastStringUpdateTimestamp - 64
    expect(performance.now()).toBe(64);

    // doesn't go through - timestamp + 16 < 0.4 * 100 + lastStringUpdateTimestamp
    vi.advanceTimersByTime(16);
    expect(cb).toHaveBeenCalledTimes(0);
    expect(mathRandomSpy).toBeCalledTimes(1);
    mathRandomSpy.mockClear();

    // goes through - timestamp + 16 > 0.2 * 100 + lastStringUpdateTimestamp
    vi.advanceTimersByTime(16);
    expect(cb).toHaveBeenLastCalledWith("fi|");
    expect(cb).toHaveBeenCalledTimes(1);
    expect(mathRandomSpy).toBeCalledTimes(1);
    cb.mockClear();
    mathRandomSpy.mockClear();
    // lastStringUpdateTimestamp - 96
    expect(performance.now()).toBe(96);

    // doesn't go through - timestamp + 16 < 0.5 * 100 + lastStringUpdateTimestamp
    // expect typing progress on 4-th raf
    vi.advanceTimersByTime(16);
    expect(cb).toHaveBeenCalledTimes(0);
    expect(mathRandomSpy).toBeCalledTimes(1);
    mathRandomSpy.mockClear();

    vi.advanceTimersByTime(16);
    expect(cb).toHaveBeenCalledTimes(0);
    expect(mathRandomSpy).toBeCalledTimes(1);
    mathRandomSpy.mockClear();

    vi.advanceTimersByTime(16);
    expect(cb).toHaveBeenCalledTimes(0);
    expect(mathRandomSpy).toBeCalledTimes(1);
    mathRandomSpy.mockClear();

    // goes through - timestamp + 16 > 0.5 * 100 + lastStringUpdateTimestamp
    vi.advanceTimersByTime(16);
    expect(cb).toHaveBeenLastCalledWith("fir|");
    expect(cb).toHaveBeenCalledTimes(1);
    expect(mathRandomSpy).toBeCalledTimes(1);
    cb.mockClear();
    mathRandomSpy.mockClear();
    // lastStringUpdateTimestamp - 160
    expect(performance.now()).toBe(160);

    // goes through - timestamp + 16 > 0.1 * 100 + lastStringUpdateTimestamp
    vi.advanceTimersByTime(16);
    expect(cb).toHaveBeenLastCalledWith("firs|");
    expect(cb).toHaveBeenCalledTimes(1);
    expect(mathRandomSpy).toBeCalledTimes(1);
    cb.mockClear();
    mathRandomSpy.mockClear();
    // lastStringUpdateTimestamp - 176
    expect(performance.now()).toBe(176);

    // doesn't go through - timestamp + 16 < 0.3 * 100 + lastStringUpdateTimestamp
    vi.advanceTimersByTime(16);
    expect(cb).toHaveBeenCalledTimes(0);
    expect(mathRandomSpy).toBeCalledTimes(1);
    mathRandomSpy.mockClear();

    // doesn't go through - timestamp + 16 < 0.4 * 100 + lastStringUpdateTimestamp
    vi.advanceTimersByTime(16);
    expect(cb).toHaveBeenCalledTimes(0);
    expect(mathRandomSpy).toBeCalledTimes(1);
    mathRandomSpy.mockClear();

    // doesn't go through - timestamp + 16 < 0.6 * 100 + lastStringUpdateTimestamp
    vi.advanceTimersByTime(16);
    expect(cb).toHaveBeenCalledTimes(0);
    expect(mathRandomSpy).toBeCalledTimes(1);
    mathRandomSpy.mockClear();

    // doesn't go through - timestamp + 16 < 0.8 * 100 + lastStringUpdateTimestamp
    vi.advanceTimersByTime(16);
    expect(cb).toHaveBeenCalledTimes(0);
    expect(mathRandomSpy).toBeCalledTimes(1);
    mathRandomSpy.mockClear();

    // doesn't go through - timestamp + 16 < 0.9 * 100 + lastStringUpdateTimestamp
    vi.advanceTimersByTime(16);
    expect(cb).toHaveBeenCalledTimes(0);
    expect(mathRandomSpy).toBeCalledTimes(1);
    mathRandomSpy.mockClear();

    // doesn't go through - timestamp + 16 < 1 * 100 + lastStringUpdateTimestamp
    vi.advanceTimersByTime(16);
    expect(cb).toHaveBeenCalledTimes(0);
    expect(mathRandomSpy).toBeCalledTimes(1);
    mathRandomSpy.mockClear();

    // goes through - timestamp + 16 > 1 * 100 + lastStringUpdateTimestamp
    vi.advanceTimersByTime(16);
    expect(cb).toHaveBeenLastCalledWith("first|");
    expect(cb).toHaveBeenCalledTimes(1);
    expect(mathRandomSpy).toBeCalledTimes(1);
    cb.mockClear();
    mathRandomSpy.mockClear();
    // lastStringUpdateTimestamp - 288
    expect(performance.now()).toBe(288);

    // getting to end of string also relies on typingVariation
    // doesn't go through - timestamp + 16 < 0.2 * 100 + lastStringUpdateTimestamp
    vi.advanceTimersByTime(16);
    expect(cb).toHaveBeenCalledTimes(0);
    expect(mathRandomSpy).toBeCalledTimes(1);
    mathRandomSpy.mockClear();

    // goes through
    vi.advanceTimersByTime(16);
    expect(cb).toHaveBeenCalledTimes(0);
    expect(mathRandomSpy).toBeCalledTimes(1);
    mathRandomSpy.mockClear();
    // lastStringUpdateTimestamp - 320
    expect(performance.now()).toBe(320);

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayAfterTyping");

    te.dispose();
    vi.restoreAllMocks();
  });

  test("showCursor + cursorSymbol + cursorBlinkRate", () => {
    const strings = ["first", "second", "third"];
    const cb = vi.fn();
    const te = new TypingEffect(strings, cb, {
      typingDelay: 0,
      untypingDelay: 0,
      typingVariation: 0,
    }).start();

    const defaultCursorBlinkRateTo16th = roundUpToSixteen(
      te.options.cursorBlinkRate
    );
    const defaultTypingCursor = te.options.cursorSymbol.typing;
    const defaultUntypingCursor = te.options.cursorSymbol.untyping;
    const defaultBlinkingCursor = te.options.cursorSymbol.blinking;

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayBeforeTyping");

    vi.advanceTimersByTime(defaultCursorBlinkRateTo16th);
    expect(cb).toHaveBeenLastCalledWith(defaultBlinkingCursor);
    vi.advanceTimersByTime(defaultCursorBlinkRateTo16th);
    expect(cb).toHaveBeenLastCalledWith("");
    vi.advanceTimersByTime(defaultCursorBlinkRateTo16th);
    expect(cb).toHaveBeenLastCalledWith(defaultBlinkingCursor);

    expect(performance.now()).toBe(1552);
    vi.advanceTimersByTime(te.options.delayBeforeTyping - 1552 + 16);
    expect(cb).toBeCalledTimes(3);
    cb.mockClear();
    expect(te.runningState).toBe("beforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("typing");

    [..."first"].reduce((accStr, letter) => {
      const str = accStr + letter;
      vi.advanceTimersByTime(16);
      expect(cb).toHaveBeenLastCalledWith(str + defaultTypingCursor);
      return str;
    }, "");
    expect(cb).toBeCalledTimes("first".length);
    cb.mockClear();

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("afterTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayAfterTyping");

    vi.advanceTimersByTime(defaultCursorBlinkRateTo16th);
    expect(cb).toHaveBeenLastCalledWith("first");
    vi.advanceTimersByTime(defaultCursorBlinkRateTo16th);
    expect(cb).toHaveBeenLastCalledWith("first" + defaultBlinkingCursor);
    vi.advanceTimersByTime(defaultCursorBlinkRateTo16th);
    expect(cb).toHaveBeenLastCalledWith("first");
    vi.advanceTimersByTime(defaultCursorBlinkRateTo16th);
    expect(cb).toHaveBeenLastCalledWith("first" + defaultBlinkingCursor);
    vi.advanceTimersByTime(defaultCursorBlinkRateTo16th);
    expect(cb).toHaveBeenLastCalledWith("first");

    expect(performance.now()).toBe(4304);
    vi.advanceTimersByTime(
      te.options.delayBeforeUntyping - defaultCursorBlinkRateTo16th * 5 + 16
    );

    expect(cb).toBeCalledTimes(5);
    cb.mockClear();
    expect(te.runningState).toBe("beforeUntyping");

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("untyping");

    [..."first"].reduceRight((accStr, _, i) => {
      vi.advanceTimersByTime(16);
      expect(cb).toHaveBeenLastCalledWith(accStr + defaultUntypingCursor);
      return accStr.substring(0, i);
    }, "first");
    vi.advanceTimersByTime(16);
    expect(cb).toHaveBeenLastCalledWith(defaultUntypingCursor);
    expect(cb).toBeCalledTimes("first".length + 1);

    te.dispose();
  });

  test("loop, should pass with looping 10 times and calling onArrayFinished", () => {
    const strings = ["first", "second", "third"];
    const cb = vi.fn();
    const te = new TypingEffect(strings, cb, {
      delayBeforeTyping: 0,
      delayBeforeUntyping: 0,
      untypingDelay: 0,
      typingDelay: 0,
      typingVariation: 0,
    }).start();

    const onArrayFinished = vi.fn();
    te.onArrayFinished(onArrayFinished);

    // + 1 - counts itself
    expect.assertions((10 * 3 + 2) * 10 + 1);

    const stringCycle = (string: string) => {
      expect(te.runningState).toBe("cycleStart");
      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("delayBeforeTyping");
      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("beforeTyping");
      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("typing");

      vi.advanceTimersByTime(16 * string.length);

      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("afterTyping");
      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("delayAfterTyping");
      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("beforeUntyping");
      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("untyping");

      vi.advanceTimersByTime(16 * string.length);

      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("untyping");
      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("afterUntyping");
      vi.advanceTimersByTime(16);
    };

    const cycleStrings = () => {
      strings.map(stringCycle);
      // restart loop
      expect(te.runningState).toBe("cycleStart");
      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("delayBeforeTyping");
      vi.advanceTimersByTime(16);
    };

    for (let count = 1; count <= 10; count++) {
      cycleStrings();
    }

    expect(onArrayFinished).toBeCalledTimes(10);

    te.dispose();
  });
});
