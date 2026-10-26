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
	url = 'file:///',
	customizePayload = (response) => {
		return response
	}
}) {
	const $fetch = useContext(HttpClientContext)
	const { signalRequestStarted, signalRequestEnded, signalCleanup } =
		useHttpSignals()

	const httpClientDriverName = getHttpClientDriverName($fetch);

	const GQL_QUERY_RE        = /^\s*query\b[^{]*\{/im;
	const GQL_MUTATION_RE     = /^\s*mutation\b[^{]*\{/im;
	const GQL_SUBSCRIPTION_RE = /^\s*subscription\b[^{]*\{/im;
	const JSON_LIKE_RE        = /^\s*\{\s*"/;
	
	const buildSearchParams = (query, isGraphQL) => {
		if (query == null || query === '') return new URLSearchParams();
		if (typeof query === 'string') {
			/* @HINT: a GraphQL document must be sent as the `query` param, not as a raw query string */
			return isGraphQL ? new URLSearchParams({ query }) : new URLSearchParams(query);
		}
		if (query instanceof URLSearchParams) return query;
		return new URLSearchParams(
			Object.entries(query)
				.filter(([, value]) => value != null)
				.map(([key, _value]) => [key, typeof _value === 'object' ? JSON.stringify(_value) : String(_value)])
		);
	};
	
	const isBodyJsonSerializable = (body) =>
		body !== null && typeof body === 'object' &&
		!(body instanceof FormData) && !(body instanceof Blob) &&
		!(body instanceof URLSearchParams) && !(body instanceof ArrayBuffer) &&
		!ArrayBuffer.isView(body);
	
	const readFetchResponse = async (res, method) => {
		const contentType = res.headers.get('content-type') || '';
		let data = null;
		if (res.status !== 204 && method !== 'HEAD') {
			data = contentType.includes('json')
				? await res.json().catch(() => null)
				: await res.text();
		}
		return { ok: res.ok, status: res.status, statusText: res.statusText, headers: res.headers, data };
	};
	
	const toError = (payload) =>
		customizePayload(payload instanceof Error ? payload : payload?.error || payload);
	
	const isErrorPayload = (payload) =>
		payload instanceof Error ||
		(payload !== null && typeof payload === 'object' &&
			(Boolean(payload.error) || ('ok' in payload && !payload.ok)));
	
	const _fetch = async ({ params = {}, method = 'GET', metadata = {} }) => {
		if (httpClientDriverName !== 'axios' && httpClientDriverName !== 'fetch') {
			throw new Error(`Unsupported HTTP client driver: ${httpClientDriverName}`);
		}
	
		const verb = String(method).toUpperCase();
		const isDefaultIdempotent = verb === 'GET' || verb === 'HEAD';
		const isNotDefaultIdempotent = !isDefaultIdempotent;
		const { query, body, headers, ...rest } = params;
		const target = url;
	
		const hasStringQuery = typeof query === 'string' && query !== '';
	
		const asQuery = hasStringQuery
			? GQL_QUERY_RE.test(query) || (isDefaultIdempotent && JSON_LIKE_RE.test(query))
			: isDefaultIdempotent && query instanceof Object;
		const asMutation = hasStringQuery
			? GQL_MUTATION_RE.test(query) || (isNotDefaultIdempotent && JSON_LIKE_RE.test(query))
			: isNotDefaultIdempotent && body instanceof Object;
		const asSubscription = hasStringQuery && GQL_SUBSCRIPTION_RE.test(query);
	
		const isGraphQL = hasStringQuery && (asQuery || asMutation || asSubscription);
	
		/* @HINT: Copy in a defensive way so the caller's object isn't mutated */
		metadata = {
			...metadata,
			requestType: !isGraphQL ? 'http-request'
				: asQuery ? 'graphql-query'
				: asMutation ? 'graphql-mutation'
				: 'graphql-subscription'
		};
	
		const searchParams = buildSearchParams(query, isGraphQL);
		let success = null;
		let error = null;
		let failed = false;

		signalRequestStarted({ success: null, error: null, metadata });
	
		try {
			let payload;
	
			if (httpClientDriverName === 'axios') {
				payload = await $fetch({
					...rest,
					url: target,
					method: verb,
					headers,
					withCredentials: false,
					params: searchParams,
					data: isDefaultIdempotent ? undefined : body
				});
			} else {
				const qs = searchParams.toString();
				const fullUrl = qs ? `${target}${target.includes('?') ? '&' : '?'}${qs}` : target;
				const init = { ...rest, method: verb, headers: new Headers(headers), credentials: 'omit' };
	
				if (isNotDefaultIdempotent && body != null) {
					if (isBodyJsonSerializable(body)) {
						init.body = JSON.stringify(body);
						if (!init.headers.has('content-type')) init.headers.set('content-type', 'application/json');
					} else {
						init.body = body;
					}
				}
				payload = await readFetchResponse(await $fetch(fullUrl, init), verb);
			}
	
			if (isErrorPayload(payload)) {
				failed = true;
				error = toError(payload);
			} else {
				success = customizePayload(payload?.response ?? payload?.data ?? payload);
			}
		} catch (err) {
			failed = true;
			error = toError(err);
		} finally {
			signalRequestEnded({ success, error, metadata });
			signalCleanup(null);                            
		}
	
		if (failed) throw error;
		return success;
	};

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
