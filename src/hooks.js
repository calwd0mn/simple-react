import { emitUpdateForHooks } from "./react-dom";

let states = [];
let hookIndex = 0;

export function resetHookIndex() {
  hookIndex = 0;
}

export function useState(initialValue) {
  states[hookIndex] = states[hookIndex] || initialValue;
  const currentIndex = hookIndex;
  function setState(newState) {
    states[currentIndex] = newState;
    // 在react原版源码中，当state更新相当于直接执行render，从根节点开始更新
    emitUpdateForHooks();
  }
  return [states[hookIndex++], setState];
}

export function useReducer(reducer, initialValue) {
  states[hookIndex] = states[hookIndex] || initialValue;
  const currentIndex = hookIndex;
  function dispatch(action) {
    states[currentIndex] = reducer(states[currentIndex], action);
    emitUpdateForHooks();
  }
  return [states[hookIndex++], dispatch];
}

export function useEffect(effectFunction, deps = []) {
  const currentIndex = hookIndex;
  const [destroyFunction, preDeps] = states[hookIndex] || [null, null];
  // 如果没有deps，或者deps数组中的值与上一次的不同，就执行副作用函数
  if (
    !states[currentIndex] ||
    deps.some((dep, index) => dep !== preDeps[index])
  ) {
    setTimeout(() => {
      destroyFunction && destroyFunction();
      states[currentIndex] = [effectFunction(), deps];
    });
  }
  hookIndex++;
}
export function useLayoutEffect(effectFunction, deps = []) {
  const currentIndex = hookIndex;
  const [destroyFunction, preDeps] = states[hookIndex] || [null, null];
  // 如果没有deps，或者deps数组中的值与上一次的不同，就执行副作用函数
  if (
    !states[currentIndex] ||
    deps.some((dep, index) => dep !== preDeps[index])
  ) {
    queueMicrotask(() => {
      destroyFunction && destroyFunction();
      states[currentIndex] = [effectFunction(), deps];
    });
  }
  hookIndex++;
}

export function useRef(initialValue) {
  states[hookIndex] = states[hookIndex] || { current: initialValue };
  return states[hookIndex++];
}

export function useImperativeHandle(ref, dataFactory, deps = []) {
  ref.current = dataFactory();
}

export function useMemo(dataFactory, deps = []) {
  const currentIndex = hookIndex;
  const [data, preDeps] = states[hookIndex] || [null, null];
  if (
    !states[currentIndex] ||
    deps.some((dep, index) => dep !== preDeps[index])
  ) {
    states[currentIndex] = [dataFactory(), deps];
  }
  return states[hookIndex++][0];
}

export function useCallback(callback, deps = []) {
  return useMemo(() => callback, deps);
}
