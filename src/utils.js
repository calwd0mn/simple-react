export const REACT_ELEMENT = Symbol("react.element");
export const REACT_FORWARD_REF = Symbol("react.forwardref");
export const REACT_TEXT = Symbol("react.text");
export const REACT_MEMO = Symbol("react.memo");
export const CREATE = Symbol("react.dom.diff.create");
export const MOVE = Symbol("react.dom.diff.move");
export const toVNode = (node) => {
  return typeof node === "string" || typeof node === "number"
    ? {
        type: REACT_TEXT,
        props: { text: node },
      }
    : node;
};
export const deepClone = (data, weapMap = new WeakMap()) => {
  if (data == null || typeof data !== "object") return data;

  if (weapMap.has(data)) {
    return weapMap.get(data);
  }

  if (data instanceof Date) return new Date(data);
  if (data instanceof RegExp) return new RegExp(data);

  let Constructor = data.constructor;
  let cloneData = new Constructor();
  weapMap.set(data, cloneData);

  if (Array.isArray(cloneData)) {
    for (let i = 0; i < data.length; i++) {
      cloneData[i] = deepClone(data[i], weapMap);
    }
    return cloneData;
  }

  if (data instanceof Map) {
    for (const [key, value] of data) {
      cloneData.set(deepClone(key, weapMap), deepClone(value, weapMap));
    }
    return cloneData;
  }

  if (data instanceof Set) {
    data.values().forEach((value) => {
      cloneData.add(deepClone(value, weapMap));
    });
    return cloneData;
  }

  Reflect.ownKeys(data).forEach((key) => {
    cloneData[key] = deepClone(data[key], weapMap);
  });
  return cloneData;
};

export const shallowEqual = (objA, objB) => {
  if (objA === objB) return true;
  if (typeof objA !== "object" || objA === null) return false;
  if (typeof objB !== "object" || objB === null) return false;
  let keysA = Object.keys(objA);
  let keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;
  for (let i = 0; i < keysA.length; i++) {
    if (objA[keysA[i]] !== objB[keysB[i]]) return false;
  }
  return true;
};
