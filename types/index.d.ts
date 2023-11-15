type JSObject = { [key: string]: unknown };

type JSONObject<D = JSObject> = object | Record<keyof D, string | boolean | number | null | undefined>;

type SerializableValues<D = object> = string | number | boolean | null | undefined | JSONObject<D>;

export type EventBus = {
  on: (eventNameOrList: string | Array<string>, eventCallback: Function) => void,
  off: (eventCallback: Function) => void,
  emit: (eventName: string, data: unknown) => void 
};

export type TextSearchQueryController<T> = {
  text: string,
  isLoading: boolean,
  page: number,
  list: T[]
};

export type SubscribedEventsStatsData = {
  timestamp: number,
  name: string,
};

export type FiredEventsStatsData = {
  timestamp: number,
  name: string,
  data: unknown
};

export type TextSearchQueryUpdateCallback = (controller?: TextSearchQueryController<T>, setter?: import('react').Dispatch<React.SetStateAction<TextSearchQueryController<T>>>) => () => void;

export type TextSearchQueryChangeEventHandler = (event: import('react').ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, listItemKey?: string[]) => void;

export type EventBusStats = {
  eventsFired: { [key: string]: FiredEventsStatsData },
  eventsFiredCount: number,
  eventsSubscribed: { [key: string]: SubscribedEventsStatsData },
  eventsSubscribedCount: number
};

export type SharedStateBoxContext<T extends Record<string, {}> = { "" : {} }> = {
  dispatch: (payload: { slice?: string & keyof T, value: T[keyof T] }) => void,
  subscribe: (callback: Function, key: string) => () => void,
  getState: ((key: string & keyof T) => T[keyof T]) | ((key: "") => T), 
};

export type BrowserStorage = {
  getFromStorage<T extends SerializableValues>(key: string, defaultPayload: T): T;
  setToStorage: (key: string, value: SerializableValues) => boolean;
  clearFromStorage: (key: string) => boolean;
};

export type BrowserStorageOptions = {
  storageType: "session" | "local"
};

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

type HttpSignalsPayload = {
  success: string | null,
  error: Error | null,
  metadata: Record<string, string | number | boolean>
};

export type HttpSignalsResult = {
  stats: EventBusStats,
  signalRequestStarted: (eventPayload: HttpSignalsPayload) => void,
  signalRequestEnded: (eventPayload: HttpSignalsPayload) => void,
  signalRequestAborted: (eventPayload: HttpSignalsPayload) => void,
  signalCleanup: (eventPayload: HttpSignalsPayload) => void
};

export type RoutingMonitorOptions = {
  setupPageTitle?: boolean,
  onNavigation?: (
    history: import('history').History,
    navigationDetails: {
      documentTitle?: string,
      previousPathname: string,
      currentPathname: string,
      navigationDirection: number
    }
  ) => void,
  getUserConfirmation: Function,
  unsavedChangesRouteKeysMap?: Record<string, string>,
  documentTitlePrefix?: string,
  appPathnamePrefix?: string,
  promptMessage?: string,
  shouldBlockRoutingTo?: () => boolean
};

export type UnsavedChangesLockOptions = {
  useBrowserPrompt?: boolean
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
export function useOn(
  eventNameOrEventNameList: string | Array<string>,
  listener: Function,
  name?: string
): ; 
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
export function usePromised(
  eventNameOrEventNameList: string | Array<string>,
  handler: Function,
  name?: string
): ;

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
export function useOutsideClick(
  callback: Function
): [
  import('react').MutableRefObject<HTMLElement | null>
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
export function useHttpSignals(): HttpSignalsResult;
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
export function useBrowserStorage(
  storageOptions: BrowserStorageOptions
): BrowserStorage;
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
export function useBrowserStorageWithEncryption(
  storageOptions: BrowserStorageOptions
): BrowserStorage;
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
export function useRoutingMonitor(options: RoutingMonitorOptions): {
  navigationList: (import('history').Location<unknwon>)[],
  getBreadCrumbsList: (pathname: string) => (import('history').Location<unknown>)[]
};

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
export function useSharedState<Q = {}>(
  slice?: string 
): [
  Q,
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
export function useUnsavedChangesLock(
  options: UnsavedChangesLockOptions
): {
  getUserConfirmation: Function,
  verifyConfimation: boolean,
  allowTransition: () => void;
  blockTransition: () => void
};
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
export function useSearchParamsState(
  searchParamName: string,
  defaultValue?: string
): [
  string,
  (newSearchParamvalue: string) => void
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
export function useControlKeysPress(
  callback: Function,
  keys: string[]
): void;
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
export function useBeforePageUnload(
  callback: Function,
  options: { when: boolean, message: string }
): void;
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
export function useComponentMounted(): boolean;
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
export function usePageFocused(): boolean;
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
export function useIsFirstRender(): boolean;
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
export function useUIDataFetcher({
  url: string | null,
  customizePayload: Function 
}): {
  connectToFetcher: ,
  fetcher: ({
    src: string,
    params: Record<string, string>,
    method: "GET" | "POST" | "HEAD" | "DELETE" | "PATCH" | "PUT",
    metadata = Record<string, unknown>
  }) => Promise<unknown>,
};
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
