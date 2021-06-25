import { useState } from 'react'
import { useEventBus } from '../eventbus/core'
import { getHttpClientDriver } from '../helpers'

export function useUIDataFetcher ({ 
  httpClientDriverName = 'axios',
  defaultFetchData = null,
  defaultFetchError = null,
  customizePayload = r => {
    return r;
  }
 }) {
  const bus = useEventBus([], ['request:started', 'request:ended', 'request:aborted', 'cleanup'])

  const [fetchData, setFetchData] = useState(defaultFetchData);
  const [fetchError, setFetchError] = useState(defaultFetchError);
  Const fetch = getHttpClientDriver(httpClientDriverName)
  const _fetch = (urlOrQuery, params = {}, method = 'POST') => {
    bus.emit('request:started', {})
      let promise = null
      if (httpClientDriverName === 'axios') {
        promise = fetch()
      } else if (httpClientDriverName === 'isomorphic-fetch') {
        promise = fetch(urlOrQuery, params)
      } else if (httpClientDriverName === 'fetch') {
	promise = fetch(urlOrQuery, params)
      }
      return promise.then(function onData(payload) {
        if (payload.error) {
          bus.emit('request:ended', { error: payload.error, success: null });
        } else {
          bus.emit('request:ended', {
            success: payload.response,
            error: null,
            metadata: { customizePayload }
          });
        }
        setFetchData(customizePayload(payload.response, 'response'));
      })
      .catch(function onError(payload) {
        setFetchError(
          customizePayload(
            payload instanceof Error ? payload : payload.error,
            'error'
          )
        );
        bus.emit('request:ended', {
          success: null,
          error: payload instanceof Error ? payload : payload.error,
          metadata: { customizePayload }
        });
      })
      .finally(function onFinish() {
        return bus.emit('cleanup', null)
      });
  };

  const connectToFetcher = templateFunction => {
    return typeof templateFunction === 'function'
      ? templateFunction.bind(null, _fetch)
      : templateFunction;
  };

  const connectToReporter = (templateFunction, isErrorReporter = false) => {
    return typeof templateFunction === 'function'
      ? templateFunction.bind(
          null,
          isErrorReporter ? setFetchError : setFetchData
        )
      : templateFunction;
  };

  const connectToFetcherAndReporter = templateFunction => {
    return typeof templateFunction === 'function'
      ? connectToReporter(connectToFetcher(templateFunction), true)
      : templateFunction;
  };

  return {
    connectToFetcherAndReporter,
    connectToFetcher,
    fetcher:_fetch,
    fetchData,
    fetchError
  };
};

