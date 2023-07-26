// import { EventBusProvider } from '../src';

import "@testing-library/react-hooks/lib/dom/pure";
import React from "react";

import { provisionFakeWebPageWindowObject } from "./.helpers/utils";

import { useSharedState, SharedGlobalStateProvider } from "../src";
import { fakeStorageFactory } from "./.helpers/test-doubles/fakes";
import { storageKey, anEmptyArray } from "./.helpers/fixtures"

/**
 * 
 * @param initialGlobalState
 * @param persistence 
 * @returns {(children: React.ReactNode) => JSX.Element} | Function
 */
const getSharedGlobalStateProvider = () => {
  return ({ children }: { children: React.ReactNode }) => (
  <SharedGlobalStateProvider value={{ initialGlobalState: { "list": anEmptyArray }, persistence: { persistOn: "local", persistKey: storageKey } }}>
    {children}
  </SharedGlobalStateProvider>);
};

describe("Testing `useSharedState` ReactJS hook", () => {
  provisionFakeWebPageWindowObject(
    "localStorage",
    fakeStorageFactory()
  );

  test("should render `useSharedState` hook and update shared data", () => {
    const { result } = renderHook(() => uuseSharedState("list"), {
      wrapper: getSharedGlobalStateProvider()
    });

    const [state, setState] = result.current;
    const aNumbersArray = [1,2];
    
    expect(state).toBeDefined();
    expect(typeof state).toBe("object");

    expect(setState).toBeDefined();
    expect(typeof setState).toBe("function");

    expect(state).toBe(anEmptyArray);
    expect(window.localStorage.getItem(storageKey)).toBe('{ "list": [] }');

    act(() => {
      setState({ slice: "list", value: aNumbersArray });
    });

    expect(state).toBe(aNumbersArray);
    expect(window.localStorage.getItem(storageKey)).toBe(`{ "list": ${String(aNumbersArray)} }`);
  });
});
