export type EventBus = {
  on: (eventNameOrList: string | Array<string>, eventCallback: Function) => void,
  off: (eventCallback: Function) => void,
  emit: (eventName: string, data: unknown) => void 
};

type SubscribedEventsStatsData = {
  timestamp: number,
  name: string,
};

type FiredEventsStatsData = {
  timestamp: number,
  name: string,
  data: unknown
};

type EventBusDetails = [
  EventBus,
  {
    eventsFired: { [key: string]: FiredEventsStatsData },
    eventsFiredCount: number,
    eventsSubscribed: { [key: string]: SubscribedEventsStatsData },
    eventsSubscribedCount: number
  }
];

type ListDetails<L extends unknown[], I = {}, O = {}> = [
  L,
  (eventName: string, argumentTransformer: ((arg: I) => O)) => ((arg: I) => void)
];

type CountDetails = [
  number
];

/**
 *
 *
 * @param
 * @param
 * @param
 * @param
 *
 * @returns
 *
 */
export function useBus(
  config: { subscribes: Array<string> , fires: Array<string> },
  ownerName?: string
): EventBusDetails;
/**
 *
 *
 * @param
 * @param
 * @param
 * @param
 *
 * @returns
 *
 */
export function useList<L, I, O>(
  eventNameOrEventNameList: string | Array<string>,
  listReducer: Function,
  list: L,
  ownerName?: string
): ListDetails<L, I, O>;
/**
 *
 *
 * @param
 * @param
 * @param
 * @param
 *
 * @returns
 *
 */
export function useCount(
  eventNamesOrEventNameList: string | Array<string>,
  countReducer: Function,
  options: { start?: number, min?: number, max?: number },
  ownerName?: string
): CountDetails;
/**
 *
 *
 * @param
 * @param
 * @param
 * @param
 *
 * @returns
 *
 */
export function useOn(): ;
/**
 *
 *
 * @param
 * @param
 * @param
 * @param
 *
 * @returns
 *
 */
export function useComposite(): ;
/**
 *
 *
 * @param
 * @param
 * @param
 * @param
 *
 * @returns
 *
 */
export function usePromised(): ;
/**
 *
 *
 * @param
 * @param
 * @param
 * @param
 *
 * @returns
 *
 */
export function useOutsideClick(): ;
/**
 *
 *
 * @param
 * @param
 * @param
 * @param
 *
 * @returns
 *
 */
export function useHttpSignals(): ;
/**
 *
 *
 * @param
 * @param
 * @param
 * @param
 *
 * @returns
 *
 */
export function useBrowserStorage(): ;
/**
 *
 *
 * @param
 * @param
 * @param
 * @param
 *
 * @returns
 *
 */
export function useTextFilteredList(): ;
/**
 *
 *
 * @param
 * @param
 * @param
 * @param
 *
 * @returns
 *
 */
export function useBrowserStorageWithEncryption(): ;
/**
 *
 *
 * @param
 * @param
 * @param
 * @param
 *
 * @returns
 *
 */
export function useRoutingChanged(): ;
/**
 *
 *
 * @param
 * @param
 * @param
 * @param
 *
 * @returns
 *
 */
export function useRoutingBBlocked(): ;
/**
 *
 *
 * @param
 * @param
 * @param
 * @param
 *
 * @returns
 *
 */
export function useRoutingMonitor(): ;
/**
 *
 *
 * @param
 * @param
 * @param
 * @param
 *
 * @returns
 *
 */
export function useSharedState(): ;
/**
 *
 *
 * @param
 * @param
 * @param
 * @param
 *
 * @returns
 *
 */
export function useUnsavedChangesLock(): ;
/**
 *
 *
 * @param
 * @param
 * @param
 * @param
 *
 * @returns
 *
 */
export function useSearchParamsState(): ;
/**
 *
 *
 * @param
 * @param
 * @param
 * @param
 *
 * @returns
 *
 */
export function useControlKeysPress(): ;
/**
 *
 *
 * @param
 * @param
 * @param
 * @param
 *
 * @returns
 *
 */
export function : ;
/**
 *
 *
 * @param
 * @param
 * @param
 * @param
 *
 * @returns
 *
 */
export function : ;
/**
 *
 *
 * @param
 * @param
 * @param
 * @param
 *
 * @returns
 *
 */
export function : ;
/**
 *
 *
 * @param
 * @param
 * @param
 * @param
 *
 * @returns
 *
 */
export function : ;

/**
 * Provider for using the useBus() hook.
 *
 * @param {{ children?: import('react').ReactNode }} props
 */
export function EventBusProvider({ children }: {
    children?: import('react').ReactNode;
}): JSX.Element;

/**
 * Provider for using the useSharedState() hook.
 *
 * @param {{ children?: import('react').ReactNode }} props
 */
export function SharedStateProvider({ children, initialGlobalState, persistence }: {
    children?: import('react').ReactNode;
    initialGlobalState?: Record<string, unknown>;
    persistence?: { persistOn: "none" | "local" | "session", persistKey: string }
}): JSX.Element;
