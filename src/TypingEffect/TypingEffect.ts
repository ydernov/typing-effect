import { substringGeneratorForArray } from "../utils/substringGeneratorForArray";
import { setIntervalRAF } from "../utils/setIntervalRAF";
import { mergeWithDefaults } from "../utils/mergeWithDefaults";

type ArGen = typeof substringGeneratorForArray;

type CursorSymbols = {
  typing: string;
  untyping: string;
  blinking: string;
};

export type TypingEffectOptions = {
  /** Delay between typing each character, in milliseconds. Defaults to `100ms`. */
  typingDelay?: number;
  /** Delay between untyping each character. Defaults to `30ms`. */
  untypingDelay?: number;
  /** Delay before starting to type a string. Defaults to `1600ms`. */
  delayBeforeTyping?: number;
  /** Delay after string is typed. Defaults to `3000ms.` */
  delayAfterTyping?: number;
  /** If true, untypes the string after the typing finishes. Defaults to `true`.
   * Setting this option restarts cycle from the first string.
   */
  untypeString?: boolean;
  /** Variation in typing speed. While typing adds a random delay between 0 and `typingVariation` value. Defaults to `100ms`. */
  typingVariation?: number;
  /** If true, a cursor is shown during the typing effect, and blinking cursor during delays. Defaults to `true`. */
  showCursor?: boolean;
  /** Defaults to `"|"`.  */
  cursorSymbol?: string | Partial<CursorSymbols>;
  /** Blink rate when "idle" - after typing or untyping. Defaults to 500ms */
  cursorBlinkRate?: number;
  /** Loop to the first string after the last. Defaults to true. */
  loop?: boolean;
};

type RunningStageName =
  | "cycleStart"
  | "idle"
  | "beforeTyping"
  | "typing"
  | "afterTyping"
  | "beforeUntyping"
  | "untyping"
  | "afterUntyping"
  | "delayBeforeTyping"
  | "delayAfterTyping";

type RunningStages = Record<
  RunningStageName,
  { handle: (timestamp: number) => RunningStageName }
>;

type IteratorType = ReturnType<ArGen>;

type InstanceState = "initialized" | "ready" | "running" | "disposed";

type CallbackType = (string: string) => void;

type ScheduledCallbacks = Record<
  RunningStageName | "arrayFinished" | "instanceDisposed",
  {
    callback: () => void | RunningStageName;
    once: boolean;
    called: boolean;
    id: symbol;
    remove: boolean;
  }[]
>;

type InternalOptions = Required<Omit<TypingEffectOptions, "cursorSymbol">> & {
  cursorSymbol: CursorSymbols;
};

type InternalOptionsPartial = Partial<Omit<InternalOptions, "cursorSymbol">> & {
  cursorSymbol?: Partial<CursorSymbols>;
};

const getDefaultOptions = (): InternalOptions => ({
  typingDelay: 100,
  untypingDelay: 30,
  delayBeforeTyping: 1600,
  delayAfterTyping: 3000,
  untypeString: true,
  typingVariation: 100,
  showCursor: true,
  cursorSymbol: {
    typing: "|",
    untyping: "|",
    blinking: "|",
  },
  cursorBlinkRate: 500,
  loop: true,
});

/**
 * Class representing a typing effect.
 * @constructor
 * @param {string[]} strings - The strings to be 'typed' and 'untyped'.
 * @param {CallbackType} callback - The callback function to be called on each update of the typing animation.
 * @param {TypingEffectOptions} options - The options for the typing effect.
 */
export class TypingEffect {
  #options = getDefaultOptions();

