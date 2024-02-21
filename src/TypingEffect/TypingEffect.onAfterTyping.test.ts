import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import { TypingEffect } from ".";

describe("onAfterTyping method tests", () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ["performance", "requestAnimationFrame"],
    }).clearAllTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  test("normal afterTyping callback should be called once for every string with string index", () => {
    const strings = ["first string", "second string", "third string"];
    const te = new TypingEffect(strings, vi.fn(), {
      delayBeforeTyping: 0,
      delayAfterTyping: 0,
      typingDelay: 0,
      untypingDelay: 0,
      typingVariation: 0,
    }).start();
    const onAfterTypingCb = vi.fn();
    te.onAfterTyping(onAfterTypingCb);

    // first string
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayBeforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("beforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("typing");

    vi.advanceTimersByTime(16 * strings[0]!.length);

    expect(onAfterTypingCb).toHaveBeenCalledTimes(0);

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("afterTyping");
    vi.advanceTimersByTime(16);

    expect(onAfterTypingCb).toHaveBeenCalledTimes(1);
    expect(onAfterTypingCb).toBeCalledWith(0);
    onAfterTypingCb.mockClear();

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

    vi.advanceTimersByTime(16 * strings[1]!.length);

    expect(onAfterTypingCb).toHaveBeenCalledTimes(0);

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("afterTyping");
    vi.advanceTimersByTime(16);

    expect(onAfterTypingCb).toHaveBeenCalledTimes(1);
    expect(onAfterTypingCb).toBeCalledWith(1);
    onAfterTypingCb.mockClear();

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

    vi.advanceTimersByTime(16 * strings[2]!.length);

    expect(onAfterTypingCb).toHaveBeenCalledTimes(0);

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("afterTyping");
    vi.advanceTimersByTime(16);

    expect(onAfterTypingCb).toHaveBeenCalledTimes(1);
    expect(onAfterTypingCb).toBeCalledWith(2);
    onAfterTypingCb.mockClear();

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

    vi.advanceTimersByTime(16 * strings[0]!.length);

    expect(onAfterTypingCb).toHaveBeenCalledTimes(0);

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("afterTyping");
    vi.advanceTimersByTime(16);

    expect(onAfterTypingCb).toHaveBeenCalledTimes(1);
    expect(onAfterTypingCb).toBeCalledWith(0);
    onAfterTypingCb.mockClear();

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

  test("calling the removal function for onAfterTyping on second string, should prevent callback being called for 3rd string and for the first on loop", () => {
    const strings = ["first string", "second string", "third string"];
    const te = new TypingEffect(strings, vi.fn(), {
      delayBeforeTyping: 0,
      delayAfterTyping: 0,
      typingDelay: 0,
      untypingDelay: 0,
      typingVariation: 0,
    }).start();
    const onAfterTypingCb = vi.fn();
    const remove = te.onAfterTyping(onAfterTypingCb);

    // first string
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

    expect(onAfterTypingCb).toHaveBeenCalledTimes(1);
    expect(onAfterTypingCb).toBeCalledWith(0);
    onAfterTypingCb.mockClear();

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

    vi.advanceTimersByTime(16 * strings[1]!.length);

    expect(onAfterTypingCb).toHaveBeenCalledTimes(0);

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("afterTyping");
    vi.advanceTimersByTime(16);

    expect(onAfterTypingCb).toHaveBeenCalledTimes(1);
    expect(onAfterTypingCb).toBeCalledWith(1);
    onAfterTypingCb.mockClear();

    // removing the onAfterTyping subscription
    remove();

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

    vi.advanceTimersByTime(16 * strings[2]!.length);

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("afterTyping");
    vi.advanceTimersByTime(16);

    expect(onAfterTypingCb).toHaveBeenCalledTimes(0);

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

    vi.advanceTimersByTime(16 * strings[0]!.length);

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("afterTyping");
    vi.advanceTimersByTime(16);

    expect(onAfterTypingCb).toHaveBeenCalledTimes(0);

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

  test("setting afterTyping callback with once === true should be called only one time", () => {
    const strings = ["first string", "second string", "third string"];
    const te = new TypingEffect(strings, vi.fn(), {
      delayBeforeTyping: 0,
      delayAfterTyping: 0,
      typingDelay: 0,
      untypingDelay: 0,
      typingVariation: 0,
    }).start();
    const onAfterTypingCb = vi.fn();
    te.onAfterTyping(onAfterTypingCb, true);

    // first string
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

    expect(onAfterTypingCb).toHaveBeenCalledTimes(1);
    expect(onAfterTypingCb).toBeCalledWith(0);
    onAfterTypingCb.mockClear();

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

    vi.advanceTimersByTime(16 * strings[1]!.length);

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("afterTyping");
    vi.advanceTimersByTime(16);

    expect(onAfterTypingCb).toHaveBeenCalledTimes(0);

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

    vi.advanceTimersByTime(16 * strings[2]!.length);

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("afterTyping");
    vi.advanceTimersByTime(16);

    expect(onAfterTypingCb).toHaveBeenCalledTimes(0);

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

    vi.advanceTimersByTime(16 * strings[0]!.length);

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("afterTyping");
    vi.advanceTimersByTime(16);

    expect(onAfterTypingCb).toHaveBeenCalledTimes(0);

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
