import {
  useSignalsState,
  useSignalsEffect,
  useSignalsComputed,
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
  useSharedState,
  useSharedSignalsState,
  useBeforePageUnload,
  useSearchParamsState,
  useControlKeysPress,
  useOutsideClick,
  usePreviousRoutePathname,
  useComponentMounted,
  useIsFirstRender,
  usePreviousProps,
  useRoutingMonitor,
  useBrowserStorage,
  useBrowserStorageEvent,
  useSignalsPageFocused,
  useTextFilteredList,
  useUnsavedChangesLock,
  useTextFilteredSignalsList,
  useSignalsBeforePageUnload,
  useIsDOMElementVisibleOnScreen,
  useBrowserStorageWithEncryption,
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
const PRINT_COMMAND = "print";
/**
 * @constant
 */
const PASTE_COMMAND = "paste";
/**
 * @constant
 */
const COPY_COMMAND = "copy";

const BUSSER_EVENTS = {
  HTTP_REQUEST_STARTED: 'request:started',
  HTTP_REQUEST_ENDED: 'request:ended',
  HTTP_REQUEST_ABORTED: 'request:aborted',
  HTTP_REQUEST_CLEANUP: 'request:cleanup'
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
  useOutsideClick,
  useComponentMounted,
  useIsFirstRender,
  usePreviousProps,
  useRoutingMonitor,
  useBrowserStorage,
  useBrowserStorageEvent,
  useSignalsBeforePageUnload,
  useSignalsPageFocused,
  useIsDOMElementVisibleOnScreen,
  useSignalsIsDOMElementVisibleOnScreen,
  useBrowserStorageWithEncryption,
  useTextFilteredSignalsList,
  useUnsavedChangesLock,
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

  PRINT_COMMAND,
  PASTE_COMMAND,
  COPY_COMMAND,

  BUSSER_EVENTS
};
