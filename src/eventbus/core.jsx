import React, {
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef
} from "react";
import { toUniqueItemList, extractPropertyValue } from "../helpers";

const BrowserStorageContext = React.createContext(null);
const TextFilterAlgorithmsContext = React.createContext(null);
const EventBusContext = React.createContext(null);

const TextFilterAlgorithmsProvider = ({
  children,
  extendAlgos = {}
}) => {
  const shared = useRef(
    Object.assign(extendAlgos, {
      specific(filterText = "", filterList = [], filterListItemKey = "") {
        return filterList.filter((filterListItem = "") => {
          const listItem =
            typeof filterListItem !== "object"
              ? filterListItem
              : extractPropertyValue(filterListItemKey, filterListItem);
          const haystack =
            typeof listItem === "string" ? listItem.toLowerCase() : listItem;
          const needle = filterText.toLowerCase();

          return (filterText === "" || haystack.indexOf(needle) > -1);
        });
      },
      fuzzy(filterText = "", filterList = [], filterListItemKey = "") {
        if (filterText === "") {
          return filterList;
        }

        const characters = filterText.split("");

        /* @NOTE: flatten the multi-dimesional filtered list (array) */
        const chunks = [].concat.apply(
          [],
          characters.map((character) => {
            return filterList.filter((filterListItem) => {
              const needle = character.toLowerCase();
              const listItem =
                typeof filterListItem !== "object"
                  ? filterListItem
                  : extractPropertyValue(filterListItemKey, filterListItem);
              const haystack =
                typeof listItem === "string"
                  ? listItem.toLowerCase()
                  : listItem;
              let radix = haystack.indexOf(needle);

              if (radix === -1) {
                return false;
              }
              return true;
            });
          })
        );

        return toUniqueItemList(chunks, filterListItemKey);
      },
      complete(filterText = "", filterList = [], filterListItemKey = "") {
        return filterList.filter((filterListItem) => {
          const listItem =
            typeof filterListItem !== "object"
              ? filterListItem
              : extractPropertyValue(filterListItemKey, filterListItem);
          const haystack =
            typeof listItem === "string" ? listItem.toLowerCase() : listItem;
          const needle = filterText.toLowerCase();

          let radix = -1,
            charPosition = 0,
            charValue = needle[charPosition] || null;

          while (null !== charValue) {
            radix = haystack.indexOf(charValue, radix + 1);
            if (!~radix) {
              return false;
            }
            charPosition += 1;
            charValue = needle[charPosition] || null;
          }
          return true;
        });
      }
    })
  );

  return (
    <TextFilterAlgorithmsContext.Provider value={shared.current}>
      {children}
    </TextFilterAlgorithmsContext.Provider>
  );
};

const BrowserStorageProvider = ({ children, storageDriver = {} }) => {
  const shared = useRef({
    setToStorage: (key, value) => {
      /* @HINT: This is the side-effect for each state change cycle - we want to write to `sessionStoage` */
      if (typeof storageDriver.setItem === "function") {
        storageDriver.setItem(key, JSON.stringify(value));
      }
    },
    clearFromStorage: (key) => {
      /* @HINT: As the component unmounts, we want to delete from `sessionStorage` */
      if (typeof storageDriver.removeItem === "function") {
        storageDriver.removeItem(key);
      }
    },
    getFromStorage: (key, defaultPayload) => {
      /* @HINT: We want to fetch from `sessionStorage` */
      let stringifiedPayload = "";

      if (typeof storageDriver.getItem === "function") {
        stringifiedPayload = storageDriver.getItem(key);
      }

      return !stringifiedPayload
        ? defaultPayload
        : JSON.parse(stringifiedPayload);
    }
  });
  return (
    <BrowserStorageContext.Provider value={shared.current}>
      {children}
    </BrowserStorageContext.Provider>
  );
};

function EventBusProvider({ children }) {
  const [handlers] = useState(() => ({}));
  return (
    <EventBusContext.Provider value={handlers}>
      {children}
    </EventBusContext.Provider>
  );
}

