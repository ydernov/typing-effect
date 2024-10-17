# Typing Effect

| Source                                                                                                                                                               | Tests                                                                                                                                                                                                               | Coverage                                                                                                                                                                                                          |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [![main branch](https://img.shields.io/github/package-json/v/ydernov/typing-effect/main?logo=github&label=main)](https://github.com/ydernov/typing-effect/tree/main) | [![Tests main](https://github.com/ydernov/typing-effect/actions/workflows/test-on-push.yml/badge.svg?branch=main)](https://github.com/ydernov/typing-effect/actions/workflows/test-on-push.yml?query=branch%3Amain) | [![Coverage main](https://img.shields.io/endpoint?url=https%3A%2F%2Fydernov.github.io%2Ftyping-effect%2Fcoverage%2Fmain%2Fbadge.json)](https://ydernov.github.io/typing-effect/coverage/main/index.html)          |
| [![Release](https://img.shields.io/github/v/release/ydernov/typing-effect?label=Release&logo=github)](https://github.com/ydernov/typing-effect/releases/latest)      |                                                                                                                                                                                                                     | [![Coverage release](https://img.shields.io/endpoint?url=https%3A%2F%2Fydernov.github.io%2Ftyping-effect%2Fcoverage%2Frelease%2Fbadge.json)](https://ydernov.github.io/typing-effect/coverage/release/index.html) |

## Description

A small TypeScript package that provides the ability to create a typing effect with one or multiple strings. It is intended for in-browser use.

Check the [Usage notes](#usage-notes) section and [demo](https://ydernov.github.io/typing-effect/) for more information and examples.
Or take a look at [dev notes](https://github.com/ydernov/typing-effect/blob/main/DEVNOTES.md).

## Installation

```bash
npm i typing-effect-ts
```

### Or via script tag

Thanks to services like [JSDELIVR](https://www.jsdelivr.com) and [UNPKG](https://www.unpkg.com) :blush:.

```html
<script type="module">
  import { TypingEffect } from "https://cdn.jsdelivr.net/npm/typing-effect-ts/dist/index.js";
  <!-- OR -->
  import { TypingEffect } from "https://unpkg.com/typing-effect-ts/dist/index.js";

  const te = new TypingEffect();
</script>
```

## Usage

Say we have a div where we want to otput our strings:

```html
<div id="typing-div">And the output is:<span></span</div>
```

Provide the instance with string array and a callback function where we set the contents of our div:

```js
import { TypingEffect } from "typing-effect";

const outElem = document.querySelector("#typing-div span");
const te = new TypingEffect(
  [
    "Children played under the oak tree's branches.",
    "Maple leaves whispered in the wind's dance.",
    "The pine tree stood tall, a forest guardian.",
  ],
  (string) => {
    outElem.innerText = string;
  }
);
```

Then call start on the instance:

```js
te.start();
```

This results in:

<img src="example_demos/first_example.gif"  />

### React Example

1. [About the custom hook](#Creating-a-custom-hook)
   1. [Version 1.4.0 example](#TypingEffect-v140-example)
   1. [Prior to version 1.4.0 example](#TypingEffect-prior-to-v140-example)
1. [Usage in a component](#Usage-in-a-component)

#### Creating a custom hook

To use TypingEffect with React I suggest creating a custom hook. This will make it easy to use by abstracting the cleanup fuctionality and returning a reactive instace reference via `useState` hook.

##### TypingEffect v1.4.0 example:

```ts
import { useEffect, useState } from "react";
import { TypingEffect } from "typing-effect-ts";

export const useTypingEffect = () => {
  const [te, setTe] = useState<TypingEffect | null>(null);

  useEffect(() => {
    te?.onInstanceDisposed(() => {
      setTe(null);
    });
  }, [te]);

  useEffect(() => {
    if (!te) {
      setTe(new TypingEffect());
    } else {
      return () => {
        if (te.instanceState !== "disposed") {
          te.dispose();
        }
      };
    }
  }, [te]);

  return te;
};
```

##### TypingEffect prior to v1.4.0 example:

```ts
import { useCallback, useEffect, useMemo, useState } from "react";
import { TypingEffect } from "typing-effect-ts";

export const useTypingEffect = () => {
  const [te, setTe] = useState<TypingEffect | null>(null);
  const originalDispose = useMemo(() => te?.dispose, [te]);

  const dispose = useCallback(() => {
    originalDispose?.();
    setTe(null);
  }, [originalDispose]);

  useEffect(() => {
    if (!te) {
      setTe(new TypingEffect());
    } else {
      te.dispose = dispose;
      return () => {
        if (te.instanceState !== "disposed") {
          te.dispose();
        }
      };
    }
  }, [te, dispose]);

  return te;
};
```

This example shows how to change the `dispose` method on the instance with a custom wrapper function, because in JS you can actually do that.

Another, arguably "cleaner," solution would be extending the TypingEffect class, modifying `dispose`, and adding your custom functionality. More info in [this article](https://javascript.info/class-inheritance#overriding-a-method).

> Note: While no longer necessary (since v1.4.0), this approach may still be useful when working with other third-party packages.

#### Usage in a component

Call the hook:

```ts
const te = useTypingEffect();
```

Have a typing element:

```tsx
<p>
  Typing: <span ref={typingRef}></span>
</p>
```

Write your logic inside ref/useCallback:

```ts
const typingRef = useCallback(
  (ref: HTMLSpanElement) => {
    if (ref && te) {
      te.setStrings(["one", "two", "three"])
        .setCallback((st) => {
          ref.innerText = st;
        })
        .start();
    }
  },
  [te]
);
```

## API

TypingEffect instance has several methods which allow you to control the running cycle or alter the behaviour.

### start

Starts the iteration over strings. Requires strings and callback to be set. If called while running, restarts iteration from the first string.

Usage:

```js
te.start();
```

### stop

Stops the iteration, preventing any further invocation of the callback function or cycle subscription callbacks.

Usage:

```js
te.stop();
```

### pause

Freezes the current iteration stage and transitions into an idle state. This action triggers the callback function with a blinking cursor if `showCursor` option is set to true. This method can only be called after a successful invocation of the `start` method.

Usage:

```js
te.pause();
```

Calling the pause in the middle of typing:

<img src="example_demos/pause_demo.gif" width="80%" />

### resume

Resumes the iteration after a pause. Affects only the paused instance.

Usage:

```js
te.resume();
```

### jumpTo

Jumps to string under a specified index within the strings array. By default schedules the jump before the next string typing/untyping cycle.

Syntax:

```ts
jumpTo: (stringIndex?: number, now?: boolean) => this;
```

Has two possible arguments:

- `stringIndex`: Optional number. The index of the string to jump to. Defaults to the current string index.
- `now`: Optional boolean. Indicates whether to execute the jump immediately. Defaults to false.

Usage:

```js
te.jumpTo(); // will restart the iteration of the current string after it finishes
te.jumpTo(2); // will start the iteration from the third string  after the current string finishes
te.jumpTo(4, true); // will start the iteration from the fifth string immediately
```

### setStrings

Sets the new array of strings for typing/untyping. If called before `start` (the instance state is not running), the strings are set immediately. Otherwise, if `now` is not provided, executes the setter before the next string's typing/untyping cycle.
After setting starts typing/untyping cycle from the first string of the provided array.

Syntax:

```ts
setStrings: (strings: string[], now?: boolean) => this;
```

Has two possible arguments:

- `strings`: An array of new strings.
- `now`: Optional boolean. Indicates whether to set new strings immediately. Defaults to false.

Usage:

```js
// will set new strings and start the iteration from "My new favourite string" after the current string cycle finishes
te.setStrings(["My new favourite string", "My second favourite string"]);

// will set new strings immediately, and start the iteration from "My new favourite string"
te.setStrings(["My new favourite string", "My second favourite string"], true);
```

### setCallback

Sets the new callback function. If called before `start` (the instance state is not running), the callback is set immediately. Otherwise, if `now` is not provided, executes the setter before the next string's typing/untyping cycle.

Syntax:

```ts
setCallback: (callback: ((string: string) => void) | null, now?: boolean) =>
  this;
```

Has two possible arguments:

- `callback`: A function which accepts a string argument.
- `now`: Optional boolean. Indicates whether to set new callback immediately. Defaults to false.

Usage:

```js
// will set new callback after the current string cycle finishes
te.setCallback((str) => {
  // do stuff
});

// will set new callback immediately
te.setCallback((str) => {
  // do stuff
}, true);
```

Setting the callback to `null` will stop current cycle, set runnig state to `idle` and instance state to `initialized`. You won't be able to start iteration until a function is set as a callback.

### setOptions

Updates the settings of TypingEffect instance. Allows full and partial update. If called before `start` (the instance state is not running), the options are set immediately. Otherwise, if `now` is not provided, executes the setter before the next string's typing/untyping cycle.

Providing explicit undefined for settings' fields will reset them to their default values.

Syntax:

```ts
setOptions: (options?: TypingEffectOptions, now?: boolean) => this;
```

Has two possible arguments:

- `options`: Options object. [About options](#Options).
- `now`: Optional boolean. Indicates whether to update options immediately. Defaults to false.

Usage:

```js
// will update provided options after the current string cycle finishes
te.setOptions({ typingDelay: 300, cursorBlinkRate: 700 });

// will update options immediately
te.setOptions({ typingDelay: 300, cursorBlinkRate: 700 }, true);

// explicit undefined
te.setOptions({ typingDelay: undefined, delayAfterTyping: 1000 });
// will result in new typingDelay value to reset to default value
// and delayAfterTyping to be set as 1000
```

### onBeforeTyping

Registers a callback that will be called before the typing of a string starts. Returns a function that removes the callback.

Syntax:

```ts
onBeforeTyping: (callback: (stringIndex: number) => void, once?: boolean) => () => void;
```

Has two possible arguments:

- `callback`: A function that will be called with the current string index as its argument.
- `once`: Optional boolean. Indicates whether the callback should be executed only once. Defaults to false.

Usage:

```js
// logs the index once before typing
te.onBeforeTyping((index) => {
  console.log(index);
}, true);

// logs the index for every string before typing
const removeLogger = te.onBeforeTyping((index) => {
  console.log(index);
});

// removes the above callback
removeLogger();
```

### onAfterTyping

Registers a callback that will be called after the typing of a string finishes. Returns a function that removes the callback.

Syntax:

```ts
onAfterTyping: (callback: (stringIndex: number) => void, once?: boolean) => () => void;
```

Has two possible arguments:

- `callback`: A function that will be called with the current string index as its argument.
- `once`: Optional boolean. Indicates whether the callback should be executed only once. Defaults to false.

Usage:

```js
// logs the index once after typing
te.onAfterTyping((index) => {
  console.log(index);
}, true);

// logs the index for every string after typing
const removeLogger = te.onAfterTyping((index) => {
  console.log(index);
});

// removes the above callback
removeLogger();
```

### onBeforeUntyping

Registers a callback that will be called before the untyping of a string starts. Returns a function that removes the callback.
The callback will not be called if `untypeString` option is `false`.

Syntax:

```ts
onBeforeUntyping: (callback: (stringIndex: number) => void, once?: boolean) => () => void;
```

Has two possible arguments:

- `callback`: A function that will be called with the current string index as its argument.
- `once`: Optional boolean. Indicates whether the callback should be executed only once. Defaults to false.

Usage:

```js
// logs the index once before untyping
te.onBeforeUntyping((index) => {
  console.log(index);
}, true);

// logs the index for every string before untyping
const removeLogger = te.onBeforeUntyping((index) => {
  console.log(index);
});

// removes the above callback
removeLogger();
```

### onAfterUntyping

Registers a callback that will be called after the untyping of a string finishes. Returns a function that removes the callback.
The callback will not be called if `untypeString` option is `false`.

Syntax:

```ts
onAfterUntyping: (callback: (stringIndex: number) => void, once?: boolean) => () => void;
```

Has two possible arguments:

- `callback`: A function that will be called with the current string index as its argument.
- `once`: Optional boolean. Indicates whether the callback should be executed only once. Defaults to false.

Usage:

```js
// logs the index once after untyping
te.onAfterUntyping((index) => {
  console.log(index);
}, true);

// logs the index for every string after untyping
const removeLogger = te.onAfterUntyping((index) => {
  console.log(index);
});

// removes the above callback
removeLogger();
```

### onArrayFinished

Registers a callback that will be called after all strings in the strings array have been processed. Returns a function that removes the callback.

Syntax:

```ts
onArrayFinished: (callback: () => void, once?: boolean) => () => void;
```

Has two possible arguments:

- `callback`: A function to be called when array finishes.
- `once`: Optional boolean. Indicates whether the callback should be executed only once. Defaults to false.

Usage:

```js
// logs the message once
te.onArrayFinished(() => {
  console.log("all strings were processed");
}, true);

// logs the message every time array is finished
const removeLogger = te.onArrayFinished(() => {
  console.log("all strings were processed");
});

// removes the above callback
removeLogger();
```

### onInstanceDisposed

Available since `v1.4.0`.

Registers a callback that will be called when instance is being disposed right before setting `instanceState` to `disposed`. Returns a function that removes the callback.

Syntax:

```ts
onInstanceDisposed: (callback: () => void) => () => void;
```

Has only one argument, because it can only be called once:

- `callback`: A function to be called when disposing.

Usage:

```js
// logs the message and does some cleanup
const removeCleanup = te.onInstanceDisposed(() => {
  console.log("The instance is disposed!");
  // performe some kind of cleanup or other operations
  // ...
  // ...
});

// removes the above callback
removeCleanup();
```

### dispose

Disposes of the instance, resetting its state and helping to "release" resources. It cancels any ongoing animation frames, resets the running state, and clears all internal data structures. This method should be called when the instance is no longer needed.

While not mandatory, it may be useful in some cases. Such as in SPAs in conjunction with [`onInstanceDisposed`](#onInstanceDisposed) method (v1.4.0). See [React usage example](#react-example). After calling `dispose`, all subsequent method calls will throw errors.

Usage:

```js
te.dispose();
```

## Options

The options object has the following structure:

```ts
type TypingEffectOptions = {
  typingDelay?: number | undefined;
  untypingDelay?: number | undefined;
  delayBeforeTyping?: number | undefined;
  delayAfterTyping?: number | undefined;
  untypeString?: boolean | undefined;
  typingVariation?: number | undefined;
  showCursor?: boolean | undefined;
  cursorSymbol?: string | Partial<CursorSymbols> | undefined;
  cursorBlinkRate?: number | undefined;
  loop?: boolean | undefined;
};

type CursorSymbols = {
  typing: string;
  untyping: string;
  blinking: string;
};
```

### typingDelay

`number`

Delay between typing each character, in milliseconds. Defaults to `100`ms.

### untypingDelay

`number`

Delay between untyping each character, in milliseconds. Defaults to `30`ms.

### delayBeforeTyping

`number`

Delay before starting to type a string, in milliseconds. Defaults to `1600`ms. During this time, if `showCursor` setting is `true`, the callback function will be called with blinking cursor symbol at the rate of `cursorBlinkRate`.

### delayAfterTyping

`number`
Delay after a string is typed, in milliseconds. Defaults to `3000`ms. During this time, if `showCursor` setting is `true`, the callback function will be called with blinking cursor symbol at the rate of `cursorBlinkRate`.

### untypeString

`boolean`

If true, untypes the string after the typing finishes. Defaults to `true`. If `false`, after `delayAfterTyping` is passed, goes straight to `delayBeforeTyping`, does not trigger `onBeforeUntyping` and `onAfterUntyping`.
Setting this option with `setOptions` while running restarts cycle from the first string.

### typingVariation

`number`

While typing, a random delay between 0 and the value of `typingVariation` is added, creating a subtle impression of natural typing. Setting to `0`, turns the variation off.
Defaults to `100`ms.

### showCursor

`boolean`

If true, a cursor symbol is shown. Defaults to `true`.

### cursorSymbol

`string` | `Partial<CursorSymbols>`

Allows to set the cursor symbol for `typing`, `untyping` and `blinking` (during delays and while paused). If string is passed as value, uses it for all three stages, otherwise allows to set the symbols individualy via object.
Defaults to `"|"`.

Usage:

```js
// will set the cursor to "_" wile typing, untyping and blinking
te.setOptions({ cursorSymbol: "_" });

// will set only the untyping cursor to "<", leaving the default "|" for typing and blinking
te.setOptions({
  cursorSymbol: {
    untyping: "<",
  },
});

// cursor values can be reset to default if set to `undefined`
// will reset untyping cursor to "|"
te.setOptions({
  cursorSymbol: {
    untyping: undefined,
  },
});
```

### cursorBlinkRate

`number`

Blink rate when "idle" - after typing or untyping, or during pause. Defaults to `500`ms.

### loop

`boolean`

Loop to the first string after the last. Defaults to `true`.

## Usage notes

### Timing

Don't expect exact timing in milliseconds. TypingEffect uses requestAnimationFrame, which usually calls its callback around every 16ms (sometimes longer if the website is busy (usually with JS)). This means the shortest reaction time is at least 16ms, so any timing you set will be rounded to the nearest bigger multiple of 16.

For instance, if you set `cursorBlinkRate` to 500ms, the cursor will actually blink every 512ms because 500 isn't divisible by 16, but 512 is.

### Layout shift

Important! If you are using TypingEffect as in the examples to set the content of some element, it's essential to remember the layout shift. See the [demo](https://ydernov.github.io/typing-effect#problem-layout-shift) for context.
It is bad UX practice since it causes content jitter, making it harder for people to process; therefore, it should be avoided. The simplest way is to check the maximum height of the container during the cycle and set it's `height` or `min-height` accordingly.

If this does not meet your requirements, refer to the solution in the demo for [layout shift](https://ydernov.github.io/typing-effect#problem-layout-shift) to understand how it can be dynamically resolved.
