'use strict'

import React, { useContext, useState } from 'react'

import { useSignalsState } from '../common/index'
import { useBus } from '../eventbus/core.jsx'
import { getHttpClientDriverName } from '../helpers'

const HttpClientContext = React.createContext(null)

function HttpClientProvider({ children, httpClient }) {
	return (
		<HttpClientContext.Provider value={httpClient}>
			{children}
		</HttpClientContext.Provider>
	)
}

const useHttpSignals = (name = 'Http.Client.Transport.Context') => {
	const [bus, stats] = useBus(
		{
			subscribes: [],
			fires: [
				'request:started',
				'request:ended',
				'request:aborted',
				'request:cleanup'
			]
		},
		name
	)

	return {
		stats,
		signalRequestStarted(eventPayload) {
			bus.emit('request:started', eventPayload)
		},
		signalRequestEnded(eventPayload) {
			bus.emit('request:ended', eventPayload)
		},
		signalRequestAborted(eventPayload) {
			bus.emit('request:aborted', eventPayload)
		},
		signalCleanup(eventPayload) {
			bus.emit('request:cleanup', eventPayload)
		}
	}
}

const useUIDataFetcher = function UIDataFetcher({
	url = null,
	customizePayload = (response) => {
		return response
	}
}) {
	const fetch = useContext(HttpClientContext)
	const { signalRequestStarted, signalRequestEnded, signalCleanup } =
		useHttpSignals()

	const httpClientDriverName = getHttpClientDriverName(fetch)

	const _fetch = ({ src, params = {}, method = 'GET', metadata = {} }) => {
		const asQuery = params.query.search(/^\s*query\s{1,}\{/im) !== -1
		const asMutation = params.query.search(/^\s*mutation\s{1,}\{/im) !== -1
		const asSubscription =
			params.query.search(/^\s*subscription\s{1,}\{/im) !== -1

		if (method.toLowerCase() === 'get' || method.toLowerCase() === 'post') {
			if (typeof params.query === 'string' && (asQuery || asMutation)) {
				metadata.isGraphQl = true
				metadata.requestType =
					(asQuery && 'query') ||
					(asMutation && 'mutation') ||
					(asSubscription && 'subscription')
			} else {
				metadata.isGraphQl = false
				metadata.requestType = 'REST'
			}
		} else if (
			method.toLowerCase() !== 'get' ||
			method.toLowerCase() !== 'head'
		) {
			metadata.isGraphQl = false
		}

		signalRequestStarted({
			success: null,
			error: null,
			metadata
		})

		let promise = null

		if (httpClientDriverName === 'axios') {
			promise = fetch({ url: url || src, method, data: params })
		} else if (httpClientDriverName === 'fetch') {
			promise = fetch(url, params)
		}

		return promise
			.then(function onData(payload) {
				if (payload.error) {
					const error = customizePayload(
						payload instanceof Error ? payload : payload.error || payload,
						'error'
					)

					signalRequestEnded({
						error,
						success: null,
						metadata
					})

					return error
				} else {
					const success = customizePayload(
						payload.response || payload.data || payload,
						'response'
					)

					signalRequestEnded({
						success,
						error: null,
						metadata
					})

					return success
				}
			})
			.catch(function onError(payload) {
				const error = customizePayload(
					payload instanceof Error ? payload : payload.error || payload,
					'error'
				)

				signalRequestEnded({
					success: null,
					error,
					metadata
				})

				return error
			})
			.finally(function onFinish() {
				return signalCleanup(null)
			})
	}

	const connectToFetcher = (templateFunction) => {
		return typeof templateFunction === 'function'
			? templateFunction.bind(null, _fetch)
			: templateFunction
	}

	return {
		connectToFetcher,
		fetcher: _fetch
	}
}

const useFetchBinder = function FetchBinder(callback = (fn) => fn) {
	const [fetchData, setFetchData] = useState(null)
	const [fetchError, setFetchError] = useState(null)

	if (typeof callback !== 'function') {
		return {
			fetchData,
			fetchError,
			boundFetcher: (fetch) => {
				if (typeof fetch !== 'function') {
					return Promise.reject(new Error('unbounded'))
				}

				return Promise.reject(null)
			}
		}
	}

	return {
		fetchData,
		fetchError,
		boundFetcher: callback(function queryFn(fetch) {
			if (typeof fetch !== 'function') {
				return Promise.reject(null)
			}

			return fetch
				.then((success) => {
					setFetchData(success)
				})
				.catch((error) => {
					setFetchError(error)
				})
		})
	}
}

const useFetchSignalsBinder = function FetchBinder(callback = (fn) => fn) {
	const [fetchData, setFetchData] = useSignalsState(null)
	const [fetchError, setFetchError] = useSignalsState(null)

	if (typeof callback !== 'function') {
		return {}
	}

	return {
		fetchData,
		fetchError,
		boundFetcher: callback(function queryFn(fetch) {
			return fetch
				.then((success) => {
					setFetchData(success)
				})
				.catch((error) => {
					setFetchError(error)
				})
		})
	}
}

export {
	HttpClientProvider,
	useUIDataFetcher,
	useFetchSignalsBinder,
	useFetchBinder,
	useHttpSignals
}
