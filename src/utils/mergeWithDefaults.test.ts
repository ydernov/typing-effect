import { expect, test } from "vitest";
import { mergeWithDefaults } from "./mergeWithDefaults";

test("call with empty update object - should return currentObj", () => {
  const currentObj = {
    qwe: 12,
    asd: "string",
    zxc: {
      ert: 0,
      dfg: "inner string",
    },
  };
  const defaultObj = {
    qwe: 0,
    asd: "default",
    zxc: {
      ert: 12,
      dfg: "default inner string",
    },
  };

  const result = mergeWithDefaults(currentObj, {}, defaultObj);

  expect(result).toBe(currentObj);

  expect(result.qwe).toBe(12);
  expect(result.asd).toBe("string");
  expect(result.zxc).toBe(currentObj.zxc);
  expect(result.zxc.ert).toBe(0);
  expect(result.zxc.dfg).toBe("inner string");
});

test("call with empty nested property of update object - should return new object with current nested property", () => {
  const currentObj = {
    qwe: 12,
    asd: "string",
    zxc: {
      ert: 0,
      dfg: "inner string",
    },
    nest: {
      deepNest: {
        z: "deeply nested",
      },
    },
  };
  const updateObj = {
    qwe: 3,
    asd: "update",
    zxc: {},
    nest: {
      deepNest: {},
    },
  };
  const defaultObj = {
    qwe: 0,
    asd: "default",
    zxc: {
      ert: 12,
      dfg: "default inner string",
    },
    nest: {
      deepNest: {
        z: "default deeply nested",
      },
    },
  };

  const result = mergeWithDefaults(currentObj, updateObj, defaultObj);

  expect(result).not.toBe(currentObj);
  expect(result).not.toBe(updateObj);
  expect(result).not.toBe(defaultObj);

  expect(result.qwe).toBe(3);
  expect(result.asd).toBe("update");

  expect(result.zxc).toBe(currentObj.zxc);
  expect(result.zxc.ert).toBe(0);
  expect(result.zxc.dfg).toBe("inner string");

  expect(result.nest).not.toBe(currentObj.nest);
  expect(result.nest.deepNest).toBe(currentObj.nest.deepNest);
  expect(result.nest.deepNest.z).toBe("deeply nested");
});

test("call with update object having properties not present in currentObj - should ignore unknown properties", () => {
  const currentObj = {
    qwe: 12,
    asd: "string",
    zxc: {
      ert: 0,
      dfg: "inner string",
    },
  };
  const defaultObj = {
    qwe: 0,
    asd: "default",
    zxc: {
      ert: 12,
      dfg: "default inner string",
    },
  };

  const updateObj = {
    unknown1: "unknown value",
    unknown2: [1, 2],
    zxc: {
      unknown3: "nested unknown",
    },
  };

  // @ts-expect-error
  const result = mergeWithDefaults(currentObj, updateObj, defaultObj);

  expect(result).not.toBe(currentObj);
  expect(result).not.toBe(updateObj);
  expect(result).not.toBe(defaultObj);

  expect(result.qwe).toBe(12);
  expect(result.asd).toBe("string");

  expect(result.zxc.ert).toBe(0);
  expect(result.zxc.dfg).toBe("inner string");

  expect(result).not.haveOwnProperty("unknown1");
  expect(result).not.haveOwnProperty("unknown2");
  expect(result.zxc).not.haveOwnProperty("unknown3");
});

test("call with mismatching currentObj and defaultObj structure - should throw error", () => {
  const currentObj = {
    qwe: 12,
    asd: "string",
    zxc: {
      ert: 0,
      dfg: "inner string",
    },
  };
  const defaultObj = {
    qwe: 0,
    asd: "default",
  };
  const updateObj = {
    qwe: 3,
  };

  expect(() => mergeWithDefaults(currentObj, updateObj, defaultObj)).toThrow(
    'Structure mismatch error. The "default object" does not have property "zxc" of the "current object".'
  );
});

