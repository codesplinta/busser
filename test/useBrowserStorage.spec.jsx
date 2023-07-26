// import { EventBusProvider } from '../src';

import "@testing-library/react-hooks/lib/dom/pure";
import React from "react";
import { renderHook, act } from "@testing-library/react-hooks";
import { provisionFakeWebPageWindowObject } from "tests/.helpers/utils";

import { useBrowserStorage } from "../src/";
import { fakeStorageFactory } from ".helpers/test-doubles/fakes";
import { userKey } from "tests/.helpers/fixtures";

describe("Testing `useBrowserStorage` ReactJS hook", () => {
  provisionFakeWebPageWindowObject(
    "localStorage",
    fakeStorageFactory()
  );

  test("should render `useBrowserStorage` hook and check saving and retrieving storage data", () => {
    const { result } = renderHook(() => useBrowserStorage({
      storageType: "local"
    }));

    const { clearFromStorage, getFromStorage, setToStorage } = result.current;

    expect(getFromStorage).toBeDefined();
    expect(typeof getFromStorage).toBe("function");

    expect(clearFromStorage).toBeDefined();
    expect(typeof clearFromStorage).toBe("function");

    expect(setToStorage).toBeDefined();
    expect(typeof setToStorage).toBe("function");

    act(() => {
      setToStorage(userKey, { "enabled": true });
      clearFromStorage()
    });

    expect(window.localStorage.getItem(userKey)).toBe(null);
  });
});
