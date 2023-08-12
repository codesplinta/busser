import "@testing-library/react-hooks/lib/dom/pure";
import { renderHook, act } from "@testing-library/react-hooks";
import { provisionFakeWebPageWindowObject } from "./.helpers/utils";

import { useRoutingMonitor } from "../src";
import { fakeStorageFactory } from "./.helpers/test-doubles/fakes";
import { stubDialogProcessFactory } from "./.helpers/test-doubles/stubs";
import { promptMessageForTest } from "./.helpers/test-doubles/mocks";
import { createBrowserHistory } from "history";

describe("Testing `useUnsavedChangesLock` ReactJS hook", () => {

  /* @HINT: Swap native browser `window.confirm` dialog trigger for a stubbed one */
  provisionFakeWebPageWindowObject(
    "confirm",
    stubDialogProcessFactory("confirm", false)
  );

  test("should render `useUnsavedChangesLock` hook and check ...", () => {
    const history = createBrowserHistory();

    const { result } = renderHook(() => useUnsavedChangesLock({
       useBrowserPrompt: true
    }), {
      wrapper: getRouterProvider()
    });

    const {
      getUserConfirmation,
    } = result.current;

    expect(getUserConfirmation).toBeDefined();
    expect(typeof getUserConfirmation).toBe("function");

    act(() => {
      history.push("/next");
    });

    expect(window.confirm).toHaveBeenCalled();
    expect(window.confirm).toHaveBeenCalledTimes(1);
    expect(window.confirm).toHaveBeenCalledWith([promptMessageForTest]);
  });
});
