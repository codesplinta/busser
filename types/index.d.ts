type JSObject = { [key: string]: unknown };

type JSONObject<D = JSObject> = object | Record<keyof D, string | boolean | number | null | undefined>;

type SerializableValues<D = object> = string | number | boolean | null | undefined | JSONObject<D>;

/**
 * @typedef EventBus
 * @type {object}
 * @property {Function} on - the event subscription event listener setter.
 * @property {Function} off - the event unsubscription listener setter.
 * @property {Function} emit - the event trigger routine.
 */
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

/**
 * @typedef SubscribedEventsStatsData
 * @type {object}
 * @property {Number} timestamp - an event timestamp.
 * @property {String} name - an event name.
 */
export type SubscribedEventsStatsData = {
  timestamp: number,
  name: string,
};

/**
 * @typedef FiredEventsStatsData
 * @type {object}
 * @property {Number} timestamp - an event timestamp.
 * @property {String} name - an event name.
 * @property {Mixed} data - the event data.
 */
export type FiredEventsStatsData = {
  timestamp: number,
  name: string,
  data: unknown
};

/**
 * @typedef {} TextSearchQueryUpdateCallback
 */
export type TextSearchQueryUpdateCallback = (controller?: TextSearchQueryController<T>, setter?: import('react').Dispatch<import('react').SetStateAction<TextSearchQueryController<T>>>) => () => void;

/**
 * @typedef {} TextSearchQueryChangeEventHandler
 */
export type TextSearchQueryChangeEventHandler = (event: import('react').ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, listItemKey?: string[]) => void;

/**
 * @typedef EventBusStats
 * @type {object}
 * @property {Object.<String, FiredEventsStatsData>} eventsFired - a record of all events fired.
 * @property {Number} eventsFiredCount - a record of the count of all events fired.
 * @property {Object.<String, SubscribedEventsStatsData>} eventsSubscribed - a record of all events subscribed.
 * @property {Number} eventsSubscribedCount - a record of the count of all events subscribed
 */
export type EventBusStats = {
  eventsFired: { [key: string]: FiredEventsStatsData },
  eventsFiredCount: number,
  eventsSubscribed: { [key: string]: SubscribedEventsStatsData },
  eventsSubscribedCount: number
};

/**
 * @typedef SharedStateBoxContext
 * @type {object}
 * @property {Function} dispatch - .
 * @property {Function} subscribe - .
 * @property {Function} getState - .
 */
export type SharedStateBoxContext<T extends Record<string, {}> = { "" : {} }> = {
  dispatch: (payload: { slice?: string & keyof T, value: T[keyof T] }) => void,
  subscribe: (callback: Function, key: string) => () => void,
  getState: ((key: string & keyof T) => T[keyof T]) | ((key: "") => T), 
};

/**
 * @typedef BrowserStorage
 * @type {object}
 * @property {Function} getFromStorage - .
 * @property {Function} setToStorage - .
 * @property {Function} clearFromStorage - .
 */
export type BrowserStorage = {
  getFromStorage<T extends SerializableValues>(key: string, defaultPayload: T): T;
  setToStorage: (key: string, value: SerializableValues) => boolean;
  clearFromStorage: (key: string) => boolean;
};

/**
 * @typedef BrowserStorageOptions
 * @type {object}
 * @property {String} storageType - the browser storage type.
 */
export type BrowserStorageOptions = {
  storageType: "session" | "local"
};

/**
 * @typedef {} TextSearchQueryPageOptions
 */
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

/**
 * @typedef HttpSignalsPayload
 * @type {object}
 * @property {?String} success - .
 * @property {?Error} error - .
 * @property {Object.<String, (String | Number | Boolean)} metadata - .
 */
type HttpSignalsPayload = {
  success: string | null,
  error: Error | null,
  metadata: Record<string, string | number | boolean>
};

/**
 * @typedef HttpSignalsResult
 * @type {object}
 * @property {EventBusStats} stats - .
 * @property {} signalRequestStarted - .
 * @property {} signalRequestEnded - .
 * @property {} signalRequestAborted - .
 * @property {} signalCleanup - .
 */
export type HttpSignalsResult = {
  stats: EventBusStats,
  signalRequestStarted: (eventPayload: HttpSignalsPayload) => void,
  signalRequestEnded: (eventPayload: HttpSignalsPayload) => void,
  signalRequestAborted: (eventPayload: HttpSignalsPayload) => void,
  signalCleanup: (eventPayload: HttpSignalsPayload) => void
};

/**
 * @typedef RoutingMonitorOptions
 * @type {object}
 * @property {Boolean=} setupPageTitle - .
 * @property {Function} getUserConfirmation - .
 * @property {String=} documentTitlePrefix - .
 * @property {String=} appPathnamePrefix - .
 * @property {Object.<String, String>=} unsavedChangesRouteKeysMap - .
 * @property {String=} promptMessage - .
 * @property {Function=} onNavigation - .
 */
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

