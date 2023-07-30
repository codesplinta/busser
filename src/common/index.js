import { useSignal } from "@preact/signals-react";

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
