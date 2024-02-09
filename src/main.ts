import "./style.css";
import { TypingEffect } from "./TypingEffect";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <div id="catsDiv">Some facts about cats: <span></span><span class='cursor idle'></span></div>
  </div>
`;

const [catsSpan, cursor] = document.querySelectorAll<HTMLSpanElement>(
  "#catsDiv span"
)! as unknown as [HTMLSpanElement, HTMLSpanElement];

const catFunFacts = [
  "Cats have five toes on their front paws but only four on their back ones.",
  "A group of cats is called a clowder.",
  "Cats sleep for an average of 12-16 hours a day.",
  "The oldest known pet cat was found on the Mediterranean island of Cyprus and is estimated to be around 9,500 years old.",
  "Cats have a unique grooming pattern: they lick their lips, then their front legs, followed by their face.",
  "A cat's nose is as unique as a human's fingerprint.",
  "Cats have a special reflective layer behind their retinas called the tapetum lucidum, which enhances their night vision.",
];

const te = new TypingEffect(
  // catFunFacts,
  undefined,
  // (string) => {
  //   catsSpan.innerText = string;
  // },
  undefined,
  {
    // typingDelay: 0,
    // typingVariation: 200,
    // delayBeforeTyping: 0,
    // delayBeforeUntyping: 0,
    // untypingDelay: 0,
    // loop: false,
    // untypeString: false,
    showCursor: false,
  }
  // {
  //   // typingDelay: 0,
  //   // typingVariation: 0,
  //   // untypingDelay: 0,
  //   untypeString: true,
  // }
)
  .setCallback((string) => {
    catsSpan.innerText = string;
  })
  .setStrings(catFunFacts)

  .start();

te.#runningState = "afterTyping";

const g = te.onBeforeTyping((i) => {
  console.log("onBeforeTyping", i);
  // cursor.classList.remove("idle");

  cursor.classList.add("green");
});

const gg = te.onAfterTyping((i) => {
  console.log("onAfterTyping", i);
  cursor.classList.add("idle");
  cursor.classList.remove("green");
});

const ggg = te.onBeforeUntyping((i) => {
  console.log("onBeforeUntyping", i);
  // cursor.classList.remove("idle");
  cursor.classList.add("red");
});

const gggg = te.onAfterUntyping((i) => {
  console.log("onAfterUntyping", i);
  cursor.classList.add("idle");
  cursor.classList.remove("red");
});

const ggggg = te.onArrayFinished(() => {
  console.log("onArrayFinished");
});

// te.onBeforeUntyping((i) => {
//   console.log("onBeforeUntyping", i);
// });

// te.onArrayFinished((i) => {
//   console.log("onArrayFinished", i);
//   // te.start();
//   setTimeout(() => {
//     te.start();
//   }, 9000);
// }, true);

// const cl = te.onStringStart((rf) => {
//   console.log("this is before the string typing", rf);
// });

setTimeout(() => {
  // g();
  // te.pause();
  // console.log("before the string typing cleanup after 20sec");
  // cl();
  // te.setStrings(["A new set of strings", "Another one"], true).setOptions({
  //   typingDelay: 0,
  //   typingVariation: 0,
  //   loop: true,
  // });
  // te.setStrings([]);
  // te.setOptions({ untypeString: false }, true);
}, 4000);
