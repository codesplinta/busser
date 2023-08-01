// import { EventBusProvider } from '../src';

import "@testing-library/react-hooks/lib/dom/pure";
import React from "react";
import { renderHook, act } from "@testing-library/react-hooks";

import {
  stubListReducer
} from "./.helpers/test-doubles/stubs";

import { useList, EventBusProvider } from "../src";

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

describe("Testing `useList` ReactJS hook", () => {
  test("should render `useList` hook and updates a list of items accordingly", () => {
    const eventName = "AN.EVENT";
    const eventTagName = "A.Component";
    const initialList = [2];

    const { result } = renderHook(() =>
      useList(
        eventName,
        stubListReducer,
        initialList,
        eventTagName
      ),
      {
        wrapper: getEventBusProvider()
      }
    );

    const [ list, factory, error, stats ] = result.current;

    expect(list).toBeDefined();
    expect(stats).toBeDefined();
    expect(factory).toBeDefined();

    expect(typeof list).toBe("object");
    expect(list instanceof Array).toBe(true);
    expect(typeof stats).toBe("object");
    expect(typeof factory).toBe("function");
    expect(error).toBe(null);

    const trigger = factory(eventName);

    act(() => {
      trigger(2);
    });

    expect(stubListReducer).toHaveBeenCalledTimes(1);
    expect(stubListReducer).toHaveBeenCalledWith([initialList]);
    expect(list).toEqual([2,4]);
    expect(stats.eventsFiredCount).toEqual(1);
    expect(stats.eventsSubscribedCount).toEqual(1);

    expect(Object.keys(stats.eventsFired)).toContain(eventName);
    expect(Object.keys(stats.eventsSubscribed)).toContain(eventName);
    expect(stats.eventsFired[eventName].name).toEqual(eventTagName);
    expect(stats.eventsSubscribed[eventName].name).toEqual(eventTagName);
  });
});
