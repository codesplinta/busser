// Type definitions for react-busser v1.0.1
// Project: https://github.com/codesplinta/busser

type TransformAsArray<L extends {}> = [...L[keyof L][]];

type NonNullValues<T extends object> = {
  [K in keyof T]: NonNullable<T[K]>;
};

type StorageTypes = string | object;

type JSObject = { [key: string]: unknown };

type JSONObject<D = JSObject> = object | Record<keyof D, string | boolean | number | null | undefined>;

type SerializableValues<D = object> = string | number | boolean | null | undefined | JSONObject<D>;

type EffectCallback<ARGS extends unknown[], R> = (...args: ARGS) => R;

type EffectMemoCallbackArgs<DepsType = unknown[]> = {
  dependencies: DepsType,
  changed: Partial<DepsType> | []
};

/**
 * @desc Made compatible with {GeolocationPositionError} and {PositionError} because
 * {PositionError} has been renamed to {GeolocationPositionError} in typescript v4.1.x
 * and so making own compatible interface is the most easiest way to avoid errors.
 */
interface IGeolocationPositionError {
  readonly code: number;
  readonly message: string;
  readonly PERMISSION_DENIED: number;
  readonly POSITION_UNAVAILABLE: number;
  readonly TIMEOUT: number;
}

interface IGeoLocationSensorState {
  error: Error | IGeolocationPositionError | null;
  isLoading: boolean;
  data: {
    accuracy: number;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    latitude: number | null;
    longitude: number | null;
    speed: number | null;
    timestamp: number | null;
  };
}

interface IGeolocationPosition {
  readonly coords: Readonly<Omit<IGeoLocationSensorState["data"], "timestamp">>;
  readonly timestamp: number;
}

declare module 'react-busser' {

  export type PrinterFont = { family: string, source: string; weight?: string; style?: string; };

  /**
   * @typedef PrintOptions
   * @type {object}
   * @property {String=} documentTitle - The document title of the printed patch.
   * @property {(() => Promise<void>)=} onBeforeGetContent - The callack to trigger before the printed content is computed.
   * @property {(() => void)=} onBeforePrint - The callback to trigger just before printing starts.
   * @property {(() => void)=} onAfterPrint - The callback to trigger just before printing finishes.
   * @property {Boolean=} removeAfterPrint - The flag that indicates whether to remove print iframe or not.
   * @property {(() => void)=} nowPrinting - The callback to trigger as  soon as printing starts.
   * @property {String=} nonce - CSP nonce for generated <style> tags.
   * @property {((errorLocation: 'onBeforePrint' | 'onBeforeGetContent' | 'print', error: Error) => void)=} onPrintError - The callack to trigger when there's a print error.
   * @property {(Array.<{ family: string, source: string; weight?: string; style?: string; }>)=} fonts - The fonts loaded for printing.
   * @property {(() => HTMLElement | Node)=} content - The callback that returns a component reference value.
   * @property {String=} bodyClass - One or more CSS class names that can be passed to the print window.
   */
  export type PrintOptions = {
    documentTitle?: string,
    onBeforeGetContent?: () => Promise<void>,
    onBeforePrint?: () => void,
    onAfterPrint?: () => void,
    removeAfterPrint?: boolean,
    nonce?: string,
    nowPrinting?: () => void,
    onPrintError?: (errorLocation: 'onBeforePrint' | 'onBeforeGetContent' | 'print', error: Error) => void,
    fonts?: PrinterFont[],
    content?: (() => HTMLElement | Node)
    bodyClass?: string
  };

  /**
   * @typedef EventBus
   * @type {object}
   * @property {Function} on - the event subscription event listener setter.
   * @property {Function} off - the event unsubscription listener setter.
   * @property {Function} emit - the event trigger routine.
   */
  export type EventBus = Readonly<{
    on: (eventNameOrList: string | Array<string>, eventCallback: Function) => void,
    off: (eventCallback: Function) => void,
    emit: (eventName: string, data: unknown) => void 
  }>;

  /**
   * @typedef TextSearchQueryController
   * @type {object}
   * @property {String} text - the input text used for filtering.
   * @property {Boolean} isLoading - the status of filtering.
   * @property {Number} page - the page for pagination.
   * @property {Array} list - the filtered list based on the input text.
   */
  export type TextSearchQueryController<T> = {
    text: string,
    isLoading: boolean,
    page: number,
    list: T[]
  };

  /**
   * @typedef TextSearchQuerySignalController
   * @type {object}
   * @property {String} text - the input text used for filtering.
   * @property {Boolean} isLoading - the status of filtering.
   * @property {Number} page - the page for pagination.
   * @property {Array} list - the filtered list based on the input text.
   */
   export type TextSearchQuerySignalController<T> = import('@preact/signals-react').ReadonlySignal<{
    text: string,
    isLoading: boolean,
    page: number,
    list: T[]
  }>;

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
   * @typedef {Array.<TextSearchQuerySignalController, TextSearchQueryChangeEventHandler>} TextSearchQuerySignalResult
   */
   export type TextSearchQuerySignalResult<T> = [
    TextSearchQuerySignalController<T>,
    TextSearchQueryChangeEventHandler
  ];

