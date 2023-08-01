// import { EventBusProvider } from '../src';

import "@testing-library/react-hooks/lib/dom/pure";
import React from "react";
import { renderHook, act } from "@testing-library/react-hooks";

import {
  stubBasicCallback
} from "./.helpers/test-doubles/stubs";
import {
  mockEventBusPayload
} from "./.helpers/test-doubles/mocks";
import { useBus, EventBusProvider } from "../src";

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

describe("Testing `useBus` ReactJS hook", () => {
  test("should render `useBus` hook and respond to subscribed event(s)", () => {
    const eventName = "AN.EVENT";
    const eventTagName = "A.Component";

    const { result } = renderHook(() =>
      useBus({
        fires: [eventName],
        subscribes: [eventName],
      }, eventTagName
      ),
      {
        wrapper: getTextFilterAlgorithmsProvider({})
      }
    );

    const [ bus, stats ] = result.current;

    expect(bus).toBeDefined();
    expect(stats).toBeDefined();

    expect(typeof bus).toBe("object");
    expect(typeof stats).toBe("object");

    bus.on(eventName, stubBasicCallback);

    act(() => {
      bus.emit(eventName, mockEventBusPayload);
    });

    expect(stubBasicCallback).toHaveBeenCalledTimes(1);
    expect(stubBasicCallback).toHaveBeenCalledWith([mockEventBusPayload]);
    expect(stats.eventsFiredCount).toEqual(1);
    expect(stats.eventsSubscribedCount).toEqual(1);
    expect(Object.keys(stats.eventsFired)).toContain(eventName);
    expect(Object.keys(stats.eventsSubscribed)).toContain(eventName)
  });
});
