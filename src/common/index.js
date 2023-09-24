import { useRef, useCallback, useEffect } from "react";
import { signal, effect } from "@preact/signals-core";

/**
 * @SEE: https://github.com/preactjs/signals/issues/307
 */
function useSignal(value) {
  const $signal = useRef();
  return $signal.current ??= signal(value);
}

export const useSignalsState = (initialState) => {
  const signal = useSignal(typeof initialState === "function" ? initialState() : initialState);
  return [signal, (dataOrFunction) => {
    if (typeof dataOrFunction === "function") {
      signal.value = dataOrFunction(signal.peek());
      return;
    }
    signal.value = dataOrFunction;
  }];
};

export const useSignalsEffect = (callback = (() => undefined), depenencyList = []) => {
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  const $callback = useCallback(callback, depenencyList);

  useEffect(() => {
    return effect($callback);
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);
};
