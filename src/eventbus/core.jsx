import React, {
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef
} from "react";
import {
  useSignalsState,
} from '../common/index';

const EventBusContext = React.createContext(null);

function EventBusProvider({ children }) {
  const [handlers] = useMemo(() => ({}), []);
  return (
    <EventBusContext.Provider value={handlers}>
      {children}
    </EventBusContext.Provider>
  );
}

/**!
 * `useBus()` ReactJS hook
 */

const useBus = (
  { subscribes = [], fires = [] },
  /* @HINT: [name]: used to identify the event bus created and used in this hook */
  name = "<no name>"
) => {
  const handlers = useContext(EventBusContext);
  const stats = useRef({
    eventsFired: {},
    eventsFiredCount: 0,
    eventsSubscribed: {},
    eventsSubscribedCount: 0
  });

  if (typeof handlers === "undefined" || handlers === null) {
    throw new Error('[react-busser]: "useBus()" must be used with the <EventBusProvider>');
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
    emit: function emit(eventName, ...data) {
      const returned = [];
      
      /* @TODO: Implement list of events names to be triggered by calling their handlers */
      /* for () { */
        if ((eventName in handlers) && fires.indexOf(eventName) > -1) {
          const allHandlers = handlers[eventName];

          for (
            let handlersCount = 0;
            handlersCount < allHandlers.length;
            handlersCount++
          ) {
            const handler = allHandlers[handlersCount];
            if (typeof handler === "function") {
              stats.current.eventsFiredCount++;
              if (typeof stats.current.eventsFired[eventName] === "undefined") {
                stats.current.eventsFired[eventName] = {};
              }

              stats.current.eventsFired[eventName].timestamp = Date.now();
              stats.current.eventsFired[eventName].data = data;
              stats.current.eventsFired[eventName].name = name;

              returned.push(handler.apply(null, data));
            }
          }
        }
      /* } */

      return returned;
    }
  }).current;

  return [Object.freeze(bus), stats.current];
};

/**!
 * `useUpon()` ReactJS hook
 */

const useUpon = (callback = () => null) => {
  if (typeof callback !== "function") {
    throw new Error("[react-busser]: callback not found!");
  }

  const callbackRef = useRef(callback);
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
      bus.emit.apply(
        bus,
        Array.isArray(argsTransformed)
          ? [eventName, ...argsTransformed]
          : [eventName, argsTransformed]
      );
    },
    [bus, eventName, stableArgsTransformer]
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
      bus.emit.apply(
        bus,
        Array.isArray(argsTransformed)
          ? [eventName, ...argsTransformed]
          : [eventName, argsTransformed]
      );
    },
    [bus, eventName, stableArgsTransformer]
  );
};

/**!
 * `useOn()` ReactJS hook
 */

const useOn = (
  eventListOrName = "",
  /* @HINT: [callback]: event handler used to respond to an event from an event bus */
  callback = () => true,
  /* @HINT: [name]: used to identify the event bus created and used in this hook */
  name = "<no name>"
) => {
  const isEventAList =
    Array.isArray(eventListOrName) || typeof eventListOrName !== "string";
  const busEvents = useRef(
    isEventAList ? eventListOrName : [eventListOrName]
  ).current;
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
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [bus, busEvents, stableCallbacks]);

  return [bus, stats];
};

/**!
 * `useRoutingBlocked()` ReactJS hook
 */

const useRoutingBlocked = (
  /* @HINT: [eventName]: the name of the event fired when the router should be blocked  page */
  eventName,
  /* @HINT: [history]: react-router-dom history used to register a route change listener */
  history,
  /* @HINT: [name]: used to identify the event bus created and used in this hook */
  name = "<no name>",
  /* @HINT: */
  callback = () => [false, "Are you sure ?"]
) => {
  const listener = useWhen(
    eventName,
    (args) => args,
    name
  );
  
  const $callback = useUpon(callback);

  useEffect(() => {
    if (
      !history ||
      typeof history.block !== "function" ||
      typeof eventName !== "string"
    ) {
      return () => null;
    }
    const unblock = history.block((...args) => {
      const [isNotOk, promptMessage] = $callback(...args);
      
      if (isNotOk) {
        const confirmationOk = window.confirm(promptMessage);
        if (confirmationOk) {
          unblock();
          listener([...args, true]);
        } else {
          listener([...args, false]);
          return false;
        }
      }
    });
    return () => unblock();
  }, [history, listener, eventName, $callback]);
};

