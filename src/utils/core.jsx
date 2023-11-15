import React, {
  useEffect,
  useRef,
  useMemo,
  useState,
  useCallback,
  useContext
} from "react";
import {
  useHistory,
  useLocation,
  useSearchParams
} from "react-router-dom";
import {
  useSignalsState,
  useSignalsEffect
} from "../common/index";

import debounce from "lodash.debounce";

import {
  stateValuesHasDiff,
  toUniqueItemList,
  extractPropertyValue,
  throttleFilterCallbackRoutine
} from "../helpers.js";

const SharedStateContext = React.createContext(null);
const TextFilterAlgorithmsContext = React.createContext(null);

/**!
 * `useBrowserStorage()` ReactJS hook
 */

export const useBrowserStorage = ({
  storageType = "local"
}) => {
  return {
    setToStorage (key, value = null) {
      /* @HINT: This is the side-effect for each state change cycle - we want to write to `localStorage` | `sessionStorage` */
      const storageDriver = storageType === "session" ? sessionStorage : localStorage;
      if (typeof storageDriver.setItem === "function") {
        try {
          if (value !== null) {
            if (typeof key === "string") {
              storageDriver.setItem(
                key,
                typeof value === "string" ? value : JSON.stringify(value)
              )
              return true
            }
          }
        } catch (error) {
          const storageError = error
          if (storageError.name === "QuotaExceededError") {
            return false
          }
        }
      }
      return false
    },
    clearFromStorage (key = '') {
      /* @HINT: As the component unmounts, we want to delete from `localStorage` | `sessionStorage` */
      const storageDriver = storageType === "session" ? sessionStorage : localStorage;
      if (typeof storageDriver.removeItem === "function") {
        try {
          storageDriver.removeItem(key)
        } catch (_) {
          return false
        }
        return true
      }
      return false
    },
    getFromStorage (key, defaultPayload = {}) {
      /* @HINT: */
      const storageDriver = storageType === "session" ? sessionStorage : localStorage;
      /* @HINT: We want to fetch from `sessionStorage` */
      let stringifiedPayload = null;

      try {
        if (typeof storageDriver.getItem === "function") {
          stringifiedPayload = storageDriver.getItem(key);
        }
      } catch (error) {
        const storageError = error;
        if (storageError.name === "SecurityError") {
          stringifiedPayload = null;
        }
      }

      let payload = null
      try {
        payload = !stringifiedPayload
          ? defaultPayload
          : JSON.parse(stringifiedPayload);
      } catch (err) {
        const error = err;
        payload = defaultPayload;
        if (error.name === "SyntaxError") {
          if (stringifiedPayload !== null) {
            payload = stringifiedPayload;
          }
        }
      }

      return payload;
    },
  }
};

