import {
  beforeEach,
  expect,
  test,
  vi,
  describe,
  afterEach,
  beforeAll,
  afterAll,
} from "vitest";
import { setIntervalRAF } from "./setIntervalRAF";

const mockTimestampsByOne = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const mockTimestampsByFive = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50];

const mockTimestampsByTen = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

const mockTimestampsByFifty = [
  0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500,
];

const mockTimestampsByHundred = [
  0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000,
];

describe.each([
  // interval 0
  {
    timestamps: mockTimestampsByOne,
    mockRafId: 100,
    expectedTimestamps: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    expectedCallbackCallTimes: 10,
    expectedRafCallTimes: 12,
    interval: 0,
  },
  {
    timestamps: mockTimestampsByFive,
    mockRafId: 200,
    expectedTimestamps: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
    expectedCallbackCallTimes: 10,
    expectedRafCallTimes: 12,
    interval: 0,
  },
  {
    timestamps: mockTimestampsByTen,
    mockRafId: 300,
    expectedTimestamps: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    expectedCallbackCallTimes: 10,
    expectedRafCallTimes: 12,
    interval: 0,
  },
  {
    timestamps: mockTimestampsByFifty,
    mockRafId: 400,
    expectedTimestamps: [50, 100, 150, 200, 250, 300, 350, 400, 450, 500],
    expectedCallbackCallTimes: 10,
    expectedRafCallTimes: 12,
    interval: 0,
  },
  {
    timestamps: mockTimestampsByHundred,
    mockRafId: 500,
    expectedTimestamps: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
    expectedCallbackCallTimes: 10,
    expectedRafCallTimes: 12,
    interval: 0,
  },

  // interval 1
  {
    timestamps: mockTimestampsByOne,
    mockRafId: 100,
    expectedTimestamps: [2, 4, 6, 8, 10],
    expectedCallbackCallTimes: 5,
    expectedRafCallTimes: 12,
    interval: 1,
  },
  {
    timestamps: mockTimestampsByFive,
    mockRafId: 200,
    expectedTimestamps: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
    expectedCallbackCallTimes: 10,
    expectedRafCallTimes: 12,
    interval: 1,
  },
  {
    timestamps: mockTimestampsByTen,
    mockRafId: 300,
    expectedTimestamps: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    expectedCallbackCallTimes: 10,
    expectedRafCallTimes: 12,
    interval: 1,
  },
  {
    timestamps: mockTimestampsByFifty,
    mockRafId: 400,
    expectedTimestamps: [50, 100, 150, 200, 250, 300, 350, 400, 450, 500],
    expectedCallbackCallTimes: 10,
    expectedRafCallTimes: 12,
    interval: 1,
  },
  {
    timestamps: mockTimestampsByHundred,
    mockRafId: 500,
    expectedTimestamps: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
    expectedCallbackCallTimes: 10,
    expectedRafCallTimes: 12,
    interval: 1,
  },

  //   // interval 5
  {
    timestamps: mockTimestampsByOne,
    mockRafId: 100,
    expectedTimestamps: [6],
    expectedCallbackCallTimes: 1,
    expectedRafCallTimes: 12,
    interval: 5,
  },
  {
    timestamps: mockTimestampsByFive,
    mockRafId: 200,
    expectedTimestamps: [10, 20, 30, 40, 50],
    expectedCallbackCallTimes: 5,
    expectedRafCallTimes: 12,
    interval: 5,
  },
  {
    timestamps: mockTimestampsByTen,
    mockRafId: 300,
    expectedTimestamps: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    expectedCallbackCallTimes: 10,
    expectedRafCallTimes: 12,
    interval: 5,
  },
  {
    timestamps: mockTimestampsByFifty,
    mockRafId: 400,
    expectedTimestamps: [50, 100, 150, 200, 250, 300, 350, 400, 450, 500],
    expectedCallbackCallTimes: 10,
    expectedRafCallTimes: 12,
    interval: 5,
  },
  {
    timestamps: mockTimestampsByHundred,
    mockRafId: 500,
    expectedTimestamps: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
    expectedCallbackCallTimes: 10,
    expectedRafCallTimes: 12,
    interval: 5,
  },

  // interval 15
  {
    timestamps: mockTimestampsByOne,
    mockRafId: 100,
    expectedTimestamps: [],
    expectedCallbackCallTimes: 0,
    expectedRafCallTimes: 12,
    interval: 15,
  },
  {
    timestamps: mockTimestampsByFive,
    mockRafId: 200,
    expectedTimestamps: [20, 40],
    expectedCallbackCallTimes: 2,
    expectedRafCallTimes: 12,
    interval: 15,
  },
  {
    timestamps: mockTimestampsByTen,
    mockRafId: 300,
    expectedTimestamps: [20, 40, 60, 80, 100],
    expectedCallbackCallTimes: 5,
    expectedRafCallTimes: 12,
    interval: 15,
  },
  {
    timestamps: mockTimestampsByFifty,
    mockRafId: 400,
    expectedTimestamps: [50, 100, 150, 200, 250, 300, 350, 400, 450, 500],
    expectedCallbackCallTimes: 10,
    expectedRafCallTimes: 12,
    interval: 15,
  },
  {
    timestamps: mockTimestampsByHundred,
    mockRafId: 500,
    expectedTimestamps: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
    expectedCallbackCallTimes: 10,
    expectedRafCallTimes: 12,
    interval: 15,
  },

  // interval 49
  {
    timestamps: mockTimestampsByOne,
    mockRafId: 100,
    expectedTimestamps: [],
    expectedCallbackCallTimes: 0,
    expectedRafCallTimes: 12,
    interval: 49,
  },
  {
    timestamps: mockTimestampsByFive,
    mockRafId: 200,
    expectedTimestamps: [50],
    expectedCallbackCallTimes: 1,
    expectedRafCallTimes: 12,
    interval: 49,
  },
  {
    timestamps: mockTimestampsByTen,
    mockRafId: 300,
    expectedTimestamps: [50, 100],
    expectedCallbackCallTimes: 2,
    expectedRafCallTimes: 12,
    interval: 49,
  },
  {
    timestamps: mockTimestampsByFifty,
    mockRafId: 400,
    expectedTimestamps: [50, 100, 150, 200, 250, 300, 350, 400, 450, 500],
    expectedCallbackCallTimes: 10,
    expectedRafCallTimes: 12,
    interval: 49,
  },
  {
    timestamps: mockTimestampsByHundred,
    mockRafId: 500,
    expectedTimestamps: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
    expectedCallbackCallTimes: 10,
    expectedRafCallTimes: 12,
    interval: 49,
  },

  // interval 144
  {
    timestamps: mockTimestampsByOne,
    mockRafId: 100,
    expectedTimestamps: [],
    expectedCallbackCallTimes: 0,
    expectedRafCallTimes: 12,
    interval: 144,
  },
  {
    timestamps: mockTimestampsByFive,
    mockRafId: 200,
    expectedTimestamps: [],
    expectedCallbackCallTimes: 0,
    expectedRafCallTimes: 12,
    interval: 144,
  },
  {
    timestamps: mockTimestampsByTen,
    mockRafId: 300,
    expectedTimestamps: [],
    expectedCallbackCallTimes: 0,
    expectedRafCallTimes: 12,
    interval: 144,
  },
  {
    timestamps: mockTimestampsByFifty,
    mockRafId: 400,
    expectedTimestamps: [150, 300, 450],
    expectedCallbackCallTimes: 3,
    expectedRafCallTimes: 12,
    interval: 144,
  },
  {
    timestamps: mockTimestampsByHundred,
    mockRafId: 500,
    expectedTimestamps: [200, 400, 600, 800, 1000],
    expectedCallbackCallTimes: 5,
    expectedRafCallTimes: 12,
    interval: 144,
  },

  // interval 320
  {
    timestamps: mockTimestampsByOne,
    mockRafId: 100,
    expectedTimestamps: [],
    expectedCallbackCallTimes: 0,
    expectedRafCallTimes: 12,
    interval: 320,
  },
  {
    timestamps: mockTimestampsByFive,
    mockRafId: 200,
    expectedTimestamps: [],
    expectedCallbackCallTimes: 0,
    expectedRafCallTimes: 12,
    interval: 320,
  },
  {
    timestamps: mockTimestampsByTen,
    mockRafId: 300,
    expectedTimestamps: [],
    expectedCallbackCallTimes: 0,
    expectedRafCallTimes: 12,
    interval: 320,
  },
  {
    timestamps: mockTimestampsByFifty,
    mockRafId: 400,
    expectedTimestamps: [350],
    expectedCallbackCallTimes: 1,
    expectedRafCallTimes: 12,
    interval: 320,
  },
  {
    timestamps: mockTimestampsByHundred,
    mockRafId: 500,
    expectedTimestamps: [400, 800],
    expectedCallbackCallTimes: 2,
    expectedRafCallTimes: 12,
    interval: 320,
  },
])(
  `tests for interval = $interval with performance.now === 0`,
  ({
    timestamps,
    mockRafId,
    expectedTimestamps,
    expectedCallbackCallTimes,
    expectedRafCallTimes,
    interval,
  }) => {
    beforeAll(() => {
      // sets performance.now() to 0
      vi.useFakeTimers({
        toFake: ["performance"],
      });
    });

    afterAll(() => {
      vi.useRealTimers();
    });

    let loopFnCallTimes = -1;

    const mockRequestAnimationFrame = vi.fn<[FrameRequestCallback], number>();

    beforeEach(() => {
      loopFnCallTimes = -1;

      mockRequestAnimationFrame.mockImplementation((loopFn) => {
        while (loopFnCallTimes + 1 < timestamps.length) {
          loopFnCallTimes++;
          loopFn(timestamps[loopFnCallTimes]!);
        }

        return ++mockRafId;
      });

      vi.stubGlobal("requestAnimationFrame", mockRequestAnimationFrame);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
      vi.clearAllMocks();
    });

    test("callback calls, call times and timestamp argument, requestAnimationFrame call times, resulting id object", () => {
      const callback = vi.fn();
      const refResult = setIntervalRAF(callback, interval);

      for (let i = 1; i <= expectedTimestamps.length; i++) {
        expect(callback).toHaveBeenNthCalledWith(i, expectedTimestamps[i - 1]);
      }
      expect(callback).toHaveBeenCalledTimes(expectedCallbackCallTimes);
      expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(
        expectedRafCallTimes
      );
      expect(refResult).toStrictEqual({ rafId: mockRafId });
    });
  }
);

