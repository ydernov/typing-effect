import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import { TypingEffect } from ".";

describe("onArrayFinished method tests", () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ["performance", "requestAnimationFrame"],
    }).clearAllTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  test("normal arrayFinished callback should be called every time the string array is finished", () => {
    const strings = ["first string", "second string", "third string"];
    const te = new TypingEffect(strings, vi.fn(), {
      delayBeforeTyping: 0,
      delayBeforeUntyping: 0,
      typingDelay: 0,
      untypingDelay: 0,
      typingVariation: 0,
    }).start();
    const onArrayFinishedCb = vi.fn();
    te.onArrayFinished(onArrayFinishedCb);

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

    // getting to the end of array, restarting the iterator and going back to cycleStart
    expect(te.runningState).toBe("cycleStart");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayBeforeTyping");

    expect(onArrayFinishedCb).toHaveBeenCalledTimes(0);

    // first string again
    vi.advanceTimersByTime(16);

    expect(onArrayFinishedCb).toHaveBeenCalledTimes(1);
    onArrayFinishedCb.mockClear();

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
    te.dispose();
  });

  test("calling the removal function for onArrayFinished on second loop, should prevent callback being called for 2nd loop and so on", () => {
    const strings = ["first string", "second string", "third string"];
    const te = new TypingEffect(strings, vi.fn(), {
      delayBeforeTyping: 0,
      delayBeforeUntyping: 0,
      typingDelay: 0,
      untypingDelay: 0,
      typingVariation: 0,
    }).start();
    const onArrayFinishedCb = vi.fn();
    const remove = te.onArrayFinished(onArrayFinishedCb);

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
      vi.advanceTimersByTime(16);

      vi.advanceTimersByTime(16 * string.length);

      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("afterUntyping");
      vi.advanceTimersByTime(16);
    };

    // first string
    stringCycle(strings[0]!);

    // second string
    stringCycle(strings[1]!);

    // third string
    stringCycle(strings[2]!);

    // getting to the end of array, restarting the iterator and going back to cycleStart
    expect(te.runningState).toBe("cycleStart");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayBeforeTyping");

    expect(onArrayFinishedCb).toHaveBeenCalledTimes(0);
    vi.advanceTimersByTime(16);
    expect(onArrayFinishedCb).toHaveBeenCalledTimes(1);

    onArrayFinishedCb.mockClear();

    // first string
    stringCycle(strings[0]!);

    // second string
    stringCycle(strings[1]!);

    // remove onArrayFinished subscription
    remove();

    // third string
    stringCycle(strings[2]!);

    // getting to the end of array, restarting the iterator and going back to cycleStart
    expect(te.runningState).toBe("cycleStart");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayBeforeTyping");

    expect(onArrayFinishedCb).toHaveBeenCalledTimes(0);
    vi.advanceTimersByTime(16);
    // this time onArrayFinishedCb not called
    expect(onArrayFinishedCb).toHaveBeenCalledTimes(0);

    // another loop
    // first string
    stringCycle(strings[0]!);

    // second string
    stringCycle(strings[1]!);

    // third string
    stringCycle(strings[2]!);

    // getting to the end of array, restarting the iterator and going back to cycleStart
    expect(te.runningState).toBe("cycleStart");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayBeforeTyping");

    expect(onArrayFinishedCb).toHaveBeenCalledTimes(0);
    vi.advanceTimersByTime(16);
    // onArrayFinishedCb not called again
    expect(onArrayFinishedCb).toHaveBeenCalledTimes(0);

    te.dispose();
  });

  test("setting arrayFinished callback with once === true should be called only one time", () => {
    const strings = ["first string", "second string", "third string"];
    const te = new TypingEffect(strings, vi.fn(), {
      delayBeforeTyping: 0,
      delayBeforeUntyping: 0,
      typingDelay: 0,
      untypingDelay: 0,
      typingVariation: 0,
    }).start();
    const onArrayFinishedCb = vi.fn();
    te.onArrayFinished(onArrayFinishedCb, true);

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
      vi.advanceTimersByTime(16);

      vi.advanceTimersByTime(16 * string.length);

      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("afterUntyping");
      vi.advanceTimersByTime(16);
    };

    // first string
    stringCycle(strings[0]!);

    // second string
    stringCycle(strings[1]!);

    // third string
    stringCycle(strings[2]!);

    // getting to the end of array, restarting the iterator and going back to cycleStart
    expect(te.runningState).toBe("cycleStart");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayBeforeTyping");

    expect(onArrayFinishedCb).toHaveBeenCalledTimes(0);
    vi.advanceTimersByTime(16);
    expect(onArrayFinishedCb).toHaveBeenCalledTimes(1);

    onArrayFinishedCb.mockClear();

    // first string
    stringCycle(strings[0]!);

    // second string
    stringCycle(strings[1]!);

    // third string
    stringCycle(strings[2]!);

    // getting to the end of array, restarting the iterator and going back to cycleStart
    expect(te.runningState).toBe("cycleStart");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayBeforeTyping");

    expect(onArrayFinishedCb).toHaveBeenCalledTimes(0);
    vi.advanceTimersByTime(16);
    // this time onArrayFinishedCb not called
    expect(onArrayFinishedCb).toHaveBeenCalledTimes(0);

    // another loop
    // first string
    stringCycle(strings[0]!);

    // second string
    stringCycle(strings[1]!);

    // third string
    stringCycle(strings[2]!);

    // getting to the end of array, restarting the iterator and going back to cycleStart
    expect(te.runningState).toBe("cycleStart");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayBeforeTyping");

    expect(onArrayFinishedCb).toHaveBeenCalledTimes(0);
    vi.advanceTimersByTime(16);
    // onArrayFinishedCb not called again
    expect(onArrayFinishedCb).toHaveBeenCalledTimes(0);

    te.dispose();
  });
});
