import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import { TypingEffect } from ".";

describe("start method tests", () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ["performance", "requestAnimationFrame"],
    }).clearAllTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  test("calling start when instance created without arguments", () => {
    const te = new TypingEffect();
    expect(performance.now()).toBe(0);

    expect(() => te.start()).toThrowError(
      `The method "start" could not be called on the instance of TypingEffect - the current state "initialized" does not match the allowed states "running, ready". Provide the "strings" and "callback" arguments.`
    );
    expect(te.instanceState).toBe("initialized");
    expect(te.runningState).toBe("idle");

    te.dispose();
  });

  test("calling start when instance created without callback", () => {
    const te = new TypingEffect(["string 1"]);
    expect(performance.now()).toBe(0);

    expect(() => te.start()).toThrowError(
      `The method "start" could not be called on the instance of TypingEffect - the current state "initialized" does not match the allowed states "running, ready". Provide the "strings" and "callback" arguments.`
    );
    expect(te.instanceState).toBe("initialized");
    expect(te.runningState).toBe("idle");

    te.dispose();
  });

  test("calling start when instance created without strings", () => {
    const te = new TypingEffect(undefined, vi.fn());
    expect(performance.now()).toBe(0);

    expect(() => te.start()).toThrowError(
      `The method "start" could not be called on the instance of TypingEffect - the current state "initialized" does not match the allowed states "running, ready". Provide the "strings" and "callback" arguments.`
    );
    expect(te.instanceState).toBe("initialized");
    expect(te.runningState).toBe("idle");

    te.dispose();
  });

  test("calling start when instance created with strings and callback", () => {
    const te = new TypingEffect(["string 1"], vi.fn());
    expect(performance.now()).toBe(0);

    expect(te.start()).toBe(te);

    expect(te.instanceState).toBe("running");
    expect(te.runningState).toBe("cycleStart");

    te.dispose();
  });

  test("calling start when strings and callback were set via the respective methods", () => {
    const te = new TypingEffect();
    expect(performance.now()).toBe(0);

    te.setStrings(["string 1"]).setCallback(vi.fn());

    expect(te.start()).toBe(te);
    expect(te.instanceState).toBe("running");
    expect(te.runningState).toBe("cycleStart");

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
    "calling start while running after $method should restart from string 1",
    ({ method, expectedInstanceState, expectedRunningState }) => {
      expect(performance.now()).toBe(0);
      const strings = ["string 1", "longer string 2"];
      const callback = vi.fn();
      const te = new TypingEffect(strings, callback, {
        delayBeforeTyping: 0,
        delayBeforeUntyping: 0,
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
      expect(callback).toHaveBeenNthCalledWith(1, "s|");
      expect(callback).toHaveBeenNthCalledWith(2, "st|");
      expect(callback).toHaveBeenNthCalledWith(3, "str|");
      expect(callback).toHaveBeenNthCalledWith(4, "stri|");
      expect(callback).toHaveBeenNthCalledWith(5, "strin|");
      expect(callback).toHaveBeenNthCalledWith(6, "string|");
      expect(callback).toHaveBeenNthCalledWith(7, "string |");
      expect(callback).toHaveBeenNthCalledWith(8, "string 1|");

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
      callback.mockClear();

      vi.advanceTimersByTime(16 * strings[1]!.length);
      expect(callback).toHaveBeenLastCalledWith(strings[1] + "|");
      expect(callback).toHaveBeenCalledTimes(strings[1]!.length);
      callback.mockClear();

      // can be skiped for method === "start"
      te[method]();
      expect(te.instanceState).toBe(expectedInstanceState);
      expect(te.runningState).toBe(expectedRunningState);

      vi.advanceTimersByTime(16);
      if (method === "pause") {
        // paused sneaks in one frame of blinking cursor
        expect(callback).toHaveBeenLastCalledWith(strings[1]);
        callback.mockClear();
      }

      te.start();
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

      te.dispose();
    }
  );

  test("calling start after scheduled jumpTo, since jumpTo is scheduled -> works after start -> jumps to string", () => {
    expect(performance.now()).toBe(0);
    const strings = ["string 1", "longer string 2", "str 3"];
    const callback = vi.fn();
    const te = new TypingEffect(strings, callback, {
      delayBeforeTyping: 0,
      delayBeforeUntyping: 0,
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

    vi.advanceTimersByTime(16);
    expect(te.instanceState).toBe("running");
    expect(te.runningState).toBe("afterTyping");

    te.start();
    expect(te.instanceState).toBe("running");
    expect(te.runningState).toBe("cycleStart");

    // getting to typing
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayBeforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("beforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("typing");

    vi.advanceTimersByTime(16 * strings[2]!.length);
    expect(callback).toHaveBeenLastCalledWith(strings[2] + "|");
    expect(callback).toHaveBeenCalledTimes(strings[2]!.length);

    te.dispose();
  });

  test("calling start after immediate jumpTo, should 'ignore' jumpTo and restart", () => {
    expect(performance.now()).toBe(0);
    const strings = ["string 1", "longer string 2", "str 3"];
    const callback = vi.fn();
    const te = new TypingEffect(strings, callback, {
      delayBeforeTyping: 0,
      delayBeforeUntyping: 0,
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

    te.start();
    expect(te.instanceState).toBe("running");
    expect(te.runningState).toBe("cycleStart");

    // getting to typing
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("delayBeforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("beforeTyping");
    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("typing");

    vi.advanceTimersByTime(16);
    expect(te.runningState).toBe("typing");

    vi.advanceTimersByTime(16 * strings[0]!.length);
    expect(callback).toHaveBeenLastCalledWith(strings[0] + "|");
    expect(callback).toHaveBeenCalledTimes(strings[0]!.length);

    te.dispose();
  });

  test("calling start after dispose", () => {
    const strings = ["string 1", "longer string 2", "str 3"];
    const callback = vi.fn();
    const te = new TypingEffect(strings, callback, {
      delayBeforeTyping: 0,
      delayBeforeUntyping: 0,
      typingDelay: 0,
      untypingDelay: 0,
      typingVariation: 0,
    }).start();

    expect(te.instanceState).toBe("running");
    expect(te.runningState).toBe("cycleStart");

    te.dispose();

    expect(() => te.start()).toThrow(
      'The method "start" could not be called - the instance of TypingEffect was disposed. Create a new one.'
    );
  });

  test("calling start after seting callback to null, should be initialized and idle", () => {
    const strings = ["string 1", "longer string 2", "str 3"];
    const callback = vi.fn();
    const te = new TypingEffect(strings, callback, {
      delayBeforeTyping: 0,
      delayBeforeUntyping: 0,
      typingDelay: 0,
      untypingDelay: 0,
      typingVariation: 0,
    }).start();

    expect(te.instanceState).toBe("running");
    expect(te.runningState).toBe("cycleStart");

    te.setCallback(null, true);

    expect(te.instanceState).toBe("initialized");
    expect(te.runningState).toBe("idle");

    expect(() => te.start()).toThrow(
      'The method "start" could not be called on the instance of TypingEffect - the current state "initialized" does not match the allowed states "running, ready". Provide the "strings" and "callback" arguments.'
    );

    expect(te.instanceState).toBe("initialized");
    expect(te.runningState).toBe("idle");

    te.dispose();
  });

  test("calling start after seting strings to [], should be initialized and idle", () => {
    const strings = ["string 1", "longer string 2", "str 3"];
    const callback = vi.fn();
    const te = new TypingEffect(strings, callback, {
      delayBeforeTyping: 0,
      delayBeforeUntyping: 0,
      typingDelay: 0,
      untypingDelay: 0,
      typingVariation: 0,
    }).start();

    expect(te.instanceState).toBe("running");
    expect(te.runningState).toBe("cycleStart");

    te.setStrings([], true);

    expect(te.instanceState).toBe("initialized");
    expect(te.runningState).toBe("idle");

    expect(() => te.start()).toThrow(
      'The method "start" could not be called on the instance of TypingEffect - the current state "initialized" does not match the allowed states "running, ready". Provide the "strings" and "callback" arguments.'
    );

    expect(te.instanceState).toBe("initialized");
    expect(te.runningState).toBe("idle");

    te.dispose();
  });
});
