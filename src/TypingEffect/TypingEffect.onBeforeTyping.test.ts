import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import { TypingEffect } from ".";

describe("onBeforeTyping method tests", () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ["performance", "requestAnimationFrame"],
    }).clearAllTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  test("normal beforeTyping callback should be called once for every string with string index", () => {
    const strings = ["first string", "second string", "third string"];
    const te = new TypingEffect(strings, vi.fn(), {
      delayBeforeTyping: 0,
      delayBeforeUntyping: 0,
      typingDelay: 0,
      untypingDelay: 0,
      typingVariation: 0,
    }).start();
    const onBeforeTypingCb = vi.fn();
    te.onBeforeTyping(onBeforeTypingCb);

    // first string
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayBeforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("beforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("typing");

    expect(onBeforeTypingCb).toHaveBeenCalledTimes(1);
    expect(onBeforeTypingCb).toBeCalledWith(0);
    onBeforeTypingCb.mockClear();

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

    vi.advanceTimersByTime(16 * strings[0]!.length);

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("afterUntyping");

    // second string
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("cycleStart");
    expect(onBeforeTypingCb).toHaveBeenCalledTimes(0);

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayBeforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("beforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("typing");

    expect(onBeforeTypingCb).toHaveBeenCalledTimes(1);
    expect(onBeforeTypingCb).toBeCalledWith(1);
    onBeforeTypingCb.mockClear();

    vi.advanceTimersByTime(16 * strings[1]!.length);

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("afterTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayAfterTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("beforeUntyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("untyping");
    vi.advanceTimersByTime(16);

    vi.advanceTimersByTime(16 * strings[1]!.length);

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("afterUntyping");
    expect(onBeforeTypingCb).toHaveBeenCalledTimes(0);

    // third string
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("cycleStart");
    expect(onBeforeTypingCb).toHaveBeenCalledTimes(0);

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayBeforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("beforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("typing");

    expect(onBeforeTypingCb).toHaveBeenCalledTimes(1);
    expect(onBeforeTypingCb).toBeCalledWith(2);
    onBeforeTypingCb.mockClear();

    vi.advanceTimersByTime(16 * strings[2]!.length);

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("afterTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayAfterTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("beforeUntyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("untyping");
    vi.advanceTimersByTime(16);

    vi.advanceTimersByTime(16 * strings[2]!.length);

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("afterUntyping");
    expect(onBeforeTypingCb).toHaveBeenCalledTimes(0);

    // getting to the end of array, restarting the iterator and going back to cycleStart
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("cycleStart");
    expect(onBeforeTypingCb).toHaveBeenCalledTimes(0);
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayBeforeTyping");

    // first string again
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("cycleStart");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayBeforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("beforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("typing");

    expect(onBeforeTypingCb).toHaveBeenCalledTimes(1);
    expect(onBeforeTypingCb).toBeCalledWith(0);
    onBeforeTypingCb.mockClear();

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

    vi.advanceTimersByTime(16 * strings[0]!.length);

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("afterUntyping");
    expect(onBeforeTypingCb).toHaveBeenCalledTimes(0);

    te.dispose();
  });

  test("calling the removal function for onBeforeTyping on second string, should prevent callback being called for 3rd string and for the first on loop", () => {
    const strings = ["first string", "second string", "third string"];
    const te = new TypingEffect(strings, vi.fn(), {
      delayBeforeTyping: 0,
      delayBeforeUntyping: 0,
      typingDelay: 0,
      untypingDelay: 0,
      typingVariation: 0,
    }).start();
    const onBeforeTypingCb = vi.fn();
    const remove = te.onBeforeTyping(onBeforeTypingCb);

    // first string
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayBeforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("beforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("typing");

    expect(onBeforeTypingCb).toHaveBeenCalledTimes(1);
    expect(onBeforeTypingCb).toBeCalledWith(0);
    onBeforeTypingCb.mockClear();

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

    vi.advanceTimersByTime(16 * strings[0]!.length);

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("afterUntyping");

    // second string
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("cycleStart");
    expect(onBeforeTypingCb).toHaveBeenCalledTimes(0);

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayBeforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("beforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("typing");

    expect(onBeforeTypingCb).toHaveBeenCalledTimes(1);
    expect(onBeforeTypingCb).toBeCalledWith(1);
    onBeforeTypingCb.mockClear();

    vi.advanceTimersByTime(16 * strings[1]!.length);

    // removing the onBeforeTyping subscription
    remove();

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("afterTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayAfterTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("beforeUntyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("untyping");
    vi.advanceTimersByTime(16);

    vi.advanceTimersByTime(16 * strings[1]!.length);

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("afterUntyping");
    expect(onBeforeTypingCb).toHaveBeenCalledTimes(0);

    // third string
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("cycleStart");
    expect(onBeforeTypingCb).toHaveBeenCalledTimes(0);

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayBeforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("beforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("typing");

    expect(onBeforeTypingCb).toHaveBeenCalledTimes(0);

    vi.advanceTimersByTime(16 * strings[2]!.length);

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("afterTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayAfterTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("beforeUntyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("untyping");
    vi.advanceTimersByTime(16);

    vi.advanceTimersByTime(16 * strings[2]!.length);

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("afterUntyping");
    expect(onBeforeTypingCb).toHaveBeenCalledTimes(0);

    // getting to the end of array, restarting the iterator and going back to cycleStart
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("cycleStart");
    expect(onBeforeTypingCb).toHaveBeenCalledTimes(0);
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayBeforeTyping");

    // first string again
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("cycleStart");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayBeforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("beforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("typing");

    expect(onBeforeTypingCb).toHaveBeenCalledTimes(0);

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

    vi.advanceTimersByTime(16 * strings[0]!.length);

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("afterUntyping");
    expect(onBeforeTypingCb).toHaveBeenCalledTimes(0);

    te.dispose();
  });

  test("setting beforeTyping callback with once === true should be called only one time", () => {
    const strings = ["first string", "second string", "third string"];
    const te = new TypingEffect(strings, vi.fn(), {
      delayBeforeTyping: 0,
      delayBeforeUntyping: 0,
      typingDelay: 0,
      untypingDelay: 0,
      typingVariation: 0,
    }).start();
    const onBeforeTypingCb = vi.fn();
    te.onBeforeTyping(onBeforeTypingCb, true);

    // first string
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayBeforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("beforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("typing");

    expect(onBeforeTypingCb).toHaveBeenCalledTimes(1);
    expect(onBeforeTypingCb).toBeCalledWith(0);
    onBeforeTypingCb.mockClear();

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

    vi.advanceTimersByTime(16 * strings[0]!.length);

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("afterUntyping");

    // second string
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("cycleStart");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayBeforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("beforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("typing");

    expect(onBeforeTypingCb).toHaveBeenCalledTimes(0);

    vi.advanceTimersByTime(16 * strings[1]!.length);

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("afterTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayAfterTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("beforeUntyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("untyping");
    vi.advanceTimersByTime(16);

    vi.advanceTimersByTime(16 * strings[1]!.length);

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("afterUntyping");

    // third string
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("cycleStart");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayBeforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("beforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("typing");

    expect(onBeforeTypingCb).toHaveBeenCalledTimes(0);

    vi.advanceTimersByTime(16 * strings[2]!.length);

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("afterTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayAfterTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("beforeUntyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("untyping");
    vi.advanceTimersByTime(16);

    vi.advanceTimersByTime(16 * strings[2]!.length);

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("afterUntyping");

    // getting to the end of array, restarting the iterator and going back to cycleStart
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("cycleStart");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayBeforeTyping");

    // first string again
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("cycleStart");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayBeforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("beforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("typing");

    expect(onBeforeTypingCb).toHaveBeenCalledTimes(0);

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

    vi.advanceTimersByTime(16 * strings[0]!.length);

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("afterUntyping");

    te.dispose();
  });
});
