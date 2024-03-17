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
  usePromised,
  useRoutingChanged,
  useRoutingBlocked,
  useSignalsList,
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
  useComponentMounted,
  useIsFirstRender,
  usePreviousProps,
  useRoutingMonitor,
  useBrowserStorage,
  useBrowserStorageEvent,
  useTextFilteredList,
  useUnsavedChangesLock,
  useTextFilteredSignalsList,
  useIsDOMElementIntersecting,
  useBrowserStorageWithEncryption
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
  useAppState,
  useAppEffect,
  useHttpSignals,
  useRoutingChanged,
  useRoutingBlocked,
  useSharedState,
  useSharedSignalsState,
  useBeforePageUnload,
  useControlKeysPress,
  useOutsideClick,
  useComponentMounted,
  useIsFirstRender,
  usePreviousProps,
  useRoutingMonitor,
  useBrowserStorage,
  useBrowserStorageEvent,
  useIsDOMElementIntersecting,
  useBrowserStorageWithEncryption,
  useTextFilteredSignalsList,
  useUnsavedChangesLock,
  useSearchParamsState,
  useSignalsList,
  useSignalsCount,
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
