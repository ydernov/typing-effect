import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import { TypingEffect } from ".";

describe("onAfterUntyping method tests", () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ["performance", "requestAnimationFrame"],
    }).clearAllTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  test("normal afterUntyping callback should be called once for every string with string index", () => {
    const strings = ["first string", "second string", "third string"];
    const te = new TypingEffect(strings, vi.fn(), {
      delayBeforeTyping: 0,
      delayAfterTyping: 0,
      typingDelay: 0,
      untypingDelay: 0,
      typingVariation: 0,
    }).start();
    const onAfterUntypingCb = vi.fn();
    te.onAfterUntyping(onAfterUntypingCb);

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

    expect(te.runningState).toBe("delayAfterTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("beforeUntyping");
    vi.advanceTimersByTime(16);

    expect(te.runningState).toBe("untyping");
    vi.advanceTimersByTime(16);

    vi.advanceTimersByTime(16 * strings[0]!.length);

    vi.advanceTimersByTime(16);

    expect(onAfterUntypingCb).toHaveBeenCalledTimes(0);

    expect(te.runningState).toBe("afterUntyping");

    vi.advanceTimersByTime(16);

    expect(onAfterUntypingCb).toHaveBeenCalledTimes(1);
    expect(onAfterUntypingCb).toBeCalledWith(0);
    onAfterUntypingCb.mockClear();

    // second string
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
    vi.advanceTimersByTime(16);

    vi.advanceTimersByTime(16 * strings[1]!.length);

    vi.advanceTimersByTime(16);

    expect(onAfterUntypingCb).toHaveBeenCalledTimes(0);

    expect(te.runningState).toBe("afterUntyping");

    vi.advanceTimersByTime(16);

    expect(onAfterUntypingCb).toHaveBeenCalledTimes(1);
    expect(onAfterUntypingCb).toBeCalledWith(1);
    onAfterUntypingCb.mockClear();

    // third string
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

    expect(te.runningState).toBe("delayAfterTyping");
    vi.advanceTimersByTime(16);

    expect(te.runningState).toBe("beforeUntyping");
    vi.advanceTimersByTime(16);

    expect(te.runningState).toBe("untyping");
    vi.advanceTimersByTime(16);

    vi.advanceTimersByTime(16 * strings[2]!.length);

    vi.advanceTimersByTime(16);

    expect(onAfterUntypingCb).toHaveBeenCalledTimes(0);
    expect(te.runningState).toBe("afterUntyping");

    vi.advanceTimersByTime(16);

    expect(onAfterUntypingCb).toHaveBeenCalledTimes(1);
    expect(onAfterUntypingCb).toBeCalledWith(2);
    onAfterUntypingCb.mockClear();

    // getting to the end of array, restarting the iterator and going back to cycleStart
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

    expect(te.runningState).toBe("delayAfterTyping");
    vi.advanceTimersByTime(16);

    expect(te.runningState).toBe("beforeUntyping");
    vi.advanceTimersByTime(16);

    expect(te.runningState).toBe("untyping");
    vi.advanceTimersByTime(16);

    vi.advanceTimersByTime(16 * strings[0]!.length);

    vi.advanceTimersByTime(16);
    expect(onAfterUntypingCb).toHaveBeenCalledTimes(0);
    expect(te.runningState).toBe("afterUntyping");

    vi.advanceTimersByTime(16);
    expect(onAfterUntypingCb).toHaveBeenCalledTimes(1);
    expect(onAfterUntypingCb).toBeCalledWith(0);
    onAfterUntypingCb.mockClear();

    te.dispose();
  });

  test("calling the removal function for onAfterUntyping on second string, should prevent callback being called for 3rd string and for the first on loop", () => {
    const strings = ["first string", "second string", "third string"];
    const te = new TypingEffect(strings, vi.fn(), {
      delayBeforeTyping: 0,
      delayAfterTyping: 0,
      typingDelay: 0,
      untypingDelay: 0,
      typingVariation: 0,
    }).start();
    const onAfterUntypingCb = vi.fn();
    const remove = te.onAfterUntyping(onAfterUntypingCb);

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

    expect(te.runningState).toBe("delayAfterTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("beforeUntyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("untyping");
    vi.advanceTimersByTime(16);

    vi.advanceTimersByTime(16 * strings[0]!.length);

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("afterUntyping");

    vi.advanceTimersByTime(16);

    expect(onAfterUntypingCb).toHaveBeenCalledTimes(1);
    expect(onAfterUntypingCb).toBeCalledWith(0);
    onAfterUntypingCb.mockClear();

    // second string
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
    vi.advanceTimersByTime(16);

    vi.advanceTimersByTime(16 * strings[1]!.length);

    vi.advanceTimersByTime(16);
    expect(onAfterUntypingCb).toHaveBeenCalledTimes(0);
    expect(te.runningState).toBe("afterUntyping");

    vi.advanceTimersByTime(16);

    expect(onAfterUntypingCb).toHaveBeenCalledTimes(1);
    expect(onAfterUntypingCb).toBeCalledWith(1);
    onAfterUntypingCb.mockClear();

    // removing the onAfterUntyping subscription
    remove();

    // third string
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

    expect(te.runningState).toBe("delayAfterTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("beforeUntyping");
    vi.advanceTimersByTime(16);

    expect(te.runningState).toBe("untyping");
    vi.advanceTimersByTime(16);

    vi.advanceTimersByTime(16 * strings[2]!.length);

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("afterUntyping");

    vi.advanceTimersByTime(16);
    expect(onAfterUntypingCb).toHaveBeenCalledTimes(0);

    // getting to the end of array, restarting the iterator and going back to cycleStart
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

    expect(te.runningState).toBe("delayAfterTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("beforeUntyping");
    vi.advanceTimersByTime(16);

    expect(te.runningState).toBe("untyping");
    vi.advanceTimersByTime(16);

    vi.advanceTimersByTime(16 * strings[0]!.length);

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("afterUntyping");
    vi.advanceTimersByTime(16);
    expect(onAfterUntypingCb).toHaveBeenCalledTimes(0);

    te.dispose();
  });

  test("setting afterUntyping callback with once === true should be called only one time", () => {
    const strings = ["first string", "second string", "third string"];
    const te = new TypingEffect(strings, vi.fn(), {
      delayBeforeTyping: 0,
      delayAfterTyping: 0,
      typingDelay: 0,
      untypingDelay: 0,
      typingVariation: 0,
    }).start();
    const onAfterUntypingCb = vi.fn();
    te.onAfterUntyping(onAfterUntypingCb, true);

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

    expect(te.runningState).toBe("delayAfterTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("beforeUntyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("untyping");
    vi.advanceTimersByTime(16);

    vi.advanceTimersByTime(16 * strings[0]!.length);

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("afterUntyping");

    vi.advanceTimersByTime(16);
    expect(onAfterUntypingCb).toHaveBeenCalledTimes(1);
    expect(onAfterUntypingCb).toBeCalledWith(0);
    onAfterUntypingCb.mockClear();

    // second string
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
    vi.advanceTimersByTime(16);

    vi.advanceTimersByTime(16 * strings[1]!.length);

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("afterUntyping");
    vi.advanceTimersByTime(16);
    expect(onAfterUntypingCb).toHaveBeenCalledTimes(0);

    // third string
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
    expect(te.runningState).toBe("delayAfterTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("beforeUntyping");
    vi.advanceTimersByTime(16);

    expect(te.runningState).toBe("untyping");
    vi.advanceTimersByTime(16);

    vi.advanceTimersByTime(16 * strings[2]!.length);

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("afterUntyping");
    vi.advanceTimersByTime(16);
    expect(onAfterUntypingCb).toHaveBeenCalledTimes(0);

    // getting to the end of array, restarting the iterator and going back to cycleStart
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
    expect(te.runningState).toBe("delayAfterTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("beforeUntyping");
    vi.advanceTimersByTime(16);

    expect(te.runningState).toBe("untyping");
    vi.advanceTimersByTime(16);

    vi.advanceTimersByTime(16 * strings[0]!.length);

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("afterUntyping");
    vi.advanceTimersByTime(16);
    expect(onAfterUntypingCb).toHaveBeenCalledTimes(0);

    te.dispose();
  });

  test("onAfterUntyping callback should not be called if untyping is false", () => {
    const strings = ["first string", "second string", "third string"];
    const te = new TypingEffect(strings, vi.fn(), {
      delayBeforeTyping: 0,
      delayAfterTyping: 0,
      typingDelay: 0,
      untypingDelay: 0,
      typingVariation: 0,
      untypeString: false,
    }).start();
    const onAfterUntypingCb = vi.fn();
    te.onAfterUntyping(onAfterUntypingCb);

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
    expect(te.runningState).toBe("delayAfterTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("cycleStart");

    expect(onAfterUntypingCb).toHaveBeenCalledTimes(0);

    // second string
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

    expect(onAfterUntypingCb).toHaveBeenCalledTimes(0);

    // third string
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
    expect(te.runningState).toBe("delayAfterTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("cycleStart");

    // getting to the end of array, restarting the iterator and going back to cycleStart
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
    expect(te.runningState).toBe("delayAfterTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("cycleStart");
    expect(onAfterUntypingCb).toHaveBeenCalledTimes(0);

    te.dispose();
  });
});
