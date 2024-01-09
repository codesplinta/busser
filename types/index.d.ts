type TransformAsArray<L extends {}> = [...L[keyof L][]];

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

/**
 * @typedef TextSearchQueryController
 * @type {object}
 * @property {String} text - the input text used for filtering.
 * @property {Boolean} isLoading - the status of filtering.
 * @property {Number} page - the page for pagination.
 * @property {Array} list - the filtered list bbased on the input text.
 */
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
 * @property {*} data - the event data.
 */
export type FiredEventsStatsData<D extends unknown> = {
  timestamp: number,
  name: string,
  data: D
};

/**
 * @callback TextSearchQueryChangeEventHandler
 * @param {React.ChangeEvent} event - the synthetic react browser event object.
 * @param {Array.<String>=} listItemKey - the property key upon which to filter on.
 */
 export type TextSearchQueryChangeEventHandler = (event: import('react').ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, listItemKey?: string[]) => void;

/**
 * @typedef {Array.<TextSearchQueryController, TextSearchQueryChangeEventHandler>} TextSearchQueryResult
 */
export type TextSearchQueryResult<T> = [
  TextSearchQueryController<T>,
  TextSearchQueryChangeEventHandler
];

/**
 * @callback TextSearchQueryUpdateCallback
 * @param {TextSearchQueryController} controller - the composite object for exposing the verious state of filter queries.
 */
export type TextSearchQueryUpdateCallback<T> = (controller?: TextSearchQueryController<T>) => () => void;

/**
 * @typedef EventBusStats
 * @type {object}
 * @property {Object.<String, FiredEventsStatsData>} eventsFired - a record of all events fired.
 * @property {Number} eventsFiredCount - a record of the count of all events fired.
 * @property {Object.<String, SubscribedEventsStatsData>} eventsSubscribed - a record of all events subscribed.
 * @property {Number} eventsSubscribedCount - a record of the count of all events subscribed.
 * @property {Object.<String, *>} eventsFiredPath - a record of all event fired in sequence.
 */
export type EventBusStats<D = unknown> = {
  eventsFired: { [key: string]: FiredEventsStatsData<D> },
  eventsFiredCount: number,
  eventsSubscribed: { [key: string]: SubscribedEventsStatsData },
  eventsSubscribedCount: number,
  eventsFiredPath: { [key: string]: D }[]
};

/**
 * @typedef SharedStateBoxContext
 * @type {object}
 * @property {Function} dispatch - notify the atom of a change.
 * @property {Function} subscribe - subcribe the observer to a change or series of changes.
 * @property {Function} getState - get the current state object.
 */
export type SharedStateBoxContext<T extends Record<string, {}> = { "" : {} }> = {
  dispatch: (payload: { slice?: string & keyof T, value: T[keyof T] }) => void,
  subscribe: (callback: Function, key: string) => () => void,
  getState: ((key: string & keyof T) => T[keyof T]) | ((key: "") => T), 
};

/**
 * @typedef BrowserStorage
 * @type {object}
 * @property {Function} getFromStorage - getter for browser `Storage` interface.
 * @property {Function} setToStorage - setter for browser `Storage` interface.
 * @property {Function} clearFromStorage - cleanup for browser `Storage` interface.
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
 * @typedef TextSearchQueryPageOptions
 * @type {object}
 * @property {String} text - the filter text.
 * @property {Number=} page - the pagination page state.
 * @property {Array} list - this list to filter on.
 */
export type TextSearchQueryPageOptions<T> = {
  text: string,
  page?: number,
  list: T[]
};

/**
 * @typedef TextSearchQueryOptions
 * @type {object}
 * @property {String} filterTaskName - the filter query search algorithm to be used.
 * @property {Function} fetchRemoteFilteredList - the callback for running filter query remotely from an API backend.
 * @property {Function=} filterUpdateCallback - the callback for running effects after each filter query.
 */
export type TextSearchQueryOptions<T> = {
  filterTaskName?: "specific" | "fuzzy" | "complete",
  fetchRemoteFilteredList?: (text?: string, searchKey?: string[]) => Promise<T[]>,
  filterUpdateCallback?: TextSearchQueryUpdateCallback<T>
};

/**
 * @typedef HttpSignalsPayload
 * @type {object}
 * @property {?String} success - success message for http request.
 * @property {?Error} error - error object for failed http request.
 * @property {Object.<String, (String | Number | Boolean)} metadata - metadata info for http request.
 */
type HttpSignalsPayload = {
  success: string | null,
  error: Error | null,
  metadata: Record<string, string | number | boolean>
};

/**
 * @callback HttpSignalsPayloadCallback
 * @param {HttpSignalsPayload} eventPayload
 */
export type HttpSignalsPayloadCallback = (eventPayload: HttpSignalsPayload) => void;

/**
 * @typedef HttpSignalsResult
 * @type {object}
 * @property {EventBusStats} stats - the debug helper object.
 * @property {HttpSignalsPayloadCallback} signalRequestStarted - the event handler for the `request:started` event.
 * @property {HttpSignalsPayloadCallback} signalRequestEnded - the event handler for the `request:ended` event.
 * @property {HttpSignalsPayloadCallback} signalRequestAborted - the event handler for the `request:aborted` event.
 * @property {HttpSignalsPayloadCallback} signalCleanup - the event handler for the `cleanup` event.
 */
export type HttpSignalsResult = {
  stats: EventBusStats,
  signalRequestStarted: HttpSignalsPayloadCallback,
  signalRequestEnded: HttpSignalsPayloadCallback,
  signalRequestAborted: HttpSignalsPayloadCallback,
  signalCleanup: HttpSignalsPayloadCallback
};