export const SharedGlobalStateProvider = ({
  children,
  initialGlobalState = {},
  persistence = { persistOn: "none", persistKey: "___$key___" }
}) => {
  const { setToStorage } = useBrowserStorage({
    storageType: persistence.persistOn === "local" ? persistence.persistOn : "session"
  });
  const shared = useRef(initialGlobalState || {});
  const box = useMemo(() => {
    const callbacks = new Set();
    return {
      getState (key) {
        if (key === "" || !key) {
          return JSON.parse(
            JSON.stringify(shared.current)
          );
        }

        if (key && typeof key === "string") {
          return shared.current[key];
        }
        return {};
      },
      dispatch ({ slice, value }) {
        const stale = this.getState("");
        let wasPersisted = false;

        if (typeof slice === "undefined") {
          shared.current = value;
        } else {
          shared.current[slice] = value;
        }

        if (persistence.persistOn !== "none") {
          wasPersisted = setToStorage(persistence.persistKey, shared.current);
        }

        for (const callbackAndKey of callbacks) {
          const [callback, key] = callbackAndKey;

          const staleType = key ? typeof stale[key] : typeof stale;
          const sharedType = key ? typeof shared.current[key] : typeof shared.current;

          let shouldUpdate = false;

          if (staleType === "object" || sharedType === "object") {
            shouldUpdate = stateValuesHasDiff(shared.current, stale);
          } else {
            if (key !== "") {
              shouldUpdate = stale[key] !== shared.current[key];
            } else {
              shouldUpdate = stale !== shared.current;
            }
          }

          /* @HINT: Always call the `callback` when there is no `key` */
          if (Boolean(key)) {
            /* @HINT: Only check if we should call the `callback` if there is a `key` */
            if (!shouldUpdate) {
              continue;
            }
          }

          callback(
            shared.current
          );
        }
      },
      subscribe (callback, key) {
        const callbackAndKey = [callback, key];
        callbacks.add(callbackAndKey);

        return () => {
          callbacks.delete(callbackAndKey);
        }
      }
    };
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  return (
    <SharedStateContext.Provider value={box}>
      {children}
    </SharedStateContext.Provider>
  )
}

/**!
 * `useBrowserStorageWithEncryption()` ReactJS hook
 */

export const useBrowserStorageWithEncryption = ({
  storageType = 'local',
}) => {
  const sharedGlobalStateBox = useContext(SharedStateContext);

  if (sharedGlobalStateBox === null) {
    throw new Error("useBrowserStorageWithEncryption[Error]: Load shared state provider before using hook");
  }

  /**
   * @USAGE:
   *
   * encryptionHelpers = {
   *  encrypt = (data) => String(data),
   *  decrypt = (data) => data
   * }
   */
  let encryptionHelpers = sharedGlobalStateBox.getState("$__encryption-helpers");
  
  if (!encryptionHelpers) {
    console.error("`useBrowserStorageWithEncryption()` is missing `encryptionHelpers` from shared state");
    encryptionHelpers = {};
  }

  const { encrypt = (data) => String(data), decrypt = (data) => data } = encryptionHelpers;
  const { setToStorage, clearFromStorage, getFromStorage } = useBrowserStorage({ storageType });
  return {
    setToStorage (key, value = null) {
      const payload = encrypt(value);
      if (typeof payload === 'string') {
        return setToStorage(key, payload);
      }
      return false;
    },
    clearFromStorage (key = '') {
      return clearFromStorage(key);
    },
    getFromStorage (key, defaultPayload = {}) {
      const payload = decrypt(getFromStorage(key, defaultPayload));
      return !payload ? defaultPayload : payload;
    }
  };
};

/**!
 * `useEffectCallback()` ReactJS hook
 */

const useEffectCallback = (callback) => {
  const ref = useRef(null);
  useEffect(() => {
    if (typeof callback === "function") {
      ref.current = callback;
    }
  }, [callback]);
  return useCallback((...args) => {
    const f_callback = ref.current;
    return f_callback !== null ? f_callback(...args) : undefined;
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);
}

/**!
 * `useOutsideClick()` ReactJS hook
 */

export function useOutsideClick (callback) {
  const reference = useRef(null);
  const handleDocumentClick = (event) => {
    if (ref.current) {
      if (!ref.current.contains(event.target)) {
        callback(ref.current, event.target);
      }
    }
  };

  useEffect(() => {
    window.document.addEventListener("click", handleDocumentClick);
    return () => {
      window.document.removeEventListener("click", handleDocumentClick);
    }
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  return [reference];
};


export const useControlKeysPress = (callback, keys = ["Escape"]) => {
  const handleDocumentControlKeys = (event) => {
    if (keys.includes(event.key)) {
      callback(event.key, event.target);
    }
  };

  useEffect(() => {
    window.document.addEventListener("keyup", handleDocumentControlKeys);
    return () => {
      window.document.removeEventListener("keyup", handleDocumentControlKeys);
    }
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);
};

/* @NOTE: a basic `Stack` data-structure definition */
class Stack {
  constructor(data = []) {
    this.length = 0
    if (Array.isArray(data)) {
      this.push.apply(this, data);
    }
  }

  isEmpty() {
    return this.length === 0;
  }

  size() {
    return this.length;
  }

  peek() {
    return this[this.size() - 1];
  }

  push(...args) {
    return Array.prototype.push.apply(this, args);
  }

  pop() {
    return Array.prototype.pop.call(this);
  }

  replaceTop(...args) {
    this.pop();
    this.push(...args);
  }

  toJSON() {
    return "[ " + Array.prototype.slice.call(this, 0).join(", ") + " ]";
  }

  toObject() {
    try {
      return JSON.parse(this.toJSON());
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "SyntaxError") {
          return Array.prototype.slice.call(this, 0, this.size());
        }
      }
      return [];
    }
  }
}

/* @NOTE: algorithm implementation of {getNavDirection} */

const getNavDirection = (navStack, lastLoadedURL) => {
  /* @NOTE: Direction: back (-1), reload (0), fresh load (-9) and forward (1) */
  let direction = -9;
  /* @HINT: The current URL on browser page */
  const docURL = document.location.href;

  /* @HINT: The temporary "auxillary" stack object to aid page nav logic */
  let auxStack = new Stack();
  /* @HINT: Take note of the intial state of the navigation stack */
  const wasNavStackEmpty = navStack.isEmpty();

  // Firstly, we need to check that if the navStack isn't empty, then
  // we need to remove the last-loaded URL to a temporary stack so we
  // can compare the second-to-last URL in the stack with the current
  // document URL to determine the direction
  if (!wasNavStackEmpty) {
    auxStack.push(navStack.pop());
  } else {
    auxStack.push(docURL);
  }

  // Check top of the navigation stack (which is the second-to-last URL loaded)
  // if it's equal to the currentg document URL. If it is, then the navigation
  // direction is 'Back' (-1)
  if (docURL === navStack.peek()) {
    // Back (back button was clicked)
    direction = -1;
  } else {
    // Check top of the temporary "auxillary" stack
    if (lastLoadedURL === auxStack.peek()) {
      // if the last-loaded URL is the
      // current one and then determine
      // the correct direction
      if (lastLoadedURL === docURL) {
        if (wasNavStackEmpty) {
          direction = -9; // Fresh Load
        } else {
          direction = 0; // Reload (refresh button was clicked)
        }
      } else {
        direction = 1; // Forward (forward button was clicked)
      }
    }
  }

  // If the direction is not 'Back' (i.e. back button clicked),
  // then replace the URL that was poped earlier and optionally
  // record the current document URL
  if (direction !== -1) {
    // if the temporary stack isn't empty
    // then empty it's content into the
    // top of the navigation stack
    if (!auxStack.isEmpty()) {
      navStack.push(auxStack.pop());
    }

    // push back the current document URL if and only if it's
    // not already at the top of the navigation stack
    if (docURL !== navStack.peek()) {
      navStack.push(docURL);
    }
  }

  // do away with the temporary stack (clean up action)
  // as it's now empty
  auxStack = null;

  // return the direction of single-page app navigation
  return direction; // Direction: back (-1), reload (0), fresh load (-9) and forward (1)
}

/**!
 * @SOURCE: https://betterprogramming.pub/im-hooked-on-hooks-b519e5b9a498
 *
 * `usePreviousProps()` ReactJS hook
 */

export const usePreviousProps = (value) => {
  const ref = useRef(null);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

/**!
 * @SOURCE: https://betterprogramming.pub/im-hooked-on-hooks-b519e5b9a498
 *
 * `useComponentMounted()` ReactJS hook
 */

export const useComponentMounted = () => {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  return isMounted.current;
};

/**!
 * @SOURCE: https://betterprogramming.pub/im-hooked-on-hooks-b519e5b9a498
 *
 * `useIsFirstRender()` ReactJS hook
 */

export const useIsFirstRender = () => {
  const isFirst = useRef(true);

  if (isFirst.current) {
    isFirst.current = false;
    return true;
  }

  return isFirst.current;
}

/**!
 * @SOURCE: https://betterprogramming.pub/im-hooked-on-hooks-b519e5b9a498
 *
 * `usePageFocused()` ReactJS hook
 */

export const usePageFocused = () => {
  const [isFocused, setIsFocused] = useState(() => {
    if (typeof window !== "undefined") {
      return document.hasFocus();
    }
    return false;
  });

  const handleFocus = () => {
    setIsFocused(document.hasFocus());
  };

  useEffect(() => {
    window.addEventListener("blur", handleFocus);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("blur", handleFocus);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return isFocused;
};

/**!
 * `useBeforePageUnload()` ReactJS hook
 */

export const useBeforePageUnload = (callback = (() => undefined), { when, message }) => {
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      callback.call(null, event.target);
      event.returnValue = message;
      return message;
    }

    if (when) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [when, message]);
};


/* @NOTE: `useSearchParams` is only defined in React-Router v6 not v5 */
const useSearchParams_ = useSearchParams || (() => {
  const pageLocation = useLocation();
  const history = useHistory();
  const searchParams = new URLSearchParams(
    Boolean(pageLocation) ? pageLocation.search : history.location.search
  );

  const setURLSearchParams = (newSearchParams, unloadPageOnNavigate = false) => {
    const nextSearchParams = new URLSearchParams(newSearchParams);

    const url = new URL(
      `${pageLocation.pathname}${nextSearchParams.toString().replace(/^([^?])/, '?$1')}`,
      window.location.origin
    );

    if (unloadPageOnNavigate) {
      window.location.assign(url.href);
    } else {
      history.push(url.href.replace(window.location.origin, ""));
    }
  };

  return [searchParams, setURLSearchParams];
});

/**!
 * @SOURCE: https://blog.logrocket.com/use-state-url-persist-state-usesearchparams/
 *
 * `useSearchParamsState()` ReactJS hook
 */

export function useSearchParamsState(
    searchParamName,
    defaultValue
) {
    const [searchParams, setSearchParams] = useSearchParams_();

    const acquiredSearchParam = searchParams.get(searchParamName);
    const searchParamsState = acquiredSearchParam ?? defaultValue;

    const setSearchParamsState = (newState: string) => {
        const nextEntries = typeof Object.fromEntries === "function"
          ? Object.assign(
            {},
            Object.fromEntries(searchParams.entries()),
            { [searchParamName]: newState }
          );
          : Object.assign(
            {},
            [...searchParams.entries()].reduce(
                (oldState, [key, value]) => ({ ...oldState, [key]: value }),
                {}
            ),
            { [searchParamName]: newState }
        );
        setSearchParams(nextEntries);
    };
    return [searchParamsState, setSearchParamsState];
};

/**!
 * `useIsDOMElementIntersecting()` ReactJS hook
 */
export const useIsDOMElementIntersecting = (domElement, options) => {
	const [ isIntersecting, setIsIntersecting ] = useState(false);

	useEffect(() => {
		const iterator = (entry) => {
			return setIsIntersecting(() => entry.isIntersecting)
		};
		const callback = (entries) => entries.forEach(iterator);
		const observer = new IntersectionObserver(callback, options);
		if (domElement) {
      observer.observe(domElement);
    }
		return () => domElement && observer.unobserve(domElement)
	}, [domElement, options]);

	return isIntersecting;
};

/**!
 * `useUnsavedChangesLock()` ReactJS hook
 */

export const useUnsavedChangesLock = ({ useBrowserPrompt = false }) => {
  const [verifyConfimation, setVerifyConfirmation] = useState(false);
  const [verifyConfirmCallback, setVerifyConfirmCallback] = useState(null);

  const getUserConfirmation = useCallback((message, callback) => {
    if (useBrowserPrompt) {
      const allowTransition = window.confirm(message);
      window.setTimeout(() => {
        callback(allowTransition);
      }, 1000);
    } else {
      setVerifyConfirmCallback((status) => callback(status));
      setVerifyConfirmation(true);
    }
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [useBrowserPrompt]);

  return {
    verifyConfimation,
    getUserConfirmation,
    allowTransition: () => {
      setVerifyConfirmation(false)
      if (verifyConfirmCallback !== null) {
        verifyConfirmCallback(true);
      }
    },
    blockTransition: () => {
      setVerifyConfirmation(true)
      if (verifyConfirmCallback !== null) {
        verifyConfirmCallback(false);
      }
    },
  };
};

/**!
 * `useRoutingMonitor()` ReactJS hook
 */

export const useRoutingMonitor = ({
  unsavedChangesRouteKeysMap = {
    '/': '$___root_unsaved_items__',
  },
  documentTitlePrefix = '',
  setupPageTitle = false,
  appPathnamePrefix = '/',
  getUserConfirmation,
  promptMessage = 'You have unsaved items on this web page. Would you like to discard them ?',
  shouldBlockRoutingTo = () => false,
  onNavigation = () => undefined,
}) => {
  const startLocation = useLocation();
  const history = useHistory();
  const { setToStorage, getFromStorage, clearFromStorage } = useBrowserStorage({
    storageType: 'session',
  });
  const [navigationList, setNavigationList] = useState([startLocation]);

  const calculateNextNavigationList = (
    navigationList,
    navigationStackAction,
    location
  ) => {
    const navigationStack = new Stack(
      navigationList ? navigationList.slice(0) : []
    );
    const stackActionCommand = navigationStackAction.toLowerCase();

    switch (stackActionCommand) {
      case 'pop':
      case 'push':
      case 'replace':
        if (stackActionCommand !== 'replace') {
          if (stackActionCommand === 'pop') {
            navigationStack.pop();
          } else {
            navigationStack.push(location);
          }
        } else {
          navigationStack.replaceTop(location);
        }
        return navigationStack.toObject();
      default:
        return navigationStack.toObject();
    }
  }

  const routeChangeProcessCallbackFactory = (
    unsavedChangesKey,
    location,
    unblock
  ) => {
    return (shouldDiscardUnsavedItems) => {
      if (shouldDiscardUnsavedItems) {
        setToStorage(unsavedChangesKey, "saved");
        /* @HINT: There are parts of this React app that should listen for this custom event ["discardunsaveditems"]
          and act accordingly */
        /* @NOTE: Event ["discardunsaveditems"] is fired here so that items yet to saved are discarded and not saved */
        window.dispatchEvent(new Event("discardunsaveditems"));

        return shouldBlockRoutingTo(location.pathname) ? false : (unblock(), undefined);
      } else {
        /* @HINT: Store signal for unsaved items on the Dashboard as pending */
        setToStorage(unsavedChangesKey, "pending");
        return false;
      }
    }
  }

  const onBeforeRouteChange = (location, unblock) => {
    const formerPathname = getFromStorage("$__former_url", "/")
    const unsavedChangesKey =
      unsavedChangesRouteKeysMap[
        formerPathname.replace(appPathnamePrefix, "/");
      ] || ""

    /* @HINT: Fetch signal for unsave items on the app by the user */
    const unsavedItemsStatus = getFromStorage(unsavedChangesKey, "saved");
    /* @HINT: If the there are items to be "saved", then prompt the user with a dialog box message */
    if (unsavedItemsStatus !== "saved") {
      return getUserConfirmation(
        promptMessage,
        routeChangeProcessCallbackFactory(unsavedChangesKey, location, unblock)
      );
    }
  }

  useEffect(() => {
    return () => {
      clearFromStorage("$__former_url");
    }
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  useEffect(() => {
    /* @HINT: block browser navigation before a route change */
    const unblock = history.block((location) => {
      return onBeforeRouteChange(location, unblock);
    })

    /* @HINT: listen for browser navigation on a route change */
    const unlisten = history.listen(function onRouteChange(location, action) {
      /* @HINT: The last loaded page URL is stored in session storage and retrieved upon the next page route change */
      const formerPathname = getFromStorage(
        "$__former_url",
        startLocation.pathname
      );
      /* @HINT: Get the former URL */
      const lastloadedURL = `${document.location.origin}${formerPathname}`
      /* @HINT: The document <title> of the page is programatically created from the page URL pathname */
      const title = location.pathname
        .replace(/^\//, "")
        .split('/')
        .slice(0)
        .reduce((buffer, suffix) => {
          const capitalizedSuffix =
            suffix.charAt(0).toUpperCase() + suffix.substring(1)
          return (
            buffer +
            (buffer !== '' ? ' ' + capitalizedSuffix : capitalizedSuffix)
          )
        }, "");

      /* @HINT: The document <title> assigned with an additional prefix */
      if (setupPageTitle) {
        document.title =
          Boolean(documentTitlePrefix) &&
          typeof documentTitlePrefix === "string"
            ? documentTitlePrefix + (title || "Home")
            : title || "Home";
      } else {
        if (
          Boolean(documentTitlePrefix) &&
          typeof documentTitlePrefix === "string"
        ) {
          if (document.title.indexOf(documentTitlePrefix) === -1) {
            document.title = documentTitlePrefix + document.title;
          }
        }
      }

      const navigationDirection = getNavDirection(
        new Stack(
          navigationList.map(
            (navigationListItem) =>
              `${document.location.origin}${navigationListItem.pathname}`
          )
        ),
        lastloadedURL
      );

      /* @HINT: Update the last loaded URL so it is consistent with the next page route change */
      setToStorage("$__former_url", location.pathname);

      setNavigationList((previousNavigationList) => {
        return calculateNextNavigationList(previousNavigationList, action, location);
      })

      return onNavigation(history, {
        documentTitle: document.title,
        currentPathname: location.pathname,
        previousPathname: formerPathname,
        navigationDirection,
      });
    });

    return () => {
      /* @HINT: If there is a listener set for the "beforeunload" event */
      if (typeof unblock === "function") {
        /* @HINT: Then, at this point, assume all unsaved items are saved  
          and then remove the listener for "beforeunload" event */
        for (const unsavedChangesKey in unsavedChangesRouteKeysMap) {
          if (unsavedChangesRouteKeysMap.hasOwnProperty(unsavedChangesKey)) {
            setToStorage(unsavedChangesKey, "saved");
          }
        }
        unblock();
      }
      unlisten();
    };
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [history])

  return {
    navigationList,
    getBreadCrumbsList(pathname = "/") {
      let prependRootPathname = null;
      const fullNavigationList = navigationList.slice(0).reverse();
      const breadcrumbsList = [];
      /* @HINT: instead of using `.split()`, we use `.match()` */
      const [
        firstPathnameFragment,
        ...remainingPathnameFragments
      ] = pathname.match(/(?:^\/)?[^/]+/g);
      const fragmentsLength = remainingPathnameFragments.length + 1;
      const currentPagePathname = pathname.startsWith(appPathnamePrefix)
        ? firstPathnameFragment
        : `${
            appPathnamePrefix.startsWith("/")
              ? appPathnamePrefix
              : '/' + appPathnamePrefix
          }${
            appPathnamePrefix.endsWith("/")
              ? firstPathnameFragment.replace(/^\//, '')
              : firstPathnameFragment.replace(/^([^/])/, '/$1')
          }`;

      for (let count = 0; count < fullNavigationList.length; count++) {
        const navListItem = fullNavigationList[count];
        const navListItemPathnameFragmentsLength =
          navListItem.pathname.split("/").length - 1;
        if (navListItem.pathname.includes(currentPagePathname)) {
          if (
            !breadcrumbsList
              .map((breadcrumbsListItem) => breadcrumbsListItem.pathname)
              .includes(navListItem.pathname)
          ) {
            if (navListItemPathnameFragmentsLength <= fragmentsLength) {
              breadcrumbsList.push(navListItem);
            }
          }
        } else {
          if (navListItem.pathname === "/") {
            prependRootPathname = navListItem;
          }
          break;
        }
      }

      if (prependRootPathname !== null) {
        breadcrumbsList.push(prependRootPathname);
      }

      return breadcrumbsList.reverse()
    },
  }
};

/**!
 * `useTextFilteredList()` ReactJS hook
 */

export function useTextFilteredList(
  { text = "", page = 1, list },
  {
    filterTaskName = "specific",
    fetchRemoteFilteredList = () => Promise.resolve([]),
    filterUpdateCallback = (controller) => () => void controller
  }
) {
  const sharedGlobalStateBox = useContext(SharedStateContext);

  if (sharedGlobalStateBox === null) {
    throw new Error("useTextFilteredList[Error]: Load shared state provider before using hook");
  }

  /**
   * @USAGE:
   *
   * algorithms = {
   *  [string]: () => ([])
   * }
   */

  /* @HINT: Fetch all the default text search algorithm functions from React context */
  const algorithms = sharedGlobalStateBox.getState("$___text-filter-algos");

  if (!algorithms) {
    console.error("`useTextFilteredList()` is missing `algorithms` from shared state");
  }

  /* @HINT: Select the text search algorithm function chosen by the client code (via `filterTaskName` argument) for text query purposes */
  const filterTextAlgorithmRunner =
    Boolean(algorithms) ? algorithms[filterTaskName] : () => ([]);

  /* @HINT: Setup the search query controller values - values that control the processing of the text search */
  const [controller, setController] = useState({
    text,
    isLoading: false,
    list,
    page
  });
  /* @HINT: Use a debounce function to batch keystrokes together and make calls to the server only after typing has ceased */
  const delayedFetchRemoteFilteredList = useRef(
    debounce((searchTerm, listItemKeys) => {
      if (typeof fetchRemoteFilteredList === "function") {
        return fetchRemoteFilteredList(searchTerm, listItemKeys);
      }
      return Promise.resolve([]);
    }, 500)
  ).current;

  /* @HINT: Setup function to handle `onChange` event of any <input> or <textarea> element used to enter text search query */
  const handleFilterTrigger = useCallback(
    (filterListAlgoRunner, event, listItemKeys = [""]) => {
      /* @HINT: Only react to `chnage` events from text inputs */
      if (
        event &&
        (event.type === "change") &&
        // event.target instanceof window.Element &&
        ("value" in event.target) &&
        !event.defaultPrevented
      ) {
        /* @HINT: get the search query from the <input> or <textarea> element */
        const searchTerm = event.target.value;

        /* @HINT: Update the state depending on whether a 
          search term was entered into the text input element */
        if (searchTerm !== "") {
          setController((prevController) => ({
            ...prevController,
            text: searchTerm,
            isLoading: true
          }));
        } else {
          setController((prevController) => ({
            ...prevController,
            text: searchTerm,
            isLoading: false,
            list,
            page: 1
          }));
          return;
        }

        /* @HINT: Perform the text search using the search query on the list of items to search from */
        const filteredList = filterListAlgoRunner(
          searchTerm,
          list,
          listItemKeys
        );

        /* @HINT: If the text search algorithm function didn't return any results (on the client-side)... */
        if (filteredList.length === 0) {
          /* @HINT: ...then, use the debounced function to fetch a list of items from 
            the server-side that may match the search query */
          (
            delayedFetchRemoteFilteredList(searchTerm, listItemKeys) ||
            new Promise((resolve) => {
              resolve([]);
            })
          ).then((fetchedList) =>
            setController((prevController) => ({
              ...prevController,
              isLoading: false,
              page: 1,
              /* @ts-ignore */
              list: fetchedList.__fromCache
                ? filterListAlgoRunner(searchTerm, fetchedList, listItemKeys)
                : fetchedList
            }))
          );
          return;
        }

        /* @HINT: filtering on the client-side returned results so update state accordingly */
        setController({
          text: searchTerm,
          isLoading: false,
          list: filteredList,
          page: 1
        });
      }
    },
    [delayedFetchRemoteFilteredList, list]
  );

  useEffect(() => {
    if (list.length === 0) {
      if (controller.list.length !== list.length) {
        if (controller.text === "") {
          setController((prevController) => ({
            ...prevController,
            list
          }));
        }
      }
      return;
    }

    if (controller.text === "") {
      if (
        controller.list.length === 0 ||
        controller.list.length !== list.length
      ) {
        setController((prevController) => ({
          ...prevController,
          list
        }));
      } else {
        if (controller.page !== page) {
          setController((prevController) => ({
            ...prevController,
            page,
            list
          }));
        }
      }
    }
  }, [list, controller, page]);

  useEffect(() => {
    const throttledFilterUpdateCallback = throttleFilterCallbackRoutine(
      filterUpdateCallback,
      [controller, setController],
      1500
    );
    let shutdownCallback = () => undefined;

    if (controller.text !== text) {
      shutdownCallback = throttledFilterUpdateCallback();
    }

    return () => {
      shutdownCallback();
    };
  }, [text, controller, filterUpdateCallback]);

  /* @HINT: Finally, return controller and chnage event handler factory function */
  return [
    controller,
    handleFilterTrigger.bind(null, filterTextAlgorithmRunner)
  ];
}

/**!
 * `useTextFilteredSignalsList()` ReactJS hook
 */

export function useTextFilteredSignalsList(
  { text = "", page = 1, list },
  {
    filterTaskName = "specific",
    fetchRemoteFilteredList = () => Promise.resolve([]),
    filterUpdateCallback = (controller) => () => void controller
  }
) {
  const sharedGlobalStateBox = useContext(SharedStateContext);

  if (sharedGlobalStateBox === null) {
    throw new Error("useTextFilteredList[Error]: Load shared state provider before using hook");
  }

  /**
   * @USAGE:
   *
   * algorithms = {
   *  [string]: () => ([])
   * }
   */

  /* @HINT: Fetch all the default text search algorithm functions from React context */
  const algorithms = sharedGlobalStateBox.getState("$___text-filter-algos");

  if (!algorithms) {
    console.error("`useTextFilteredList()` is missing `algorithms` from shared state");
  }

  /* @HINT: Select the text search algorithm function chosen by the client code (via `filterTaskName` argument) for text query purposes */
  const filterTextAlgorithmRunner =
    Boolean(algorithms) ? algorithms[filterTaskName] : () => [];

  /* @HINT: Setup the search query controller values - values that control the processing of the text search */
  const [controller, setController] = useSignalsState({
    text,
    isLoading: false,
    list,
    page
  });
  /* @HINT: Use a debounce function to batch keystrokes together and make calls to the server only after typing has ceased */
  const delayedFetchRemoteFilteredList = useRef(
    debounce((searchTerm, listItemKeys) => {
      if (typeof fetchRemoteFilteredList === "function") {
        return fetchRemoteFilteredList(searchTerm, listItemKeys);
      }
      return Promise.resolve([]);
    }, 500)
  ).current;

  /* @HINT: Setup function to handle `onChange` event of any <input> or <textarea> element used to enter text search query */
  const handleFilterTrigger = useCallback(
    (filterListAlgoRunner, event, listItemKeys = [""]) => {
      /* @HINT: Only react to `chnage` events from text inputs */
      if (
        event &&
        (event.type === "change") &&
        // event.target instanceof window.Element &&
        ("value" in event.target) &&
        !event.defaultPrevented
      ) {
        /* @HINT: get the search query from the <input> or <textarea> element */
        const searchTerm = event.target.value;

        /* @HINT: Update the state depending on whether a 
          search term was entered into the text input element */
        if (searchTerm !== "") {
          setController((prevController) => ({
            ...prevController,
            text: searchTerm,
            isLoading: true
          }));
        } else {
          setController((prevController) => ({
            ...prevController,
            text: searchTerm,
            isLoading: false,
            list,
            page: 1
          }));
          return;
        }

        /* @HINT: Perform the text search using the search query on the list of items to search from */
        const filteredList = filterListAlgoRunner(
          searchTerm,
          list,
          listItemKeys
        );

        /* @HINT: If the text search algorithm function didn't return any results (on the client-side)... */
        if (filteredList.length === 0) {
          /* @HINT: ...then, use the debounced function to fetch a list of items from 
            the server-side that may match the search query */
          (
            delayedFetchRemoteFilteredList(searchTerm, listItemKeys) ||
            new Promise((resolve) => {
              resolve([]);
            })
          ).then((fetchedList) =>
            setController((prevController) => ({
              ...prevController,
              isLoading: false,
              page: 1,
              /* @ts-ignore */
              list: fetchedList.__fromCache
                ? filterListAlgoRunner(searchTerm, fetchedList, listItemKeys)
                : fetchedList
            }))
          );
          return;
        }

        /* @HINT: filtering on the client-side returned results so update state accordingly */
        setController({
          text: searchTerm,
          isLoading: false,
          list: filteredList,
          page: 1
        });
      }
    },
    [delayedFetchRemoteFilteredList, list]
  );

  useSignalsEffect(() => {
    if (list.length === 0) {
      if (controller.list.length !== list.length) {
        if (controller.text === "") {
          setController((prevController) => ({
            ...prevController,
            list
          }));
        }
      }
      return;
    }

    if (controller.text === "") {
      if (
        controller.list.length === 0 ||
        controller.list.length !== list.length
      ) {
        setController((prevController) => ({
          ...prevController,
          list
        }));
      } else {
        if (controller.page !== page) {
          setController((prevController) => ({
            ...prevController,
            page,
            list
          }));
        }
      }
    }
  }, [list, controller, page]);

  useSignalsEffect(() => {
    const throttledFilterUpdateCallback = throttleFilterCallbackRoutine(
      filterUpdateCallback,
      [controller, setController],
      1500
    );
    let shutdownCallback = () => undefined;

    if (controller.text !== text) {
      shutdownCallback = throttledFilterUpdateCallback();
    }

    return () => {
      shutdownCallback();
    };
  }, [text, controller, filterUpdateCallback]);

  /* @HINT: Finally, return controller and chnage event handler factory function */
  return [
    controller,
    handleFilterTrigger.bind(null, filterTextAlgorithmRunner)
  ];
}

export const TextFilterAlgorithmsProvider = ({
  children,
  extendAlgos = {}
}) => {
  const shared = useRef(
    Object.assign(extendAlgos, {
      /* @NOTE: `specific` filter alogrithm */
      specific (filterText = "", filterList = [], filterListItemKeys = [""]) {
        return filterList.filter((filterListItem) => {
          return filterListItemKeys.reduce(
            (finalStatusResult, filterListItemKey) => {
              const listItem =
                typeof filterListItem !== "object"
                  ? filterListItem
                  : extractPropertyValue(filterListItemKey, filterListItem);
              const haystack =
                typeof listItem === "string"
                  ? listItem.toLowerCase()
                  : String(listItem).toLowerCase();
              const needle = filterText.toLowerCase();

              return (
                filterText === "" ||
                haystack.indexOf(needle) > -1 ||
                finalStatusResult
              );
            },
            false
          );
        });
      },
      /* @NOTE: `fuzzy` filter alogrithm */
      fuzzy (filterText = "", filterList = [], filterListItemKeys = [""]) {
        if (filterText === "") {
          return filterList;
        }

        const characters = filterText.split("");

        /* @HINT: flatten the multi-dimesional list (array) */
        const chunks = Array.prototype.concat.apply(
          [],
          characters.map((character) => {
            return filterList.filter((filterListItem) => {
              return filterListItemKeys.reduce(
                (finalStatusResult, filterListItemKey) => {
                  const needle = character.toLowerCase();
                  const listItem =
                    typeof filterListItem !== "object"
                      ? filterListItem
                      : extractPropertyValue(filterListItemKey, filterListItem);
                  const haystack =
                    typeof listItem === "string"
                      ? listItem.toLowerCase()
                      : String(listItem).toLowerCase();
                  const radix = haystack.indexOf(needle);
                  let result = true;

                  if (radix === -1) {
                    result = false;
                  }
                  return result || finalStatusResult;
                },
                false
              );
            });
          })
        );

        return toUniqueItemList(
          filterListItemKeys.flatMap((filterListItemKey) =>
            toUniqueItemList(chunks, filterListItemKey)
          )
        );
      },
      /* @NOTE: `complete` filter alogrithm */
      complete(filterText = "", filterList = [], filterListItemKeys = [""]) {
        return filterList.filter((filterListItem) => {
          return filterListItemKeys.reduce(
            (finalStatusResult, filterListItemKey) => {
              const listItem =
                typeof filterListItem !== "object"
                  ? filterListItem
                  : extractPropertyValue(filterListItemKey, filterListItem);
              const haystack =
                typeof listItem === "string"
                  ? listItem.toLowerCase()
                  : String(listItem).toLowerCase();
              const needle = filterText.toLowerCase();

              let result = true,
                radix = -1,
                charPosition = 0,
                charValue = needle[charPosition] || null;

              while (null !== charValue) {
                radix = haystack.indexOf(charValue, radix + 1);
                if (radix === -1) {
                  result = false;
                  break;
                }
                charPosition += 1;
                charValue = needle[charPosition] || null;
              }
              return result || finalStatusResult;
            },
            false
          );
        });
      }
    })
  );

  return (
    <TextFilterAlgorithmsContext.Provider
      /* eslint-disable-next-line react-hooks/exhaustive-deps */
      value={useMemo(() => shared.current, [])}
    >
      {children}
    </TextFilterAlgorithmsContext.Provider>
  );
};

/**!
 * `useSharedState()` ReactJS hook
 */

export const useSharedState = (slice = "") => {
  const sharedGlobalStateBox = useContext(SharedStateContext);

  if (sharedGlobalStateBox === null) {
    throw new Error("useSharedState[Error]: Load provider before using hook");
  }

  const [shared, setSharedState] = useState(sharedGlobalStateBox.getState(""));

  useEffect(() => {
    const unsubscribe = sharedGlobalStateBox.subscribe(setSharedState, slice ? slice : "");
    return () => unsubscribe()
  }, [sharedGlobalStateBox, slice]);

  return [slice ? shared[slice] : shared, sharedGlobalStateBox.dispatch.bind(sharedGlobalStateBox)];
};


/**!
 * `useSharedSignalsState()` ReactJS hook
 */

export const useSharedSignalsState = (slice = "") => {
  const sharedGlobalStateBox = useContext(SharedStateContext);

  if (sharedGlobalStateBox === null) {
    throw new Error("useSharedSignalsState[Error]: Load provider before using hook");
  }

  const [shared, setSharedState] = useSignalsState(sharedGlobalStateBox.getState(""));

  useSignalsEffect(() => {
    const unsubscribe = sharedGlobalStateBox.subscribe(setSharedState, slice ? slice : "");
    return () => unsubscribe()
  }, [sharedGlobalStateBox, slice]);

  return [slice ? shared[slice] : shared, sharedGlobalStateBox.dispatch.bind(sharedGlobalStateBox)];
};
