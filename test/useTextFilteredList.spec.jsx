// import { EventBusProvider } from '../src';

import "@testing-library/react-hooks/lib/dom/pure";
import React from "react";
import { renderHook, act } from "@testing-library/react-hooks";

import {
  stubEffectsCallback
} from "./.helpers/test-doubles/stubs";
import {
  mockSearchFilterListComplexObjects,
  mockSearchFilterListSimpleObjects,
  mockSearchFilterListSimpleStrings
} from "./.helpers/test-doubles/mocks";
import { useTextFilteredList, TextFilterAlgorithmsProvider } from "../src";

/**
 * 
 * @param extendAlgos 
 * @returns {(children: React.ReactNode) => JSX.Element} | Function
 */
const getTextFilterAlgorithmsProvider = (extendAlgos) => {
  return ({ children }) => (
    <TextFilterAlgorithmsProvider extendAlgos={extendAlgos}>
      {children}
    </TextFilterAlgorithmsProvider>
  );
};

describe("Testing `useTextFilteredList` ReactJS hook", () => {
  test("should render `useTextFilteredList` hook and filter a list of strings", () => {
    const { result } = renderHook(() =>
      useTextFilteredList({
        text: "",
        list: mockSearchFilterListSimpleStrings,
      }, {
        filterTaskName: "specific",
        filterUpdateCallback: stubEffectsCallback
      }),
      {
        wrapper: getTextFilterAlgorithmsProvider({})
      }
    );

    const [controller, handleChange] = result.current;

    expect(controller).toBeDefined();
    expect(typeof handleChange).toBe("function");

    const event = new Event("change");
    const inputElement = window.document.createElement("input");
    inputElement.name = "search";
    inputElement.type = "text";
    inputElement.value = "Bot";

    Object.defineProperty(event, "target", {
      value: inputElement,
      writable: false
    });

    act(() => {
      handleChange(
        event
      );
    });

    expect(controller.text).toBe("Bot");
    expect(controller.list.length).toEqual(1);
    expect(controller.list).toContain<string>(
      "Bot Five"
    );
    expect(stubEffectsCallback).toHaveBeenCalledTimes(1);
    expect(stubEffectsCallback).toHaveBeenCalledWith([controller]);
  });

  test("should render `useTextFilteredList` hook and filter a list of simple objects by `name` property", () => {
    const { result } = renderHook(() =>
      useTextFilteredList({
        text: "",
        list: mockSearchFilterListSimpleObjects,
      }, {
        filterTaskName: "specific",
        filterUpdateCallback: stubEffectsCallback
      }),
      {
        wrapper: getTextFilterAlgorithmsProvider({})
      }
    );

    const [controller, handleChange] = result.current;

    expect(controller).toBeDefined();
    expect(typeof handleChange).toBe("function");

    const event = new Event("change");
    const inputElement = window.document.createElement("input");
    inputElement.name = "search";
    inputElement.type = "text";
    inputElement.value = "No";

    Object.defineProperty(event, "target", {
      value: inputElement,
      writable: false
    });

    act(() => {
      handleChange(
        event,
        ["name"]
      );
    });

    expect(controller.text).toBe("No");
    expect(controller.list.length).toEqual(1);
    expect(controller.list).toContain({
      name: "Note Two", id: "ef88-ff24-d1a5cb40-08da-66df",
      status: "inactive"
    });
    expect(stubEffectsCallback).toHaveBeenCalledTimes(1);
    expect(stubEffectsCallback).toHaveBeenCalledWith([controller]);
  });

  test("should render `useTextFilteredList` hook and filter a list of complex objects with nested `status` property", () => {
    const { result } = renderHook(() =>
      useTextFilteredList({
        text: "",
        list: mockSearchFilterListComplexObjects,
      }, {
        filterTaskName: "specific",
        filterUpdateCallback: stubEffectsCallback
      }),
      {
        wrapper: getTextFilterAlgorithmsProvider({})
      }
    );

    const [controller, handleChange] = result.current;

    expect(controller).toBeDefined();
    expect(typeof handleChange).toBe("function");

    const event = new Event("change");
    const inputElement = window.document.createElement("input");
    inputElement.name = "search";
    inputElement.type = "text";
    inputElement.value = "inact";

    Object.defineProperty(event, "target", {
      value: inputElement,
      writable: false
    });

    act(() => {
      handleChange(
        event,
        ["metadata.status"]
      );
    });

    expect(controller.list).toContainEqual(
      expect.objectContaining({
        name: "Note Two",
        id: "ef88-ff24-d1a5cb40-08da-66df",
        metadata: { status: "inactive" }
      })
    );
    expect(stubEffectsCallback).toHaveBeenCalledTimes(1);
    expect(stubEffectsCallback).toHaveBeenCalledWith([controller]);
  });
});
