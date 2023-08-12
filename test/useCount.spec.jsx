// import { EventBusProvider } from '../src';

import "@testing-library/react-hooks/lib/dom/pure";
import React from "react";
import { renderHook, act } from "@testing-library/react-hooks";

import {
  stubBasicCallback
} from "./.helpers/test-doubles/stubs";
import { useCount, EventBusProvider } from "../src";

/**
 *  
 * @returns {(children: React.ReactNode) => JSX.Element} | Function
 */
const getEventBusProvider = () => {
  return ({ children }) => (
    <EventBusProvider>
      {children}
    </EventBusProvider>
  );
};

describe("Testing `useCount` ReactJS hook", () => {
  test("should render `useCount` hook and ...", () => {
    const eventName = "AN.EVENT";
    const eventTagName = "A.Component";

    const { result } = renderHook(() =>
      useCount(
        [eventName],
        stubBasicCallback,
        { start: 2 },
        eventTagName
      ),
      {
        wrapper: getEventBusProvider()
      }
    );

    const [ count, handleCounting, stats ] = result.current;

    expect(count).toBeDefined();
    expect(stats).toBeDefined();
    expect(handleCounting).toBeDefined();

    expect(typeof count).toBe("number");
    expect(typeof stats).toBe("object");
    expect(typeof handleCounting).toBe("function");

    const increment = handleCounting(eventName);

    act(() => {
      increment(1);
    });

    expect(stubBasicCallback).toHaveBeenCalled();
    expect(stubBasicCallback).toHaveBeenCalledTimes(1);
    expect(stubBasicCallback).toHaveBeenCalledWith([2, 1]);
  });
});
