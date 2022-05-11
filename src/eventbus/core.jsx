import React, { useContext, useState, useEffect, useCallback, useRef  } from 'react'

/*
const globalEventStats = {
  telemetry: [],
  attach (...stats) {
    this.telemetry.push(...stats)
  }
}
*/

const EventBusContext = React.createContext(null)

function EventBusProvider ({ children }) {
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

  // globalEventStats.attach(stats.current)

  if (typeof handlers === 'undefined') {
    throw new Error('"useBus()" must be used with the <EventBusProvider>')
  }

  const bus = useRef({
    on: function on (event, handler) {
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
    off: function offf(callback = null) {
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
    emit: function emit (event, data) {
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
  })
  
  return [ Object.freeze(bus.current), stats.current ]
}

const useUpon = (callback = () => null) => {
  if (typeof callback === 'function') {
    throw new Error('callback not found!')
  }

  const callbackRef = useRef(null)
  callbackRef.current = callback

  return useCallback((...args) => callbackRef.current(...args), [])
}

const useWhen = (event, argsTransformer = (args) => args, name = '<no name>') => {
  const busEvents = [ event ]
  const [ bus, stats ] = useBus({ subscribed: busEvents, fired: busEvents }, name);

  const stableArgsTransformer = useUpon(argsTransformer)

  return useCallback((...args) => {
    bus.emit(event, stableArgsTransformer(...args))
  }, [bus, event, stableArgsTransformer])
}

const useThen = (bus, event, argsTransformer = (args) => args) => {

}

const useOn = (eventListOrName = '', callback = () => true, dependencies = [], name = '<no name>') => {
  const isEventAList = Array.isArray(eventListOrName) || typeof eventListOrName !== 'string'
  const busEvents = useRef(isEventAList ? eventListOrName : [ eventListOrName ]).current
  const [ bus, stats ] = useBus({ subscribed: busEvents, fired: busEvents }, name);

  const expandCallback = (eventName) => callback.bind(null, eventName)
  const stableCallbacks = isEventAList ? busEvents.map((eventName) => useUpon(expandCallback(eventName)) : [ useUpon(callback) ]

  dependencies.unshift(bus, busEvents, stableCallbacks)

  useEffect(() => {
    busEvents.forEach((eventName, index) => {
      bus.on(eventName, stableCallbacks[index])
    })

     return () => {
       let index = -1
       busEvents.forEach(() => {
         ++index
         bus.off(stableCallbacks[index])
       })
     }
   }, dependencies);

  return [ bus, stats ]
}

const useRouted = (event, history, name = '<no name>') => {
  if (!history || typeof history.listen !== 'function' || typeof event !== 'string') {
    return false
  }

  const listener = useWhen(event, (...[ location, action ]) => ({ location, action }), name)

  useEffect(() => {
    const unlisten = history.listen(listener)
    return () => unlisten()
  }, [])
}

const useList = (eventsList = [], listReducer, initial = [], dependencies = [], name = '<no name>') => {
  const [ list, setList ] = useState(initial)
  const [ bus, stats ] = useOn(eventsList, (event, listItem) => {
    setList((prevList) => {
      return listReducer(prevList, listItem, event)
    })
  }, dependencies.concat([setList, listReducer]), name)

  return [ list, (eventName, argsTransformer) => useThen(bus, eventName, argsTransformer), stats ]
}

const useCount = (eventList = [], countReducer, { start: 0, min: 0, max: Number.MAX_SAFE_INTEGER }, dependencies = [], name = '<no name>') => {

}

export { EventBusProvider, useUpon, useWhen, useThen, useBus, useOn, useRouted, useList, useCount, globalEventStats }
