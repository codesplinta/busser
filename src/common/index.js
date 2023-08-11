import { useMemo } from "react";
import { signal, effect } from "@preact/signals-react";

function useSignal(value) {
 return useMemo(
   () => signal(value),
   /* eslint-disable-next-line react-hooks/exhaustive-deps */
   []
 );
}

export const useSignalsState = (initialState) => {
  const signal = useSignal(initialState);
  return [signal, (dataOrFunction) => {
    if (typeof dataOrFunction === "function") {
      signal.value = dataOrFunction(signal.peek());
      return;
    }
    signal.value = dataOrFunction;
  }];
};

export const useSignalEffect = (callback, depenencyList = []) => {
  if (typeof callback !== "function") {
    return;
  }

  const $callback = useCallback(callback, depenencyList);
  return effect($callback);
};
