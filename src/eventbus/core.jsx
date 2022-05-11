import React, {
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef
} from "react";

const EventBusContext = React.createContext(null);

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
  const [bus, stats] = useOn(
    eventsList,
    (event, listItem) => {
      setList((prevList) => {
        return listReducer(prevList, listItem, event);
      });
    },
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
  { start = 0, min = 0, max = Number.MAX_SAFE_INTEGER },
  name = "<no name>"
) => {
  if (
    typeof start !== "number" ||
    typeof min !== "number" ||
    typeof max !== "number"
  ) {
    throw new Error("incorrect count bounds data type");
  }

  if (start < min || start > max) {
    throw new Error("incorrect count bounds range");
  }

  const bounds = useRef({ min, max });
  const [count, setCount] = useState(start);
  const [bus, stats] = useOn(
    eventsList,
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
    name
  );

  return [
    count,
    // eslint-disable-next-line react-hooks/rules-of-hooks
    (eventName, argsTransformer) => useThen(bus, eventName, argsTransformer),
    stats
  ];
};

export {
  EventBusProvider,
  useUpon,
  useWhen,
  useThen,
  useBus,
  useOn,
  useRouted,
  useList,
  useCount
};