  /**
   * @callback TextSearchQueryUpdateCallback
   * @param {TextSearchQueryController} controller - the composite object for exposing the verious state of filter queries.
   */
  export type TextSearchQueryUpdateCallback<T> = (controller?: TextSearchQueryController<T>) => () => void;

  /**
   * @callback TextSearchListChangedCallback
   * @param {TextSearchQueryController} controller - the composite object for exposing the verious state of filter queries.
   */
  export type TextSearchListChangedCallback<T> = (controller?: TextSearchQueryController<T>) => void;

  /**
   * @typedef EventBusStats
   * @type {object}
   * @property {Object.<String, FiredEventsStatsData>} eventsFired - a record of all events fired.
   * @property {Number} eventsFiredCount - a record of the count of all events fired.
   * @property {Object.<String, SubscribedEventsStatsData>} eventsSubscribed - a record of all events subscribed.
   * @property {Number} eventsSubscribedCount - a record of the count of all events subscribed.
   * @property {Object.<String, *>} eventsFiredPath - a record of all event fired in sequence.
   */
  export type EventBusStats<D = unknown> = Readonly<{
    eventsFired: { [key: string]: FiredEventsStatsData<D> },
    eventsFiredCount: number,
    eventsSubscribed: { [key: string]: SubscribedEventsStatsData },
    eventsSubscribedCount: number,
    eventsFiredPath: { [key: string]: D }[]
  }>;

  /**
   * @typedef SharedStateBoxContext
   * @type {object}
   * @property {Function} dispatch - notify the atom of a change.
   * @property {Function} subscribe - subcribe the observer to a change or series of changes.
   * @property {Function} getState - get the current state object.
   */
  export type SharedStateBoxContext<T extends Record<string | number | symbol, unknown> = { "" : {} }> = {
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
    hasKeyInStorage: (key: string) => boolean;
    hasKeyPrefixInStorage: (key: string) => boolean;
    setToStorage: (key: string, value: SerializableValues) => boolean;
    clearFromStorage: (key: string) => boolean;
  };

  /**
   * @typedef BrowserStorageOptions
   * @type {object}
   * @property {"session" | "local"} storageType - the browser storage type.
   */
  export type BrowserStorageOptions = {
    storageType: "session" | "local"
  };

  /**
   * @typedef TextSearchQueryPageOptions
   * @type {object}
   * @property {String} text - the filter text used to filter the list.
   * @property {Number=} page - the pagination page number.
   * @property {Array} list - the list to filter using `text`.
   */
  export type TextSearchQueryPageOptions<T> = {
    text?: string,
    page?: number,
    list: T[]
  };

  /**
   * @typedef TextSearchQueryOptions
   * @type {object}
   * @property {String=} filterTaskName - the filter query search algorithm to be used.
   * @property {Function=} fetchRemoteFilteredList - the callback for running filter query remotely from an API backend.
   * @property {TextSearchQueryUpdateCallback=} filterUpdateCallback - the callback for running effects after each distinct filter query.
   * @property {TextSearchListChangedCallback=} onListChanged - the callback for running effects after each mutation on the list to filter.
   */
  export type TextSearchQueryOptions<T> = {
    filterTaskName?: "specific" | "fuzzy" | "complete" | (string & {}),
    fetchRemoteFilteredList?: (text?: string, searchKey?: string[]) => Promise<T[]>,
    filterUpdateCallback?: TextSearchQueryUpdateCallback<T>
    onListChanged?: TextSearchListChangedCallback<T>
  };

  /**
   * @typedef HttpSignalsPayload
   * @type {object}
   * @property {?String} success - success message for http request.
   * @property {?Error} error - error object for failed http request.
   * @property {Object.<String, (String | Number | Boolean)} metadata - metadata info for http request.
   */
  export type HttpSignalsPayload = {
    success: string | null,
    error: Error | null,
    metadata: Record<string, string | number | boolean>
  };

