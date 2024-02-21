import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import { TypingEffect } from ".";

describe("stop method tests", () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ["performance", "requestAnimationFrame"],
    }).clearAllTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  test.each([
    {
      cb: undefined,
      strings: undefined,
      description: "calling stop when instance was created without arguments",
      instanceState: "initialized",
    },
    {
      cb: undefined,
      strings: ["string 1"],
      description: "calling stop when instance was created without callback",
      instanceState: "initialized",
    },

    {
      cb: vi.fn(),

      strings: undefined,
      description: "calling stop when instance was created without strings",
      instanceState: "initialized",
    },

    {
      cb: vi.fn(),
      strings: ["string 1"],
      description:
        "calling stop when instance was created with strings and callback",
      instanceState: "ready",
    },
  ])("$description", ({ strings, cb, instanceState }) => {
    const te = new TypingEffect(strings, cb);

    expect(te.stop()).toBe(te);
    expect(te.instanceState).toBe(instanceState);
    expect(te.runningState).toBe("idle");

    te.dispose();
  });

  test("calling stop when strings and callback were set via the respective methods", () => {
    const te = new TypingEffect();
    te.setStrings(["string 1"]).setCallback(vi.fn());

    expect(te.stop()).toBe(te);

    expect(te.instanceState).toBe("ready");
    expect(te.runningState).toBe("idle");

    te.dispose();
  });

  test.each([
    {
      method: "start",
      expectedInstanceState: "running",
      expectedRunningState: "cycleStart",
    },
    {
      method: "stop",
      expectedInstanceState: "ready",
      expectedRunningState: "idle",
    },

    {
      method: "pause",
      expectedInstanceState: "running",
      expectedRunningState: "idle",
    },

    {
      method: "resume",
      expectedInstanceState: "running",
      expectedRunningState: "typing",
    },
  ] as const)(
    "calling stop while running after $method",
    ({ method, expectedInstanceState, expectedRunningState }) => {
      expect(performance.now()).toBe(0);
      const strings = ["string 1", "longer string 2"];
      const callback = vi.fn();
      const te = new TypingEffect(strings, callback, {
        delayBeforeTyping: 0,
        delayAfterTyping: 0,
        typingDelay: 0,
        untypingDelay: 0,
        typingVariation: 0,
      }).start();

      expect(te.instanceState).toBe("running");
      expect(te.runningState).toBe("cycleStart");

      // getting to typing
      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("delayBeforeTyping");
      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("beforeTyping");
      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("typing");

      vi.advanceTimersByTime(16 * strings[0]!.length);
      expect(callback).toHaveBeenLastCalledWith(strings[0] + "|");
      expect(callback).toHaveBeenCalledTimes(strings[0]!.length);
      callback.mockClear();

      // getting to untyping
      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("afterTyping");
      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("delayAfterTyping");
      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("beforeUntyping");
      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("untyping");

      // skip 1 iteration because untyping starts from full string length
      vi.advanceTimersByTime(16);
      expect(callback).toHaveBeenCalledTimes(0);

      vi.advanceTimersByTime(16 * strings[0]!.length);
      expect(callback).toHaveBeenLastCalledWith("|");
      expect(callback).toHaveBeenCalledTimes(strings[0]!.length);
      callback.mockClear();

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
      expect(callback).toHaveBeenCalledTimes(0);

      vi.advanceTimersByTime(16 * strings[1]!.length);
      expect(callback).toHaveBeenLastCalledWith(strings[1] + "|");
      expect(callback).toHaveBeenCalledTimes(strings[1]!.length);
      callback.mockClear();

      te[method]();
      expect(te.instanceState).toBe(expectedInstanceState);
      expect(te.runningState).toBe(expectedRunningState);

      te.stop();
      vi.advanceTimersByTime(16);
      expect(te.instanceState).toBe("ready");
      expect(te.runningState).toBe("idle");

      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("idle");
      vi.advanceTimersByTime(16000);

      expect(callback).toHaveBeenCalledTimes(0);

      te.dispose();
    }
  );

  test("calling stop after scheduled jumpTo", () => {
    const strings = ["string 1", "longer string 2", "str 3"];
    const callback = vi.fn();
    const te = new TypingEffect(strings, callback, {
      delayBeforeTyping: 0,
      delayAfterTyping: 0,
      typingDelay: 0,
      untypingDelay: 0,
      typingVariation: 0,
    }).start();

    expect(te.instanceState).toBe("running");
    expect(te.runningState).toBe("cycleStart");

    // getting to typing
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayBeforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("beforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("typing");

    vi.advanceTimersByTime(16 * strings[0]!.length);
    expect(callback).toHaveBeenLastCalledWith(strings[0] + "|");
    expect(callback).toHaveBeenCalledTimes(strings[0]!.length);
    callback.mockClear();

    te.jumpTo(2);

    expect(te.instanceState).toBe("running");
    expect(te.runningState).toBe("typing");

    te.stop();
    expect(te.instanceState).toBe("ready");
    expect(te.runningState).toBe("idle");

    vi.advanceTimersByTime(16000);
    expect(te.instanceState).toBe("ready");
    expect(te.runningState).toBe("idle");

    expect(callback).toHaveBeenCalledTimes(0);

    te.dispose();
  });

  test("calling stop after immediate jumpTo", () => {
    const strings = ["string 1", "longer string 2", "str 3"];
    const callback = vi.fn();
    const te = new TypingEffect(strings, callback, {
      delayBeforeTyping: 0,
      delayAfterTyping: 0,
      typingDelay: 0,
      untypingDelay: 0,
      typingVariation: 0,
    }).start();

    expect(te.instanceState).toBe("running");
    expect(te.runningState).toBe("cycleStart");

    // getting to typing
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayBeforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("beforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("typing");

    vi.advanceTimersByTime(16 * strings[0]!.length);
    expect(callback).toHaveBeenLastCalledWith(strings[0] + "|");
    expect(callback).toHaveBeenCalledTimes(strings[0]!.length);
    callback.mockClear();

    te.jumpTo(2, true);

    expect(te.instanceState).toBe("running");
    expect(te.runningState).toBe("cycleStart");

    te.stop();

    expect(te.instanceState).toBe("ready");
    expect(te.runningState).toBe("idle");

    vi.advanceTimersByTime(16000);
    expect(te.instanceState).toBe("ready");
    expect(te.runningState).toBe("idle");
    expect(callback).toHaveBeenCalledTimes(0);

    te.dispose();
  });

  test("calling stop after dispose", () => {
    const strings = ["string 1", "longer string 2", "str 3"];
    const callback = vi.fn();
    const te = new TypingEffect(strings, callback, {
      delayBeforeTyping: 0,
      delayAfterTyping: 0,
      typingDelay: 0,
      untypingDelay: 0,
      typingVariation: 0,
    }).start();

    expect(te.instanceState).toBe("running");
    expect(te.runningState).toBe("cycleStart");

    te.dispose();

    expect(() => te.stop()).toThrow(
      'The method "stop" could not be called - the instance of TypingEffect was disposed. Create a new one.'
    );
  });

  test("calling stop after seting callback to null, should be initialized and idle", () => {
    const strings = ["string 1", "longer string 2", "str 3"];
    const callback = vi.fn();
    const te = new TypingEffect(strings, callback, {
      delayBeforeTyping: 0,
      delayAfterTyping: 0,
      typingDelay: 0,
      untypingDelay: 0,
      typingVariation: 0,
    }).start();

    expect(te.instanceState).toBe("running");
    expect(te.runningState).toBe("cycleStart");

    te.setCallback(null, true);

    expect(te.instanceState).toBe("initialized");
    expect(te.runningState).toBe("idle");

    te.stop();

    expect(te.instanceState).toBe("initialized");
    expect(te.runningState).toBe("idle");

    te.dispose();
  });

  test("calling stop after seting strings to [], should be initialized and idle", () => {
    const strings = ["string 1", "longer string 2", "str 3"];
    const callback = vi.fn();
    const te = new TypingEffect(strings, callback, {
      delayBeforeTyping: 0,
      delayAfterTyping: 0,
      typingDelay: 0,
      untypingDelay: 0,
      typingVariation: 0,
    }).start();

    expect(te.instanceState).toBe("running");
    expect(te.runningState).toBe("cycleStart");

    te.setStrings([], true);

    expect(te.instanceState).toBe("initialized");
    expect(te.runningState).toBe("idle");

    te.stop();

    expect(te.instanceState).toBe("initialized");
    expect(te.runningState).toBe("idle");

    te.dispose();
  });
});