describe.each([
  // interval 0
  {
    timestamps: mockTimestampsByOne,
    mockRafId: 100,
    expectedTimestamps: [],
    expectedCallbackCallTimes: 0,
    expectedRafCallTimes: 12,
    interval: 0,
  },
  {
    timestamps: mockTimestampsByFive,
    mockRafId: 200,
    expectedTimestamps: [],
    expectedCallbackCallTimes: 0,
    expectedRafCallTimes: 12,
    interval: 0,
  },
  {
    timestamps: mockTimestampsByTen,
    mockRafId: 300,
    expectedTimestamps: [],
    expectedCallbackCallTimes: 0,
    expectedRafCallTimes: 12,
    interval: 0,
  },
  {
    timestamps: mockTimestampsByFifty,
    mockRafId: 400,
    expectedTimestamps: [150, 200, 250, 300, 350, 400, 450, 500],
    expectedCallbackCallTimes: 8,
    expectedRafCallTimes: 12,
    interval: 0,
  },
  {
    timestamps: mockTimestampsByHundred,
    mockRafId: 500,
    expectedTimestamps: [200, 300, 400, 500, 600, 700, 800, 900, 1000],
    expectedCallbackCallTimes: 9,
    expectedRafCallTimes: 12,
    interval: 0,
  },

  // interval 1
  {
    timestamps: mockTimestampsByOne,
    mockRafId: 100,
    expectedTimestamps: [],
    expectedCallbackCallTimes: 0,
    expectedRafCallTimes: 12,
    interval: 1,
  },
  {
    timestamps: mockTimestampsByFive,
    mockRafId: 200,
    expectedTimestamps: [],
    expectedCallbackCallTimes: 0,
    expectedRafCallTimes: 12,
    interval: 1,
  },
  {
    timestamps: mockTimestampsByTen,
    mockRafId: 300,
    expectedTimestamps: [],
    expectedCallbackCallTimes: 0,
    expectedRafCallTimes: 12,
    interval: 1,
  },
  {
    timestamps: mockTimestampsByFifty,
    mockRafId: 400,
    expectedTimestamps: [150, 200, 250, 300, 350, 400, 450, 500],
    expectedCallbackCallTimes: 8,
    expectedRafCallTimes: 12,
    interval: 1,
  },
  {
    timestamps: mockTimestampsByHundred,
    mockRafId: 500,
    expectedTimestamps: [200, 300, 400, 500, 600, 700, 800, 900, 1000],
    expectedCallbackCallTimes: 9,
    expectedRafCallTimes: 12,
    interval: 1,
  },

  //    interval 5
  {
    timestamps: mockTimestampsByOne,
    mockRafId: 100,
    expectedTimestamps: [],
    expectedCallbackCallTimes: 0,
    expectedRafCallTimes: 12,
    interval: 5,
  },
  {
    timestamps: mockTimestampsByFive,
    mockRafId: 200,
    expectedTimestamps: [],
    expectedCallbackCallTimes: 0,
    expectedRafCallTimes: 12,
    interval: 5,
  },
  {
    timestamps: mockTimestampsByTen,
    mockRafId: 300,
    expectedTimestamps: [],
    expectedCallbackCallTimes: 0,
    expectedRafCallTimes: 12,
    interval: 5,
  },
  {
    timestamps: mockTimestampsByFifty,
    mockRafId: 400,
    expectedTimestamps: [150, 200, 250, 300, 350, 400, 450, 500],
    expectedCallbackCallTimes: 8,
    expectedRafCallTimes: 12,
    interval: 5,
  },
  {
    timestamps: mockTimestampsByHundred,
    mockRafId: 500,
    expectedTimestamps: [200, 300, 400, 500, 600, 700, 800, 900, 1000],
    expectedCallbackCallTimes: 9,
    expectedRafCallTimes: 12,
    interval: 5,
  },

  // interval 15
  {
    timestamps: mockTimestampsByOne,
    mockRafId: 100,
    expectedTimestamps: [],
    expectedCallbackCallTimes: 0,
    expectedRafCallTimes: 12,
    interval: 15,
  },
  {
    timestamps: mockTimestampsByFive,
    mockRafId: 200,
    expectedTimestamps: [],
    expectedCallbackCallTimes: 0,
    expectedRafCallTimes: 12,
    interval: 15,
  },
  {
    timestamps: mockTimestampsByTen,
    mockRafId: 300,
    expectedTimestamps: [],
    expectedCallbackCallTimes: 0,
    expectedRafCallTimes: 12,
    interval: 15,
  },
  {
    timestamps: mockTimestampsByFifty,
    mockRafId: 400,
    expectedTimestamps: [150, 200, 250, 300, 350, 400, 450, 500],
    expectedCallbackCallTimes: 8,
    expectedRafCallTimes: 12,
    interval: 15,
  },
  {
    timestamps: mockTimestampsByHundred,
    mockRafId: 500,
    expectedTimestamps: [200, 300, 400, 500, 600, 700, 800, 900, 1000],
    expectedCallbackCallTimes: 9,
    expectedRafCallTimes: 12,
    interval: 15,
  },

  // interval 49
  {
    timestamps: mockTimestampsByOne,
    mockRafId: 100,
    expectedTimestamps: [],
    expectedCallbackCallTimes: 0,
    expectedRafCallTimes: 12,
    interval: 49,
  },
  {
    timestamps: mockTimestampsByFive,
    mockRafId: 200,
    expectedTimestamps: [],
    expectedCallbackCallTimes: 0,
    expectedRafCallTimes: 12,
    interval: 49,
  },
  {
    timestamps: mockTimestampsByTen,
    mockRafId: 300,
    expectedTimestamps: [],
    expectedCallbackCallTimes: 0,
    expectedRafCallTimes: 12,
    interval: 49,
  },
  {
    timestamps: mockTimestampsByFifty,
    mockRafId: 400,
    expectedTimestamps: [150, 200, 250, 300, 350, 400, 450, 500],
    expectedCallbackCallTimes: 8,
    expectedRafCallTimes: 12,
    interval: 49,
  },
  {
    timestamps: mockTimestampsByHundred,
    mockRafId: 500,
    expectedTimestamps: [200, 300, 400, 500, 600, 700, 800, 900, 1000],
    expectedCallbackCallTimes: 9,
    expectedRafCallTimes: 12,
    interval: 49,
  },

  // interval 144
  {
    timestamps: mockTimestampsByOne,
    mockRafId: 100,
    expectedTimestamps: [],
    expectedCallbackCallTimes: 0,
    expectedRafCallTimes: 12,
    interval: 144,
  },
  {
    timestamps: mockTimestampsByFive,
    mockRafId: 200,
    expectedTimestamps: [],
    expectedCallbackCallTimes: 0,
    expectedRafCallTimes: 12,
    interval: 144,
  },
  {
    timestamps: mockTimestampsByTen,
    mockRafId: 300,
    expectedTimestamps: [],
    expectedCallbackCallTimes: 0,
    expectedRafCallTimes: 12,
    interval: 144,
  },
  {
    timestamps: mockTimestampsByFifty,
    mockRafId: 400,
    expectedTimestamps: [250, 400],
    expectedCallbackCallTimes: 2,
    expectedRafCallTimes: 12,
    interval: 144,
  },
  {
    timestamps: mockTimestampsByHundred,
    mockRafId: 500,
    expectedTimestamps: [300, 500, 700, 900],
    expectedCallbackCallTimes: 4,
    expectedRafCallTimes: 12,
    interval: 144,
  },

  // interval 320
  {
    timestamps: mockTimestampsByOne,
    mockRafId: 100,
    expectedTimestamps: [],
    expectedCallbackCallTimes: 0,
    expectedRafCallTimes: 12,
    interval: 320,
  },
  {
    timestamps: mockTimestampsByFive,
    mockRafId: 200,
    expectedTimestamps: [],
    expectedCallbackCallTimes: 0,
    expectedRafCallTimes: 12,
    interval: 320,
  },
  {
    timestamps: mockTimestampsByTen,
    mockRafId: 300,
    expectedTimestamps: [],
    expectedCallbackCallTimes: 0,
    expectedRafCallTimes: 12,
    interval: 320,
  },
  {
    timestamps: mockTimestampsByFifty,
    mockRafId: 400,
    expectedTimestamps: [450],
    expectedCallbackCallTimes: 1,
    expectedRafCallTimes: 12,
    interval: 320,
  },
  {
    timestamps: mockTimestampsByHundred,
    mockRafId: 500,
    expectedTimestamps: [500, 900],
    expectedCallbackCallTimes: 2,
    expectedRafCallTimes: 12,
    interval: 320,
  },
])(
  `tests for interval = $interval with performance.now > 0`,
  ({
    timestamps,
    mockRafId,
    expectedTimestamps,
    expectedCallbackCallTimes,
    expectedRafCallTimes,
    interval,
  }) => {
    beforeAll(() => {
      // sets performance.now() to 0
      vi.useFakeTimers({
        toFake: ["performance"],
      }).advanceTimersByTime(100);
    });

    afterAll(() => {
      vi.useRealTimers();
    });

    let loopFnCallTimes = -1;

    const mockRequestAnimationFrame = vi.fn<[FrameRequestCallback], number>();

    beforeEach(() => {
      loopFnCallTimes = -1;

      mockRequestAnimationFrame.mockImplementation(
        (loopFn: FrameRequestCallback) => {
          while (loopFnCallTimes + 1 < timestamps.length) {
            loopFnCallTimes++;
            loopFn(timestamps[loopFnCallTimes]!);
          }

          return ++mockRafId;
        }
      );

      vi.stubGlobal("requestAnimationFrame", mockRequestAnimationFrame);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
      vi.clearAllMocks();
    });

    test("callback calls, call times and timestamp argument, requestAnimationFrame call times, resulting id object", () => {
      const callback = vi.fn();
      const refResult = setIntervalRAF(callback, interval);

      for (let i = 1; i <= expectedTimestamps.length; i++) {
        expect(callback).toHaveBeenNthCalledWith(i, expectedTimestamps[i - 1]);
      }
      expect(callback).toHaveBeenCalledTimes(expectedCallbackCallTimes);
      expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(
        expectedRafCallTimes
      );
      expect(refResult).toStrictEqual({ rafId: mockRafId });
    });
  }
);
