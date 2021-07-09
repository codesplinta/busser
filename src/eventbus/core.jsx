import React, { useContext, useState, /* useReducer */ } from 'react'

const EventBusContext = React.createContext()

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

const useEventBus = (subscribed = [], fired = []) => {
  const handlers = useContext(EventBusContext)
  
  if (typeof handlers === 'undefined') {
    throw new Error('"useEventBus()" must be used with the <EventBusProvider>')
  }

  const bus = {
    on: function (event, handler) {
      if (!(event in handlers) && subscribed.indexOf(event) === -1) {
        return false;
      }

      if (!handlers[event]) {
        handlers[event] = [];
      }

      handlers[event].push(handler);
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
      if (event in handlers && fired.indexOf(event) > -1) {
        const allHandlers = handlers[event];
        for (
          let handlersCount = 0;
          handlersCount < allHandlers.length;
          handlersCount++
        ) {
          const handler = allHandlers[handlersCount];
          if (typeof handler === "function") {
            handler.call(null, data);
          }
        }
      }
    }
  }
  
  return Object.freeze(bus)
}

export { EventBusProvider, useEventBus }
