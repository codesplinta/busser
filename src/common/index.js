import { useCallback, useEffect } from "react";
import { signal, effect, useSignal, useComputed } from "@preact/signals-react";

/**
 * @SEE: https://github.com/preactjs/signals/issues/307
 */
function useSignal$(value) {
  const $signal = useRef();
  return ($signal.current ??= signal(value));
}

export const useSignalsState = (initialState) => {
  const useSignal_ = Boolean(useSignal) ? useSignal : useSignal$;
  const signal = useSignal_(
    typeof initialState === "function" ? initialState() : initialState
  );

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
    return effect(($callback);
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);
};

export const useAppState = (appState, useSignals = false) => {
  const statePrimitiveMap = {
    signals: useSignalsState,
    container: useState
  };

  return statePrimitiveMap[useSignals ? "signals" : "container"](
    appState
  );
};

export const useAppEffect = (effectCallback, useSignals = false) => {
  const statePrimitiveMap = {
    signals: useSignalsEffect,
    container: useEffect
  };

  return statePrimitiveMap[useSignals ? "signals" : "container"](
    effectCallback
  );
};

export const useSignalsComputed = useComputed;
