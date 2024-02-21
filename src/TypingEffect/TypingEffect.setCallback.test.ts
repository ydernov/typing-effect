import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import { TypingEffect } from ".";

describe(`setCallback method tests`, () => {
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
      `with valid callback and now === $useNow;
        runningState should be "idle",
        should not duplicate "cycleStart" - next stage should be "delayBeforeTyping",
        calling should return instance`,
      ({ useNow }) => {
        const cb = vi.fn();
        const strings = ["str1, str2"];

        const te = new TypingEffect(strings, undefined, {
          delayBeforeTyping: 0,
          delayAfterTyping: 0,
          typingDelay: 0,
          untypingDelay: 0,
          typingVariation: 0,
        });

        expect(te.callback).toEqual(null);
        expect(te.strings).toEqual(strings);
        expect(te.instanceState).toBe("initialized");
        expect(te.runningState).toBe("idle");

        expect(te.setCallback(cb, useNow)).toBe(te);
        expect(te.callback).toBe(cb);

        expect(te.instanceState).toBe("ready");
        expect(te.runningState).toBe("idle");

        te.start();

        expect(te.instanceState).toBe("running");
        expect(te.runningState).toBe("cycleStart");

        vi.advanceTimersToNextTimer();

        expect(te.instanceState).toBe("running");
        expect(te.runningState).toBe("delayBeforeTyping");

        te.dispose();
      }
    );

    test.each([
      {
        useNow: false,
      },
      { useNow: true },
    ])(
      `with null and now === $useNow;
        runningState should be "idle",
        calling should return instance`,
      ({ useNow }) => {
        const strings = ["str1, str2"];

        const te = new TypingEffect(strings, undefined, {
          delayBeforeTyping: 0,
          delayAfterTyping: 0,
          typingDelay: 0,
          untypingDelay: 0,
          typingVariation: 0,
        });

        expect(te.strings).toEqual(strings);
        expect(te.callback).toEqual(null);

        expect(te.instanceState).toBe("initialized");
        expect(te.runningState).toBe("idle");

        expect(te.setCallback(null, useNow)).toBe(te);

        expect(te.instanceState).toBe("initialized");
        expect(te.runningState).toBe("idle");

        expect(() => te.start()).toThrow(
          'The method "start" could not be called on the instance of TypingEffect - the current state "initialized" does not match the allowed states "running, ready". Provide the "strings" and "callback" arguments.'
        );

        te.dispose();
      }
    );

    test.each([
      {
        useNow: false,
      },
      { useNow: true },
    ])(
      `cuncurrent calls should only use the last; with now === $useNow;
        runningState should be "idle",
        should not duplicate "cycleStart" - next stage should be "delayBeforeTyping",
        calling should return instance`,
      ({ useNow }) => {
        const cb1 = vi.fn();
        const cb2 = null;
        const cb3 = vi.fn();
        const strings = ["str1, str2"];

        const te = new TypingEffect(strings, undefined, {
          delayBeforeTyping: 0,
          delayAfterTyping: 0,
          typingDelay: 0,
          untypingDelay: 0,
          typingVariation: 0,
        });

        expect(te.callback).toEqual(null);
        expect(te.strings).toEqual(strings);
        expect(te.instanceState).toBe("initialized");
        expect(te.runningState).toBe("idle");

        expect(
          te
            .setCallback(cb1, useNow)
            .setCallback(cb2, useNow)
            .setCallback(cb3, useNow)
        ).toBe(te);
        expect(te.callback).toBe(cb3);

        expect(te.instanceState).toBe("ready");
        expect(te.runningState).toBe("idle");

        te.start();

        expect(te.instanceState).toBe("running");
        expect(te.runningState).toBe("cycleStart");

        vi.advanceTimersToNextTimer();

        expect(te.instanceState).toBe("running");
        expect(te.runningState).toBe("delayBeforeTyping");

        vi.advanceTimersToNextTimer();
        expect(te.runningState).toBe("beforeTyping");

        vi.advanceTimersToNextTimer();
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * strings[0]!.length);

        expect(te.runningState).toBe("typing");

        expect(cb3).toHaveBeenCalledTimes(strings[0]!.length);
        expect(cb3).toHaveBeenLastCalledWith(strings[0] + "|");
        expect(cb1).toBeCalledTimes(0);

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
      `with valid callback and now === $useNow;
        runningState should be "idle",
        should not duplicate "cycleStart" - next stage should be "delayBeforeTyping",
        calling should return instance`,
      ({ useNow }) => {
        const cb1 = vi.fn();
        const cb2 = vi.fn();
        const strings = ["str1, str2"];

        const te = new TypingEffect(strings, cb1, {
          delayBeforeTyping: 0,
          delayAfterTyping: 0,
          typingDelay: 0,
          untypingDelay: 0,
          typingVariation: 0,
        });

        expect(te.callback).toBe(cb1);
        expect(te.strings).toEqual(strings);
        expect(te.instanceState).toBe("ready");
        expect(te.runningState).toBe("idle");

        expect(te.setCallback(cb2, useNow)).toBe(te);
        expect(te.callback).toBe(cb2);

        expect(te.instanceState).toBe("ready");
        expect(te.runningState).toBe("idle");

        te.start();

        expect(te.instanceState).toBe("running");
        expect(te.runningState).toBe("cycleStart");

        vi.advanceTimersToNextTimer();

        expect(te.instanceState).toBe("running");
        expect(te.runningState).toBe("delayBeforeTyping");

        te.dispose();
      }
    );

    test.each([
      {
        useNow: false,
      },
      { useNow: true },
    ])(
      `with null callback and now === $useNow;
        runningState should be "idle",
        instanceState should be "initialized"
        calling should return instance`,
      ({ useNow }) => {
        const cb = vi.fn();
        const strings = ["str1, str2"];

        const te = new TypingEffect(strings, cb, {
          delayBeforeTyping: 0,
          delayAfterTyping: 0,
          typingDelay: 0,
          untypingDelay: 0,
          typingVariation: 0,
        });

        expect(te.callback).toBe(cb);
        expect(te.strings).toEqual(strings);
        expect(te.instanceState).toBe("ready");
        expect(te.runningState).toBe("idle");

        expect(te.setCallback(null, useNow)).toBe(te);
        expect(te.callback).toEqual(null);

        expect(te.instanceState).toBe("initialized");
        expect(te.runningState).toBe("idle");

        expect(() => te.start()).toThrow(
          'The method "start" could not be called on the instance of TypingEffect - the current state "initialized" does not match the allowed states "running, ready". Provide the "strings" and "callback" arguments.'
        );

        te.dispose();
      }
    );

    test.each([
      {
        useNow: false,
      },
      { useNow: true },
    ])(
      `cuncurrent calls should only use the last; with now === $useNow;
        runningState should be "idle",
        should not duplicate "cycleStart" - next stage should be "delayBeforeTyping",
        calling should return instance`,
      ({ useNow }) => {
        const cb1 = vi.fn();
        const cb2 = null;
        const cb3 = vi.fn();
        const strings = ["str1, str2"];

        const te = new TypingEffect(strings, cb1, {
          delayBeforeTyping: 0,
          delayAfterTyping: 0,
          typingDelay: 0,
          untypingDelay: 0,
          typingVariation: 0,
        });

        expect(te.callback).toBe(cb1);
        expect(te.strings).toEqual(strings);
        expect(te.instanceState).toBe("ready");
        expect(te.runningState).toBe("idle");

        expect(
          te
            .setCallback(cb1, useNow)
            .setCallback(cb2, useNow)
            .setCallback(cb3, useNow)
        ).toBe(te);
        expect(te.callback).toBe(cb3);

        expect(te.instanceState).toBe("ready");
        expect(te.runningState).toBe("idle");

        te.start();

        expect(te.instanceState).toBe("running");
        expect(te.runningState).toBe("cycleStart");

        vi.advanceTimersToNextTimer();

        expect(te.instanceState).toBe("running");
        expect(te.runningState).toBe("delayBeforeTyping");

        vi.advanceTimersToNextTimer();
        expect(te.runningState).toBe("beforeTyping");

        vi.advanceTimersToNextTimer();
        expect(te.runningState).toBe("typing");

        vi.advanceTimersByTime(16 * strings[0]!.length);

        expect(te.runningState).toBe("typing");

        expect(cb1).toHaveBeenCalledTimes(0);
        expect(cb3).toHaveBeenCalledTimes(strings[0]!.length);
        expect(cb3).toHaveBeenLastCalledWith(strings[0] + "|");

        te.dispose();
      }
    );
  });

  describe('calls when instanceState === "running", w/o "now"', () => {
    test(`setting callback while running, callback IS NOT null;
    should set callback at the cycle start after the first string has finished
    should not duplicate cycleStart stage`, () => {
      const strings = ["initial strings 1", "initial strings 2"];
      const initialCallback = vi.fn();
      const newCallback = vi.fn();
      const te = new TypingEffect(strings, initialCallback, {
        delayBeforeTyping: 0,
        delayAfterTyping: 0,
        typingDelay: 0,
        untypingDelay: 0,
        typingVariation: 0,
      });
      expect(te.instanceState).toBe("ready");
      expect(te.runningState).toBe("idle");
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
      expect(initialCallback).toHaveBeenCalledTimes(0);

      const firstStringPart = "initial";
      vi.advanceTimersByTime(16 * firstStringPart.length);
      expect(initialCallback).toHaveBeenLastCalledWith(firstStringPart + "|");

      // call in the middle of typing
      te.setCallback(newCallback);
      expect(te.callback).toBe(initialCallback);

      const secondStringPart = " strings 1";
      vi.advanceTimersByTime(16 * secondStringPart.length);
      expect(initialCallback).toHaveBeenLastCalledWith(
        firstStringPart + secondStringPart + "|"
      );
      expect(initialCallback).toHaveBeenCalledTimes(strings[0]!.length);
      initialCallback.mockClear();

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
      expect(initialCallback).toHaveBeenCalledTimes(0);

      vi.advanceTimersByTime(16 * strings[0]!.length);
      expect(initialCallback).toHaveBeenLastCalledWith("|");
      expect(initialCallback).toHaveBeenCalledTimes(strings[0]!.length);
      initialCallback.mockClear();
      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("afterUntyping");
      expect(te.callback).toBe(initialCallback);

      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("cycleStart");
      // setStrings callback runs here, sets new strings and goes to delayBeforeTyping

      vi.advanceTimersByTime(16);
      expect(te.callback).toBe(newCallback);
      expect(te.runningState).toBe("delayBeforeTyping");
      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("beforeTyping");
      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("typing");
      vi.advanceTimersByTime(16 * strings[1]!.length);
      expect(newCallback).toHaveBeenLastCalledWith(strings[1] + "|");
      expect(newCallback).toHaveBeenCalledTimes(strings[1]!.length);
      newCallback.mockClear();
      expect(initialCallback).toHaveBeenCalledTimes(0);
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
      expect(newCallback).toHaveBeenCalledTimes(0);
      vi.advanceTimersByTime(16 * strings[1]!.length);
      expect(newCallback).toHaveBeenLastCalledWith("|");
      expect(newCallback).toHaveBeenCalledTimes(strings[1]!.length);
      expect(initialCallback).toHaveBeenCalledTimes(0);
      te.dispose();
    });

    test(`setting callback while running, callback IS null;
    should set new callback at the cycle start after the first string has finished
    should set runningState to idle on the next RAF iteration
    should set instanceState to "initialized"`, () => {
      const strings = ["initial strings 1", "initial strings 2"];
      const initialCallback = vi.fn();
      const te = new TypingEffect(strings, initialCallback, {
        delayBeforeTyping: 0,
        delayAfterTyping: 0,
        typingDelay: 0,
        untypingDelay: 0,
        typingVariation: 0,
      });
      expect(te.instanceState).toBe("ready");
      expect(te.runningState).toBe("idle");
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
      expect(initialCallback).toHaveBeenCalledTimes(0);

      const firstStringPart = "initial";
      vi.advanceTimersByTime(16 * firstStringPart.length);
      expect(initialCallback).toHaveBeenLastCalledWith(firstStringPart + "|");

      // call in the middle of typing
      te.setCallback(null);
      expect(te.callback).toBe(initialCallback);

      const secondStringPart = " strings 1";
      vi.advanceTimersByTime(16 * secondStringPart.length);
      expect(initialCallback).toHaveBeenLastCalledWith(
        firstStringPart + secondStringPart + "|"
      );
      expect(initialCallback).toHaveBeenCalledTimes(strings[0]!.length);
      initialCallback.mockClear();

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
      expect(initialCallback).toHaveBeenCalledTimes(0);

      vi.advanceTimersByTime(16 * strings[0]!.length);
      expect(initialCallback).toHaveBeenLastCalledWith("|");
      expect(initialCallback).toHaveBeenCalledTimes(strings[0]!.length);
      initialCallback.mockClear();
      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("afterUntyping");
      expect(te.callback).toBe(initialCallback);

      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("cycleStart");
      // setStrings callback runs here, sets new strings;
      vi.advanceTimersByTime(16);
      expect(te.instanceState).toBe("initialized");
      expect(te.runningState).toBe("idle");
      expect(te.callback).toEqual(null);

      vi.advanceTimersByTime(1600);
      expect(te.instanceState).toBe("initialized");
      expect(te.runningState).toBe("idle");
      te.dispose();
    });

    test(`concurrent setting callback while running, final callback IS NOT null;
     - should use the last setting 
     - should not duplicate cycleStart
     - should continue with next string
    `, () => {
      const initialStrings = ["initial strings 1", "initial strings 2"];
      const initialCallback = vi.fn();
      const cb1 = vi.fn();
      const cb2 = null;
      const cb3 = vi.fn();
      const te = new TypingEffect(initialStrings, initialCallback, {
        delayBeforeTyping: 0,
        delayAfterTyping: 0,
        typingDelay: 0,
        untypingDelay: 0,
        typingVariation: 0,
      });
      expect(te.instanceState).toBe("ready");
      expect(te.runningState).toBe("idle");
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
      expect(initialCallback).toHaveBeenCalledTimes(0);

      const firstStringPart = "initial";
      vi.advanceTimersByTime(16 * firstStringPart.length);
      expect(initialCallback).toHaveBeenLastCalledWith(firstStringPart + "|");

      // call in the middle of typing
      te.setCallback(cb1).setCallback(cb2).setCallback(cb3);
      expect(te.callback).toBe(initialCallback);

      const secondStringPart = " strings 1";
      vi.advanceTimersByTime(16 * secondStringPart.length);
      expect(initialCallback).toHaveBeenLastCalledWith(
        firstStringPart + secondStringPart + "|"
      );
      expect(initialCallback).toHaveBeenCalledTimes(initialStrings[0]!.length);
      initialCallback.mockClear();

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
      expect(initialCallback).toHaveBeenCalledTimes(0);

      vi.advanceTimersByTime(16 * initialStrings[0]!.length);
      expect(initialCallback).toHaveBeenLastCalledWith("|");
      expect(initialCallback).toHaveBeenCalledTimes(initialStrings[0]!.length);
      initialCallback.mockClear();
      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("afterUntyping");
      expect(te.callback).toBe(initialCallback);

      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("cycleStart");
      // setCallback callbacks run here, sets new strings and goes to delayBeforeTyping
      vi.advanceTimersByTime(16);
      expect(te.callback).toBe(cb3);
      expect(te.runningState).toBe("delayBeforeTyping");

      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("beforeTyping");
      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("typing");
      vi.advanceTimersByTime(16 * initialStrings[1]!.length);
      expect(cb3).toHaveBeenLastCalledWith(initialStrings[1] + "|");
      expect(cb3).toHaveBeenCalledTimes(initialStrings[1]!.length);
      cb3.mockClear();
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
      expect(cb3).toHaveBeenCalledTimes(0);
      vi.advanceTimersByTime(16 * initialStrings[1]!.length);
      expect(cb3).toHaveBeenLastCalledWith("|");
      expect(cb3).toHaveBeenCalledTimes(initialStrings[1]!.length);
      expect(initialCallback).toHaveBeenCalledTimes(0);
      te.dispose();
    });

    test(`concurrent setting callback while running, final callback strings IS null;
    should use the last setting 
    should not duplicate cycleStart`, () => {
      const initialStrings = ["initial strings 1", "initial strings 2"];
      const initialCallback = vi.fn();
      const cb1 = null;
      const cb2 = vi.fn();
      const cb3 = null;
      const te = new TypingEffect(initialStrings, initialCallback, {
        delayBeforeTyping: 0,
        delayAfterTyping: 0,
        typingDelay: 0,
        untypingDelay: 0,
        typingVariation: 0,
      });
      expect(te.instanceState).toBe("ready");
      expect(te.runningState).toBe("idle");
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
      expect(initialCallback).toHaveBeenCalledTimes(0);

      const firstStringPart = "initial";
      vi.advanceTimersByTime(16 * firstStringPart.length);
      expect(initialCallback).toHaveBeenLastCalledWith(firstStringPart + "|");

      // call in the middle of typing
      te.setCallback(cb1).setCallback(cb2).setCallback(cb3);
      expect(te.callback).toBe(initialCallback);

      const secondStringPart = " strings 1";
      vi.advanceTimersByTime(16 * secondStringPart.length);
      expect(initialCallback).toHaveBeenLastCalledWith(
        firstStringPart + secondStringPart + "|"
      );
      expect(initialCallback).toHaveBeenCalledTimes(initialStrings[0]!.length);
      initialCallback.mockClear();

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
      expect(initialCallback).toHaveBeenCalledTimes(0);

      vi.advanceTimersByTime(16 * initialStrings[0]!.length);
      expect(initialCallback).toHaveBeenLastCalledWith("|");
      expect(initialCallback).toHaveBeenCalledTimes(initialStrings[0]!.length);
      initialCallback.mockClear();
      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("afterUntyping");
      expect(te.callback).toBe(initialCallback);

      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("cycleStart");
      // setCallback callbacks run here
      vi.advanceTimersByTime(16);
      expect(te.instanceState).toBe("initialized");
      expect(te.runningState).toBe("idle");
      expect(te.callback).toBe(cb3);

      vi.advanceTimersByTime(1600);
      expect(te.instanceState).toBe("initialized");
      expect(te.runningState).toBe("idle");
      te.dispose();
    });

    test(`setting callback while running right after setting strings with empty array, callback IS NOT null
      - instanceState should be "initialized", runningState should be "idle"`, () => {
      const initialStrings = ["initial strings 1", "initial strings 2"];
      const initialCallback = vi.fn();
      const newCallback = vi.fn();
      const te = new TypingEffect(initialStrings, initialCallback, {
        delayBeforeTyping: 0,
        delayAfterTyping: 0,
        typingDelay: 0,
        untypingDelay: 0,
        typingVariation: 0,
      });
      expect(te.instanceState).toBe("ready");
      expect(te.runningState).toBe("idle");
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
      expect(initialCallback).toHaveBeenCalledTimes(0);

      const firstStringPart = "initial";
      vi.advanceTimersByTime(16 * firstStringPart.length);
      expect(initialCallback).toHaveBeenLastCalledWith(firstStringPart + "|");

      // call in the middle of typing
      te.setStrings([]).setCallback(newCallback);
      expect(te.strings).toEqual(initialStrings);
      expect(te.callback).toBe(initialCallback);

      const secondStringPart = " strings 1";
      vi.advanceTimersByTime(16 * secondStringPart.length);
      expect(initialCallback).toHaveBeenLastCalledWith(
        firstStringPart + secondStringPart + "|"
      );
      expect(initialCallback).toHaveBeenCalledTimes(initialStrings[0]!.length);
      initialCallback.mockClear();

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
      expect(initialCallback).toHaveBeenCalledTimes(0);

      vi.advanceTimersByTime(16 * initialStrings[0]!.length);
      expect(initialCallback).toHaveBeenLastCalledWith("|");
      expect(initialCallback).toHaveBeenCalledTimes(initialStrings[0]!.length);
      initialCallback.mockClear();
      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("afterUntyping");
      expect(te.strings).toEqual(initialStrings);
      expect(te.callback).toBe(initialCallback);

      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("cycleStart");
      // setStrings callback and setCallback callback run here

      vi.advanceTimersByTime(16);
      expect(te.strings).toEqual([]);
      expect(te.callback).toBe(newCallback);

      expect(te.instanceState).toBe("initialized");
      expect(te.runningState).toBe("idle");

      vi.advanceTimersByTime(1600);

      expect(te.instanceState).toBe("initialized");
      expect(te.runningState).toBe("idle");
      te.dispose();
    });
  });

  describe('calls when instanceState === "running", with "now" === true', () => {
    test(`setting callback while running, callback IS NOT null
      - should set new callback at the current cycle and continue with re resto of the string`, () => {
      const initialStrings = ["initial strings 1", "initial strings 2"];
      const initialCallback = vi.fn();
      const newCallback = vi.fn();
      const te = new TypingEffect(initialStrings, initialCallback, {
        delayBeforeTyping: 0,
        delayAfterTyping: 0,
        typingDelay: 0,
        untypingDelay: 0,
        typingVariation: 0,
      });
      expect(te.instanceState).toBe("ready");
      expect(te.runningState).toBe("idle");
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
      expect(initialCallback).toHaveBeenCalledTimes(0);

      const firstStringPart = "initial";
      vi.advanceTimersByTime(16 * firstStringPart.length);
      expect(initialCallback).toHaveBeenLastCalledWith(firstStringPart + "|");
      initialCallback.mockClear();

      // call in the middle of typing
      te.setCallback(newCallback, true);
      // strings are new on the current current cycle
      expect(te.callback).toBe(newCallback);
      expect(te.instanceState).toBe("running");
      expect(te.runningState).toBe("typing");

      const secondStringPart = " strings 1";
      vi.advanceTimersByTime(16 * secondStringPart.length);
      expect(newCallback).toHaveBeenLastCalledWith(
        firstStringPart + secondStringPart + "|"
      );
      expect(newCallback).toHaveBeenCalledTimes(secondStringPart.length);
      newCallback.mockClear();
      expect(initialCallback).toHaveBeenCalledTimes(0);

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
      vi.advanceTimersByTime(16 * initialStrings[0]!.length);
      expect(newCallback).toHaveBeenLastCalledWith("|");
      expect(newCallback).toHaveBeenCalledTimes(initialStrings[0]!.length);
      expect(initialCallback).toHaveBeenCalledTimes(0);
      te.dispose();
    });

    test(`setting callback while running, callback IS null;
    should set new callback at the current cycle
    should set runningState to idle at the current cycle
    should set instanceState to "initialized"`, () => {
      const initialStrings = ["initial strings 1", "initial strings 2"];
      const initialCallback = vi.fn();
      const te = new TypingEffect(initialStrings, initialCallback, {
        delayBeforeTyping: 0,
        delayAfterTyping: 0,
        typingDelay: 0,
        untypingDelay: 0,
        typingVariation: 0,
      });
      expect(te.instanceState).toBe("ready");
      expect(te.runningState).toBe("idle");
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
      expect(initialCallback).toHaveBeenCalledTimes(0);

      const firstStringPart = "initial";
      vi.advanceTimersByTime(16 * firstStringPart.length);
      expect(initialCallback).toHaveBeenLastCalledWith(firstStringPart + "|");

      // call in the middle of typing
      te.setCallback(null, true);

      expect(te.callback).toEqual(null);
      expect(te.instanceState).toBe("initialized");
      expect(te.runningState).toBe("idle");
      initialCallback.mockClear();

      vi.advanceTimersByTime(1600);
      expect(te.instanceState).toBe("initialized");
      expect(te.runningState).toBe("idle");
      expect(initialCallback).toHaveBeenCalledTimes(0);

      te.dispose();
    });

    test(`concurrent setting callback while running, final callback IS NOT null;
    should use the last setting 
    null callback middle step should set ready/idle
    should not duplicate cycleStart`, () => {
      const initialStrings = ["initial strings 1", "initial strings 2"];
      const initialCallback = vi.fn();
      const cb1 = vi.fn();
      const cb2 = null;
      const cb3 = vi.fn();
      const te = new TypingEffect(initialStrings, initialCallback, {
        delayBeforeTyping: 0,
        delayAfterTyping: 0,
        typingDelay: 0,
        untypingDelay: 0,
        typingVariation: 0,
      });
      expect(te.instanceState).toBe("ready");
      expect(te.runningState).toBe("idle");
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
      expect(initialCallback).toHaveBeenCalledTimes(0);

      const firstStringPart = "initial";
      vi.advanceTimersByTime(16 * firstStringPart.length);
      expect(initialCallback).toHaveBeenLastCalledWith(firstStringPart + "|");

      // call in the middle of typing
      te.setCallback(cb1, true).setCallback(cb2, true).setCallback(cb3, true);

      expect(te.callback).toBe(cb3);
      expect(te.instanceState).toBe("ready");
      expect(te.runningState).toBe("idle");
      initialCallback.mockClear();

      te.start();
      expect(te.instanceState).toBe("running");
      expect(te.runningState).toBe("cycleStart");

      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("delayBeforeTyping");
      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("beforeTyping");
      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("typing");

      vi.advanceTimersByTime(16 * initialStrings[0]!.length);
      expect(cb3).toHaveBeenLastCalledWith(initialStrings[0] + "|");
      expect(cb3).toHaveBeenCalledTimes(initialStrings[0]!.length);
      cb3.mockClear();
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
      vi.advanceTimersByTime(16 * initialStrings[0]!.length);
      expect(cb3).toHaveBeenLastCalledWith("|");
      expect(cb3).toHaveBeenCalledTimes(initialStrings[0]!.length);
      expect(initialCallback).toHaveBeenCalledTimes(0);
      te.dispose();
    });

    test(`concurrent setting callback while running, final callback IS null;
    should use the last setting 
    should not duplicate cycleStart`, () => {
      const initialStrings = ["initial strings 1", "initial strings 2"];
      const initialCallback = vi.fn();
      const cb1 = null;
      const cb2 = vi.fn();
      const cb3 = null;
      const te = new TypingEffect(initialStrings, initialCallback, {
        delayBeforeTyping: 0,
        delayAfterTyping: 0,
        typingDelay: 0,
        untypingDelay: 0,
        typingVariation: 0,
      });
      expect(te.instanceState).toBe("ready");
      expect(te.runningState).toBe("idle");
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
      expect(initialCallback).toHaveBeenCalledTimes(0);

      const firstStringPart = "initial";
      vi.advanceTimersByTime(16 * firstStringPart.length);
      expect(initialCallback).toHaveBeenLastCalledWith(firstStringPart + "|");

      // call in the middle of typing
      te.setCallback(cb1, true).setCallback(cb2, true).setCallback(cb3, true);

      expect(te.callback).toBe(cb3);
      expect(te.instanceState).toBe("initialized");
      expect(te.runningState).toBe("idle");
      initialCallback.mockClear();

      expect(() => te.start()).toThrow(
        'The method "start" could not be called on the instance of TypingEffect - the current state "initialized" does not match the allowed states "running, ready". Provide the "strings" and "callback" arguments.'
      );

      vi.advanceTimersByTime(1600);
      expect(te.instanceState).toBe("initialized");
      expect(te.runningState).toBe("idle");

      te.dispose();
    });

    test(`setting callback while running right after setting strings to empty array,callback IS NOT null
      - instanceState should be "initialized", runningState should be "idle"`, () => {
      const initialStrings = ["initial strings 1", "initial strings 2"];
      const initialCallback = vi.fn();
      const newCallback = vi.fn();
      const te = new TypingEffect(initialStrings, initialCallback, {
        delayBeforeTyping: 0,
        delayAfterTyping: 0,
        typingDelay: 0,
        untypingDelay: 0,
        typingVariation: 0,
      });
      expect(te.instanceState).toBe("ready");
      expect(te.runningState).toBe("idle");
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
      expect(initialCallback).toHaveBeenCalledTimes(0);

      const firstStringPart = "initial";
      vi.advanceTimersByTime(16 * firstStringPart.length);
      expect(initialCallback).toHaveBeenLastCalledWith(firstStringPart + "|");

      // call in the middle of typing
      te.setStrings([], true).setCallback(newCallback, true);
      expect(te.strings).toEqual([]);
      expect(te.callback).toBe(newCallback);

      expect(te.instanceState).toBe("initialized");
      expect(te.runningState).toBe("idle");

      initialCallback.mockClear();

      vi.advanceTimersByTime(1600);
      expect(te.instanceState).toBe("initialized");
      expect(te.runningState).toBe("idle");
      expect(initialCallback).toHaveBeenCalledTimes(0);

      te.dispose();
    });
  });
});