/**
 * @typedef RoutingMonitorOptions
 * @type {object}
 * @property {Boolean=} setupPageTitle - the web page <title>.
 * @property {Function} getUserConfirmation - the callback to prompt the user to confirm a route change.
 * @property {String=} documentTitlePrefix - prefix for the document <title>.
 * @property {String=} appPathnamePrefix - the prefix for the app pathname.
 * @property {Object.<String, String>=} unsavedChangesRouteKeysMap - the object map for routes and their respective unsaved items' key.
 * @property {String=} promptMessage - the prompt text.
 * @property {Function=} onNavigation - the callback called on every route change.
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
 * @typedef {[EventBus, EventBusStats]} EventBusDetails
 */
export type EventBusDetails = [
  EventBus,
  EventBusStats
];

export type ListDetails<L extends unknown[], I extends unknown[], O = {}> = [
  L,
  (eventName: string, argumentTransformer: ((...args: I) => O)) => ((...args: I) => void),
  null | Error,
  EventBusStats
];

export type CountDetails<I extends unknown[], O = {}> = [
  number,
  (eventName: string, argumentTransformer: ((...args: I) => O)) => ((...args: I) => void),
  null | Error,
  EventBusStats
];

export type PromiseDetails<I extends unknown[], O = {}> = [
  undefined,
  (eventName: string, argumentTransformer: ((...args: I) => O)) => ((...args: I) => void),
  null | Error,
  EventBusStats
]

export type CompositeDetails<C = {}, O = {}> = [
  C,
  (eventName: string, argumentTransformer: ((args: C) => O)) => ((args: C) => void),
  null | Error,
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
 * @returns {EventBusDetails}
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
 * @returns {ListDetails}
 *
 */
export declare function useList<L extends unknown[], I extends unknown[], O>(
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
 * @returns {CountDetails}
 *
 */
export declare function useCount<I extends unknown[], O>(
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
export declare function useOn(
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
 * @param {Object.<String, *>} composite
 * @param {String=} name
 *
 * @returns {}
 *
 */
export declare function useComposite(
  eventNameOrEventNameList: string | Array<string>,
  compositeReducer: Function,
  composite: Record<string, any>,
  name?: string
): CompositeDetails;
/**
 * usePromised:
 *
 * used to execute any async task with a deffered or promised value triggered via events.
 *
 * @param {(String | Array.<String>)} eventNameOrEventNameList
 * @param {Function} handler
 * @param {String=} name
 *
 * @returns {PromiseDetails}
 *
 */
export declare function usePromised<I extends unknown[], O>(
  eventNameOrEventNameList: string | Array<string>,
  handler: Function,
  name?: string
): PromiseDetails<I, O>;

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
export declare function useOutsideClick(
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
export declare function useHttpSignals(): HttpSignalsResult;
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
export declare function useBrowserStorage(
  storageOptions: BrowserStorageOptions
): BrowserStorage;
/**
 * useTextFilteredList:
 *
 * used to filter a list (array) of things based on a search text being typed into an input.
 *
 * @param {TextSearchQueryPageOptions} textQueryPageOptions
 * @param {TextSearchQueryOptions} textQueryOptions
 *
 * @returns {Object}
 *
 */
export declare function useTextFilteredList<T>(
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
export declare function useBrowserStorageWithEncryption(
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
export declare function useRoutingChanged(
  eventName: string,
  history: import('history').History,
  name?: string,
  callback?: () => void
): void;
/**
 * useRoutingBlocked:
 *
 * used to respond to `beforeunload` event in the browser via events.
 *
 * @param {String} eventName
 * @param {Object} history
 * @param {String=} name
 * @param {Function=} callback
 *
 * @returns {Void}
 *
 */
export declare function useRoutingBlocked(
  eventName: string,
  history: import('history').History,
  name?: string,
  callback?: () => [boolean, string]
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
export declare function useRoutingMonitor(options: RoutingMonitorOptions): {
  navigationList: (import('history').Location)[],
  getBreadCrumbsList: (pathname: string) => (import('history').Location)[]
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
export declare function useSharedState<Q = {}>(
  slice?: string 
): [
  Q,
  Function
];
/**
 * useUnsavedChangesLock:
 *
 * used to generate a custom `getUserConfirmation()` function for your router of choice: `<BrowserRouter/>` or `<HashRoute/>`.
 *
 * @param {UnsavedChangesLockOptions} options
 *
 * @returns {{ getUserConfirmation: Function, verifyConfirmation: Boolean, allowTransition: Function, blockTransition: Function }}
 *
 */
export declare function useUnsavedChangesLock(
  options: UnsavedChangesLockOptions
): {
  getUserConfirmation: Function,
  verifyConfirmation: boolean,
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
export declare function useSearchParamsState(
  searchParamName: string,
  defaultValue?: string
): [
  string,
  (newSearchParamvalue: string) => void,
  () => void
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
 * @returns {void}
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
 * usePreviousProps:
 *
 * used to get the previous props in the current render phase of a components' life
 *
 * @returns {*}
 *
 */
export function usePreviousProps(): unknown;
/**
 * useUIDataFetcher:
 *
 * 
 *
 * @param {{ url: ?String, customizePayload: Function }} config
 *
 * @returns {{connectToFetcher: Fucntion, fetcher: Function }}
 *
 */
export function useUIDataFetcher(config: {
  url: string | null,
  customizePayload: Function 
}): {
  connectToFetcher: () => void,
  fetcher: (fetcherOptions: {
    src: string,
    params: Record<string, string>,
    method: "GET" | "POST" | "HEAD" | "DELETE" | "PATCH" | "PUT",
    metadata: Record<string, unknown>
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
): boolean;
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
export function useFetchBinder(): void;


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
