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

## Contributing

Guidelines for contributing to your project.

## License

Information about the license.