/**
 * @typedef UnsavedChangesLockOptions
 * @type {object}
 * @property {Boolean} useBrowserPrompt - flag for making use of the browser prompt.
 */
export type UnsavedChangesLockOptions = {
  useBrowserPrompt?: boolean
};

/**
 * @typedef {Array.<TextSearchQueryController, TextSearchQueryChangeEventHandler>} TextSearchQuery
 */
export type TextSearchQuery<T> = [
  TextSearchQueryController<T>,
  TextSearchQueryChangeEventHandler
];

/**
 * @typedef {Array.<EventBus, EventBusStats>} EventBusDetails
 */
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

export type CompositeDetails<C = {}, O = {}> = [
  C,
  ,
  EventBusStats
];

/**
 * useBus:
 *
 * used to setup communication from one component to another using the events routed via the central event bus (pub/sub)
 *
 * @param {{ subscribes: Array.<String>, fires: Array.<String> }} context
 * @param {String=} ownerName
 *
 * @returns {}
 *
 */
export function useBus(
  context: { subscribes: Array<string>, fires: Array<string> },
  ownerName?: string
): EventBusDetails;
/**
 * useList:
 *
 * used to manage a list (array) of things (objects, strings, numbers e.t.c). 
 *
 * @param {(String | Array.<string>)} eventNamesOrEventNameList
 * @param {Function} listReducer
 * @param {Object.<String, >} list
 * @param {String=} ownerName
 *
 * @returns {}
 *
 */
export function useList<L, I, O>(
  eventNameOrEventNameList: string | Array<string>,
  listReducer: Function,
  list: L,
  ownerName?: string
): ListDetails<L, I, O>;
/**
 * useCount:
 *
 *  used to manage counting the occurence of an event or addition of enitities (items in a list (data structure)).
 *
 * @param {(String | Array.<String>)} eventNamesOrEventNameList
 * @param {Function} countReducer
 * @param {{ start: Number, min: Number, max: Number }} options
 * @param {String=} ownerName
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
 * useOn:
 *
 * used to setup event handlers on the central event bus. 
 *
 * @param {(String | Array.<String>)} eventNameOrEventNameList
 * @param {Function} listener
 * @param {String=} name
 *
 * @returns {EventBusDetails}
 *
 */
export function useOn(
  eventNameOrEventNameList: string | Array<string>,
  listener: Function,
  name?: string
): EventBusDetails; 
/**
 * useComposite:
 *
 * used to process derived state that is made from logical chnages made on base state via events.
 *
 * @param {(String | Array.<string>)} eventNameOrEventNameList
 * @param {Function} compositeReducer
 * @param {Object.<String, Mixed>} composite
 * @param {String=} name
 *
 * @returns
 *
 */
export function useComposite(
  eventNameOrEventNameList: string | Array<string>,
  compositeReducer: Function,
  composite: Record<string, any>,
  name?: string
): CompositeDetails<>;
/**
 * usePromised:
 *
 * used to execute any async task with a deffered or promised value triggered via events.
 *
 * @param {(String | Array.<string>)} eventNameOrEventNameList
 * @param {Function} handler
 * @param {String=} name
 *
 * @returns {}
 *
 */
export function usePromised(
  eventNameOrEventNameList: string | Array<string>,
  handler: Function,
  name?: string
): [
  ,
  EventBusStats
];

/**
 * useOutsideClick:
 *
 *  used to respond to clicks outside a target DOM element
 *
 * @param {Function} callback
 *
 * @returns {Array}
 *
 */
export function useOutsideClick(
  callback: Function
): [
  import('react').MutableRefObject<HTMLElement | null>
];
/**
 * useHttpSignals:
 *
 * used to setup events for when async http requests are started or ended.
 *
 * @returns {HttpSignalsResult}
 *
 */
export function useHttpSignals(): HttpSignalsResult;
/**
 * useBrowserStorage:
 *
 * used to access and update data in either `window.localStorage` or `window.sessionStorage`.
 *
 * @param {BrowserStorageOptions} storageOptions
 *
 * @returns {BrowserStorage}
 *
 */
export function useBrowserStorage(
  storageOptions: BrowserStorageOptions
): BrowserStorage;
/**
 * useTextFilteredList:
 *
 * used to filter a list (array) of things based on a search text being typed into an input.
 *
 * @param {} textQueryPageOptions
 * @param {} textQueryOptions
 *
 * @returns {Object}
 *
 */
