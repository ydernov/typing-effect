import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import { TypingEffect } from ".";

describe("pause method tests", () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ["performance", "requestAnimationFrame"],
    }).clearAllTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  describe("call pause on initialized instance", () => {
    test("instance was created w/o callback and strings", () => {
      const te = new TypingEffect();

      expect(te.instanceState).toBe("initialized");
      expect(te.runningState).toBe("idle");

      expect(() => te.pause()).toThrow(
        'The method "pause" could not be called on the instance of TypingEffect - the current state "initialized" does not match the allowed state "running". Provide the "strings" and "callback" arguments.'
      );

      te.dispose();
    });

    test("instance was created w/o callback", () => {
      const te = new TypingEffect(["str1"]);

      expect(te.instanceState).toBe("initialized");
      expect(te.runningState).toBe("idle");

      expect(() => te.pause()).toThrow(
        'The method "pause" could not be called on the instance of TypingEffect - the current state "initialized" does not match the allowed state "running". Provide the "strings" and "callback" arguments.'
      );

      te.dispose();
    });

    test("instance was created w/o strings", () => {
      const te = new TypingEffect(undefined, vi.fn());

      expect(te.instanceState).toBe("initialized");
      expect(te.runningState).toBe("idle");

      expect(() => te.pause()).toThrow(
        'The method "pause" could not be called on the instance of TypingEffect - the current state "initialized" does not match the allowed state "running". Provide the "strings" and "callback" arguments.'
      );

      te.dispose();
    });

    test("instance was created ready, but then strings were set to []", () => {
      const te = new TypingEffect(["str1"], vi.fn());

      expect(te.instanceState).toBe("ready");
      expect(te.runningState).toBe("idle");

      te.setStrings([]);

      expect(te.instanceState).toBe("initialized");
      expect(te.runningState).toBe("idle");

      expect(() => te.pause()).toThrow(
        'The method "pause" could not be called on the instance of TypingEffect - the current state "initialized" does not match the allowed state "running". Provide the "strings" and "callback" arguments.'
      );

      te.dispose();
    });

    test("instance was created ready, but then callback were set to null", () => {
      const te = new TypingEffect(["str1"], vi.fn());

      expect(te.instanceState).toBe("ready");
      expect(te.runningState).toBe("idle");

      te.setCallback(null);

      expect(te.instanceState).toBe("initialized");
      expect(te.runningState).toBe("idle");

      expect(() => te.pause()).toThrow(
        'The method "pause" could not be called on the instance of TypingEffect - the current state "initialized" does not match the allowed state "running". Provide the "strings" and "callback" arguments.'
      );

      te.dispose();
    });
  });

  describe("call pause on ready instance", () => {
    test("instance was created with callback and strings", () => {
      const te = new TypingEffect(["str1"], vi.fn());

      expect(te.instanceState).toBe("ready");
      expect(te.runningState).toBe("idle");

      expect(() => te.pause()).toThrow(
        'The method "pause" could not be called on the instance of TypingEffect - the current state "ready" does not match the allowed state "running".'
      );

      te.dispose();
    });

    test("instance was created w/o callback and it was set", () => {
      const te = new TypingEffect(["str1"]);

      expect(te.instanceState).toBe("initialized");
      expect(te.runningState).toBe("idle");

      te.setCallback(vi.fn());

      expect(te.instanceState).toBe("ready");
      expect(te.runningState).toBe("idle");

      expect(() => te.pause()).toThrow(
        'The method "pause" could not be called on the instance of TypingEffect - the current state "ready" does not match the allowed state "running".'
      );

      te.dispose();
    });

    test("instance was created w/o strings and they were set", () => {
      const te = new TypingEffect(undefined, vi.fn());

      expect(te.instanceState).toBe("initialized");
      expect(te.runningState).toBe("idle");

      te.setStrings(["str1"]);

      expect(te.instanceState).toBe("ready");
      expect(te.runningState).toBe("idle");

      expect(() => te.pause()).toThrow(
        'The method "pause" could not be called on the instance of TypingEffect - the current state "ready" does not match the allowed state "running".'
      );

      te.dispose();
    });

    test("instance was created w/o strings and callback, but they were set", () => {
      const te = new TypingEffect();

      expect(te.instanceState).toBe("initialized");
      expect(te.runningState).toBe("idle");

      te.setStrings(["str1"]).setCallback(vi.fn());

      expect(te.instanceState).toBe("ready");
      expect(te.runningState).toBe("idle");

      expect(() => te.pause()).toThrow(
        'The method "pause" could not be called on the instance of TypingEffect - the current state "ready" does not match the allowed state "running".'
      );

      te.dispose();
    });
  });

  describe("call pause on running instance", () => {
    test("call pause after while typing, should pause and idle calling callback with cursorBlinkRate intervals, then resume", () => {
      const cb = vi.fn();
      const te = new TypingEffect(["first string", "second string"], cb, {
        delayBeforeTyping: 0,
        delayAfterTyping: 0,
        typingDelay: 0,
        untypingDelay: 0,
        typingVariation: 0,
        cursorBlinkRate: 16,
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

      vi.advanceTimersByTime(16 * "first ".length);
      expect(cb).toHaveBeenLastCalledWith("first |");
      expect(cb).toHaveBeenCalledTimes("first ".length);
      cb.mockClear();
      te.pause();

      expect(te.runningState).toBe("idle");
      expect(te.instanceState).toBe("running");

      vi.advanceTimersByTime(32);
      expect(cb).toHaveBeenCalledWith("first ");
      vi.advanceTimersByTime(16);
      expect(cb).toHaveBeenCalledWith("first |");
      vi.advanceTimersByTime(16);
      expect(cb).toHaveBeenCalledWith("first ");
      vi.advanceTimersByTime(16);
      expect(cb).toHaveBeenCalledWith("first |");
      vi.advanceTimersByTime(16);
      expect(cb).toHaveBeenCalledWith("first ");
      vi.advanceTimersByTime(16);
      expect(cb).toHaveBeenCalledWith("first |");
      vi.advanceTimersByTime(16);
      expect(cb).toHaveBeenCalledWith("first ");
      vi.advanceTimersByTime(16);
      expect(cb).toHaveBeenCalledWith("first |");
      cb.mockClear();

      te.resume();

      expect(te.runningState).toBe("typing");
      expect(te.instanceState).toBe("running");

      vi.advanceTimersByTime(16 * "string".length);
      expect(cb).toHaveBeenLastCalledWith("first string|");
      expect(cb).toHaveBeenCalledTimes("string".length);

      te.dispose();
    });

    test("call pause after pause was already called, should not affect pausing and resume", () => {
      const cb = vi.fn();
      const te = new TypingEffect(["first string", "second string"], cb, {
        delayBeforeTyping: 0,
        delayAfterTyping: 0,
        typingDelay: 0,
        untypingDelay: 0,
        typingVariation: 0,
        cursorBlinkRate: 16,
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

      vi.advanceTimersByTime(16 * "first ".length);
      expect(cb).toHaveBeenLastCalledWith("first |");
      expect(cb).toHaveBeenCalledTimes("first ".length);
      cb.mockClear();
      te.pause();

      expect(te.runningState).toBe("idle");
      expect(te.instanceState).toBe("running");

      vi.advanceTimersByTime(32);
      expect(cb).toHaveBeenCalledWith("first ");
      vi.advanceTimersByTime(16);
      expect(cb).toHaveBeenCalledWith("first |");
      vi.advanceTimersByTime(16);
      expect(cb).toHaveBeenCalledWith("first ");
      vi.advanceTimersByTime(16);
      expect(cb).toHaveBeenCalledWith("first |");
      vi.advanceTimersByTime(16);
      expect(cb).toHaveBeenCalledWith("first ");
      vi.advanceTimersByTime(16);
      expect(cb).toHaveBeenCalledWith("first |");
      vi.advanceTimersByTime(16);
      expect(cb).toHaveBeenCalledWith("first ");
      vi.advanceTimersByTime(16);
      expect(cb).toHaveBeenCalledWith("first |");

      te.pause();

      vi.advanceTimersByTime(16);
      expect(cb).toHaveBeenCalledWith("first ");
      vi.advanceTimersByTime(16);
      expect(cb).toHaveBeenCalledWith("first |");
      vi.advanceTimersByTime(16);
      expect(cb).toHaveBeenCalledWith("first ");
      vi.advanceTimersByTime(16);
      expect(cb).toHaveBeenCalledWith("first |");

      cb.mockClear();

      te.resume();

      expect(te.runningState).toBe("typing");
      expect(te.instanceState).toBe("running");

      vi.advanceTimersByTime(16 * "string".length);
      expect(cb).toHaveBeenLastCalledWith("first string|");
      expect(cb).toHaveBeenCalledTimes("string".length);

      te.dispose();
    });

    test("call pause after stop, should throw because not instanceState is not running", () => {
      const cb = vi.fn();
      const te = new TypingEffect(["first string", "second string"], cb, {
        delayBeforeTyping: 0,
        delayAfterTyping: 0,
        typingDelay: 0,
        untypingDelay: 0,
        typingVariation: 0,
        cursorBlinkRate: 16,
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

      vi.advanceTimersByTime(16 * "first ".length);
      expect(cb).toHaveBeenLastCalledWith("first |");
      expect(cb).toHaveBeenCalledTimes("first ".length);
      cb.mockClear();

      te.stop();

      expect(te.runningState).toBe("idle");
      expect(te.instanceState).toBe("ready");

      expect(() => te.pause()).toThrow(
        'The method "pause" could not be called on the instance of TypingEffect - the current state "ready" does not match the allowed state "running".'
      );

      vi.advanceTimersByTime(1600);

      expect(te.runningState).toBe("idle");
      expect(te.instanceState).toBe("ready");

      te.dispose();
    });
  });

  test("calling after dispose", () => {
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

    expect(() => te.pause()).toThrow(
      'The method "pause" could not be called - the instance of TypingEffect was disposed. Create a new one.'
    );
  });
});
