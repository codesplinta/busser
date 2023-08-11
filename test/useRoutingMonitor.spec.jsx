import "@testing-library/react-hooks/lib/dom/pure";
import { renderHook, act } from "@testing-library/react-hooks";
import { provisionFakeWebPageWindowObject } from "./.helpers/utils";

import { useRoutingMonitor } from "../src";
import { fakeStorageFactory } from "./.helpers/test-doubles/fakes";
import { stubBasicCallback, stubDialogProcessFactory } from "./.helpers/test-doubles/stubs";
import { promptMessageForTest } from "./.helpers/test-doubles/mocks";
import { BrowserRouter } from "react-router-dom";
import { createBrowserHistory } from "history";

/**
 *  
 * @returns {(children: React.ReactNode) => JSX.Element} | Function
 */
const getRouterProvider = (getUserConfirmation = undefined, basename = undefined, forceRefresh = undefined) => {
  return ({ children }) => (
    <BrowserRouter getUserConfirmation={getUserConfirmation} basename={basename} forceRefresh={forceRefresh}>
      {children}
    </BrowserRouter>
  );
};

describe("Testing `useRoutingMonitor` ReactJS hook", () => {
  /* @HINT: Swap native browser `window.sessionStorage` object for fake one */
  provisionFakeWebPageWindowObject(
    "sessionStorage",
    fakeStorageFactory()
  );

  /* @HINT: Swap native browser `window.confirm` dialog trigger for a stubbed one */
  provisionFakeWebPageWindowObject(
    "confirm",
    stubDialogProcessFactory("confirm", true)
  );

  test("should render `useRoutingMonitor` hook and check whether route changes are registered", () => {
    const getUserConfirmation = (message, callback) => {
      const allowTransition = window.confirm(message);
      winow.setTimeout(() => {
        callback(allowTransition);
      }, 500);
    };
    const history = createBrowserHistory();

    history.push({
      pathname: "/v1/post/settings"
    });

    const { result } = renderHook(() => useRoutingMonitor({
       unsavedChangesRouteKeysMap: { 
        "post/settings": "unsavedPostItems"
       },
       getUserConfirmation,
       promptMessage: promptMessageForTest,
       appPathnamePrefix: "/v1/",
       onNavigation: stubBasicCallback
    }), {
      wrapper: getRouterProvider(getUserConfirmation)
    });

    const { navigationList, getBreadCrumbsList } = result.current;

    expect(navigationList).toBeDefined();
    expect(getBreadCrumbsList).toBeDefined();

    expect(Array.isArray(navigationList)).toBe(true);
    expect(typeof getBreadCrumbsList).toBe("function");

    act(() => {
      window.sessionStorage.setItem("unsavedPostItems", "pending");
      history.push("/v1/post");
    });

    expect(window.confirm).toHaveBeenCalled();
    expect(window.confirm).toHaveBeenCalledTimes(1);
    expect(window.confirm).toHaveBeenCalledWith([promptMessageForTest]);
    expect(stubBasicCallback).toHaveBeenCalled();
    expect(stubBasicCallback).toHaveBeenCalledTimes(1);
    expect(window.sessionStorage.getItem("unsavedPostItems")).toBe("saved");
  });
});
