import { useState, useMemo, useEffect } from 'react'
import { useEventBus } from '../eventbus/core'

function isEmpty(value) {
  return (
      value === null || // check for null
      value === undefined || // check for undefined
      value === '' || // check for empty string
      (Array.isArray(value) && value.length === 0) || // check for empty array
      (typeof value === 'object' && Object.keys(value).length === 0) // check for empty object
  );
}

export const useUIStateManager = ({ state = {}, events = [], updater = () => ({}) }) => {
  const allSubscribedEvents = ['request:started', 'request:ended', 'request:aborted'].concat(events)

  const [uiState, setUIState] = useState(state);
  const eventBus = useEventBus(allSubscribedEvents, []);
 
  useEffect(() => {
    allSubscribedEvents.forEach((subscribedEvent) => {
      eventBus.on(subscribedEvent, ({ success, error, metadata }) => {
         const updateUIState = updater(subscribedEvent, { success, error, metadata }) 
         if (!isEmpty(updateUIState)) {
           setUIState(Object.assign(uiState, updateUIState))
         }
      });
    });

    return () => {
      eventBus.off();
    }
  }, []);

  const state = useMemo(() => {
    uiState
  ), [uiState])

  return [ state, setUIState ];
}
