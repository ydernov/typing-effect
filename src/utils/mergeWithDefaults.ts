import type { DeepPartial } from "./types";

const isArray = (val: unknown): val is [] => {
  return Array.isArray(val);
};

/**
 * Merges an update object with a default object, and returns a new object.
 * If the property is non-primitive and not in `updateObj` or is undefined, directly links to the value of `currentObj` or `defaultObj respectively.
 * This function is designed to deeply merge objects, handling arrays and nested objects as well.
 * It ensures that if an update object has a property set to `undefined`, the corresponding property from the default object will be used.
 *
 * @template Obj - The type of the object being merged.
 * @param currentObj - The current object to merge with the update object.
 * @param updateObj - The update object containing the changes to be applied.
 * @param defaultObj - The default object providing fallback values when the update object has `undefined` properties.
 * Must have identical structure to `currentObj`.
 * @returns A new object that is a merge of the current object, the update object, and the default object.
 * @throws If the structure of the `defaultObj` does not match the `currentObj`, an error is thrown.
 *
 * @example
 * const current = { name: "John", age: 30, address: { city: "New York", state: "New York" }, pets: ["cat", "dog"] };
 * const update = { age: undefined, address: { city: "Syracuse" } };
 * const defaults = { name: "Sally", age: 25, address: { city: "Chicago", state: "IL" }, pets: [] };
 * const result = mergeWithDefaults(current, update, defaults);
 * // result will be { name: "John", age: 25, address: { city: "Syracuse", state: "New York" } }
 * // result.pets is the same array as current.pets - result.pets === current.pets
 */

const mergeWithDefaults = <Obj extends Record<PropertyKey, unknown>>(
  currentObj: Obj,
  updateObj: DeepPartial<Obj>,
  defaultObj: Obj
) => {
  if (
    JSON.stringify(updateObj, (_, val) => {
      return val === undefined ? "und" : val;
    }) === "{}"
  ) {
    return currentObj;
  } else {
    let newObj = {} as Obj;
    for (const propKey in currentObj) {
      if (currentObj.hasOwnProperty(propKey)) {
        if (defaultObj.hasOwnProperty(propKey)) {
          if (updateObj.hasOwnProperty(propKey)) {
            const currentVal = currentObj[propKey];
            const updateVal = updateObj[propKey];
            const defaultVal = defaultObj[propKey];

            if (updateVal === undefined) {
              newObj[propKey] = defaultVal;
            } else {
              switch (true) {
                case isArray(currentVal) && isArray(updateVal): {
                  newObj[propKey] = structuredClone(
                    updateVal
                  ) as typeof currentVal;

                  break;
                }

                case typeof currentVal === "object" &&
                  currentVal !== null &&
                  typeof updateVal === "object" &&
                  updateVal !== null: {
                  newObj[propKey] = mergeWithDefaults(
                    currentVal as Record<PropertyKey, unknown>,
                    updateVal,
                    defaultVal as Record<PropertyKey, unknown>
                  ) as typeof currentVal;

                  break;
                }
                default: {
                  (newObj[propKey] as typeof updateVal) = updateVal;
                  break;
                }
              }
            }
          } else {
            newObj[propKey] = currentObj[propKey];
          }
        } else {
          throw new Error(
            `Structure mismatch error. The "default object" does not have property "${propKey}" of the "current object".`
          );
        }
      }
    }
    return newObj;
  }
};

export { mergeWithDefaults };