/**!
 * `useRoutingChanged()` ReactJS hook
 */

const useRoutingChanged = (
  /* @HINT: [eventName]: the name of the event fired when the router navigates to a different page */
  eventName,
  /* @HINT: [history]: react-router-dom history used to register a route change listener */
  history,
  /* @HINT: [name]: used to identify the event bus created and used in this hook */
  name = "<no name>",
  /* @HINT: */
  callback = () => undefined
) => {
  const listener = useWhen(
    eventName,
    (...[location, action]) => ({ location, action }),
    name
  );

  const $callback = useUpon(callback);

  useEffect(() => {
    if (
      !history ||
      typeof history.listen !== "function" ||
      typeof eventName !== "string"
    ) {
      return () => null;
    }
    const unlisten = history.listen((...args) => {
      $callback();
      listener(...args)
    });
    return () => unlisten();
  }, [history, listener, eventName, $callback]);
};

/**!
 * `usePromised()` ReactJS hook
 */

const usePromised = (
  eventListOrName = "",
  /* @HINT: [callback]: event handler used to respond to an event from an event bus */
  callback = () => Promise.resolve(false),
  /* @HINT: [name]: used to identify the event bus created and used in this hook */
  name = "<no name>"
) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleAsyncOperation = useCallback(
    typeof eventListOrName === "string"
      ? (payload) => {
          const result = callback(payload);
          return result instanceof Promise ? result : Promise.resolve(false);
        }
      : (event, payload) => {
          const result = callback(event, payload);
          return result instanceof Promise ? result : Promise.resolve(false);
        }
  );

  const [bus, stats] = useOn(eventListOrName, handleAsyncOperation, name);

  return [
    // eslint-disable-next-line react-hooks/rules-of-hooks
    (eventName, argsTransformer) => useThen(bus, eventName, argsTransformer),
    stats
  ];
};

/**!
 * `useBus()` ReactJS hook
 */

