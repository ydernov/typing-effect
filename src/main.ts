import "./style.css";
import { TypingEffect } from "./TypingEffect";

const catFunFacts = [
  "Cats have five toes on their front paws but only four on their back ones.",
  "A group of cats is called a clowder.",
  "Cats sleep for an average of 12-16 hours a day.",
  "The oldest known pet cat was found on the Mediterranean island of Cyprus and is estimated to be around 9,500 years old.",
  "Cats have a unique grooming pattern: they lick their lips, then their front legs, followed by their face.",
  "A cat's nose is as unique as a human's fingerprint.",
  "Cats have a special reflective layer behind their retinas called the tapetum lucidum, which enhances their night vision.",
];

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div id="typing-examples">
    <div id="default" class="example-block">
      <h2>Default example:</h2>
      <div class="typing-container">Some facts about cats: <span></span></div>
    </div>

    <div id="typing-delay" class="example-block">
      <h2>Typing delay examples:</h2>
      <div>
        <h3>Default (100ms)</h3>
        <div class="typing-container">Some facts about cats: <span></span></div>
      </div>
      <div>
        <h3>500ms</h3>
        <div class="typing-container">Some facts about cats: <span></span></div>
      </div>
      <div>
        <h3>0ms</h3>
        <div class="typing-container">Some facts about cats: <span></span></div>
      </div>
    </div>

    <div id="typing-variation" class="example-block">
      <h2>Typing variation examples:</h2>
      <div>
        <h3>Default (100ms)</h3>
        <div class="typing-container">Some facts about cats: <span></span></div>
      </div>
      <div>
        <h3>500ms</h3>
        <div class="typing-container">Some facts about cats: <span></span></div>
      </div>
      <div>
        <h3>0ms</h3>
        <div class="typing-container">Some facts about cats: <span></span></div>
      </div>
      <div>
        <h3>0ms with typingDelay = 0ms</h3>
        <div class="typing-container">Some facts about cats: <span></span></div>
      </div>
    </div>

    <div id="untyping-delay" class="example-block">
      <h2>Untyping delay examples:</h2>
      <div>
        <h3>Default (100ms)</h3>
        <div class="typing-container">Some facts about cats: <span></span></div>
      </div>
      <div>
        <h3>500ms</h3>
        <div class="typing-container">Some facts about cats: <span></span></div>
      </div>
      <div>
        <h3>0ms</h3>
        <div class="typing-container">Some facts about cats: <span></span></div>
      </div>
    </div>

    <div id="delay-before-typing" class="example-block">
      <h2>Delay before typing examples:</h2>
      <div>
        <h3>Default (1600ms)</h3>
        <div class="typing-container">Some facts about cats: <span></span></div>
      </div>
      <div>
        <h3>10000ms</h3>
        <div class="typing-container">Some facts about cats: <span></span></div>
      </div>
      <div>
        <h3>0ms</h3>
        <div class="typing-container">Some facts about cats: <span></span></div>
      </div>
    </div>

    <div id="delay-after-typing" class="example-block">
      <h2>Delay after typing examples:</h2>
      <div>
        <h3>Default (3000ms)</h3>
        <div class="typing-container">Some facts about cats: <span></span></div>
      </div>
      <div>
        <h3>10000ms</h3>
        <div class="typing-container">Some facts about cats: <span></span></div>
      </div>
      <div>
        <h3>0ms</h3>
        <div class="typing-container">Some facts about cats: <span></span></div>
      </div>
    </div>

    <div id="without-untyping" class="example-block">
      <h2>No untyping example:</h2>
      <div class="typing-container">Some facts about cats: <span></span></div>
    </div>

    <div id="without-cursor" class="example-block">
      <h2>No cursor example:</h2>
      <div class="typing-container">Some facts about cats: <span></span></div>
    </div>

    <div id="cursor-blink-rate" class="example-block">
      <h2>Cursor blink rate examples:</h2>
      <div>
        <h3>Default (500ms)</h3>
        <div class="typing-container">Some facts about cats: <span></span></div>
      </div>
      <div>
        <h3>1000ms</h3>
        <div class="typing-container">Some facts about cats: <span></span></div>
      </div>
      <div>
        <h3>100ms</h3>
        <div class="typing-container">Some facts about cats: <span></span></div>
      </div>
    </div>

    <div id="cursor-symbol" class="example-block">
      <h2>Cursor symbol examples with UTF-8 emoji:</h2>
      <div>
        <h3>Typing - 👉; untyping - 👈; blinking - ✋</h3>
        <div class="typing-container">Some facts about cats: <span></span></div>
      </div>
    </div>

    <div id="custom-cursor" class="example-block">
      <h2>Custom cursor example:</h2>

      <div class="typing-container">Some facts about cats: <span></span><span class='cursor idle'></span></div>
    </div>
    
  </div>
