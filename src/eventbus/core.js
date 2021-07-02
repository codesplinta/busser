import React, { useContext, useReducer } from 'react'

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
  const handlers = {}
  return <EventBusContext.Provider value={handlers}>{children}</EventBusContext.Provider>
}

const useEventBus = (subscribed, fired = []) => {
  const handlers = useContext(EventBusContext)
  
  if (typeof handlers === 'undefined') {
    throw new Error('"useEventBus()" must be used with the <EventBusProvider>')
  }

  return {
    on: function (event, handler) {
      if (event in handlers && subscribed.indexOf(event)) {
        return false
      }
      handlers[event] = handler;
    },
    off: function() {
      for (let eventCount = 0; eventCount < subscribed.length; eventCount++) {
        delete handlers[event];
      }
    },
    emit: function (event, data) {
      if (event in handlers && fired.indexOf(event)) {
        const handler = handlers[event];
        if (typeof handler === 'function') {
          handler.call(null, data);
        }
      }
    }
  }
}

export { EventBusProvider, useEventBus }
