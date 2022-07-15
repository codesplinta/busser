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
      specific(filterText = "", filterList = [], filterListItemKeys = [""]) {
        return filterList.filter((filterListItem) => {
          return filterListItemKeys.reduce((finalStatusResult, filterListItemKey) => {
            const listItem =
              typeof filterListItem !== "object"
                ? filterListItem
                : extractPropertyValue(filterListItemKey, filterListItem);
            const haystack =
              typeof listItem === "string"
                ? listItem.toLowerCase()
                : String(listItem).toLowerCase();
            const needle = filterText.toLowerCase();

            return (filterText === "" || haystack.indexOf(needle) > -1) || finalStatusResult;
          }, false);
        });
      },
      fuzzy(filterText = "", filterList = [], filterListItemKeys = [""]) {
        if (filterText === "") {
          return filterList;
        }

        const characters = filterText.split("");

        /* @NOTE: flatten the multi-dimesional filtered list (array) */
        const chunks = [].concat.apply(
          [],
          characters.map((character) => {
            return filterList.filter((filterListItem) => {
              return filterListItemKeys.reduce((finalStatusResult, filterListItemKey) => {
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
              }, false);
            });
          })
        );

        return toUniqueItemList(filterListItemKeys.flatMap((filterListItemKey) => toUniqueItemList(chunks, filterListItemKey)));
      },
      complete(filterText = "", filterList = [], filterListItemKeys = [""]) {
        return filterList.filter((filterListItem) => {
          return filterListItemKeys.reduce((finalStatusResult, filterListItemKey) => {
            const listItem =
              typeof filterListItem !== "object"
                ? filterListItem
                : extractPropertyValue(filterListItemKey, filterListItem);
            const haystack =
              typeof listItem === "string" ? listItem.toLowerCase() : String(listItem).toLowerCase();
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
          }, false);
        });
      }
    })
  );

  return (
    // eslint-disable-next-line react-hooks/exhaustive-deps
    <TextFilterAlgorithmsContext.Provider value={useMemo(() => shared.current, Object.keys(shared.current))}>
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

const useBus = (
  { subscribes = [], fires = [] },
  /* @HINT: [name]: used to identify the event bus created and used in this hook */
  name = "<no name>") => {
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
    emit: function emit(event, ...data) {
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

            returned.push(handler.apply(null, data));
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
  eventName = "",
  /* @HINT: [argsTransformer]: a pure function used to simply transform arguments to a function */
  argsTransformer = (args) => args,
  /* @HINT: [name]: used to identify the event bus created and used in this hook */
  name = "<no name>"
) => {
  const busEvents = [eventName];
  const [bus] = useBus({ subscribes: busEvents, fires: busEvents }, name);

  const stableArgsTransformer = useUpon(argsTransformer);

  return useCallback(
    (...args) => {
      const argsTransformed = stableArgsTransformer(...args);
      bus.emit(event, Array.isArray(argsTransformed) ? ...argsTransformed : argsTransformed);
    },
    [bus, event, stableArgsTransformer]
  );
};

const useThen = (
  bus,
  eventName,
  /* @HINT: [argsTransformer]: a pure function used to simply transform arguments to a function */
  argsTransformer = (args) => args
) => {
  const stableArgsTransformer = useUpon(argsTransformer);

  return useCallback(
    (...args) => {
      const argsTransformed = stableArgsTransformer(...args);
      bus.emit(eventName, Array.isArray(argsTransformed) ? ...argsTransformed : argsTransformed);
    },
    [bus, eventName, stableArgsTransformer]
  );
};

const useOn = (
  eventListOrName = "",
  /* @HINT: [callback]: event handler used to respond to an event from an event bus */
  callback = () => true,
  /* @HINT: [name]: used to identify the event bus created and used in this hook */
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

const useRouted = (
  eventName,
  /* @HINT: [history]: react-router-dom history used to register a route change listener */
  history,
  /* @HINT: [name]: used to identify the event bus created and used in this hook */
  name = "<no name>"
) => {
  const listener = useWhen(
    eventName,
    (...[location, action]) => ({ location, action }),
    name
  );

  useEffect(() => {
    if (
      !history ||
      typeof history.listen !== "function" ||
      typeof eventName !== "string"
    ) {
      return () => null;
    }
    const unlisten = history.listen(listener);
    return () => unlisten();
  }, [history, listener, eventName]);
};

const usePromised = (
  eventListOrName = "",
  /* @HINT: [callback]: event handler used to respond to an event from an event bus */
  callback = () => Promise.resolve(false),
  /* @HINT: [name]: used to identify the event bus created and used in this hook */
  name = "<no name>") => {
  const handleAsyncOperation = useCallback(
    typeof eventListOrName === 'string'
      ? (payload) => {
        const result = callback(payload)
        return result instanceof Promise ? result : Promise.resolve(false)
      }
      : (event, payload) => {
        const result = callback(event, payload)
        return result instanceof Promise ? result : Promise.resolve(false)
      }
  );

  const [bus, stats] = useOn(
    eventListOrName,
    handleAsyncOperation,
    name
  );

  return [
    // eslint-disable-next-line react-hooks/rules-of-hooks
    (eventName, argsTransformer) => useThen(bus, eventName, argsTransformer),
    stats
  ];
};

const useList = (
  eventsListOrName = "",
  listReducer,
  initial = [],
  /* @HINT: [name]: used to identify the event bus created and used in this hook */
  name = "<no name>"
) => {
  const [list, setList] = useState(initial);
  const handleMutationTrigger = useCallback(
    typeof eventsListOrName !== 'string'
      ? (event, payload) => {
          setList((prevList) => {
            return listReducer(prevList, payload, event);
          });
      }
      : (payload) => {
        setList((prevList) => {
          return listReducer(prevList, payload);
        });
      },
  [listReducer]);

  const [bus, stats] = useOn(
    eventsListOrName,
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

const useCompsite = (
  eventsListOrName = "",
  compositeReducer,
  composite = {},
  /* @HINT: [name]: used to identify the event bus created and used in this hook */
  name = "<no name>"
) => {
  const [composite, setComposite] = useState({ ...composite });
  const handleMutationTrigger = useCallback(
    typeof eventsListOrName !== 'string'
      ? (event, payload) => {
          setComposite((prevComposite) => {
            return { ...compositeReducer(prevComposite, payload, event) };
          });
      }
      : (payload) => {
        setComposite((prevComposite) => {
          return { ...compositeReducer(prevComposite, payload) };
        });
      },
  [compositeReducer]);

  const [bus, stats] = useOn(
    eventsListOrName,
    handleMutationTrigger,
    name
  );

  return [
    composite,
    // eslint-disable-next-line react-hooks/rules-of-hooks
    (eventName, argsTransformer) => useThen(bus, eventName, argsTransformer),
    stats
  ];
};

const useCount = (
  eventsList = [],
  countReducer,
  { start = 0, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER },
  /* @HINT: [name]: used to identify the event bus created and used in this hook */
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
  eventsListOrName = "",
  controllerReducer,
  {
    text = "",
    initial = [],
    filterTaskName = "specific",
    fetchRemoteFilteredList = () => Promise.resolve([])
  },
  /* @HINT: [name]: used to identify the event bus created and used in this hook */
  name = "<no name>",
) => {
  const algorithms = useContext(TextFilterAlgorithmsContext);
  const filterTextAlgorithm = !algorithms ? () => ([]) : algorithms[filterTaskName];

  const [controller, setController] = useState({ text, list: initial, isLoading: false });

  const handleFilterTrigger = useCallback(
    typeof eventsListOrName !== 'string'
      ? ((filterListByText, event, payload = { listItemKeys = [""], searchText = undefined }) => {
        if (payload.searchText !== "") {
          setController((prevController) => {
            return { ...prevController, text: payload.searchText, isLoading: true }
          });
        }

        const filteredList = typeof payload.searchText !== 'undefined'
          ? filterListByText(payload.searchText, initial, payload.listItemKeys)
          : []

        if (filteredList.length) {
          fetchRemoteFilteredList(payload.searchTerm, payload.listItemKeys).then(
            (fetchedFilteredList) => setController((prevController) => {
              return { list: controllerReducer(
                {
                  original: initial,
                  unfiltered: prevController.list,
                  filtered: fetchedFilteredList
                }, payload, event
              ), text: prevController.text, isLoading: false }
            })
          );
          return;
        }

        setController((prevController) => {
          return { list: controllerReducer(
            {
              original: initial,
              unfiltered: prevController.list,
              filtered: filteredList
            }, payload, event
          ), text: payload.searchText, isLoading: false }
        });
      }).bind(null, filterTextAlgorithm)
      : ((filterListByText, payload = { listItemKeys = [""], searchText = undefined }) => {
        if (payload.searchText !== "") {
          setController((prevController) => {
            return { ...prevController, text: payload.searchText, isLoading: true }
          });
        }

        const filteredList = typeof payload.searchText !== 'undefined'
          ? filterListByText(payload.searchText, initial, payload.listItemKeys)
          : []

        if (filteredList.length) {
          fetchRemoteFilteredList(payload.searchTerm, payload.listItemKeys).then(
            (fetchedFilteredList) => setController((prevController) => {
              return { list: controllerReducer(
                {
                  original: initial,
                  unfiltered: prevController.list,
                  filtered: fetchedFilteredList
                }, payload
              ), text: prevController.text, isLoading: false }
            })
          );
          return;
        }

        setController((prevController) => {
          return { list: controllerReducer(
            {
              original: initial,
              unfiltered: prevController.list,
              filtered: filteredList
            }, payload
          ), text: payload.searchText, isLoading: false }
        });
      }).bind(null, filterTextAlgorithm),
    [controllerReducer]
  )

  const [bus, stats] = useOn(
    eventsListOrName,
    handleFilterTrigger,
    name
  );

  return [
    controller,
    // eslint-disable-next-line react-hooks/rules-of-hooks
    (eventName, argsTransformer) => useThen(bus, eventName, argsTransformer),
    stats
  ];
};

const useBrowserStorage = () => {
  return useContext(BrowserStorageContext);
};


export {
  EventBusProvider,
  BrowserStorageProvider,
  TextFilterAlgorithmsProvider,
  useTextFilteredList,
  useBrowserStorage,
  useComposite,
  usePromised,
  useRouted,
  useCount,
  useList,
  useUpon,
  useWhen,
  useThen,
  useBus,
  useOn
};