const useBus = ({ subscribes = [], fires = [] }, name = "<no name>") => {
  const handlers = useContext(EventBusContext);
  const stats = useRef({
    eventsFired: {},
    eventsFiredCount: 0,
    eventsSubscribed: {},
    eventsSubscribedCount: 0
  });

  if (typeof handlers === "undefined") {
    throw new Error('"useBus()" must be used with the <EventBusProvider>');
  }

  const bus = useRef({
    on: function on(event, handler) {
      if (!handlers[event]) {
        handlers[event] = [];
      }

      if (typeof handler === "function") {
        if (subscribes.indexOf(event) === -1) {
          subscribes.push(event);
          stats.current.eventsSubscribedCount++;
          if (typeof stats.current.eventsSubscribed[event] === "undefined") {
            stats.current.eventsSubscribed[event] = {};
          }

          stats.current.eventsSubscribed[event].timestamp = Date.now();
          stats.current.eventsSubscribed[event].name = name;
        }
        handlers[event].push(handler);
      }
    },
    off: function off(callback = null) {
      for (let eventCount = 0; eventCount < subscribes.length; eventCount++) {
        const event = subscribes[eventCount];
        const eventHandlers = handlers[event];

        if (eventHandlers) {
          const index = eventHandlers.indexOf(callback);

          if (index !== -1) {
            eventHandlers.splice(index, 1);
          } else {
            delete handlers[event];
          }
        }
      }
    },
    emit: function emit(event, data) {
      const returned = [];
      if (event in handlers && fires.indexOf(event) > -1) {
        const allHandlers = handlers[event];

        for (
          let handlersCount = 0;
          handlersCount < allHandlers.length;
          handlersCount++
        ) {
          const handler = allHandlers[handlersCount];
          if (typeof handler === "function") {
            stats.current.eventsFiredCount++;
            if (typeof stats.current.eventsFired[event] === "undefined") {
              stats.current.eventsFired[event] = {};
            }

            stats.current.eventsFired[event].timestamp = Date.now();
            stats.current.eventsFired[event].data = data;
            stats.current.eventsFired[event].name = name;

            returned.push(handler.call(null, data));
          }
        }
      }
      return returned;
    }
  }).current;

  return [Object.freeze(bus), stats.current];
};

const useUpon = (callback = () => null) => {
  if (typeof callback !== "function") {
    throw new Error("callback not found!");
  }

  const callbackRef = useRef(null);
  callbackRef.current = callback;

  return useCallback((...args) => callbackRef.current(...args), []);
};

const useWhen = (
  event,
  argsTransformer = (args) => args,
  name = "<no name>"
) => {
  const busEvents = [event];
  const [bus] = useBus({ subscribes: busEvents, fires: busEvents }, name);

  const stableArgsTransformer = useUpon(argsTransformer);

  return useCallback(
    (...args) => {
      bus.emit(event, stableArgsTransformer(...args));
    },
    [bus, event, stableArgsTransformer]
  );
};

const useThen = (bus, event, argsTransformer = (args) => args) => {
  const stableArgsTransformer = useUpon(argsTransformer);

  return useCallback(
    (...args) => {
      bus.emit(event, stableArgsTransformer(...args));
    },
    [bus, event, stableArgsTransformer]
  );
};

