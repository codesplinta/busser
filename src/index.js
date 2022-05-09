import { EventBusProvider, useBus, useOn, useWhen, useUpon, usePageRouted } from './eventbus/core'
import { useUIStateManager } from './ui/manager'
import { HttpClientProvider, useUIDataFetcher, useFetchBinder } from './ui/fetcher'

const entry = {
  EventBusProvider,
  HttpClientProvider,
  useBus,
  useuseOn,
  useWhen,
  useUpon,
  usePageRouted,
  useUIStateManager,
  useUIDataFetcher,
  useFetchBinder
}

export default entry
