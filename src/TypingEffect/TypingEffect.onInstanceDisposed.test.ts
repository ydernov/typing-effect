import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import { TypingEffect } from ".";

describe("onInstanceDisposed method tests", () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ["performance", "requestAnimationFrame"],
    }).clearAllTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  test("all onInstaneDisposed callbacks should be called once and in order", () => {
    const strings = ["first string", "second string", "third string"];
    const te = new TypingEffect(strings, vi.fn(), {
      delayBeforeTyping: 0,
      delayAfterTyping: 0,
      typingDelay: 0,
      untypingDelay: 0,
      typingVariation: 0,
    }).start();
    const onInstanceDisposedFirst = vi.fn();
    const onInstanceDisposedSecond = vi.fn();

    te.onInstanceDisposed(onInstanceDisposedFirst);
    te.onInstanceDisposed(onInstanceDisposedSecond);

    te.dispose();

    expect(() => te.dispose()).toThrow();

    expect(onInstanceDisposedFirst).toBeCalledTimes(1);
    expect(onInstanceDisposedSecond).toBeCalledTimes(1);

    expect(onInstanceDisposedFirst.mock.invocationCallOrder[0]).toBe(1);
    expect(onInstanceDisposedSecond.mock.invocationCallOrder[0]).toBe(2);
  });

  test("calling the removal function for onInstanceDisposed should prevent callback being called", () => {
    const strings = ["first string", "second string", "third string"];
    const te = new TypingEffect(strings, vi.fn(), {
      delayBeforeTyping: 0,
      delayAfterTyping: 0,
      typingDelay: 0,
      untypingDelay: 0,
      typingVariation: 0,
    }).start();
    const onInstanceDisposedFirst = vi.fn();
    const onInstanceDisposedSecond = vi.fn();

    const removeFirst = te.onInstanceDisposed(onInstanceDisposedFirst);
    te.onInstanceDisposed(onInstanceDisposedSecond);

    removeFirst();

    te.dispose();

    expect(onInstanceDisposedFirst).not.toBeCalled();
    expect(onInstanceDisposedSecond).toBeCalledTimes(1);
  });
});
