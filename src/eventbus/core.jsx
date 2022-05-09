import React, { useContext, useState, useEffect, useCallback, useRef /*, useReducer */ } from 'react'

const globalEventStats = {
  telemetry: [],
  attach (...stats) {
    this.telemetry.push(...stats)
  }
}

const EventBusContext = React.createContext(null)

/* function controllerReducer(state, action) {
  switch(action.type) {
    case 'update:scroll':
      return Object.assign(state, { scrollPosition: action.payload })
    break;
    case 'update:focus': 
      return Object.assign(state, { windowHasFocus: action.payload }}
    break;
    default:
      throw new Error(`Unhandled action type: “${action.type}”`)
    break;
  }
} */

function EventBusProvider ({ children }) {
  /* const [ state, dispatch ] = useReducer(controllerReducer, {
    scrollPosition: 0, 
    windowHasFocus: true
  })
  const controller = { state, dispatch } */
  const [ handlers ] = useState(() => ({}))
  return <EventBusContext.Provider value={handlers}>{children}</EventBusContext.Provider>
}

const useBus = ({ subscribed = [], fired = [] }, name = '<no name>') => {
  const handlers = useContext(EventBusContext)
  const stats = useRef({
    eventsFired: {},
    eventsFiredCount: 0,
    eventsSubscribed: {},
    eventsSubscribedCount: 0
  })

  globalEventStats.attach(stats.current)

  if (typeof handlers === 'undefined') {
    throw new Error('"useBus()" must be used with the <EventBusProvider>')
  }

  const bus = {
    on: function (event, handler) {
      if (!(event in handlers) && subscribed.indexOf(event) === -1) {
        return false;
      }

      if (!handlers[event]) {
        handlers[event] = [];
      }

      if (typeof handler === 'function') {
        subscribed.push(event)
        stats.current.eventsSubscribedCount++
        if (typeof stats.current.eventsSubscribed[event] === 'undefined') {
          stats.current.eventsSubscribed[event] = {}
        }

        stats.current.eventsSubscribed[event].timestamp = Date.now()
        stats.current.eventsSubscribed[event].name = name

        handlers[event].push(handler);
      }
    },
    off: function (callback = null) {
      for (let eventCount = 0; eventCount < subscribed.length; eventCount++) {
        const event = subscribed[eventCount];
        const eventHandlers = handlers[event];
        const index = eventHandlers.indexOf(callback);

        if (index !== -1) {
          eventHandlers.splice(index, 1);
        } else {
          delete handlers[event];
        }
      }
    },
    emit: function (event, data) {
      const returned = []
      if (event in handlers && fired.indexOf(event) > -1) {
        const allHandlers = handlers[event];

        for (
          let handlersCount = 0;
          handlersCount < allHandlers.length;
          handlersCount++
        ) {
          const handler = allHandlers[handlersCount];
          if (typeof handler === "function") {
            stats.current.eventsFiredCount++
            if (typeof stats.current.eventsFired[event] === 'undefined') {
              stats.current.eventsFired[event] = {}
            }

            stats.current.eventsFired[event].timestamp = Date.now()
            stats.current.eventsFired[event].data = data
            stats.current.eventsFired[event].name = name

            returned.push(handler.call(null, data));
          }
        }
      }
      return returned
    }
  }
  
  return [ Object.freeze(bus), stats.current ]
}

const useUpon = (callback = () => null) => {
  const callbackRef = useRef(null)
  callbackRef.current = callback

  return useCallback((...args) => callbackRef.current(...args), [])
}

const useWhen = (event, argsTransform = (args) => args, name = '<no name>') => {
  const [ bus, stats ] = useBus({ subscribed: [ event ], fired: [ event ] }, name);

  return useCallback((...args) => {
    bus.emit(event, argsTransform(args))
  }, [bus, event, useUpon(argsTransform)])
}

const useOn = (event = '', callback = () => true, dependencies = [], name = '<no name>') => {
  const [ bus, stats ] = useBus({ subscribed: [ event ], fired: [ event ] }, name);

  dependencies.unshift(bus, event)

  const stableCallback = useUpon(callback)

  useEffect(() => {
     bus.on(event, stableCallback)

     return () => {
        bus.off(stableCallback)
     }
   }, dependencies);

  return [ bus, stats ]
}

const usePageRouted = (event, history, name = '<no name>') => {
  if (!history || typeof history.listen !== 'function' || typeof event !== 'string') {
    return false
  }

  const listener = useWhen(event, (...[ location, action ]) => ({ location, action }), name)

  useEffect(() => {
    const unlisten = history.listen(listener)
    return () => unlisten()
  }, [])
}

export { EventBusProvider, useUpon, useWhen, useBus, useOn, usePageRouted, globalEventStats }