  /**
   * @callback StorageEventCallback
   * @param {StorageEvent} event
   */
  export type StorageEventCallback = (event: StorageEvent) => void;
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
   * @property {Function} getUserConfirmation - the callback to prompt the user to confirm a route change.
   * @property {String=} appPathnamePrefix - the prefix for the app pathname.
   * @property {Object.<String, String>=} unsavedChangesRouteKeysMap - the object map for routes and their respective unsaved items' key.
   * @property {String=} promptMessage - the prompt text for unsaved items'.
   * @property {Function=} onNavigation - the callback called on every route change.
   */
  export type RoutingMonitorOptions = Pick<import('react-router-dom').HashRouterProps, "getUserConfirmation"> & {
    onNavigation?: (
      history: import('history').History,
      navigationDetails: {
        previousPathname: string,
        currentPathname: string,
        navigationDirection: "refreshnavigation" | "backwardnavigation" | "forwardnavigation" | "freshnavigation"
      }
    ) => void,
    unsavedChangesRouteKeysMap?: Record<string, string>,
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

  /**
   * @typedef StateUpdatesForHistoryOptions
   * @type {object}
   * @property {Number=} capacity - the capacity of the upddates history list.
   * @property {String=} persistKey - the key to persist the value of the history list in the browser storage.
   * @property {Function=} onRedo - the callback function triggered when the action on history list is redone.
   * @property {Function=} onUndo - the callback function triggered when the action on history list is undone.
   */
   export type StateUpdatesForHistoryOptions = {
	 capacity: number,
	 persistKey: string,
	 onRedo: () => void,
	 onUndo: () => void
   };

  /**
   * @typedef BrowserNetworkStatusResult
   * @type {object}
   * @property {Boolean} online - 
   * @property {Boolean} previousOnline - 
   * @property {Date} lastChanged - 
   * @property {String} connectionType -
   */
  export type BrowserNetworkStatusResult = {
	  online: boolean,
	  previousOnline: boolean,
	  lastChanged: Date,
	  connectionType: 'slow-2g' | '3g'
  };

  /**
   * @typedef PositionOptions
   * @type {object}
   * @property {Boolean} shouldWatchPosition - 
   * @property {Number} timeout - 
   * @property {Number} maximumAge - 
   */
  export type PositionOptions = {
	  shouldWatchPosition: boolean,
	  timeout: number,
	  maximumAge: number
  };

  /**
   * @typedef GeoLocationInfo
   * @type {object}
   * @property {Number} late - The geolocation latitude
   * @property {Number} lng - The geolocation longitude
   * @property {Number} alt - The geolocation altitude
   * @property {Number} acc - The geolocation accuracy
   */
  export type GeoLocationInfo = {
	  lat: number,
	  lng: number,
	  alt: number,
	  acc: number
  };

  export type PropertyDetails<I extends unknown[], P extends string = string, O = unknown> = [
    P,
    (eventName: string, argumentTransformer?: ((...args: I) => O)) => ((...args: I) => void),
    null | Error,
    EventBusStats
  ];

  export type SignalsPropertyDetails<I extends unknown[], P extends string = string, O = unknown> = [
    import('@preact/signals-react').ReadonlySignal<P>,
    (eventName: string, argumentTransformer?: ((...args: I) => O)) => ((...args: I) => void),
    import('@preact/signals-react').ReadonlySignal<null | Error>,
    EventBusStats
  ];

  export type ListDetails<I extends unknown[], L = unknown[], O = (unknown | L)> = [
    L,
    (eventName: string, argumentTransformer?: ((...args: I) => O)) => ((...args: I) => void),
    null | Error,
    EventBusStats
  ];

  export type SignalsListDetails<I extends unknown[], L = unknown[], O = (unknown | L)> = [
    import('@preact/signals-react').ReadonlySignal<L>,
    (eventName: string, argumentTransformer?: ((...args: I) => O)) => ((...args: I) => void),
    import('@preact/signals-react').ReadonlySignal<null | Error>,
    EventBusStats
  ];

  export type CountDetails<I extends unknown[]> = [
    number,
    (eventName: string, argumentTransformer?: ((...args: I) => number)) => ((...args: I) => void),
    null | Error,
    EventBusStats
  ];

  export type SignalsCountDetails<I extends unknown[]> = [
    import('@preact/signals-react').ReadonlySignal<number>,
    (eventName: string, argumentTransformer?: ((...args: I) => number)) => ((...args: I) => void),
    import('@preact/signals-react').ReadonlySignal<null | Error>,
    EventBusStats
  ];

  export type PromiseDetails<I extends unknown[], O = unknown> = [
    undefined,
    (eventName: string, argumentTransformer?: ((...args: I) => O)) => ((...args: I) => void),
    null | Error,
    EventBusStats
  ];

  export type CompositeDetails<I extends unknown[], C = Record<string | number | symbol, unknown>, O = unknown> = [
    C,
    (eventName: string, argumentTransformer?: ((...args: I) => O)) => ((...args: I) => void),
    null | Error,
    EventBusStats
  ];

  export type SignalsCompositeDetails<I extends unknown[], C = Record<string | number | symbol, unknown>, O = unknown> = [
    import('@preact/signals-react').ReadonlySignal<C>,
    (eventName: string, argumentTransformer?: ((...args: I) => O)) => ((...args: I) => void),
    import('@preact/signals-react').ReadonlySignal<null | Error>,
    EventBusStats
  ];

  /**
   * useBus:
   *
   * used to setup communication from one component to another using the events routed via the central event bus (pub/sub)
   *
   * @param {{ subscribes: Array.<String>, fires: Array.<String> }} context - the list of event names this event bus fires (emits) and/or subscribes to.
   * @param {String=} ownerName - the tag/name of the ReactJS component that owns this data primitive.
   *
   * @returns `EventBusDetails`
   *
   */
  export function useBus(
    context: { subscribes: Array<string>, fires: Array<string> },
    ownerName?: string
  ): EventBusDetails;
  /**
   * useProperty:
   * 
   * used to manage a single string value that has a finite set of values.
   * 
   * @param {(String | Array.<string>)} eventNameOrEventNameList - the event name or list of event names to respond to
   * @param {Function} propertyReducer - similar to a redux reducer but for a `property` state.
   * @param {String} property - a piece of state whose data-type is a string and has a finite set of valid values.
   * @param {String=} ownerName - the tag/name of the ReactJS component that owns this `property` data primitive.
   * 
   * @returns `PropertyDetails`
   *
   */
  export function useProperty<I extends unknown[], P extends string = string, O = unknown>(
    eventNameOrEventNameList: string | Array<string>,
    propertyReducer: (previousProperty: P, eventPayload: O, event?: string) => P,
    property: P,
    ownerName?: string
  ): PropertyDetails<I, P, O>
  /**
   * useSignalsProperty:
   * 
   * used to manage a single string value that has a finite set of values - signals variant.
   * 
   * @param {(String | Array.<string>)} eventNameOrEventNameList - the event name or list of event names to respond to.
   * @param {Function} propertyReducer - similar to a redux reducer but for a `property` state.
   * @param {String} property - a piece of state whose data-type is a string and has a finite set of valid values.
   * @param {String=} ownerName - the tag/name of the ReactJS component that owns this `property` data primitive.
   * 
   * @returns `SignalsPropertyDetails`
   *
   */
   export function useSignalsProperty<I extends unknown[], P extends string = string, O = unknown>(
    eventNameOrEventNameList: string | Array<string>,
    propertyReducer: (previousProperty: P, eventPayload: O, event?: string) => P,
    property: P,
    ownerName?: string
  ): SignalsPropertyDetails<I, P, O>
  /**
   * useList:
   *
   * used to manage a list (array) of things (objects, strings, numbers e.t.c). 
   *
   * @param {(String | Array.<string>)} eventNamesOrEventNameList - the event name or list of event names to respond to.
   * @param {Function} listReducer - similar to a redux reducer but for a `list` state.
   * @param {Array.<Object.<String, *>>} list - a piece of state whose data-type is an array of other primitive or reference types.
   * @param {String=} ownerName - the tag/name of the ReactJS component that owns this `list` data primitive.
   *
   * @returns `ListDetails`
   *
   */
  export function useList<I extends unknown[], L = unknown[], O = unknown[] | unknown>(
    eventNameOrEventNameList: string | Array<string>,
    listReducer: (previousList: L, eventPayload: O, event?: string) => L,
    list: L,
    ownerName?: string
  ): ListDetails<I, L, O>;
  /**
   * useSignalsList:
   *
   * used to manage a list (array) of things (objects, strings, numbers e.t.c) - signals varaint. 
   *
   * @param {(String | Array.<string>)} eventNamesOrEventNameList - the event name or list of event names to respond to.
   * @param {Function} listReducer - similar to a redux reducer but for a `list` state.
   * @param {Array.<Object.<String, *>>} list - a piece of state whose data-type is an array of other primitive or reference types.
   * @param {String=} ownerName - the tag/name of the ReactJS component that owns this `list` data primitive.
   *
   * @returns `SignalsListDetails`
   *
   */
   export function useSignalsList<I extends unknown[], L = unknown[], O = unknown[] | unknown>(
    eventNameOrEventNameList: string | Array<string>,
    listReducer: (previousList: L, eventPayload: O, event?: string) => L,
    list: L,
    ownerName?: string
  ): SignalsListDetails<I, L, O>;
  /**
   * useCount:
   *
   *  used to manage counting the occurence of an event or addition of enitities (items in a list (data structure)).
   *
   * @param {(String | Array.<String>)} eventNamesOrEventNameList - the event name or list of event names to respond to.
   * @param {Function} countReducer - similar to a redux reducer but for a `count` state.
   * @param {{ start: Number, min: Number, max: Number }} count - a piece of state whose data-type is a number for the purposes of counting.
   * @param {String=} ownerName - the tag/name of the ReactJS component that owns this `count` data primitive.
   *
   * @returns `CountDetails`
   *
   */
  export function useCount<I extends unknown[]>(
    eventNamesOrEventNameList: string | Array<string>,
    countReducer: (previousCount: number, eventPayload: number, event?: string) => number,
    count: { start?: number, min?: number, max?: number },
    ownerName?: string
  ): CountDetails<I>;
    /**
   * useSignalsCount:
   *
   *  used to manage counting the occurence of an event or addition of enitities (items in a list (data structure)) - signals varaint.
   *
   * @param {(String | Array.<String>)} eventNamesOrEventNameList - the event name or list of event names to respond to.
   * @param {Function} countReducer - similar to a redux reducer but for a `count` state.
   * @param {{ start: Number, min: Number, max: Number }} count - a piece of state whose data-type is a number for the purposes of counting.
   * @param {String=} ownerName - the tag/name of the ReactJS component that owns this `count` data primitive.
   *
   * @returns `SignalsCountDetails`
   *
   */
  export function useSignalsCount<I extends unknown[]>(
    eventNamesOrEventNameList: string | Array<string>,
    countReducer: (previousCount: number, eventPayload: number, event?: string) => number,
    count: { start?: number, min?: number, max?: number },
    ownerName?: string
  ): SignalsCountDetails<I>;
  /**
   * useOn:
   *
   * used to setup event handlers on the central event bus. 
   *
   * @param {(String | Array.<String>)} eventNameOrEventNameList
   * @param {Function} listener
   * @param {String=} name
   *
   * @returns `EventBusDetails`
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
   * used to process derived object literal state that is made from logical changes made on base state via events.
   *
   * @param {(String | Array.<string>)} eventNameOrEventNameList - the event name or list of event names to respond to.
   * @param {Function} compositeReducer - similar to a redux reducer but for a `composite` state.
   * @param {Object.<String, *>} composite - a piece of state whose data-type is an object literal with property value pairs.
   * @param {String=} name - the tag/name of the ReactJS component that owns this `composite` data primitive.
   *
   * @returns `CompositeDetails`
   *
   */
  export function useComposite<I extends unknown[], C = Record<string | number | symbol, unknown>, O = unknown>(
    eventNameOrEventNameList: string | Array<string>,
    compositeReducer: (previousComposite: C, eventPayload: O, event?: string) => C,
    composite: C,
    name?: string
  ): CompositeDetails<I, C, O>;
  /**
   * useSignalsComposite:
   *
   * used to process derived object literal state that is made from logical changes made on base state via events - signal variant.
   *
   * @param {(String | Array.<string>)} eventNameOrEventNameList - the event name or list of event names to respond to.
   * @param {Function} compositeReducer - similar to a redux reducer but for a `composite` state.
   * @param {Object.<String, *>} composite - a piece of state whose data-type is an object literal with property value pairs.
   * @param {String=} name - the tag/name of the ReactJS component that owns this `composite` data primitive.
   *
   * @returns `SignalsCompositeDetails`
   *
   */
   export function useSignalsComposite<I extends unknown[], C = Record<string | number | symbol, unknown>, O = unknown>(
    eventNameOrEventNameList: string | Array<string>,
    compositeReducer: (previousComposite: C, eventPayload: O, event?: string) => C,
    composite: C,
    name?: string
  ): SignalsCompositeDetails<I, C, O>;
  /**
   * usePromised:
   *
   * used to execute any async task with a deffered or promised value triggered via events.
   *
   * @param {(String | Array.<String>)} eventNameOrEventNameList
   * @param {Function} handler
   * @param {String=} name
   *
   * @returns `PromiseDetails`
   *
   */
  export function usePromised<I extends unknown[], O = unknown>(
    eventNameOrEventNameList: string | Array<string>,
    handler: () => Promise<unknown>,
    name?: string
  ): PromiseDetails<I, O>;

  /**
   * useOutsideClick:
   *
   *  used to respond to clicks outside a target DOM element
   *
   * @param {Function} callback
   *
   * @returns `[import('react').MutableRefObject<HTMLElement | null>]`
   *
   */
  export function useOutsideClick<E extends HTMLElement>(
    callback: (referenceElement: E | null, targetElement: EventTarget | null) => void
  ): [
    import('react').MutableRefObject<E | null>
  ];
  /**
   * useHttpSignals:
   *
   * used to setup events for when async http requests are started or ended.
   *
   * @returns `HttpSignalsResult`
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
   * @returns `BrowserStorage`
   *
   */
  export function useBrowserStorage(
    storageOptions: BrowserStorageOptions
  ): BrowserStorage;
  /**
   * useBrowserStorageEvent:
   *
   * used to setup browser `stroage` event for `window.localStorage` or `window.sessionStorage` for browser inter-tab updates.
   *
   * @param {StorageEventCallback} callback
   *
   * @returns void
   *
   */
  export function useBrowserStorageEvent(
    callback: StorageEventCallback
  ): void
  /**
   * useTextFilteredList:
   *
   * used to filter a list (array) of things based on a search text being typed into an input.
   *
   * @param {TextSearchQueryPageOptions} textQueryPageOptions
   * @param {TextSearchQueryOptions} textQueryOptions
   *
   * @returns `TextSearchQueryResult`
   *
   */
  export function useTextFilteredList<T = unknown>(
    textQueryPageOptions: TextSearchQueryPageOptions<T>,
    textQueryOptions: TextSearchQueryOptions<T>
  ): TextSearchQueryResult<T>;
  /**
   * useTextFilteredSignalsList:
   *
   * used to filter a list (array) of things based on a search text being typed into an input (signals variant).
   *
   * @param {TextSearchQueryPageOptions} textQueryPageOptions
   * @param {TextSearchQueryOptions} textQueryOptions
   *
   * @returns `TextSearchQueryResult`
   *
   */
   export function useTextFilteredSignalsList<T = unknown>(
    textQueryPageOptions: TextSearchQueryPageOptions<T>,
    textQueryOptions: TextSearchQueryOptions<T>
  ): TextSearchQuerySignalResult<T>;
  /**
   *  useBrowserStorageWithEncryption:
   *
   * used to access and update data in either `window.localStorage` or `window.sessionStorage` while using encryption.
   *
   * @param {BrowserStorageOptions} storageOptions
   *
   * @returns `BrowserStorage`
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
   * @returns void
   *
   */
  export function useRoutingChanged(
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
   * @returns void
   *
   */
  export function useRoutingBlocked(
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
   * @returns `{ navigationList: (import('history').Location)[], currentLocation: Location, getBreadCrumbsList: (pathname: string) => (import('history').Location)[] }`
   *
   */
  export function useRoutingMonitor(
    options: RoutingMonitorOptions
  ): {
    readonly navigationList: (import('history').Location)[],
	readonly currentLocation: Location,
    getBreadCrumbsList: (pathnamePrefix: string, maxSize?: number) => (import('history').Location)[]
  };
  /**
   * useSignalsEffect:
   * 
   * used as an alternative to `useEffect()` for signals
   *  
   * @param {Function} effectCallback
   * @param {Array<*>} dependencyList
   * 
   * @returns void
   * 
   */
  export function useSignalsEffect(
    effectCalback: () => Function | undefined,
    dependencyList: import('react').DependencyList
  ): void;
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
  export function useSharedState<Q = {} | Record<string | number | symbol, unknown>>(
    slice?: string & keyof Q 
  ): readonly [
    Q | Q[keyof Q],
    (updatePayload: {
	  slice?: string & keyof Q,
	  value: Q[keyof Q]
  	} | ((previousState: Q) => ({
		  slice?: string & keyof Q,
		  value: Q[keyof Q]
		}))) => void					
  ];
  /**
   * useSharedSignalsState:
   *
   * used to share global state to any set of components deep in the tree hierarchy without re-rendering the whole sub-tree (signals variant).
   *
   * @param {String=} slice
   *
   * @returns {Array}
   *
   */
   export function useSharedSignalsState<Q = {} | Record<string | number | symbol, unknown>>(
    slice?: string & keyof Q 
  ): readonly [
    import('@preact/signals-react').ReadonlySignal<Q | Q[keyof Q]>,
    (updatePayload: {
	  slice?: string & keyof Q,
	  value: Q[keyof Q]
  	} | ((previousState: Q) => ({
		  slice?: string & keyof Q,
		  value: Q[keyof Q]
		}))) => void
  ];
  /**
   * useUnsavedChangesLock:
   *
   * used to generate a custom `getUserConfirmation()` function for your router of choice: `<BrowserRouter/>` or `<HashRoute/>`.
   *
   * @param {UnsavedChangesLockOptions} options
   *
   * @returns `{ getUserConfirmation: Function, verifyConfirmation: Boolean, allowTransition: Function, blockTransition: Function }`
   *
   */
  export function useUnsavedChangesLock(
    options: UnsavedChangesLockOptions
  ): Pick<import('react-router-dom').HashRouterProps, "getUserConfirmation"> & {
    verifyConfirmation: boolean;
    allowTransition: () => void;
    blockTransition: () => void;
  };
  /**
   * useSearchParamStateValueUpdate:
   * 
   * used to update the value of a single URL search (query) param.
   * 
   * @param {String=} paramName 
   * 
   * @returns `Function`
   */
  export function useSearchParamStateValueUpdate(paramName?: string): ((
    paramValue?: string,
    option?: { overwriteHistory?: boolean; }
  ) => void);
  /**
   * useEffectCallback:
   *
   * used to ensure a stable reference for a callback within a ReactJS component
   *
   * @param {Function} callback
   * @param {Object=} option
   *
   * @returns `Function`
   */
 	export function useEffectCallback<A extends unknown[], R>(
	  callback: EffectCallback<A, R>,
	  option?: { immutableRef: boolean }
	): EffectCallback<A, R>;
  /**
   * useLockBodyScroll:
   *
   * used to disable scroll on the body tag of a html page
   *
   * @param {Boolean=} isActive
   *
   * @return void
   */
 	export function useLockBodyScroll(isActive?: boolean): void;
  /**
   * useWindowSize:
   *
   * used to keep track of the width and height of the browser window
   *
   * @param {Object} size
   *
   * @return {Object}
   */
   export function useWindowSize(size?: { width: number, height: number }): readonly {
	   width: number,
	   height: number
   };
  /**
   * useSearchParamStateValue:
   * 
   * used to manage the value of a single URL search (query) param.
   * 
   * @param {String=} paramName 
   * 
   * @returns `[*, Function]`
   */
  export function useSearchParamStateValue(paramName?: string): readonly [
    { [paramNameLiteral: string]: string },
    (
      paramValue?: string,
      option?: { overwriteHistory?: boolean; }
    ) => void
  ];
  /**
   * useBrowserStorageEffectUpdates:
   * 
   * used to sync data in browser storage with ReactJS component state changes.
   * 
   * @param {String} storageKey
   * @param {*} storageDefaultValue
   * @param {String} storageType
   * @param {"bypassEffect" | "enforceEffect"} storageMode 
   * 
   * @returns `[*, Function, Function]`
   */
  export function useBrowserStorageEffectUpdates<T extends StorageTypes>(
    storageKey: string,
    storageDefaultValue?: T | null | undefined,
    storageType?: BrowserStorageOptions["storageType"],
    storageMode?: "bypassEffect" | "enforceEffect"
  ): readonly [
    T | null | undefined,
    (nextStorageValueUpdate: T | null, option?: { append?: boolean }) => void,
    <T extends SerializableValues>(key: string, defaultPayload?: T | null | undefined) => T | null
  ];
  /**
   * useBrowserScreenActivityStatusMonitor:
   * 
   * used to monitor the activity of a user interacting with a web page using callbacks.
   * 
   * @param {Object.<*>} options 
   * 
   * @returns `{ updateScreenActivityTimeoutInMilliseconds: Function, status: Function }`
   */
  export function useBrowserScreenActivityStatusMonitor(options: {
    onPageNotActive: Function,
    onPageNowActive: Function,
	  onStopped: Function,
	  onPageHidden: Function,
	  onPageVisible: Function,
    ACTIVITY_TIMEOUT_DURATION: number
  }): readonly {
	status: () => "busy" | "idle",
    updateScreenActivityTimeoutInMilliseconds: (newTimeoutDuration: number) => void
  };
  /**
   * useTextSortedList:
   * 
   * used to sort an array of items having the same data type.
   * 
   * @param {Array.<*>} listToSort 
   * @param {String} defaultSortOrder
   * @param {String|Number} propertyToSortOn 
   * 
   * @returns `[Array, Function]`
   */
  export function useTextSortedList<U extends string | number | Record<string, string | number | object>>(
    listToSort: U[],
    defaultSortOrder: ("ASC" | "DESC") | {}&string,
    propertyToSortOn: string | number | null
  ): readonly [
    U[],
    (
      sortOrder: ("ASC" | "DESC") | {}&string,
      propertyToSortOn: string | number | null
    ) => void
  ];
  /**
   * useSearchParamsState:
   *
   * used to ensure that `useSearchParams()` doesn't lose any URL location search state between route changes.
   *
   * @param {String} searchParamName
   * @param {Boolean=} canReplace
   * @param {String=} defaultValue
   *
   * @returns `[String, Function, Function]`
   */
  export function useSearchParamsState<S extends string = string>(
    searchParamName: string,
    canReplace?: boolean, 
    defaultValue?: S
  ): readonly [
    S,
    (newSearchParamValue: S | ((prevSearchParamValue: S) => S)) => void,
    () => void
  ];
  /**
   * useGeoLocation:
   *
   * used to fetch geolocation data for the current pyhsical location of any  web browser
   *
   * @param {PositionOptions}
   * @param {GeoLocationInfo}
   *
   * @returns {Object}
   */
  export function useGeoLocation(options?: PositionOptions, defaultLocation?: GeoLocationInfo): readonly [IGeoLocationSensorState, {
	readonly reload: () => void;
	readonly refetch: () => void;
  }];
  /**
   * useControlKeyPress:
   *
   * used to respond to `keypress` event in the browser specifically for control keys (e.g. Enter, Tab).
   *
   * @param {Function} callback
   * @param {Array.<String>} keys
   *
   * @returns void
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
   * @param {{ when: Boolean, message: String, extraWatchProperty: String }} options
   *
   * @returns void
   */
  export function useBeforePageUnload(
    callback: (targetElement: EventTarget | null) => void,
    options: { when: boolean, message?: string, extraWatchProperty?: string }
  ): void;
  /**
   * useSignalsBeforePageUnload:
   *
   * used to respond to `beforeunload` event in the browser with a message only when a condition is met (signals variant).
   *
   * @param {Function} callback
   * @param {{ when: Boolean, message: String }} options
   *
   * @returns void
   */
   export function useSignalsBeforePageUnload(
    callback: (targetElement: Window | HTMLBodyElement) => void,
    options: { when: boolean, message: string }
  ): void;
  /**
   * useEffectMemo:
   *
   * used to ensure that the dependecy array though containing unstable references does not result in unstable reference.
   *
   * @param {Function} callback
   * @param {Array} deps
   *
   * @returns *
   */
   export function useEffectMemo<Z extends unknown[], V = unknown>(
	callback: (options: EffectMemoCallbackArgs<Z>) => V,
	deps: Z
   ): V | null
  /**
   * useComponentMounted:
   * 
   * used to determine if a React component is mounted or not.
   *
   * @returns Boolean
   */
  export function useComponentMounted(): boolean;
  /**
   * usePageFocused:
   *
   * used to determine when the document (web page) recieves focus from user interaction.
   *
   * @returns Boolean
   */
  export function usePageFocused(): boolean;
  /**
   * useStateUpdatesWithHistory:
   *
   * used to provide a set of changes made to state over time as an array of history entries
   *
   * @param {String|Object} initialState
   * @param {StateUpdatesForHistoryOptions} options
   *
   * @return {Array}
   */
   export function useStateUpdatesWithHistory<H extends string | object | null>(
	   initialState: H,
	   options?: StateUpdatesForHistoryOptions
   ): readonly [
	   H,
	   {
		   push: ((newUpdateObject: H) => void),
		   redo: () => boolean,
		   undo: () => boolean,
		   reset: ((newInitialUpateState: H) => void),
		   statuses: { canRedo: boolean, canUndo: boolean }
	   }
   ];
  /**
   * useBroswserNetworkStatus:
   *
   * used to report the network status innformation of a web browser
   *
   * @return {BrowserNetworkStatusResult}
   */
   export function useBroswserNetworkStatus(): BrowserNetworkStatusResult
  /**
   * useSignalsPageFocused:
   *
   * used to determine when the document (web page) recieves focus from user interaction (signals variant).
   *
   * @returns {Boolean}
   */
   export function useSignalsPageFocused(): import('@preact/signals-react').ReadonlySignal<boolean>;
  /**
   * useIsFirstRender:
   *
   * used to determine when a React component is only first rendered.
   *
   * @returns {Boolean}
   */
  export function useIsFirstRender(): boolean;
  /**
   * usePreviousProps:
   *
   * used to get the previous props in the current render phase of a components' life
   *
   * @param {import('react').ComponentPropsWithRef<import('react').ElementType>>} props
   * 
   * @returns *
   */
  export function usePreviousProps<T extends import('react').ComponentPropsWithRef<import('react').ElementType>>(props: T): T;
  /**
   * useUIDataFetcher:
   *
   * used to fetch data using a fetcher function ...
   *
   * @param {{ url: ?String, customizePayload: Function }} config
   *
   * @returns `{connectToFetcher: Fucntion, fetcher: Function }`
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
   * useIsDOMElementVisibleOnScreen:
   *
   * used to determine if an intersection observer has targeted a DOM element at the intersection threshold.
   *
   * @param {IntersectionObserverInit=} options
   *
   * @returns `[Boolean, import('react').MutableRefObject<Element | HTMLElement | null>]`
   */
  export function useIsDOMElementVisibleOnScreen(
    options?: IntersectionObserverInit
  ): readonly [boolean, import('react').MutableRefObject<Element | HTMLElement | null>];
  /**
   * useSignalsIsDOMElementVisibleOnScreen:
   *
   * used to determine if an intersection observer has targeted a DOM element at the intersection threshold (signals variant).
   *
   * @param {IntersectionObserverInit=} options
   *
   * @returns `[Boolean, import('react').MutableRefObject<Element | HTMLElement | null>]`
   */
   export function useSignalsIsDOMElementVisibleOnScreen(
    options?: IntersectionObserverInit
  ): readonly [import('@preact/signals-react').ReadonlySignal<boolean>, import('react').MutableRefObject<Element | HTMLElement | null>];
  /**
   * useUICommands:
   * 
   * used to trigger commands for UI related tasks like printing a web page, copying or pasting text.
   * 
   * @param {{ print: PrintOptions }} options
   * 
   * @returns `{ hub: { print: Function, copy: Function, paste: Function } }`
   */
  export function useUICommands(
    options: {
      print: PrintOptions
    }
  ): {
    hub: {
      print: (componentRef?: import('react').MutableRefObject<HTMLElement> | null) => Promise<void>,
      copy: (text: string, selectedElement?: HTMLElement | Node) => Promise<boolean>,
      paste: (selectedElement?: HTMLElement | Node) => Promise<string>
    }
  };
  /**
   * usePreviousRoutePathname:
   *
   * used to get the previous route pathname of a React SPA
   *
   * @returns {String}
   */
  export function usePreviousRoutePathname(): string
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
   * Provider for using the useBus() andd other related hook hook.
   *
   * @param {{ children?: import('react').ReactNode }} props
   * 
   * @returns `JSX.Element`
   */
  export function EventBusProvider({ children }: {
      children?: import('react').ReactNode;
  }): JSX.Element;

  /**
   * Provider for using the useSharedState() hook.
   *
   * @param {{ children?: import('react').ReactNode }} props
   * 
   * @returns `JSX.Element`
   */
  export function SharedStateProvider({ children, initialGlobalState, persistence }: {
      children?: import('react').ReactNode;
      initialGlobalState?: {} | Record<string, unknown>;
      persistence?: { persistOn: "none" | "local" | "session", persistKey: string }
  }): JSX.Element;
}