const useOn = (
  eventListOrName = "",
  callback = () => true,
  name = "<no name>"
) => {
  const isEventAList =
    Array.isArray(eventListOrName) || typeof eventListOrName !== "string";
  const busEvents = useRef(isEventAList ? eventListOrName : [eventListOrName])
    .current;
  const [bus, stats] = useBus(
    { subscribes: busEvents, fires: busEvents },
    name
  );

  const stableCallbacks = useMemo(() => {
    const expandCallback = (eventName) => callback.bind(null, eventName);
    return isEventAList
      ? busEvents.map((eventName) => expandCallback(eventName))
      : [callback];
  }, [isEventAList, busEvents, callback]);

  useEffect(() => {
    busEvents.forEach((eventName, index) => {
      bus.on(eventName, stableCallbacks[index]);
    });

    return () => {
      let index = -1;
      busEvents.forEach(() => {
        ++index;
        bus.off(stableCallbacks[index]);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bus, busEvents, stableCallbacks]);

  return [bus, stats];
};

const useRouted = (event, history, name = "<no name>") => {
  const listener = useWhen(
    event,
    (...[location, action]) => ({ location, action }),
    name
  );

  useEffect(() => {
    if (
      !history ||
      typeof history.listen !== "function" ||
      typeof event !== "string"
    ) {
      return () => null;
    }
    const unlisten = history.listen(listener);
    return () => unlisten();
  }, [history, listener, event]);
};

const useList = (
  eventsList = [],
  listReducer,
  initial = [],
  name = "<no name>"
) => {
  const [list, setList] = useState(initial);
  const handleMutationTrigger = useCallback((event, listItem) => {
    setList((prevList) => {
      return listReducer(prevList, listItem, event);
    });
  }, [listReducer]);
  const [bus, stats] = useOn(
    eventsList,
    handleMutationTrigger,
    name
  );

  return [
    list,
    // eslint-disable-next-line react-hooks/rules-of-hooks
    (eventName, argsTransformer) => useThen(bus, eventName, argsTransformer),
    stats
  ];
};

const useCount = (
  eventsList = [],
  countReducer,
  { start = 0, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER },
  name = "<no name>"
) => {
  if (
    typeof start !== "number" ||
    typeof min !== "number" ||
    typeof max !== "number"
  ) {
    throw new Error("[react-busser]: incorrect count bounds data type");
  }

  if (start < min || start > max) {
    throw new Error("[react-busser]: incorrect count bounds range");
  }

  const bounds = useRef({ min, max });
  const [count, setCount] = useState(start);
  const handleMutationTrigger = useCallback((event, directionOrCountItem) => {
    setCount((prevCount) => {
      const probableNextCount = prevCount + 1;
      const probablePrevCount = prevCount - 1;
      const limit = bounds.current;

      return probablePrevCount < limit.min && probableNextCount > limit.max
        ? prevCount
        : countReducer(prevCount, directionOrCountItem, event);
    });
  }, [countReducer]);
  const [bus, stats] = useOn(
    eventsList,
    handleMutationTrigger,
    name
  );

  return [
    count,
    // eslint-disable-next-line react-hooks/rules-of-hooks
    (eventName, argsTransformer) => useThen(bus, eventName, argsTransformer),
    stats
  ];
};

const useTextFilteredList = (
  eventsList = [],
  initial = [],
  { text = "", filterTaskName = "specific" },
  name = "<no name>",
) => {
  const algorithms = useContext(TextFilterAlgorithmsContext);
  const filterTextAlgorithm = algorithms[filterTaskName];

  const [controller, setController] = useState({ text, list: initial });

  const handleFilterTrigger = useCallback(
    (event, listItemKey = "") => {
      if (
        event &&
        event.type === "change" &&
        event.target instanceof Element &&
        !event.defaultPrevented
      ) {
        const searchTerm = event.target.value;
        setController((prevController) => ({
          text: searchTerm,
          list: controllerReducer(prevController, filterTextAlgorithm.apply(null, [searchTerm, initial, listItemKey]), "")
        }));
      }
    },
    [filterTextAlgorithm, initial]
  );

  const [bus, stats] = useOn(
    eventsList,
    handleFilterTrigger,
    name
  );

  return [
    controller,
    handleFilterTrigger
  ];
};

const useBrowserStorage = () => {
  return useContext(BrowserStorageContext);
};


export {
  EventBusProvider,
  BrowserStorageProvider,
  TextFilterAlgorithmsProvider,
  useUpon,
  useWhen,
  useThen,
  useBus,
  useOn,
  useBrowserStorage,
  useRouted,
  useList,
  useCount
};