`;

// default
const defaultExample = document.querySelectorAll<HTMLSpanElement>(
  "#default .typing-container span"
)! as unknown as [HTMLSpanElement];

const defaultTE = new TypingEffect(catFunFacts, (string) => {
  defaultExample[0].innerText = string;
}).start();

// typingDelay
const typingDelayExamples = document.querySelectorAll<HTMLSpanElement>(
  "#typing-delay .typing-container span"
)! as unknown as [HTMLSpanElement, HTMLSpanElement, HTMLSpanElement];

const typingDelayTE_default = new TypingEffect(catFunFacts, (string) => {
  typingDelayExamples[0].innerText = string;
}).start();

const typingDelayTE_500ms = new TypingEffect(
  catFunFacts,
  (string) => {
    typingDelayExamples[1].innerText = string;
  },
  {
    typingDelay: 500,
  }
).start();

const typingDelayTE_0ms = new TypingEffect(
  catFunFacts,
  (string) => {
    typingDelayExamples[2].innerText = string;
  },
  {
    typingDelay: 0,
  }
).start();

// typingVariation
const typingVariationExamples = document.querySelectorAll<HTMLSpanElement>(
  "#typing-variation .typing-container span"
)! as unknown as [
  HTMLSpanElement,
  HTMLSpanElement,
  HTMLSpanElement,
  HTMLSpanElement
];

const typingVariationTE_default = new TypingEffect(catFunFacts, (string) => {
  typingVariationExamples[0].innerText = string;
}).start();

const typingVariationTE_500ms = new TypingEffect(
  catFunFacts,
  (string) => {
    typingVariationExamples[1].innerText = string;
  },
  {
    typingVariation: 500,
  }
).start();

const typingVariationTE_0ms = new TypingEffect(
  catFunFacts,
  (string) => {
    typingVariationExamples[2].innerText = string;
  },
  {
    typingVariation: 0,
  }
).start();

const typingVariationTE_0_0ms = new TypingEffect(
  catFunFacts,
  (string) => {
    typingVariationExamples[3].innerText = string;
  },
  {
    typingVariation: 0,
    typingDelay: 0,
  }
).start();

// untypingDelay
const untypingDelayExamples = document.querySelectorAll<HTMLSpanElement>(
  "#untyping-delay .typing-container span"
)! as unknown as [HTMLSpanElement, HTMLSpanElement, HTMLSpanElement];

const untypingDelayTE_default = new TypingEffect(catFunFacts, (string) => {
  untypingDelayExamples[0].innerText = string;
}).start();

const untypingDelayTE_500ms = new TypingEffect(
  catFunFacts,
  (string) => {
    untypingDelayExamples[1].innerText = string;
  },
  {
    untypingDelay: 500,
  }
).start();

const untypingDelayTE_0ms = new TypingEffect(
  catFunFacts,
  (string) => {
    untypingDelayExamples[2].innerText = string;
  },
  {
    untypingDelay: 0,
  }
).start();

// delayBeforeTyping
const delayBeforeTypingExamples = document.querySelectorAll<HTMLSpanElement>(
  "#delay-before-typing .typing-container span"
)! as unknown as [HTMLSpanElement, HTMLSpanElement, HTMLSpanElement];

const delayBeforeTypingTE_default = new TypingEffect(catFunFacts, (string) => {
  delayBeforeTypingExamples[0].innerText = string;
}).start();

const delayBeforeTypingTE_10000ms = new TypingEffect(
  catFunFacts,
  (string) => {
    delayBeforeTypingExamples[1].innerText = string;
  },
  {
    delayBeforeTyping: 10000,
  }
).start();

const delayBeforeTypingTE_0ms = new TypingEffect(
  catFunFacts,
  (string) => {
    delayBeforeTypingExamples[2].innerText = string;
  },
  {
    delayBeforeTyping: 0,
  }
).start();

// delayAfterTyping
const delayAfterTypingExamples = document.querySelectorAll<HTMLSpanElement>(
  "#delay-after-typing .typing-container span"
)! as unknown as [HTMLSpanElement, HTMLSpanElement, HTMLSpanElement];

const delayAfterTypingTE_default = new TypingEffect(catFunFacts, (string) => {
  delayAfterTypingExamples[0].innerText = string;
}).start();

const delayAfterTypingTE_10000ms = new TypingEffect(
  catFunFacts,
  (string) => {
    delayAfterTypingExamples[1].innerText = string;
  },
  {
    delayAfterTyping: 10000,
  }
).start();

const delayAfterTypingTE_0ms = new TypingEffect(
  catFunFacts,
  (string) => {
    delayAfterTypingExamples[2].innerText = string;
  },
  {
    delayAfterTyping: 0,
  }
).start();

// no untyping
const noUntypingExample = document.querySelectorAll<HTMLSpanElement>(
  "#without-untyping .typing-container span"
)! as unknown as [HTMLSpanElement];

const noUntypingTE = new TypingEffect(
  catFunFacts,
  (string) => {
    noUntypingExample[0].innerText = string;
  },
  {
    untypeString: false,
  }
).start();

// no cursor
const noCursorExample = document.querySelectorAll<HTMLSpanElement>(
  "#without-cursor .typing-container span"
)! as unknown as [HTMLSpanElement];

const noCursorTE = new TypingEffect(
  catFunFacts,
  (string) => {
    noCursorExample[0].innerText = string;
  },
  {
    showCursor: false,
  }
).start();

// cursorBlinkRate
const cursorBlinkRateExamples = document.querySelectorAll<HTMLSpanElement>(
  "#cursor-blink-rate .typing-container span"
)! as unknown as [HTMLSpanElement, HTMLSpanElement, HTMLSpanElement];

const cursorBlinkRateTE_default = new TypingEffect(catFunFacts, (string) => {
  cursorBlinkRateExamples[0].innerText = string;
}).start();

const cursorBlinkRateTE_10000ms = new TypingEffect(
  catFunFacts,
  (string) => {
    cursorBlinkRateExamples[1].innerText = string;
  },
  {
    cursorBlinkRate: 1000,
  }
).start();

const cursorBlinkRateTE_100ms = new TypingEffect(
  catFunFacts,
  (string) => {
    cursorBlinkRateExamples[2].innerText = string;
  },
  {
    cursorBlinkRate: 100,
  }
).start();

// cursorSymbol
const cursorSymbolExample = document.querySelectorAll<HTMLSpanElement>(
  "#cursor-symbol .typing-container span"
)! as unknown as [HTMLSpanElement];

const cursorSymbolTE = new TypingEffect(
  catFunFacts,
  (string) => {
    cursorSymbolExample[0].innerText = string;
  },
  {
    cursorSymbol: {
      typing: "👉",
      untyping: "👈",
      blinking: "✋",
    },
  }
).start();

// custom cursor
const customCursorExample = document.querySelectorAll<HTMLSpanElement>(
  "#custom-cursor .typing-container span"
)! as unknown as [HTMLSpanElement, HTMLSpanElement];

const customCursorTE = new TypingEffect(
  catFunFacts,
  (string) => {
    customCursorExample[0].innerText = string;
  },
  {
    showCursor: false,
  }
).start();

customCursorTE.onBeforeTyping(() => {
  customCursorExample[1].classList.remove("idle");
});

customCursorTE.onAfterTyping(() => {
  customCursorExample[1].classList.add("idle");
});

customCursorTE.onBeforeUntyping(() => {
  customCursorExample[1].classList.remove("idle");
});

customCursorTE.onAfterUntyping(() => {
  customCursorExample[1].classList.add("idle");
});

// const ggggg = te.onArrayFinished(() => {
//   console.log("onArrayFinished");
// });
