'use strict';

import { useState } from 'react'
import { useEventBus } from '../eventbus/core'
import { getHttpClientDriver, getDefaultHttpServerUrl } from '../helpers'

const useUIDataFetcher = function UIDataFetcher ({ 
  customizePayload = response => {
    return response;
  }
 }) {
  const bus = useEventBus([], ['request:started', 'request:ended', 'request:aborted', 'cleanup'])

  const { httpClientDriverName, fetch } = getHttpClientDriver()
  const _fetch = (url, params = {}, method = 'POST', metadata = {}) => {
      const asQuery = params.query.search(/^\s*query\s{1,}\{/i) !== -1
      const asMutation = params.query.search(/^\s*mutation\s{1,}\{/i) !== -1
      const asSubscription = params.query.search(/^\s*subscription\s{1,}\{/i) !== -1

      if (method.toLowerCase() === 'get'
	|| method.toLowerCase() === 'post') {
    	if (typeof params.query === 'string'
	    && (asQuery || asMutation)) {
	  metadata.isGraphQl = true;
          metadata.isQueryType = asQuery && 'query' || asMutation && 'mutation' || asSubscription && 'subscription'
	} else {
	  metadata.isGraphQl = false;
	}
      } else if (method.toLowerCase() !== 'get'
	|| method.toLowerCase() !== 'head') {
    	metadata.isGraphQl = false;
      }

      bus.emit('request:started', { success: true, error: null, metatdata })

      let promise = null
      let url = getDefaultHttpServerUrl(url)

      if (httpClientDriverName === 'axios') {
        promise = fetch({ url, method, data: params })
      } else if (httpClientDriverName === 'isomorphic-fetch') {
        promise = fetch(url, params)
      } else if (httpClientDriverName === 'fetch') {
	promise = fetch(url, params)
      }

      return promise.then(function onData(payload) {
        if (payload.error) {
	  const error = customizePayload(
	      payload instanceof Error ? payload : payload.error || payload,
	      'error'
            )

          bus.emit('request:ended', {
	    error,
	    success: null,
	    metadata
    	  });

	  return error;
        } else {
	  const success = customizePayload(
	      payload.response || payload,
	      'response'
	    )

          bus.emit('request:ended', {
            success,
            error: null,
            metadata
          });

	  return success;
        }
      })
      .catch(function onError(payload) {
	const error = customizePayload(
	  payload instanceof Error ? payload : payload.error || payload,
	  'error'
        )

        bus.emit('request:ended', {
          success: null,
          error,
          metadata
        });

	return error;
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

  return {
    connectToFetcher,
    fetcher:_fetch,
  };
};

const useFetchBinder = function FetchBinder (callback = (fn) => fn ) {
  if (typeof callback !== 'function') {
    return {}
  }

  const [fetchData, setFetchData] = useState(null)
  const [fetchError, setFetchError] = useState(null)

  return {
    fetchData,
    fetchError,
    boundFetcher: callback(function queryFn(fetch) {
      return fetch.then((success) => {
        setFetchData(success)
      }).catch((error) => {
        setFetchError(error)
      })
    })
  }
}

export { useUIDataFetcher, useFetchBinder }
