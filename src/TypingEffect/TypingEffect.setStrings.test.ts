import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import { TypingEffect } from ".";

describe(`setStrings method tests`, () => {
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
      `with valid strings and now === $useNow;
        runningState should be "idle",
        should not duplicate "cycleStart" - next stage should be "delayBeforeTyping",
        calling should return instance`,
      ({ useNow }) => {
        const cb = vi.fn();
        const strings = ["str1, str2"];

        const te = new TypingEffect(undefined, cb, {
          delayBeforeTyping: 0,
          delayBeforeUntyping: 0,
          typingDelay: 0,
          untypingDelay: 0,
          typingVariation: 0,
        });

        expect(te.callback).toBe(cb);
        expect(te.strings).toEqual([]);
        expect(te.instanceState).toBe("initialized");
        expect(te.runningState).toBe("idle");

        expect(te.setStrings(strings, useNow)).toBe(te);
        expect(te.strings).toEqual(strings);

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
      `with empty strings and now === $useNow;
        runningState should be "idle",
        calling should return instance`,
      ({ useNow }) => {
        const cb = vi.fn();

        const te = new TypingEffect(undefined, cb, {
          delayBeforeTyping: 0,
          delayBeforeUntyping: 0,
          typingDelay: 0,
          untypingDelay: 0,
          typingVariation: 0,
        });

        expect(te.callback).toBe(cb);
        expect(te.strings).toEqual([]);
        expect(te.instanceState).toBe("initialized");
        expect(te.runningState).toBe("idle");

        expect(te.setStrings([], useNow)).toBe(te);

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
        const cb = vi.fn();
        const strings1 = ["str1, str2"];
        const strings2: string[] = [];
        const strings3 = ["qwe", "rty"];

        const te = new TypingEffect(undefined, cb, {
          delayBeforeTyping: 0,
          delayBeforeUntyping: 0,
          typingDelay: 0,
          untypingDelay: 0,
          typingVariation: 0,
        });

        expect(te.callback).toBe(cb);
        expect(te.strings).toEqual([]);
        expect(te.instanceState).toBe("initialized");
        expect(te.runningState).toBe("idle");

        expect(
          te
            .setStrings(strings1, useNow)
            .setStrings(strings2, useNow)
            .setStrings(strings3, useNow)
        ).toBe(te);
        expect(te.strings).toEqual(strings3);

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

        vi.advanceTimersByTime(16 * strings3[0]!.length);

        expect(te.runningState).toBe("typing");

        expect(cb).toHaveBeenCalledTimes(strings3[0]!.length);
        expect(cb).toHaveBeenLastCalledWith(strings3[0] + "|");

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
      `with valid strings and now === $useNow;
        runningState should be "idle",
        should not duplicate "cycleStart" - next stage should be "delayBeforeTyping",
        calling should return instance`,
      ({ useNow }) => {
        const cb = vi.fn();
        const strings = ["str1, str2"];

        const te = new TypingEffect(strings, cb, {
          delayBeforeTyping: 0,
          delayBeforeUntyping: 0,
          typingDelay: 0,
          untypingDelay: 0,
          typingVariation: 0,
        });

        expect(te.callback).toBe(cb);
        expect(te.strings).toEqual(strings);
        expect(te.instanceState).toBe("ready");
        expect(te.runningState).toBe("idle");

        expect(te.setStrings(strings, useNow)).toBe(te);
        expect(te.strings).toEqual(strings);

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
      `with empty strings and now === $useNow;
        runningState should be "idle",
        instanceState should be "initialized"
        calling should return instance`,
      ({ useNow }) => {
        const cb = vi.fn();
        const strings = ["str1, str2"];

        const te = new TypingEffect(strings, cb, {
          delayBeforeTyping: 0,
          delayBeforeUntyping: 0,
          typingDelay: 0,
          untypingDelay: 0,
          typingVariation: 0,
        });

        expect(te.callback).toBe(cb);
        expect(te.strings).toEqual(strings);
        expect(te.instanceState).toBe("ready");
        expect(te.runningState).toBe("idle");

        expect(te.setStrings([], useNow)).toBe(te);

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
        const cb = vi.fn();
        const strings1 = ["str1, str2"];
        const strings2: string[] = [];
        const strings3 = ["qwe", "rty"];

        const te = new TypingEffect(strings1, cb, {
          delayBeforeTyping: 0,
          delayBeforeUntyping: 0,
          typingDelay: 0,
          untypingDelay: 0,
          typingVariation: 0,
        });

        expect(te.callback).toBe(cb);
        expect(te.strings).toEqual(strings1);
        expect(te.instanceState).toBe("ready");
        expect(te.runningState).toBe("idle");

        expect(
          te
            .setStrings(strings1, useNow)
            .setStrings(strings2, useNow)
            .setStrings(strings3, useNow)
        ).toBe(te);
        expect(te.strings).toEqual(strings3);

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

        vi.advanceTimersByTime(16 * strings3[0]!.length);

        expect(te.runningState).toBe("typing");

        expect(cb).toHaveBeenCalledTimes(strings3[0]!.length);
        expect(cb).toHaveBeenLastCalledWith(strings3[0] + "|");

        te.dispose();
      }
    );
  });

  describe('calls when instanceState === "running", w/o "now"', () => {
    test(`setting strings while running, strings IS NOT an empty array;
    should set new strings at the cycle start after the first string has finished
    should not duplicate cycleStart stage`, () => {
      const initialStrings = ["initial strings 1", "initial strings 2"];
      const newStrings = ["new strings 1", "new strings 2"];
      const initialCallback = vi.fn();
      const te = new TypingEffect(initialStrings, initialCallback, {
        delayBeforeTyping: 0,
        delayBeforeUntyping: 0,
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
      te.setStrings(newStrings);
      expect(te.strings).toEqual(initialStrings);

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

      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("cycleStart");
      // setStrings callback runs here, sets new strings and goes to delayBeforeTyping

      vi.advanceTimersByTime(16);
      expect(te.strings).toEqual(newStrings);
      expect(te.runningState).toBe("delayBeforeTyping");
      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("beforeTyping");
      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("typing");
      vi.advanceTimersByTime(16 * newStrings[0]!.length);
      expect(initialCallback).toHaveBeenLastCalledWith(newStrings[0] + "|");
      expect(initialCallback).toHaveBeenCalledTimes(newStrings[0]!.length);
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
      vi.advanceTimersByTime(16 * newStrings[0]!.length);
      expect(initialCallback).toHaveBeenLastCalledWith("|");
      expect(initialCallback).toHaveBeenCalledTimes(newStrings[0]!.length);
      te.dispose();
    });

    test(`setting strings while running, strings IS an empty array;
    should set new strings at the cycle start after the first string has finished
    should set runningState to idle on the next RAF iteration
    should set instanceState to "initialized"`, () => {
      const initialStrings = ["initial strings 1", "initial strings 2"];
      const newStrings: string[] = [];
      const initialCallback = vi.fn();
      const te = new TypingEffect(initialStrings, initialCallback, {
        delayBeforeTyping: 0,
        delayBeforeUntyping: 0,
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
      te.setStrings(newStrings);
      expect(te.strings).toEqual(initialStrings);

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

      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("cycleStart");
      // setStrings callback runs here, sets new strings;
      vi.advanceTimersByTime(16);
      expect(te.instanceState).toBe("initialized");
      expect(te.runningState).toBe("idle");
      expect(te.strings).toEqual(newStrings);

      vi.advanceTimersByTime(1600);
      expect(te.instanceState).toBe("initialized");
      expect(te.runningState).toBe("idle");
      te.dispose();
    });

    test(`concurrent setting strings while running, strings IS NOT an empty array;
    should use the last setting 
    should not duplicate cycleStart`, () => {
      const initialStrings = ["initial strings 1", "initial strings 2"];
      const strings1 = ["strings 1_1", "strings 1_2"];
      const strings2: string[] = [];
      const strings3 = ["strings 3_1", "strings 3_2"];
      const initialCallback = vi.fn();
      const te = new TypingEffect(initialStrings, initialCallback, {
        delayBeforeTyping: 0,
        delayBeforeUntyping: 0,
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
      te.setStrings(strings1).setStrings(strings2).setStrings(strings3);
      expect(te.strings).toEqual(initialStrings);

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

      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("cycleStart");
      // setStrings callback runs here, sets new strings and goes to delayBeforeTyping
      vi.advanceTimersByTime(16);
      expect(te.strings).toEqual(strings3);
      expect(te.runningState).toBe("delayBeforeTyping");

      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("beforeTyping");
      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("typing");
      vi.advanceTimersByTime(16 * strings3[0]!.length);
      expect(initialCallback).toHaveBeenLastCalledWith(strings3[0] + "|");
      expect(initialCallback).toHaveBeenCalledTimes(strings3[0]!.length);
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
      vi.advanceTimersByTime(16 * strings3[0]!.length);
      expect(initialCallback).toHaveBeenLastCalledWith("|");
      expect(initialCallback).toHaveBeenCalledTimes(strings3[0]!.length);
      te.dispose();
    });

    test(`concurrent setting strings while running, strings IS an empty array;
    should use the last setting 
    should not duplicate cycleStart`, () => {
      const initialStrings = ["initial strings 1", "initial strings 2"];
      const strings1: string[] = [];
      const strings2 = ["strings 2_1", "strings 2_2"];
      const strings3: string[] = [];
      const initialCallback = vi.fn();
      const te = new TypingEffect(initialStrings, initialCallback, {
        delayBeforeTyping: 0,
        delayBeforeUntyping: 0,
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
      te.setStrings(strings1).setStrings(strings2).setStrings(strings3);
      expect(te.strings).toEqual(initialStrings);

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

      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("cycleStart");
      // setStrings callback runs here, sets new strings and goes to idle
      vi.advanceTimersByTime(16);
      expect(te.instanceState).toBe("initialized");
      expect(te.runningState).toBe("idle");
      expect(te.strings).toEqual(strings3);

      vi.advanceTimersByTime(1600);
      expect(te.instanceState).toBe("initialized");
      expect(te.runningState).toBe("idle");
      te.dispose();
    });

    test(`setting strings while running right after setting callback to null, strings IS NOT an empty array
      - instanceState should be "initialized", runningState should be "idle"`, () => {
      const initialStrings = ["initial strings 1", "initial strings 2"];
      const newStrings = ["new strings 1", "new strings 2"];
      const initialCallback = vi.fn();
      const te = new TypingEffect(initialStrings, initialCallback, {
        delayBeforeTyping: 0,
        delayBeforeUntyping: 0,
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
      te.setCallback(null).setStrings(newStrings);
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
      expect(te.strings).toEqual(newStrings);
      expect(te.callback).toBe(null);

      expect(te.instanceState).toBe("initialized");
      expect(te.runningState).toBe("idle");

      vi.advanceTimersByTime(1600);

      expect(te.instanceState).toBe("initialized");
      expect(te.runningState).toBe("idle");
      te.dispose();
    });
  });

  describe('calls when instanceState === "running", with "now" === true', () => {
    test(`setting strings while running, strings IS NOT an empty array;s
      - should set new strings at the current cycle and next runningState to "cycleStart"`, () => {
      const initialStrings = ["initial strings 1", "initial strings 2"];
      const newStrings = ["new strings 1", "new strings 2"];
      const initialCallback = vi.fn();
      const te = new TypingEffect(initialStrings, initialCallback, {
        delayBeforeTyping: 0,
        delayBeforeUntyping: 0,
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
      te.setStrings(newStrings, true);
      // strings are new on the current current cycle
      expect(te.strings).toEqual(newStrings);
      expect(te.instanceState).toBe("running");
      expect(te.runningState).toBe("typing");

      // on the next cycle the runningState will be set cycleStart
      // execute cycleStart stage and set runningState to delayBeforeTyping

      initialCallback.mockClear();
      vi.advanceTimersByTime(16);
      expect(te.instanceState).toBe("running");
      expect(te.runningState).toBe("delayBeforeTyping");
      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("beforeTyping");
      vi.advanceTimersByTime(16);
      expect(te.runningState).toBe("typing");
      vi.advanceTimersByTime(16 * newStrings[0]!.length);
      expect(initialCallback).toHaveBeenLastCalledWith(newStrings[0] + "|");
      expect(initialCallback).toHaveBeenCalledTimes(newStrings[0]!.length);
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
      vi.advanceTimersByTime(16 * newStrings[0]!.length);
      expect(initialCallback).toHaveBeenLastCalledWith("|");
      expect(initialCallback).toHaveBeenCalledTimes(newStrings[0]!.length);
      te.dispose();
    });

    test(`setting strings while running, strings IS an empty array;
    should set new strings at the current cycle
    should set runningState to idle at the current cycle
    should set instanceState to "initialized"`, () => {
      const initialStrings = ["initial strings 1", "initial strings 2"];
      const newStrings: string[] = [];
      const initialCallback = vi.fn();
      const te = new TypingEffect(initialStrings, initialCallback, {
        delayBeforeTyping: 0,
        delayBeforeUntyping: 0,
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
      te.setStrings(newStrings, true);
      // strings are new on the current current cycle
      // runningState is "idle" immediately since instanceState is initialized
      expect(te.strings).toEqual(newStrings);
      expect(te.instanceState).toBe("initialized");
      expect(te.runningState).toBe("idle");
      initialCallback.mockClear();

      vi.advanceTimersByTime(1600);
      expect(te.instanceState).toBe("initialized");
      expect(te.runningState).toBe("idle");
      expect(initialCallback).toHaveBeenCalledTimes(0);

      te.dispose();
    });

    test(`concurrent setting strings while running, strings IS NOT an empty array;
    should use the last setting 
    empty strings middle step should set ready/idle
    should not duplicate cycleStart`, () => {
      const initialStrings = ["initial strings 1", "initial strings 2"];
      const strings1 = ["strings 1_1", "strings 1_2"];
      const strings2: string[] = [];
      const strings3 = ["strings 3_1", "strings 3_2"];
      const initialCallback = vi.fn();
      const te = new TypingEffect(initialStrings, initialCallback, {
        delayBeforeTyping: 0,
        delayBeforeUntyping: 0,
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
      te.setStrings(strings1, true)
        .setStrings(strings2, true)
        .setStrings(strings3, true);

      expect(te.strings).toEqual(strings3);
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
      vi.advanceTimersByTime(16 * strings3[0]!.length);
      expect(initialCallback).toHaveBeenLastCalledWith(strings3[0] + "|");
      expect(initialCallback).toHaveBeenCalledTimes(strings3[0]!.length);
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
      vi.advanceTimersByTime(16 * strings3[0]!.length);
      expect(initialCallback).toHaveBeenLastCalledWith("|");
      expect(initialCallback).toHaveBeenCalledTimes(strings3[0]!.length);
      te.dispose();
    });

    test(`concurrent setting strings while running, strings IS an empty array;
    should use the last setting 
    should not duplicate cycleStart`, () => {
      const initialStrings = ["initial strings 1", "initial strings 2"];
      const strings1: string[] = [];
      const strings2: string[] = ["strings 2_1", "strings 2_2"];
      const strings3: string[] = [];
      const initialCallback = vi.fn();
      const te = new TypingEffect(initialStrings, initialCallback, {
        delayBeforeTyping: 0,
        delayBeforeUntyping: 0,
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
      te.setStrings(strings1, true)
        .setStrings(strings2, true)
        .setStrings(strings3, true);

      expect(te.strings).toEqual(strings3);
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

    test(`setting strings while running right after setting callback to null, strings IS NOT an empty array
      - instanceState should be "initialized", runningState should be "idle"`, () => {
      const initialStrings = ["initial strings 1", "initial strings 2"];
      const newStrings = ["new strings 1", "new strings 2"];
      const initialCallback = vi.fn();
      const te = new TypingEffect(initialStrings, initialCallback, {
        delayBeforeTyping: 0,
        delayBeforeUntyping: 0,
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
      te.setCallback(null, true).setStrings(newStrings, true);
      expect(te.strings).toEqual(newStrings);
      expect(te.callback).toBe(null);

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
