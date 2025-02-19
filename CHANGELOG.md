<a name="1.0.0"></a>
# 1.0.0 (2025-02-19)

### Feature Added
- Added `useTextSortedList()` hook.
- Added `useBrowserStorageEffectUpdates()` hook.
- Added `useSearchParamStateValue()` hook.
- Added `useSearchParamStateValueUpdate()` hook.
- Added `useBrowserScreenActivityStatusMonitor()` hook.
- Updated `getFromStorage()` returned by the `useBrowserStorage()` hook to write the **defaultValue** (second argument) to storage.
- Added `hasKeyInStorage(...)` and `hasKeyPrefixInStorage(...)` to the object returned by the `useBrowserStorage()` hook.

### Bug Fixes
- Fixed bug within `useSearchParamsState()` hook - the search param default value isn't included in the browser url on mount.
- Fixed issue with `useUICommands()` hook with a couple of breaking changes introduced. 

### Chores
- Refactored internal implementation within `useRoutingMonitor()` hook with some breaking changes introduced.
- Refactored internal implementation within `useBeforePageUnload()` hook.
- Updated `clipboard-polyfill` dependency from `v4.0.2` to `v4.1.1`
- Removed `PRINT_COMMAND`, `COPY_COMMAND` and `PASTE_COMMAND` constants from public API export.

<a name="0.1.3"></a>
# 0.1.3 (2024-05-05)

### Chores
- Updated `mocklets` dev dependency from `v0.0.3` to `v0.0.5`
- Updated type delcaration file

### Bug Fixes
- None

<a name="0.1.2"></a>
# 0.1.2 (2024-04-25)

### Feature Added
- Added the option to pass an updater function as first argument to `useSharedState()` and `useSharedSignalsState()` hooks.
- Installed dev dependency `mockelets` for use as test helpers for missing **jest-dom** browser APIs

### Bug Fixes
- Fixed bug with `useSharedState()` and `useSharedSignalsState()` hooks not updating due to subscription callbacks getting re-initialized on the `<SharedGlobalStateProvider>` re-render.
- Refactored `useTextFilteredList()` and `useTextFilteredSignalsList()` hooks to use one instance of `textSearchAlgorithms` 

<a name="0.1.1"></a>
# 0.1.1 (2024-04-16)

### Feature Added
- Added `useSignalsProperty()` hook (data primitive - signals variant).
- Added `useSignalsIsDOMElementVisibleOnScreen()` hook (signals variant).
- Added `useSignalsBeforePageUnload()` hook (signals variant).
- Added `useSignalsPageFocused()` hook (signals variant).

### Bug Fixes
- Fixed specific types in TypeScript declaration file

<a name="0.1.0"></a>
# 0.1.0 (2024-04-11)

>Includes breaking change

### Feature Added
- [Breaking Change]: Renamed `useIsDOMElementIntersecting()` hook to `useIsDOMElementVisibleOnScreen()`.
- Added `useProperty()` hook as data primitive.
- Added argument type guards for all other data primitive hook: `useList()`, `useCount()` and `useComposite()`.

### Bug Fixes
- Fixed TS declaration file issues

<a name="0.0.5"></a>
# 0.0.5 (2024-03-31)

### Feature Added
- Updated deprecated dev dependency `rollup-plugin-terser` v7.0.2 to `@rollup/plugin-terser` v0.4.4 for issue by [@iamgabrielsoft](https://github.com/iamgabrielsoft) Related: [Issue #4](https://github.com/codesplinta/busser/issues/4)
- Added `react-router-dom-v5-compat` migration package to begin path to support for RemixRun v1.x

### Bug Fixes
- None

<a name="0.0.4"></a>
# 0.0.4 (2024-03-21)

### Feature Added
- None

### Bug Fixes
- Fixed callback data bug with `useTextFilteredList()` and `useTextFilteredSignalsList()` hooks


<a name="0.0.3"></a>
# 0.0.3 (2024-03-20)

### Feature Added
- None

### Bug Fixes
- Fixed re-render update bugs with `useTextFilteredList()` and `useTextFilteredSignalsList()` hooks

<a name="0.0.2"></a>
# 0.0.2 (2024-03-17)

### Feature Added
- Added `useBrowserStorageEvent()` hook

### Bug Fixes
- Made `"@preact/signals-react"` package a dependency insteadd of a peer dependency
- Fixed missing argument bug for `useUICommands()` hook

<a name="0.0.1"></a>
# 0.0.1 (2024-03-06)

### Feature Added
- Added `useBus()` hook
- Added `useOn()` hook
- Added `useUpon()` hook
- Added `usePromised()` hook
- Added `useComposite()` hook
- Added `useList()` hook
- Added `useCount()` hook
- Added `useRoutingChanged()` hook
- Added `useRoutingBlocked()` hook
- Added `useRoutingMonitor()` hook
- Added `useSharedState()` hook
- Added `useSharedSignalsState()` hook
- Added `useBrowserStorage()` hook
- Added `useBrowserStorageWithEncryption()` hook
- Added `useHttpSignals()` hook
- Added `useSearchParamsState()` hook
- Added `useUnsavedChangesLock()` hook
- Added `useTextFilteredList()` hook
- Added `useOutsideClick()` hook
- Added `useIsFirstRender()` hook
- Added `useControlKeysPress()` hook
- Added `usePreviousProps()` hook
- Added `useComponentMounted()` hook
- Added `useBeforePageUnload()` hook
- Added `useIsDOMElementIntersecting()` hook
- Added `useBeforePageUnload()` hook
- Added `useTextFilteredSignalsList()` hook
- Added `useAppState()` hook
- Added `useAppEffect()` hook
- Added `useSingalsState()` hook
- Added `useSignalsEffect()` hook
- Added `useSignalsComputed()` hook
- Added `useSignalsList()` hook
- Added `useSignalsCount()` hook
- Added `useSignalsPromised()` hook
- Added `useSignalsComposite()` hook
- Added `useUICommands()` hook
- Added `useFetchBinder()` hook
- Added `useUIDataFetcher()` hook


### Bug Fixes
- None