import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import { TypingEffect } from ".";

describe("jumpTo method tests", () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ["performance", "requestAnimationFrame"],
    }).clearAllTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  describe("call jumpTo on initialized instance", () => {
    test("instance was created w/o callback and strings", () => {
      const te = new TypingEffect();

      expect(te.instanceState).toBe("initialized");
      expect(te.runningState).toBe("idle");

      expect(() => te.jumpTo()).toThrow(
        'The method "jumpTo" could not be called on the instance of TypingEffect - the current state "initialized" does not match the allowed state "running". Provide the "strings" and "callback" arguments.'
      );

      te.dispose();
    });

    test("instance was created w/o callback", () => {
      const te = new TypingEffect(["str1"]);

      expect(te.instanceState).toBe("initialized");
      expect(te.runningState).toBe("idle");

      expect(() => te.jumpTo()).toThrow(
        'The method "jumpTo" could not be called on the instance of TypingEffect - the current state "initialized" does not match the allowed state "running". Provide the "strings" and "callback" arguments.'
      );

      te.dispose();
    });

    test("instance was created w/o strings", () => {
      const te = new TypingEffect(undefined, vi.fn());

      expect(te.instanceState).toBe("initialized");
      expect(te.runningState).toBe("idle");

      expect(() => te.jumpTo()).toThrow(
        'The method "jumpTo" could not be called on the instance of TypingEffect - the current state "initialized" does not match the allowed state "running". Provide the "strings" and "callback" arguments.'
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

      expect(() => te.jumpTo()).toThrow(
        'The method "jumpTo" could not be called on the instance of TypingEffect - the current state "initialized" does not match the allowed state "running". Provide the "strings" and "callback" arguments.'
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

      expect(() => te.jumpTo()).toThrow(
        'The method "jumpTo" could not be called on the instance of TypingEffect - the current state "initialized" does not match the allowed state "running". Provide the "strings" and "callback" arguments.'
      );

      te.dispose();
    });
  });

  describe("call jumpTo on ready instance", () => {
    test("instance was created with callback and strings", () => {
      const te = new TypingEffect(["str1"], vi.fn());

      expect(te.instanceState).toBe("ready");
      expect(te.runningState).toBe("idle");

      expect(() => te.jumpTo()).toThrow(
        'The method "jumpTo" could not be called on the instance of TypingEffect - the current state "ready" does not match the allowed state "running".'
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

      expect(() => te.jumpTo()).toThrow(
        'The method "jumpTo" could not be called on the instance of TypingEffect - the current state "ready" does not match the allowed state "running".'
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

      expect(() => te.jumpTo()).toThrow(
        'The method "jumpTo" could not be called on the instance of TypingEffect - the current state "ready" does not match the allowed state "running".'
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

      expect(() => te.jumpTo()).toThrow(
        'The method "jumpTo" could not be called on the instance of TypingEffect - the current state "ready" does not match the allowed state "running".'
      );

      te.dispose();
    });

    test("call after stop", () => {
      const te = new TypingEffect(["str1"], vi.fn()).start();

      expect(te.instanceState).toBe("running");
      expect(te.runningState).toBe("cycleStart");

      te.stop();

      expect(() => te.jumpTo()).toThrow(
        'The method "jumpTo" could not be called on the instance of TypingEffect - the current state "ready" does not match the allowed state "running".'
      );

      te.dispose();
    });
  });

  describe("call jumpTo on running instance", () => {
    test.each([
      {
        index: -1,
      },
      {
        index: 20,
      },
    ])(
      "call with out of range index - '$index', should jump to index 0",
      ({ index }) => {
        const cb = vi.fn();
        const te = new TypingEffect(
          ["first string", "second string", "third string"],
          cb,
          {
            delayBeforeTyping: 0,
            delayBeforeUntyping: 0,
            typingDelay: 0,
            untypingDelay: 0,
            typingVariation: 0,
          }
        ).start();

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

        te.jumpTo(index, true);
        expect(te.runningState).toBe("cycleStart");

        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("delayBeforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("beforeTyping");
        vi.advanceTimersByTime(16);
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * "first string".length);
        expect(cb).toHaveBeenLastCalledWith("first string|");
        expect(cb).toHaveBeenCalledTimes("first string".length);

        te.dispose();
      }
    );

    test("call without an argument, should jump to current string", () => {
      const cb = vi.fn();
      const te = new TypingEffect(
        ["first string", "second string", "third string"],
        cb,
        {
          delayBeforeTyping: 0,
          delayBeforeUntyping: 0,
          typingDelay: 0,
          untypingDelay: 0,
          typingVariation: 0,
        }
      ).start();

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

      // should jump to the first string
      te.jumpTo(undefined, true);
      expect(te.runningState).toBe("cycleStart");

      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("delayBeforeTyping");
      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("beforeTyping");
      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("typing");

      vi.advanceTimersByTime(16 * "first string".length);
      expect(cb).toHaveBeenLastCalledWith("first string|");
      expect(cb).toHaveBeenCalledTimes("first string".length);
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

      vi.advanceTimersByTime(16 * "first string".length);
      expect(cb).toHaveBeenLastCalledWith("|");
      expect(cb).toHaveBeenCalledTimes("first string".length);
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

      // at cycleStart the second string is in processing so should jump to it
      te.jumpTo(undefined, true);
      expect(te.runningState).toBe("cycleStart");

      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("delayBeforeTyping");
      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("beforeTyping");
      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("typing");

      vi.advanceTimersByTime(16 * "second string".length);
      expect(cb).toHaveBeenCalledTimes("second string".length);
      expect(cb).toHaveBeenLastCalledWith("second string|");

      te.dispose();
    });

    test("call jumpTo while typing, should schedule the jump to after the first string is untyped, then switch to the string of the provided index", () => {
      const cb = vi.fn();
      const te = new TypingEffect(
        ["first string", "second string", "third string"],
        cb,
        {
          delayBeforeTyping: 0,
          delayBeforeUntyping: 0,
          typingDelay: 0,
          untypingDelay: 0,
          typingVariation: 0,
        }
      ).start();

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

      // jump to the third string
      te.jumpTo(2);

      vi.advanceTimersByTime(16 * "string".length);
      expect(cb).toHaveBeenLastCalledWith("first string|");
      expect(cb).toHaveBeenCalledTimes("first string".length);
      cb.mockClear();

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
      vi.advanceTimersByTime(16 * "first string".length);
      expect(cb).toHaveBeenLastCalledWith("|");
      expect(cb).toHaveBeenCalledTimes("first string".length);
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

      vi.advanceTimersByTime(16 * "third string".length);
      expect(cb).toHaveBeenLastCalledWith("third string|");
      expect(cb).toHaveBeenCalledTimes("third string".length);

      te.dispose();
    });

    test("call jumpTo with now === true while typing, should immediately jump to the new string with cycleStart", () => {
      const cb = vi.fn();
      const te = new TypingEffect(
        ["first string", "second string", "third string"],
        cb,
        {
          delayBeforeTyping: 0,
          delayBeforeUntyping: 0,
          typingDelay: 0,
          untypingDelay: 0,
          typingVariation: 0,
        }
      ).start();

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

      // jump to the third string
      te.jumpTo(2, true);
      cb.mockClear();
      expect(te.runningState).toBe("cycleStart");

      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("delayBeforeTyping");
      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("beforeTyping");
      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("typing");

      vi.advanceTimersByTime(16 * "third string".length);
      expect(cb).toHaveBeenLastCalledWith("third string|");
      expect(cb).toHaveBeenCalledTimes("third string".length);

      te.dispose();
    });

    test("consecutive jumpTo calls while typing, should schedule the jumps to after the first string is untyped, then switch to the string of the last jumpTo call", () => {
      const cb = vi.fn();
      const te = new TypingEffect(
        ["first string", "second string", "third string"],
        cb,
        {
          delayBeforeTyping: 0,
          delayBeforeUntyping: 0,
          typingDelay: 0,
          untypingDelay: 0,
          typingVariation: 0,
        }
      ).start();

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

      // jump to the third string
      te.jumpTo().jumpTo(1).jumpTo(2);

      vi.advanceTimersByTime(16 * "string".length);
      expect(cb).toHaveBeenLastCalledWith("first string|");
      expect(cb).toHaveBeenCalledTimes("first string".length);
      cb.mockClear();

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
      vi.advanceTimersByTime(16 * "first string".length);
      expect(cb).toHaveBeenLastCalledWith("|");
      expect(cb).toHaveBeenCalledTimes("first string".length);
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

      vi.advanceTimersByTime(16 * "third string".length);
      expect(cb).toHaveBeenLastCalledWith("third string|");
      expect(cb).toHaveBeenCalledTimes("third string".length);

      te.dispose();
    });

    test("consecutive jumpTo calls with now === true while typing, should immediately jump to the string of the last jumpTo call", () => {
      const cb = vi.fn();
      const te = new TypingEffect(
        ["first string", "second string", "third string"],
        cb,
        {
          delayBeforeTyping: 0,
          delayBeforeUntyping: 0,
          typingDelay: 0,
          untypingDelay: 0,
          typingVariation: 0,
        }
      ).start();

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

      // jump to the third string
      te.jumpTo(0, true).jumpTo(undefined, true).jumpTo(2, true);
      cb.mockClear();
      expect(te.runningState).toBe("cycleStart");

      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("delayBeforeTyping");
      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("beforeTyping");
      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("typing");

      vi.advanceTimersByTime(16 * "third string".length);
      expect(cb).toHaveBeenLastCalledWith("third string|");
      expect(cb).toHaveBeenCalledTimes("third string".length);

      te.dispose();
    });

    ///
  });

  test("calling after dispose", () => {
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

    expect(() => te.jumpTo()).toThrow(
      'The method "jumpTo" could not be called - the instance of TypingEffect was disposed. Create a new one.'
    );
  });
});
