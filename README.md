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

## Contributing

Guidelines for contributing to your project.

## License

Information about the license.