const useList = (
  eventsListOrName = "",
  listReducer,
  initial = [],
  /* @HINT: [name]: used to identify the event bus created and used in this hook */
  name = "<no name>"
) => {
  const [list, setList] = useState(initial);
  const [error, setError] = useState(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleMutationTrigger = useCallback(
    typeof eventsListOrName !== "string"
      ? (event, payload) => {
          setList((prevList) => {
            let nextList;
            try {
              nextList = listReducer(prevList, payload, event);
            } catch (e) {
              setError(e);
            }

            return nextList;
          });
        }
      : (payload) => {
          setList((prevList) => {
            let nextList;
            try {
              nextList = listReducer(prevList, payload);
            } catch (e) {
              setError(e);
            }

            return nextList;
          });
        },
    [listReducer]
  );

  const [bus, stats] = useOn(eventsListOrName, handleMutationTrigger, name);

  return [
    list,
    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    (eventName, argsTransformer) => useThen(bus, eventName, argsTransformer),
    error,
    stats
  ];
};

/**!
 * `useSignalsList()` ReactJS hook
 */

const useSignalsList = (
  eventsListOrName = "",
  listReducer,
  initial = [],
  /* @HINT: [name]: used to identify the event bus created and used in this hook */
  name = "<no name>"
) => {
  const [list, setList] = useSignalsState(initial);
  const [error, setError] = useSignalsState(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleMutationTrigger = useCallback(
    typeof eventsListOrName !== "string"
      ? (event, payload) => {
          setList((prevList) => {
            let nextList;
            try {
              nextList = listReducer(prevList, payload, event);
            } catch (e) {
              setError(e);
            }

            return nextList;
          });
        }
      : (payload) => {
          setList((prevList) => {
            let nextList;
            try {
              nextList = listReducer(prevList, payload);
            } catch (e) {
              setError(e);
            }

            return nextList;
          });
        },
    [listReducer]
  );

  const [bus, stats] = useOn(eventsListOrName, handleMutationTrigger, name);

  return [
    list,
    // eslint-disable-next-line react-hooks/rules-of-hooks
    (eventName, argsTransformer) => useThen(bus, eventName, argsTransformer),
    stats
  ];
};

/**!
 * `useComposite()` ReactJS hook
 */

const useComposite = (
  eventsListOrName = "",
  compositeReducer,
  initial = {},
  /* @HINT: [name]: used to identify the event bus created and used in this hook */
  name = "<no name>"
) => {
  const [composite, setComposite] = useState({ ...initial });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleMutationTrigger = useCallback(
    typeof eventsListOrName !== "string"
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
    [compositeReducer]
  );

  const [bus, stats] = useOn(eventsListOrName, handleMutationTrigger, name);

  return [
    composite,
    // eslint-disable-next-line react-hooks/rules-of-hooks
    (eventName, argsTransformer) => useThen(bus, eventName, argsTransformer),
    stats
  ];
};

/**!
 * `useSignalsComposite()` ReactJS hook
 */

const useSignalsComposite = (
  eventsListOrName = "",
  compositeReducer,
  initial = {},
  /* @HINT: [name]: used to identify the event bus created and used in this hook */
  name = "<no name>"
) => {
  const [composite, setComposite] = useSignalsState({ ...initial });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleMutationTrigger = useCallback(
    typeof eventsListOrName !== "string"
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
    [compositeReducer]
  );

  const [bus, stats] = useOn(eventsListOrName, handleMutationTrigger, name);

  return [
    composite,
    // eslint-disable-next-line react-hooks/rules-of-hooks
    (eventName, argsTransformer) => useThen(bus, eventName, argsTransformer),
    stats
  ];
};

/**!
 * `useCount()` ReactJS hook
 */

const useCount = (
  /* @HINT: [eventsList]: this list of events */
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
    throw new Error('[react-busser]: "useCount()" incorrect count bounds data type');
  }

  if (start < min || start > max) {
    throw new Error('[react-busser]: "useCount()" incorrect count bounds range');
  }

  const bounds = useRef({ min, max });
  const [count, setCount] = useState(start);
  const handleMutationTrigger = useCallback(
    (event, directionOrCountItem) => {
      setCount((prevCount) => {
        const probableNextCount = prevCount + 1;
        const probablePrevCount = prevCount - 1;
        const limit = bounds.current;

        return probablePrevCount < limit.min && probableNextCount > limit.max
          ? prevCount
          : countReducer(prevCount, directionOrCountItem, event);
      });
    },
    [countReducer]
  );
  const [bus, stats] = useOn(eventsList, handleMutationTrigger, name);

  return [
    count,
    // eslint-disable-next-line react-hooks/rules-of-hooks
    (eventName, argsTransformer) => useThen(bus, eventName, argsTransformer),
    stats
  ];
};

/**!
 * `useSignalsCount()` ReactJS hook
 */

const useSignalsCount = (
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
    throw new Error('[react-busser]: "useSignalCount()" incorrect count bounds data type');
  }

  if (start < min || start > max) {
    throw new Error('[react-busser]: "useSignalCount()" incorrect count bounds range');
  }

  const bounds = useRef({ min, max });
  const [count, setCount] = useSignalsState(start);
  const handleMutationTrigger = useCallback(
    (event, directionOrCountItem) => {
      setCount((prevCount) => {
        const probableNextCount = prevCount + 1;
        const probablePrevCount = prevCount - 1;
        const limit = bounds.current;

        return probablePrevCount < limit.min && probableNextCount > limit.max
          ? prevCount
          : countReducer(prevCount, directionOrCountItem, event);
      });
    },
    [countReducer]
  );
  const [bus, stats] = useOn(eventsList, handleMutationTrigger, name);

  return [
    count,
    // eslint-disable-next-line react-hooks/rules-of-hooks
    (eventName, argsTransformer) => useThen(bus, eventName, argsTransformer),
    stats
  ];
};

export {
  EventBusProvider,
  useTextFilteredList,
  useSignalsComposite,
  useRoutingBlocked,
  useRoutingChanged,
  useSignalsCount,
  useSignalsList,
  useComposite,
  usePromised,
  useCount,
  useList,
  useUpon,
  useBus,
  useOn
};
