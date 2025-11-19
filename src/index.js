import {
  useSignalsState,
  useSignalsEffect,
  useSignalsComputed,
  useBrowserScreenActivityStatusMonitor,
  useAppState,
  useAppEffect,
  useUICommands
} from "./common/index";
import {
  EventBusProvider,
  useBus,
  useOn,
  useUpon,
  useList,
  useCount,
  useComposite,
  useProperty,
  usePromised,
  useRoutingChanged,
  useRoutingBlocked,
  useSignalsList,
  useSignalsProperty,
  useSignalsCount,
  useSignalsComposite
} from "./eventbus/core";
import {
  SharedGlobalStateProvider,
  useWindowSize,
  useSharedState,
  useSharedSignalsState,
  useBeforePageUnload,
  useSearchParamsState,
  useControlKeysPress,
  useGeoLocation,
  useOutsideClick,
  useLockBodyScroll,
  usePreviousRoutePathname,
  useTextSortedList,
  useEffectCallback,
  useComponentMounted,
  useIsFirstRender,
  usePreviousProps,
  useRoutingMonitor,
  useBrowserStorage,
  useBrowserStorageEvent,
  useSignalsPageFocused,
  useTextFilteredList,
  useUnsavedChangesLock,
  useSearchParamStateValue,
  useTextFilteredSignalsList,
  useSignalsBeforePageUnload,
  useSearchParamStateValueUpdate,
  useIsDOMElementVisibleOnScreen,
  useBrowserStorageWithEncryption,
  useBrowserStorageEffectUpdates,
  useStateUpdatesWithHistory,
  useBrowserNetworkStatus,
  useSignalsIsDOMElementVisibleOnScreen
} from "./utils/core";
import {
  HttpClientProvider,
  useUIDataFetcher,
  useFetchBinder,
  useHttpSignals
} from "./fetcher/core";

/**
 * @constant
 */
const BUSSER_EVENTS = {
  HTTP_REQUEST_STARTED: 'request:started',
  HTTP_REQUEST_ENDED: 'request:ended',
  HTTP_REQUEST_ABORTED: 'request:aborted',
  HTTP_REQUEST_CLEANUP: 'request:cleanup'
};
/**
 * @constant
 */
const SORT_ORDER = {
  ASCENDING: "ASC",
  DESCENDING: "DESC"
};

export {
  EventBusProvider,
  HttpClientProvider,
  SharedGlobalStateProvider,
  useBus,
  useOn,
  useUpon,
  useList,
  useCount,
  useProperty,
  useAppState,
  useAppEffect,
  useHttpSignals,
  useRoutingChanged,
  useRoutingBlocked,
  useSharedState,
  useSharedSignalsState,
  useBeforePageUnload,
  useControlKeysPress,
  usePreviousRoutePathname,
  useTextSortedList,
  useOutsideClick,
  useComponentMounted,
  useIsFirstRender,
  useWindowSize,
  usePreviousProps,
  useRoutingMonitor,
  useBrowserStorage,
  useBrowserStorageEvent,
  useSignalsBeforePageUnload,
  useSignalsPageFocused,
  useSearchParamStateValue,
  useSearchParamStateValueUpdate,
  useIsDOMElementVisibleOnScreen,
  useBrowserScreenActivityStatusMonitor,
  useSignalsIsDOMElementVisibleOnScreen,
  useBrowserStorageEffectUpdates,
  useBrowserStorageWithEncryption,
  useStateUpdatesWithHistory,
  useBrowserNetworkStatus,
  useTextFilteredSignalsList,
  useEffectCallback,
  useUnsavedChangesLock,
  useLockBodyScroll,
  useGeoLocation,
  useSearchParamsState,
  useSignalsList,
  useSignalsCount,
  useSignalsProperty,
  useSignalsState,
  useSignalsEffect,
  useSignalsComputed,
  useSignalsComposite,
  useTextFilteredList,
  useComposite,
  usePromised,
  useUICommands,
  useUIDataFetcher,
  useFetchBinder,

  SORT_ORDER,
  BUSSER_EVENTS
};
