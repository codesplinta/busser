export type EventBus = {
  on: (eventNameOrList: string | Array<string>, eventCallback: Function) => void,
  off: (eventCallback: Function) => void,
  emit: (eventName: string, data: unknown) => void 
};

type TextSearchQueryController<T> = {
  text: string,
  isLoading: boolean,
  page: number,
  list: T[]
}

type SubscribedEventsStatsData = {
  timestamp: number,
  name: string,
};

type FiredEventsStatsData = {
  timestamp: number,
  name: string,
  data: unknown
};

type TextSearchQueryUpdateCallback = (controller?: TextSearchQueryController<T>, setter?: import('react').Dispatch<React.SetStateAction<TextSearchQueryController<T>>>) => () => void;

type TextSearchQueryChangeEventHandler = (event: import('react').ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, listItemKey?: string[]) => void;

export type EventBusStats = {
  eventsFired: { [key: string]: FiredEventsStatsData },
  eventsFiredCount: number,
  eventsSubscribed: { [key: string]: SubscribedEventsStatsData },
  eventsSubscribedCount: number
};

type SharedStateBoxContext<T extends Record<string, {}> = { "" : {} }> = {
  dispatch: (payload: { slice?: string & keyof T, value: T[keyof T] }) => void,
  subscribe: (callback: Function, key: string) => () => void,
  getState: ((key: string & keyof T) => T[keyof T]) | ((key: "") => T), 
}

export type BrowserStorage = {
  getFromStorage<T extends unknown>(key: string, defaultPayload: T): T | null;
  setToStorage: (key: string, value: object | null) => boolean;
  clearFromStorage: () => boolean;
}

export type TextSearchQueryPageOptions<T> = {
  text: string,
  page?: number,
  list: T[]
};

export type TextSearchQueryOptions<T> = {
  filterTaskName?: "specific" | "fuzzy" | "complete",
  fetchRemoteFilteredList?: (text?: string, searchKey?: string[]) => Promise<T[]>,
  filterUpdateCallback?: TextSearchQueryUpdateCallback
};

export type TextSearchQuery<T> = [
  TextSearchQueryController<T>,
  TextSearchQueryChangeEventHandler
];

export type EventBusDetails = [
  EventBus,
  EventBusStats
];

export type ListDetails<L extends unknown[], I = {}, O = {}> = [
  L,
  (eventName: string, argumentTransformer: ((arg: I) => O)) => ((arg: I) => void),
  EventBusStats
];

export type CountDetails<I = {}, O = {}> = [
  number,
  (eventName: string, argumentTransformer: ((arg: I) => O)) => ((arg: I) => void),
  EventBusStats
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
  { subscribes: Array<string>, fires: Array<string> },
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
export function useCount<I, O>(
  eventNamesOrEventNameList: string | Array<string>,
  countReducer: Function,
  options: { start?: number, min?: number, max?: number },
  ownerName?: string
): CountDetails<I, O>;
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
export function useBrowserStorage({
  storageType: "session" | "local"
}): BrowserStorage;
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
export function useTextFilteredList<T>(
  textQueryPageOptions: TextSearchQueryPageOptions<T>,
  textQueryOptions: TextSearchQueryOptions<T>
): TextSearchQueryResult<T>;
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
export function useBrowserStorageWithEncryption({
  storageType: "session" | "local"
}): BrowserStorage;
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
export function useRoutingBlocked(): ;
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
export function useSharedState(
  slice?: string 
): [
  {},
  Function
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
export function useBeforePageUnload(): ;
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
export function useUIDataFetcher(): ;
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
export function useFetchBinder(): ;


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
