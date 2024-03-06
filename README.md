# Typing Effect

## Description

A small TypeScript package that provides the ability to create a typing effect with one or multiple strings. It is intended for in-browser use.

## Installation

Instructions on how to install your project.

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

![](/example_demos/first_example.gif)

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

<img src="/example_demos/pause_demo.gif" width="80%" />

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
* `stringIndex`: Optional number. The index of the string to jump to. Defaults to the current string index.
* `now`: Optional boolean. Indicates whether to execute the jump immediately. Defaults to false.

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
* `strings`: An array of new strings.
* `now`: Optional boolean. Indicates whether to set new strings immediately. Defaults to false.

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
setCallback: (callback: ((string: string) => void) | null, now?: boolean) => this;
```

Has two possible arguments:
* `callback`: A function which accepts a string argument.
* `now`: Optional boolean. Indicates whether to set new callback immediately. Defaults to false.

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
* `options`: Options object. [About options](#Options).
* `now`: Optional boolean. Indicates whether to update options immediately. Defaults to false.

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
* `callback`: A function that will be called with the current string index as its argument.
* `once`: Optional boolean. Indicates whether the callback should be executed only once. Defaults to false.

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
* `callback`: A function that will be called with the current string index as its argument.
* `once`: Optional boolean. Indicates whether the callback should be executed only once. Defaults to false.

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
* `callback`: A function that will be called with the current string index as its argument.
* `once`: Optional boolean. Indicates whether the callback should be executed only once. Defaults to false.

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
* `callback`: A function that will be called with the current string index as its argument.
* `once`: Optional boolean. Indicates whether the callback should be executed only once. Defaults to false.

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
* `callback`: A function to be called when array finishes.
* `once`: Optional boolean. Indicates whether the callback should be executed only once. Defaults to false.

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
```

## Contributing

Guidelines for contributing to your project.

## License

Information about the license.