  #optionsCopy = (): InternalOptions => ({
    ...this.#options,
    cursorSymbol: { ...this.#options.cursorSymbol },
  });

  get options() {
    return this.#optionsCopy();
  }

  #iteratorState: {
    iterator: IteratorType | null;
    initialResult: ReturnType<IteratorType["next"]>;
    lastResult: ReturnType<IteratorType["next"]>;
  } = {
    iterator: null,
    initialResult: {
      done: false,
      value: { string: "", index: 0 },
    },
    lastResult: {
      done: false,
      value: { string: "", index: 0 },
    },
  };

  #setIterator = (iterator: IteratorType | null) => {
    this.#iteratorState.iterator = iterator;
    this.#iteratorState.lastResult = this.#iteratorState.initialResult;
  };

  #setLastResult = (result: ReturnType<IteratorType["next"]>) => {
    this.#iteratorState.lastResult = result;

    if (result.value && "string" in result.value) {
      this.#lastStringData.value = result.value.string;
      this.#lastStringData.index = result.value.index;
      this.#lastStringData.nextExpectedIndex =
        result.value.index + 1 < this.#strings.length
          ? result.value.index + 1
          : 0;
    }
  };

  #strings: string[] = [];

  get strings() {
    return [...this.#strings];
  }

  #setStrings = (strings: string[], now?: boolean) => {
    if (!Array.isArray(strings)) {
      throw new Error("Provided strings is not an array.");
    }
    const setterFn = () => {
      this.#strings = strings;
      if (this.#strings.length > 0) {
        this.#setIterator(
          substringGeneratorForArray(this.#strings, {
            rewindStringOnFinish: this.#options.untypeString,
          })
        );
      } else {
        this.#setIterator(null);
      }
    };

    const notRunningSetter = () => {
      setterFn();
      this.#instanceState = this.#checkInstanceState();
      this.#overrideRunningStateBeforeStageExecution = null;
      this.#overrideRunningStateAfterStageExecution = null;
    };

    const scheduledSetter = () => {
      setterFn();
      this.#instanceState = this.#checkInstanceState();
      const runningState = this.#checkRunningState();

      if (this.#instanceState !== "initialized") {
        this.#instanceState = "running";
        this.#overrideRunningStateBeforeStageExecution = null;
        this.#overrideRunningStateAfterStageExecution = null;
      } else {
        this.#overrideRunningStateBeforeStageExecution = null;
        this.#overrideRunningStateAfterStageExecution = runningState;
      }
    };

    const immediateSetter = () => {
      setterFn();
      this.#instanceState = this.#checkInstanceState();
      const runningState = this.#checkRunningState("cycleStart");

      if (this.#instanceState === "running") {
        this.#overrideRunningStateBeforeStageExecution = runningState;
        this.#overrideRunningStateAfterStageExecution = null;
      } else {
        this.#overrideRunningStateBeforeStageExecution = null;
        this.#overrideRunningStateAfterStageExecution = null;
        this.#runningState = runningState;
      }
    };

    const runningSetter = () => {
      if (now) {
        immediateSetter();
      } else {
        this.#scheduleCallback("cycleStart", scheduledSetter, true);
      }
    };

    if (this.instanceState === "running") {
      runningSetter();
    } else {
      notRunningSetter();
    }
  };

  #callback: CallbackType | null = null;

  get callback() {
    return this.#callback;
  }

  #setCallback = (callback: CallbackType | null, now?: boolean) => {
    if (callback !== null && typeof callback !== "function") {
      throw new Error("Provided callback is not a function or null.");
    }
    const notRunningSetter = () => {
      this.#callback = callback;
      this.#instanceState = this.#checkInstanceState();
      this.#overrideRunningStateBeforeStageExecution = null;
      this.#overrideRunningStateAfterStageExecution = null;
    };

    const scheduledSetter = () => {
      this.#callback = callback;
      this.#instanceState = this.#checkInstanceState();
      const runningState = this.#checkRunningState();
      if (this.#instanceState !== "initialized") {
        this.#instanceState = "running";
        this.#overrideRunningStateBeforeStageExecution = null;
        this.#overrideRunningStateAfterStageExecution = null;
      } else {
        this.#overrideRunningStateBeforeStageExecution = null;
        this.#overrideRunningStateAfterStageExecution = runningState;
      }
    };

    const immediateSetter = () => {
      this.#callback = callback;
      this.#instanceState = this.#checkInstanceState();
      const runningState = this.#checkRunningState();
      if (this.#instanceState === "running") {
        this.#overrideRunningStateBeforeStageExecution = null;
        this.#overrideRunningStateAfterStageExecution = null;
      } else {
        this.#overrideRunningStateBeforeStageExecution = null;
        this.#overrideRunningStateAfterStageExecution = null;
        this.#runningState = runningState;
      }
    };

    const runningSetter = () => {
      if (now) {
        immediateSetter();
      } else {
        this.#scheduleCallback("cycleStart", scheduledSetter, true);
      }
    };

    if (this.instanceState === "running") {
      runningSetter();
    } else {
      notRunningSetter();
    }
  };

  #constructOptions = (options?: TypingEffectOptions) => {
    const localCopy = this.#optionsCopy();
    const defaultOptions = getDefaultOptions();

    if (options) {
      const { cursorSymbol, ...rest } = options;
      let update: Partial<InternalOptionsPartial> = rest;
      if (options.hasOwnProperty("cursorSymbol")) {
        switch (true) {
          case cursorSymbol === undefined:
            update.cursorSymbol = {
              typing: undefined,
              untyping: undefined,
              blinking: undefined,
            };
            break;

          case typeof cursorSymbol === "object":
            update.cursorSymbol = cursorSymbol;
            break;

          default:
            update.cursorSymbol = {
              typing: cursorSymbol,
              untyping: cursorSymbol,
              blinking: cursorSymbol,
            };
            break;
        }
      }

      return mergeWithDefaults(localCopy, update, defaultOptions);
    } else {
      return localCopy;
    }
  };

  #setOptions = (options?: TypingEffectOptions, now?: boolean) => {
    if (
      options !== undefined &&
      (typeof options !== "object" || options === null)
    ) {
      throw new Error("Provided options is not an object.");
    }

    const setterFn = () => {
      const newOptions = this.#constructOptions(options);
      let setsIterator = false;

      if (this.#options.untypeString !== newOptions.untypeString) {
        this.#setIterator(
          substringGeneratorForArray(this.#strings, {
            rewindStringOnFinish: newOptions.untypeString,
          })
        );
        setsIterator = true;
      }

      this.#options = newOptions;
      return setsIterator;
    };

    const notRunningSetter = () => {
      setterFn();
    };

    const scheduledSetter = () => {
      setterFn();
    };

    const immediateSetter = () => {
      const setsIterator = setterFn();
      const runningState = this.#checkRunningState("cycleStart");
      if (setsIterator) {
        this.#runningState = runningState;
        this.#overrideRunningStateBeforeStageExecution = null;
        this.#overrideRunningStateAfterStageExecution = null;
      }
    };

    const runningSetter = () => {
      if (now) {
        immediateSetter();
      } else {
        this.#scheduleCallback("cycleStart", scheduledSetter, true);
      }
    };

    if (this.instanceState === "running") {
      runningSetter();
    } else {
      notRunningSetter();
    }
  };

  #cursorState: {
    visible: boolean;
    lastChangeTimestamp: number;
  } = {
    visible: false,
    lastChangeTimestamp: 0,
  };

  #rafLoop: ReturnType<typeof setIntervalRAF> | null = setIntervalRAF(
    (timestamp) => {
      if (
        this.#instanceState === "running" &&
        this.#runningStagesStateMachine
      ) {
        if (
          !this.#iteratorState.lastResult.done ||
          this.#runningState === "idle"
        ) {
          if (this.#overrideRunningStateBeforeStageExecution) {
            this.#runningState = this.#overrideRunningStateBeforeStageExecution;
            this.#overrideRunningStateBeforeStageExecution = null;
          }

          this.#runningState =
            this.#runningStagesStateMachine[this.#runningState].handle(
              timestamp
            );

          if (this.#overrideRunningStateAfterStageExecution) {
            this.#runningState = this.#overrideRunningStateAfterStageExecution;
            this.#overrideRunningStateAfterStageExecution = null;
          }
        } else {
          this.#runScheduledCallbacks("arrayFinished");
          if (this.#options.loop) {
            this.#setIterator(
              substringGeneratorForArray(this.#strings, {
                rewindStringOnFinish: this.#options.untypeString,
              })
            );
            this.#runningState = "cycleStart";
          } else {
            this.#runningState = "idle";
          }
        }
      }
    }
  );

  #lastStringData: {
    value: string;
    index: number;
    nextExpectedIndex: number;
    changeTimestamp: number;
    callbackString: string;
  } = {
    value: "",
    index: 0,
    nextExpectedIndex: 0,
    changeTimestamp: 0,
    callbackString: "",
  };

  #instanceState: InstanceState = "initialized";

  get instanceState() {
    return this.#instanceState;
  }

  #runningState: RunningStageName;
  get runningState() {
    return this.#runningState;
  }

  #overrideRunningStateBeforeStageExecution: RunningStageName | null = null;
  #overrideRunningStateAfterStageExecution: RunningStageName | null = null;
  #pausedRunningState: RunningStageName | null = null;

  #runningStagesStateMachine: RunningStages | null = null;

  #isFirstIteratorResultProcessed = false;

  #scheduledCallbacksInit = (): ScheduledCallbacks => ({
    cycleStart: [],
    idle: [],
    beforeTyping: [],
    typing: [],
    afterTyping: [],
    delayAfterTyping: [],
    beforeUntyping: [],
    untyping: [],
    afterUntyping: [],
    delayBeforeTyping: [],
    arrayFinished: [],
    instanceDisposed: [],
  });

  #scheduledCallbacks = this.#scheduledCallbacksInit();

  /**
   * Schedules a callback to be executed once per stage's cycle at a specific stage of the typing effect.
   *
   * @param {RunningStageName} stageName - The name of the stage at which the callback should be executed.
   * @param callback - The callback function to be scheduled.
   * @param {boolean} once - If false, the callback will be executed every time the stage is reached.
   * If true, the callback will be executed only once when the stage is reached for the first time.
   */
  #scheduleCallback = (
    stageName: RunningStageName | "arrayFinished" | "instanceDisposed",
    callback: () => void,
    once: boolean
  ): symbol => {
    const cbId = Symbol("cbId");
    this.#scheduledCallbacks[stageName].push({
      callback,
      once,
      called: false,
      id: cbId,
      remove: false,
    });
    return cbId;
  };

  // Leave the actual removal up to runScheduledCallbacks so to not to interfere with it's work
  #markScheduledCallbackForRemoval = (
    stageName: RunningStageName | "arrayFinished" | "instanceDisposed",
    cbId: symbol
  ) => {
    const cbElem = this.#scheduledCallbacks[stageName].find(
      ({ id }) => id === cbId
    );
    if (cbElem) {
      cbElem.remove = true;
    }
  };

  #runScheduledCallbacks = (
    stageName: RunningStageName | "arrayFinished" | "instanceDisposed"
  ) => {
    if (this.#instanceState !== "disposed") {
      const indexesToRemove: number[] = [];
      this.#scheduledCallbacks[stageName].forEach((callbackData, index) => {
        if (callbackData.once || callbackData.remove) {
          // unshift instead of push because we need descending order to splice later
          indexesToRemove.unshift(index);
        }
        if (!callbackData.called && !callbackData.remove) {
          callbackData.callback();
          callbackData.called = true;
        }
      });

      // removing marked callbacks
      indexesToRemove.forEach((index) => {
        this.#scheduledCallbacks[stageName].splice(index, 1);
      });

      // resetting the called value
      this.#scheduledCallbacks[stageName].forEach((callbackData) => {
        callbackData.called = false;
      });
    }
  };

  #lastStageTimestamp = 0;

  #createStage = <
    StageName extends RunningStageName,
    NextStageName extends RunningStageName
  >(
    stageName: StageName,
    nextStageName: NextStageName | (() => NextStageName),
    stageFunction?: ((timestamp: number) => "done" | void) | undefined
  ) => {
    return {
      [stageName]: {
        handle: (timestamp: number): NextStageName => {
          this.#runScheduledCallbacks(stageName);
          const nextStageNameString =
            typeof nextStageName === "function"
              ? nextStageName()
              : nextStageName;
          if (stageFunction) {
            const fnResult = stageFunction(timestamp);
            if (fnResult === "done") {
              this.#lastStageTimestamp = timestamp;
              return nextStageNameString;
            } else {
              return stageName as unknown as NextStageName;
            }
          } else {
            this.#lastStageTimestamp = timestamp;
            return nextStageNameString;
          }
        },
      },
    } as Record<StageName, { handle: (timestamp: number) => NextStageName }>;
  };

  #callCallback: CallbackType = (string) => {
    // a verbose check of callback type because optional call (this.callback?.(string)) doesn't work with private fields
    if (
      typeof this.#callback === "function" &&
      string !== this.#lastStringData.callbackString
    ) {
      this.#callback(string);
      this.#lastStringData.callbackString = string;
    }
  };

  #handleCursorBlinking(
    timestamp: number,
    string = this.#lastStringData.value
  ) {
    if (
      timestamp >=
      Math.max(
        this.#lastStringData.changeTimestamp,
        this.#lastStageTimestamp,
        this.#cursorState.lastChangeTimestamp
      ) +
        this.#options.cursorBlinkRate
    ) {
      this.#cursorState.lastChangeTimestamp = timestamp;
      this.#cursorState.visible = !this.#cursorState.visible;
    }
    return (
      string +
      (this.#cursorState.visible ? this.#options.cursorSymbol.blinking : "")
    );
  }

  #constructPublicMethod =
    <
      MethodType extends (args: any) => any,
      MethodReturnsTypingEffectInstance extends "instance" | "void" | "own",
      ReturnsType = MethodReturnsTypingEffectInstance extends "own"
        ? ReturnType<MethodType>
        : MethodReturnsTypingEffectInstance extends "instance"
        ? this
        : void
    >(
      method: MethodType,
      methodName: string,
      allowedState: InstanceState | "any" | InstanceState[],
      returnsInstance: MethodReturnsTypingEffectInstance
    ) =>
    (...args: Parameters<MethodType>): ReturnsType => {
      const allowedCheck = () => {
        if (allowedState === "any") {
          return true;
        }
        if (Array.isArray(allowedState)) {
          return allowedState.includes(this.#instanceState);
        } else {
          return this.#instanceState === allowedState;
        }
      };
      if (this.#instanceState === "disposed") {
        throw new Error(
          `The method "${methodName}" could not be called - the instance of TypingEffect was disposed. Create a new one.`
        );
      }

      const messageState = Array.isArray(allowedState)
        ? allowedState.join(", ")
        : allowedState;

      if (allowedCheck()) {
        const methodResult = method.apply(this, args);
        if (returnsInstance === "own") {
          return methodResult;
        }

        if (returnsInstance === "instance") {
          return this as unknown as ReturnsType;
        }
        return undefined as ReturnsType;
      }
      let errorString = `The method "${methodName}" could not be called on the instance of TypingEffect - the current state "${
        this.#instanceState
      }" does not match the allowed state${
        Array.isArray(allowedState) ? "s" : ""
      } "${messageState}".`;
      if (this.#instanceState === "initialized") {
        errorString += ' Provide the "strings" and "callback" arguments.';
      }
      throw new Error(errorString);
    };

  #start = () => {
    this.#setIterator(
      substringGeneratorForArray(this.#strings, {
        rewindStringOnFinish: this.#options.untypeString,
      })
    );

    this.#instanceState = "running";
    this.#runningState = "cycleStart";
    this.#pausedRunningState = null;
    this.#isFirstIteratorResultProcessed = false;
    this.#overrideRunningStateBeforeStageExecution = null;
    this.#overrideRunningStateAfterStageExecution = null;
  };

  #pause = () => {
    if (!this.#pausedRunningState) {
      this.#pausedRunningState = this.#runningState;
      this.#runningState = "idle";
      this.#overrideRunningStateBeforeStageExecution = null;
      this.#overrideRunningStateAfterStageExecution = null;
    }
  };

  #resume = () => {
    if (this.#pausedRunningState) {
      this.#runningState = this.#pausedRunningState;
      this.#pausedRunningState = null;
      this.#overrideRunningStateBeforeStageExecution = null;
      this.#overrideRunningStateAfterStageExecution = null;
    }
  };

  #stop = () => {
    this.#runningState = "idle";
    this.#instanceState = this.#checkInstanceState("ready");
    this.#pausedRunningState = null;
    this.#overrideRunningStateBeforeStageExecution = null;
    this.#overrideRunningStateAfterStageExecution = null;
  };

  #dispose = () => {
    this.#rafLoop && cancelAnimationFrame(this.#rafLoop.rafId);
    this.#rafLoop = null;
    this.#runScheduledCallbacks("instanceDisposed");
    this.#instanceState = "disposed";
    this.#runningState = "idle";
    this.#strings = [];
    this.#callback = null;
    this.#iteratorState.iterator = null;
    this.#rafLoop = null;
    this.#scheduledCallbacks = this.#scheduledCallbacksInit();
    this.#runningStagesStateMachine = null;
    this.#overrideRunningStateBeforeStageExecution = null;
    this.#overrideRunningStateAfterStageExecution = null;
  };

  #jumpTo = (stringIndex = this.#lastStringData.index, now?: boolean) => {
    const setterFn = () => {
      this.#setIterator(
        substringGeneratorForArray(this.#strings, {
          rewindStringOnFinish: this.#options.untypeString,
          startAtString: stringIndex,
        })
      );
    };

    const scheduledSetter = () => {
      setterFn();
      if (this.#instanceState === "running") {
        this.#overrideRunningStateAfterStageExecution = null;
        this.#overrideRunningStateBeforeStageExecution = null;
      } else {
        this.#overrideRunningStateAfterStageExecution = "idle";
        this.#overrideRunningStateBeforeStageExecution = null;
      }
    };

    const immediateSetter = () => {
      setterFn();
      const runningState = this.#checkRunningState("cycleStart");
      this.#runningState = runningState;
      this.#overrideRunningStateBeforeStageExecution = null;
      this.#overrideRunningStateAfterStageExecution = null;
    };

    if (now) {
      immediateSetter();
    } else {
      this.#scheduleCallback("cycleStart", scheduledSetter, true);
    }
  };

  #checkInstanceState = (conditionalState = this.#instanceState) => {
    const requiredCheck =
      this.#iteratorState.iterator !== null &&
      typeof this.#callback === "function";

    return requiredCheck
      ? this.#instanceState === "initialized"
        ? "ready"
        : conditionalState
      : "initialized";
  };

  #checkRunningState = (conditionalState = this.#runningState) => {
    return this.#instanceState === "running" ? conditionalState : "idle";
  };

  constructor(
    strings?: string[],
    callback?: CallbackType,
    options?: TypingEffectOptions
  ) {
    if (strings) this.#setStrings(strings);
    if (callback) this.#setCallback(callback);
    this.#setOptions(options);

    this.#runningState = "idle";

    this.#runningStagesStateMachine = {
      ...this.#createStage("idle", "idle", (timestamp) => {
        if (this.#options.showCursor) {
          this.#callCallback(this.#handleCursorBlinking(timestamp));
        }
      }),

      ...this.#createStage("cycleStart", "delayBeforeTyping", () => {
        // call .next() to check if iterator is done, to prevent going to "delayBeforeTyping" and so on
        this.#setLastResult(
          this.#iteratorState.iterator?.next() || this.#iteratorState.lastResult
        );
        this.#isFirstIteratorResultProcessed = true;

        return "done";
      }),

      ...this.#createStage("delayBeforeTyping", "beforeTyping", (timestamp) => {
        if (
          timestamp >=
          this.#lastStageTimestamp + this.#options.delayBeforeTyping
        ) {
          return "done";
        } else if (this.#options.showCursor) {
          this.#callCallback(this.#handleCursorBlinking(timestamp, ""));
        }
      }),

      ...this.#createStage("beforeTyping", "typing"),

      ...this.#createStage("typing", "afterTyping", (timestamp: number) => {
        const typingReadyTimestamp =
          Math.max(
            this.#lastStageTimestamp,
            this.#lastStringData.changeTimestamp
          ) + this.#options.typingDelay;

        if (timestamp >= typingReadyTimestamp) {
          const typingVar = Math.floor(
            Math.random() * this.#options.typingVariation
          );

          if (timestamp >= typingReadyTimestamp + typingVar) {
            this.#lastStringData.changeTimestamp = timestamp;

            if (!this.#isFirstIteratorResultProcessed) {
              this.#setLastResult(
                this.#iteratorState.iterator?.next() ||
                  this.#iteratorState.lastResult
              );
            }

            this.#isFirstIteratorResultProcessed = false;

            if (this.#iteratorState.lastResult.value) {
              if ("string" in this.#iteratorState.lastResult.value) {
                this.#callCallback(
                  this.#iteratorState.lastResult.value.string +
                    (this.#options.showCursor
                      ? this.#options.cursorSymbol.typing
                      : "")
                );
              } else if (
                "stringEnd" in this.#iteratorState.lastResult.value &&
                this.#iteratorState.lastResult.value.stringEnd
              ) {
                return "done";
              }
            }
          }
        }
      }),

      ...this.#createStage("afterTyping", "delayAfterTyping"),

      ...this.#createStage(
        "delayAfterTyping",
        () => (this.#options.untypeString ? "beforeUntyping" : "cycleStart"),
        (timestamp) => {
          if (
            timestamp >=
            this.#lastStageTimestamp + this.#options.delayAfterTyping
          ) {
            return "done";
          } else if (this.#options.showCursor) {
            this.#callCallback(this.#handleCursorBlinking(timestamp));
          }
        }
      ),

      ...this.#createStage("beforeUntyping", "untyping"),

      ...this.#createStage("untyping", "afterUntyping", (timestamp) => {
        if (
          timestamp >=
          Math.max(
            this.#lastStageTimestamp,
            this.#lastStringData.changeTimestamp
          ) +
            this.#options.untypingDelay
        ) {
          this.#lastStringData.changeTimestamp = timestamp;

          this.#setLastResult(
            this.#iteratorState.iterator?.next() ||
              this.#iteratorState.lastResult
          );

          if (this.#iteratorState.lastResult.value) {
            if ("string" in this.#iteratorState.lastResult.value) {
              this.#callCallback(
                this.#iteratorState.lastResult.value.string +
                  (this.#options.showCursor
                    ? this.#options.cursorSymbol.untyping
                    : "")
              );
            } else if (
              "stringRewindEnd" in this.#iteratorState.lastResult.value &&
              this.#iteratorState.lastResult.value.stringRewindEnd
            ) {
              return "done";
            }
          }
        }
      }),

      ...this.#createStage("afterUntyping", "cycleStart"),
    };
  }

  // ---- Exposed public methods

  /**
   * Starts or restarts the iteration over strings.
   * Switches instance state to `running` and running state to `cycleStart`.
   * @returns current instance
   * @throws If strings or callback not provided; if called after `dispose`
   */
  start = this.#constructPublicMethod(
    this.#start,
    "start",
    ["running", "ready"],
    "instance"
  );

  /**
   * Pauses the iteration and switches running state to `idle`.
   * @returns current instance
   * @throws If instance state is not `running`; if called after `dispose`
   */
  pause = this.#constructPublicMethod(
    this.#pause,
    "pause",
    "running",
    "instance"
  );

  /**
   * Resumes iteration after pause. Does nothing if not paused.
   * @returns current instance
   * @throws If instance state is not `running`; if called after `dispose`
   */
  resume = this.#constructPublicMethod(
    this.#resume,
    "resume",
    "running",
    "instance"
  );

  /**
   * Stops iteration. Sets running state to `idle` and instance state to `ready`.
   * @returns current instance
   * @throws If called after `dispose`
   */
  stop = this.#constructPublicMethod(this.#stop, "stop", "any", "instance");

  /**
   * Jumps to a specific string index within the strings array.
   *
   * By default executes before the next string typing/untyping cycle.
   *
   * @param stringIndex - The index of the string to jump to. Defaults to current string index.
   * @param now - An optional boolean indicating whether to execute the jump immediately. Defaults to false.
   *
   * @returns current instance
   * @throws If instance state is not `running`; if called after `dispose`
   */
  jumpTo = this.#constructPublicMethod(
    this.#jumpTo,
    "jumpTo",
    "running",
    "instance"
  );

  /**
   * Disposes of the instance, resetting its state and helping to "release" resources.
   *
   * This method is used to clean up and release any resources held by the instance,
   * effectively resetting its state to a disposed state. It cancels any ongoing
   * animation frames, resets the running state, and clears all internal data structures.
   * @throws If called after `dispose`
   *
   * @remarks
   * This method should be called when the instance is no longer needed.
   */

  dispose = this.#constructPublicMethod(
    this.#dispose,
    "dispose",
    "any",
    "void"
  );

  /**
   * Sets new array of strings for typing/untyping.
   * If the instance state is not running, the strings are set immediately.
   * If running, by default executes setter before the next string typing/untyping cycle.
   *
   * @param strings - An array of strings.
   * @param now - An optional boolean indicating whether to set new strings immediately. Defaults to false.
   *
   * @remarks After setting starts typing/untyping cycle from the first string.
   * Calling with empty array will stop current cycle, set runnig state to `idle` and instance state to `initialized`.
   * @returns current instance
   * @throws If provided strings is not an array; if called after `dispose`
   */

  setStrings = this.#constructPublicMethod(
    this.#setStrings,
    "setStrings",
    "any",
    "instance"
  );

  /**
   * Sets new callback function.
   * If the instance state is not running, the callback is set immediately.
   * If running, by default executes setter before the next string typing/untyping cycle.
   *
   * @param callback A function with string argument to be called with string updates.
   * @param now - An optional boolean indicating whether to set new callback immediately. Defaults to false.
   *
   * @remarks
   * Calling with `null` will stop current cycle, set runnig state to `idle` and instance state to `initialized`.
   * @returns current instance
   * @throws If provided `callback` is neither a function or `null`; if called after `dispose`
   */
  setCallback = this.#constructPublicMethod(
    this.#setCallback,
    "setCallback",
    "any",
    "instance"
  );

  /**
   * Updates the settings of TypingEffect. Allows full and partial update.
   * If the instance state is not running, the new options are set immediately.
   * If running, by default executes setter before the next string typing/untyping cycle.
   *
   * @param options An object with new settings.
   * @param now - An optional boolean indicating whether to set new options immediately. Defaults to false.
   *
   * @remarks
   * Providing explicit undefined for settings' fields will reset them to default value.
   * @returns current instance
   * @throws If provided `options` is neither an object or `undefined`; if called after `dispose`
   *
   * @example
   * typingEffect.setOptions({ typingDelay: undefined, delayAfterTyping: 1000 });
   * // will result in new typingDelay value to be taken from default value
   * // and delayAfterTyping to be set as 1000
   */

  setOptions = this.#constructPublicMethod(
    this.#setOptions,
    "setOptions",
    "any",
    "instance"
  );

  /**
   * Registers a callback that will be called before the typing of a string starts.
   *
   * @param callback - A function that will be called with the current string index as its argument.
   * @param once - An optional boolean indicating whether the callback should be executed only once. Defaults to false.
   *
   * @returns A function that removes the callback
   * @throws If provided `callback` is not a function; if called after `dispose`
   */

  onBeforeTyping = this.#constructPublicMethod(
    (callback: (stringIndex: number) => void, once = false) => {
      if (typeof callback !== "function") {
        throw new Error("Provided callback is not a function.");
      }

      const cbId = this.#scheduleCallback(
        "beforeTyping",
        () => {
          callback(this.#lastStringData.index);
        },
        once
      );

      return () => this.#markScheduledCallbackForRemoval("beforeTyping", cbId);
    },
    "onBeforeTyping",
    "any",
    "own"
  );

  /**
   * Registers a callback that will be called after the typing of a string finishes.
   *
   * @param callback - A function that will be called with the current string index as its argument.
   * @param once - An optional boolean indicating whether the callback should be executed only once. Defaults to false.
   *
   * @returns A function that removes the callback
   * @throws If provided `callback` is not a function; if called after `dispose`
   */

  onAfterTyping = this.#constructPublicMethod(
    (callback: (stringIndex: number) => void, once = false) => {
      if (typeof callback !== "function") {
        throw new Error("Provided callback is not a function.");
      }

      const cbId = this.#scheduleCallback(
        "afterTyping",
        () => {
          callback(this.#lastStringData.index);
        },
        once
      );

      return () => this.#markScheduledCallbackForRemoval("afterTyping", cbId);
    },
    "onAfterTyping",
    "any",
    "own"
  );

  /**
   * Registers a callback that will be called before the untyping of a string starts.
   * Will not be called if `untypeString` option is `false`.
   *
   * @param callback - A function that will be called with the current string index as its argument.
   * @param once - An optional boolean indicating whether the callback should be executed only once. Defaults to false.
   *
   * @returns A function that removes the callback
   * @throws If provided `callback` is not a function; if called after `dispose`
   */

  onBeforeUntyping = this.#constructPublicMethod(
    (callback: (stringIndex: number) => void, once = false) => {
      if (typeof callback !== "function") {
        throw new Error("Provided callback is not a function.");
      }

      const cbId = this.#scheduleCallback(
        "beforeUntyping",
        () => {
          callback(this.#lastStringData.index);
        },
        once
      );

      return () =>
        this.#markScheduledCallbackForRemoval("beforeUntyping", cbId);
    },
    "onBeforeUntyping",
    "any",
    "own"
  );

  /**
   * Registers a callback that will be called after the untyping of a string finishes.
   * Will not be called if `untypeString` option is `false`.
   *
   * @param callback - A function that will be called with the current string index as its argument.
   * @param once - An optional boolean indicating whether the callback should be executed only once. Defaults to false.
   *
   * @returns A function that removes the callback
   * @throws If provided `callback` is not a function; if called after `dispose`
   */

  onAfterUntyping = this.#constructPublicMethod(
    (callback: (stringIndex: number) => void, once = false) => {
      if (typeof callback !== "function") {
        throw new Error("Provided callback is not a function.");
      }

      const cbId = this.#scheduleCallback(
        "afterUntyping",
        () => {
          callback(this.#lastStringData.index);
        },
        once
      );

      return () => this.#markScheduledCallbackForRemoval("afterUntyping", cbId);
    },
    "onAfterUntyping",
    "any",
    "own"
  );

  /**
   * Registers a callback that will be called after all strings in the strings array have been processed.
   *
   * @param callback - A function to be called when array finishes.
   * @param once - An optional boolean indicating whether the callback should be executed only once. Defaults to false.
   *
   * @returns A function that removes the callback
   * @throws If provided `callback` is not a function; if called after `dispose`
   */

  onArrayFinished = this.#constructPublicMethod(
    (callback: () => void, once = false) => {
      if (typeof callback !== "function") {
        throw new Error("Provided callback is not a function.");
      }

      const cbId = this.#scheduleCallback("arrayFinished", callback, once);

      return () => this.#markScheduledCallbackForRemoval("arrayFinished", cbId);
    },
    "onArrayFinished",
    "any",
    "own"
  );

  onInstanceDisposed = this.#constructPublicMethod(
    (callback: () => void) => {
      if (typeof callback !== "function") {
        throw new Error("Provided callback is not a function.");
      }

      const cbId = this.#scheduleCallback("instanceDisposed", callback, true);

      return () =>
        this.#markScheduledCallbackForRemoval("instanceDisposed", cbId);
    },
    "onInstanceDisposed",
    "any",
    "own"
  );
}