export function useTextFilteredList<T>(
  textQueryPageOptions: TextSearchQueryPageOptions<T>,
  textQueryOptions: TextSearchQueryOptions<T>
): TextSearchQueryResult<T>;
/**
 *  useBrowserStorageWithEncryption:
 *
 * used to access and update data in either `window.localStorage` or `window.sessionStorage` while using encryption.
 *
 * @param {BrowserStorageOptions} storageOptions
 *
 * @returns {BrowserStorage}
 *
 */
export function useBrowserStorageWithEncryption(
  storageOptions: BrowserStorageOptions
): BrowserStorage;
/**
 * useRoutingChanged:
 *
 * used to respond to a SPA page route changes via events.
 *
 * @param {String} eventName
 * @param {Object} history
 * @param {String=} name
 * @param {Function} callback
 *
 * @returns {Void}
 *
 */
export function useRoutingChanged(
  eventName: string,
  history: import('history').History,
  name?: string,
  callback: Function
): void;
/**
 * useRoutingBlocked:
 *
 * used to respond to `beforeunload` event in the browser via events.
 *
 * @param {String} eventName
 * @param {Object} history
 * @param {String=} name
 * @param
 *
 * @returns {Void}
 *
 */
export function useRoutingBlocked(
  eventName: string,
  history: import('history').History,
  name?: string,
  callback: () => [boolean, string]
): void;
/**
 * useRoutingMonitor:
 *
 * used to monitor page route changes from a central place inside a app router component.
 *
 * @param {RoutingMonitorOptions} options
 *
 * @returns {Object}
 *
 */
export function useRoutingMonitor(options: RoutingMonitorOptions): {
  navigationList: (import('history').Location<unknwon>)[],
  getBreadCrumbsList: (pathname: string) => (import('history').Location<unknown>)[]
};

/**
 * useSharedState:
 *
 * used to share global state to any set of components deep in the tree hierarchy without re-rendering the whole sub-tree.
 *
 * @param {String=} slice
 *
 * @returns {Array}
 *
 */
export function useSharedState<Q = {}>(
  slice?: string 
): [
  Q,
  Function
];
/**
 * useUnsavedChangesLoxk:
 *
 * used to generate a custom `getUserConfirmation()` function for your router of choice: `<BrowserRouter/>` or `<HashRoute/>`.
 *
 * @param {UnsavedChangesLockOptions} options
 *
 * @returns {Object}
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
 * useSearchParamsState:
 *
 * used to ensure that `useSearchParams()` doesn't lose any URL location search state between route changes.
 *
 * @param {String} searchParamName
 * @param {String=} defaultValue
 *
 * @returns {Array}
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
 * useControlKeyPress:
 *
 * used to respond to `keypress` event in the browser specifically for control keys (e.g. Enter, Tab).
 *
 * @param {Function} callback
 * @param {Array.<String>} keys
 *
 * @returns {Void}
 *
 */
export function useControlKeysPress(
  callback: Function,
  keys: string[]
): void;
/**
 * useBeforePageUnload:
 *
 * used to respond to `beforeunload` event in the browser with a message only when a condition is met.
 *
 * @param {Function} callback
 * @param {{ when: Boolean, message: String }} options
 *
 * @returns {Void}
 *
 */
export function useBeforePageUnload(
  callback: Function,
  options: { when: boolean, message: string }
): void;
/**
 * useComponentMounted:
 * 
 * used to determine if a React component is mounted or not.
 *
 * @returns {Boolean}
 *
 */
export function useComponentMounted(): boolean;
/**
 * usePageFocused:
 *
 * used to determine when the document (web page) recieves focus from user interaction.
 *
 * @returns {Boolean}
 *
 */
export function usePageFocused(): boolean;
/**
 * useIsFirstRender:
 *
 * used to determine when a React component is only first rendered.
 *
 * @returns {Boolean}
 *
 */
export function useIsFirstRender(): boolean;
/**
 * useUIDataFetcher:
 *
 * 
 *
 * @param {{ url: ?String, customizePayload: Function }} config
 *
 * @returns {Object}
 *
 */
export function useUIDataFetcher({
  url: string | null,
  customizePayload: Function 
}): {
  connectToFetcher: () => ,
  fetcher: ({
    src: string,
    params: Record<string, string>,
    method: "GET" | "POST" | "HEAD" | "DELETE" | "PATCH" | "PUT",
    metadata = Record<string, unknown>
  }) => Promise<unknown>,
};
/**
 * useIsDOMElementIntersecting:
 *
 * used to determine if an intersection observer has targeted a DOM element at the intersection threshold.
 *
 * @param {(Element | HTMLElement)} domElement
 * @param {IntersectionObserverInit} options
 *
 * @returns {Boolean}
 *
 */
export function useIsDOMElementIntersecting(
  domElement: Element | HTMLElement,
  options: IntersectionObserverInit
) boolean;
/**
 * useFetchBinder:
 *
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
