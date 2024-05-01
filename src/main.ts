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
  "#custom-cursor .normal .typing-container span"
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

// custom cursor overflow

const customCursorExample_overflow_default =
  document.querySelectorAll<HTMLSpanElement>(
    "#custom-cursor .cursor-overflow .typing-container.default span"
  )! as unknown as [HTMLSpanElement, HTMLSpanElement];

const overflow_default = new TypingEffect(
  ["Cats have five toes on their front paws but only four on their back ones."],
  (string) => {
    customCursorExample_overflow_default[0].innerText = string;
  },
  {
    showCursor: false,
    loop: false,
    untypeString: false,
    delayBeforeTyping: 0,
    typingDelay: 0,
    typingVariation: 0,
  }
).start();

const customCursorExample_overflow_fixed =
  document.querySelectorAll<HTMLSpanElement>(
    "#custom-cursor .cursor-overflow .typing-container.fixed span"
  )! as unknown as [HTMLSpanElement, HTMLSpanElement];

const overflow_fixed = new TypingEffect(
  ["Cats have five toes on their front paws but only four on their back ones."],
  (string) => {
    customCursorExample_overflow_fixed[0].innerText = string;
  },
  {
    showCursor: false,
    loop: false,
    untypeString: false,
    delayBeforeTyping: 0,
    typingDelay: 0,
    typingVariation: 0,
  }
).start();

// const ggggg = te.onArrayFinished(() => {
//   console.log("onArrayFinished");
// });

// name input example
const nameInputExample = document.querySelector<HTMLInputElement>(
  "#name-input-ex input"
)!;

const nameInputExampleTE = new TypingEffect(
  [
    "Mick Jagger",
    "Freddie Mercury",
    "Jimi Hendrix",
    "David Bowie",
    "Kurt Cobain",
    "Jonathan David Douglas 'Jon' Lord",
  ],
  (string) => {
    nameInputExample.setAttribute("placeholder", string);
  }
).start();

nameInputExample.addEventListener("focus", () => {
  nameInputExampleTE.pause();
});

nameInputExample.addEventListener("blur", () => {
  nameInputExampleTE.resume();
});

// problem-layout-shift

const layoutShiftExample = document.querySelector<HTMLInputElement>(
  "#problem-layout-shift .typing-container span"
)!;

const layoutShiftExampleStrigs = [
  "In ancient Egypt, cats held a sacred status, worshipped as embodiments of the goddess Bastet, their sleek forms and enigmatic gaze symbolizing protection, fertility, and divine grace, leading to their depiction in intricate hieroglyphs, adornments in homes, and even mummification alongside esteemed individuals, reflecting a deep cultural reverence that resonated through millennia.",
  "This is a short string - cats are awesome!",
];

const layoutShiftExample_longestString = layoutShiftExampleStrigs.reduce(
  (longest, current) => {
    return current.length > longest.length ? current : longest;
  },
  ""
);

const layoutShiftExampleTE = new TypingEffect(
  layoutShiftExampleStrigs,
  (string) => {
    layoutShiftExample.innerText = string;
  },
  { typingDelay: 0 }
).start();

const layoutShiftExample_solution1 = document.querySelector<HTMLInputElement>(
  "#problem-layout-shift .dynamic-solution-position .typing-container span"
)!;

const layoutShiftExample_solution1_filler =
  document.querySelector<HTMLInputElement>(
    "#problem-layout-shift .dynamic-solution-position .filler"
  )!;

requestAnimationFrame(() => {
  layoutShiftExample_solution1_filler.style.height = "auto";
  layoutShiftExample_solution1_filler.innerText =
    "Some facts about cats: " + layoutShiftExample_longestString + "|";
});

const layoutShiftExampleTE_solution1 = new TypingEffect(
  layoutShiftExampleStrigs,
  (string) => {
    layoutShiftExample_solution1.innerText = string;
  },
  { typingDelay: 0 }
).start();