test("partial update - should return new object with updated values", () => {
  const defaultObj = {
    q: 0,
    w: "0",
    e: {
      r: 0,
      t: "0",
      y: [
        0,
        "0",
        {
          u: 0,
          i: "0",
        },
      ],
      i: {
        o: 0,
        p: "0",
      },
    },
    a: [0, "0"],
  };
  const currentObj = {
    q: 1,
    w: "1",
    e: {
      r: 1,
      t: "1",
      y: [
        1,
        "1",
        {
          u: 1,
          i: "1",
        },
      ],
      i: {
        o: 1,
        p: "1",
      },
    },
    a: [1, "1"],
  };

  const updateObj = {
    q: 2,
    e: {
      t: "2",
      i: {
        p: "2",
      },
    },
    a: [],
  };

  const result = mergeWithDefaults(currentObj, updateObj, defaultObj);

  expect(result).not.toBe(currentObj);
  expect(result).not.toBe(updateObj);
  expect(result).not.toBe(defaultObj);

  expect(result.q).toBe(2);
  expect(result.w).toBe("1");

  expect(result.e).not.toBe(currentObj.e);
  expect(result.e).not.toBe(updateObj.e);
  expect(result.e.r).toBe(1);
  expect(result.e.t).toBe("2");

  // same object as currentObj.e.y because unchanged values are taken fron current object directly
  expect(result.e.y).toBe(currentObj.e.y);
  expect(result.e.y).toEqual([
    1,
    "1",
    {
      u: 1,
      i: "1",
    },
  ]);

  expect(result.e.i).not.toBe(currentObj.e.i);
  expect(result.e.i).not.toBe(updateObj.e.i);
  expect(result.e.i).toEqual({
    o: 1,
    p: "2",
  });

  expect(result.a).not.toBe(currentObj.a);
  expect(result.a).not.toBe(updateObj.a);
  expect(result.a).toEqual([]);
});

test("call with undefined values - should return new object with undefined properties taken from default", () => {
  const defaultObj = {
    q: 0,
    w: "0",
    e: {
      r: 0,
      t: "0",
      y: [
        0,
        "0",
        {
          u: 0,
          i: "0",
        },
      ],
      i: {
        o: 0,
        p: "0",
      },
    },
    a: [0, "0"],
  };
  const currentObj = {
    q: 1,
    w: "1",
    e: {
      r: 1,
      t: "1",
      y: [
        1,
        "1",
        {
          u: 1,
          i: "1",
        },
      ],
      i: {
        o: 1,
        p: "1",
      },
    },
    a: [1, "1"],
  };
  const updateObj = {
    q: undefined,
    e: {
      t: undefined,
      i: undefined,
    },
    a: undefined,
  };

  const result = mergeWithDefaults(currentObj, updateObj, defaultObj);

  expect(result).not.toBe(currentObj);
  expect(result).not.toBe(updateObj);
  expect(result).not.toBe(defaultObj);

  expect(result.q).toBe(0);
  expect(result.w).toBe("1");

  expect(result.e).not.toBe(currentObj.e);
  expect(result.e).not.toBe(updateObj.e);
  expect(result.e).not.toBe(defaultObj.e);
  expect(result.e.r).toBe(1);
  expect(result.e.t).toBe("0");

  // same object as currentObj.e.y because unchanged values are taken fron current object directly
  expect(result.e.y).toBe(currentObj.e.y);
  expect(result.e.y).toEqual([
    1,
    "1",
    {
      u: 1,
      i: "1",
    },
  ]);

  expect(result.e.i).not.toBe(currentObj.e.i);
  expect(result.e.i).not.toBe(updateObj.e.i);
  expect(result.e.i).toBe(defaultObj.e.i);
  expect(result.e.i).toEqual({
    o: 0,
    p: "0",
  });

  expect(result.a).not.toBe(currentObj.a);
  expect(result.a).not.toBe(updateObj.a);
  expect(result.a).toBe(defaultObj.a);
  expect(result.a).toEqual([0, "0"]);
});
