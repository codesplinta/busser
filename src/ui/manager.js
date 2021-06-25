import { useState } from 'react'
import { useEventBus } from '../eventbus/core'

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

  return [ uiState, setUIState ];
}
