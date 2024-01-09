'use strict';

import React, {
	useContext,
	useState,
	useMemo,
	useEffect,
	useCallback,
	useRef
} from 'react';
import { useSignalsState } from '../common/index';

const EventBusContext = React.createContext(null)

function EventBusProvider({ children }) {
	const hooksEnabled =
		{}.hasOwnProperty.call(React, 'useMemo') &&
		{}.hasOwnProperty.call(React, 'useCallback')

	if (!hooksEnabled) {
		return new Error(
			"EventBusProvider[Error]: You are using a ReactJS version that ddoesn't support memo hooks"
		)
	}

	/* eslint-disable-next-line react-hooks/rules-of-hooks */
	const handlers = useMemo(() => ({}), [])
	return (
		<EventBusContext.Provider value={handlers}>
			{children}
		</EventBusContext.Provider>
	)
}

/**!
 * `useBus()` ReactJS hook
 */

const useBus = (
	{ subscribes = [], fires = [] },
	/* @HINT: [name]: used to identify the event bus created and used in this hook */
	name = '<no name>'
) => {
	const handlers = useContext(EventBusContext)
	const stats = useRef({
		eventsFired: {},
		eventsFiredCount: 0,
		eventsSubscribed: {},
		eventsSubscribedCount: subscribes.length,
    eventsFiredPath: []
	})

	if (typeof handlers === 'undefined' || handlers === null) {
		throw new Error(
			'[react-busser]: "useBus()" must be used with the <EventBusProvider>'
		)
	}

	const bus = useRef({
		on: function on(event, handler) {
			if (!handlers[event]) {
				handlers[event] = []
			}

			if (typeof handler === 'function') {
				if (subscribes.indexOf(event) === -1) {
					stats.current.eventsSubscribedCount = subscribes.push(event)
				}

				if (typeof stats.current.eventsSubscribed[event] === 'undefined') {
					stats.current.eventsSubscribed[event] = {}
				}

				stats.current.eventsSubscribed[event].timestamp = Date.now()
				stats.current.eventsSubscribed[event].name = name

				handlers[event].push(handler)
			}
		},
		off: function off(callback = null) {
			for (let eventCount = 0; eventCount < subscribes.length; eventCount++) {
				const event = subscribes[eventCount]
				const eventHandlers = handlers[event]

				if (eventHandlers) {
					const index = eventHandlers.indexOf(callback)

					if (index !== -1) {
						eventHandlers.splice(index, 1)
					} else {
						delete handlers[event]
					}
				}
			}
		},
		emit: function emit(eventName, ...data) {
			const returned = []

			/* @TODO: Implement list of events names to be triggered by calling their handlers */
			/* for () { */
			if (eventName in handlers && fires.indexOf(eventName) > -1) {
				const allHandlers = handlers[eventName]

				for (
					let handlersCount = 0;
					handlersCount < allHandlers.length;
					handlersCount++
				) {
					const handler = allHandlers[handlersCount];
					if (typeof handler === 'function') {
						stats.current.eventsFiredCount++
						if (typeof stats.current.eventsFired[eventName] === 'undefined') {
              stats.current.eventsFiredPath.push({ eventName: data });
							stats.current.eventsFired[eventName] = {}
						}

						stats.current.eventsFired[eventName].timestamp = Date.now();
						stats.current.eventsFired[eventName].data = data;
						stats.current.eventsFired[eventName].name = name;

						returned.push(handler.apply(null, data))
					}
				}
			}
			/* } */

			return returned
		}
	}).current

	return [Object.freeze(bus), stats.current]
}

/**!
 * `useUpon()` ReactJS hook
 */

const useUpon = (callback = () => null) => {
	// eslint-disable react-hooks/rules-of-hooks
	const callbackRef = useRef(callback || (() => null))
	callbackRef.current = callback

	return useCallback((...args) => callbackRef.current(...args), [])
}

const useWhen = (
	eventName = '',
	/* @HINT: [argsTransformer]: a pure function used to simply transform arguments to a function */
	argsTransformer = (args) => args,
	/* @HINT: [name]: used to identify the event bus created and used in this hook */
	name = '<no name>'
) => {
	const busEvents = [eventName]
	const [bus] = useBus({ subscribes: busEvents, fires: busEvents }, name)

	const stableArgsTransformer = useUpon(argsTransformer)

	return useCallback(
		(...args) => {
			const argsTransformed = stableArgsTransformer(...args)
			bus.emit.apply(
				bus,
				Array.isArray(argsTransformed)
					? [eventName, ...argsTransformed]
					: [eventName, argsTransformed]
			)
		},
		[bus, eventName, stableArgsTransformer]
	)
}

const useThen = (
	bus,
	eventName,
	/* @HINT: [argsTransformer]: a pure function used to simply transform arguments to a function */
	argsTransformer = (args) => args
) => {
	const stableArgsTransformer = useUpon(argsTransformer)

	return useCallback(
		(...args) => {
			const argsTransformed = stableArgsTransformer(...args)
			bus.emit.apply(
				bus,
				Array.isArray(argsTransformed)
					? [eventName, ...argsTransformed]
					: [eventName, argsTransformed]
			)
		},
		[bus, eventName, stableArgsTransformer]
	)
}

/**!
 * `useOn()` ReactJS hook
 */

const useOn = (
	eventListOrName = '',
	/* @HINT: [callback]: event handler used to respond to an event from an event bus */
	callback = () => true,
	/* @HINT: [name]: used to identify the event bus created and used in this hook */
	name = '<no name>'
) => {
	const isEventAList =
		Array.isArray(eventListOrName) || typeof eventListOrName !== 'string'
	const busEvents = useRef(
		isEventAList ? eventListOrName : [eventListOrName]
	).current
	const [bus, stats] = useBus({ subscribes: busEvents, fires: busEvents }, name)

	const stableCallbacks = useMemo(() => {
		const expandCallback = (eventName) => callback.bind(null, eventName)
		return isEventAList
			? busEvents.map((eventName) => expandCallback(eventName))
			: [callback]
	}, [isEventAList, busEvents, callback])

	useEffect(() => {
		busEvents.forEach((eventName, index) => {
			bus.on(eventName, stableCallbacks[index])
		})

		return () => {
			let index = -1
			busEvents.forEach(() => {
				++index
				bus.off(stableCallbacks[index])
			})
		}
	/* eslint-disable-next-line react-hooks/exhaustive-deps */
	}, [bus, busEvents, stableCallbacks])

	return [bus, stats]
}

/**!
 * `useRoutingBlocked()` ReactJS hook
 */

const useRoutingBlocked = (
	/* @HINT: [eventName]: the name of the event fired when the router should be blocked  page */
	eventName,
	/* @HINT: [history]: react-router-dom history used to register a route change listener */
	history,
	/* @HINT: [name]: used to identify the event bus created and used in this hook */
	name = '<no name>',
	/* @HINT: */
	callback = () => [false, 'Are you sure ?']
) => {
	const listener = useWhen(eventName, (args) => args, name)

	const $callback = useUpon(callback || (() => [false, 'Are you sure ?']))

	useEffect(() => {
		if (
			!history ||
			typeof history.block !== 'function' ||
			typeof eventName !== 'string'
		) {
			return () => null
		}
		const unblock = history.block((...args) => {
			const [isNotOk, promptMessage] = $callback(...args)

			if (isNotOk) {
				const confirmationOk = window.confirm(promptMessage)
				if (confirmationOk) {
					unblock()
					listener([...args, true])
				} else {
					listener([...args, false])
					return false
				}
			}
		})
		return () => unblock()
	}, [history, listener, eventName, $callback])
}

/**!
 * `useRoutingChanged()` ReactJS hook
 */

const useRoutingChanged = (
	/* @HINT: [eventName]: the name of the event fired when the router navigates to a different page */
	eventName,
	/* @HINT: [history]: react-router-dom history used to register a route change listener */
	history,
	/* @HINT: [name]: used to identify the event bus created and used in this hook */
	name = '<no name>',
	/* @HINT: */
	callback = () => undefined
) => {
	const listener = useWhen(
		eventName,
		(...[location, action]) => ({ location, action }),
		name
	)

	const $callback = useUpon(callback || (() => undefined))

	useEffect(() => {
		if (
			!history ||
			typeof history.listen !== 'function' ||
			typeof eventName !== 'string'
		) {
			return () => null
		}
		const unlisten = history.listen((...args) => {
			$callback()
			listener(...args)
		})
		return () => unlisten()
	}, [history, listener, eventName, $callback])
}

/**!
 * `usePromised()` ReactJS hook
 */

const usePromised = (
	eventListOrName = '',
	/* @HINT: [callback]: event handler used to respond to an event from an event bus */
	callback = () => Promise.resolve(false),
	/* @HINT: [name]: used to identify the event bus created and used in this hook */
	name = '<no name>'
) => {
	const [error, setError] = useState(null)
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const handleAsyncOperation = useCallback(
		typeof eventListOrName === 'string'
			? (payload) => {
					try {
						const result = callback(payload)
						return result instanceof Promise ? result : Promise.reject(false)
					} catch (e) {
						setError(e)
					}
			  }
			: (event, payload) => {
					try {
						const result = callback(event, payload)
						return result instanceof Promise ? result : Promise.reject(false)
					} catch (e) {
						setError(e)
					}
			  }
	)

	const [bus, stats] = useOn(eventListOrName, handleAsyncOperation, name)

	return [
		undefined,
		// eslint-disable-next-line react-hooks/rules-of-hooks
		(eventName, argsTransformer) => useThen(bus, eventName, argsTransformer),
		error,
		stats
	]
}

/**!
 * `useList()` ReactJS hook
 */

const useList = (
	eventsListOrName = '',
	listReducer,
	initial = [],
	/* @HINT: [name]: used to identify the event bus created and used in this hook */
	name = '<no name>'
) => {
	const [list, setList] = useState(initial)
	const [error, setError] = useState(null)
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const handleMutationTrigger = useCallback(
		typeof eventsListOrName !== 'string'
			? (event, payload) => {
					setList((prevList) => {
						let nextList
						try {
							nextList = listReducer(prevList, payload, event)
						} catch (e) {
							setTimeout(() => setError(e), 0)
							nextList = prevList
						}

						return nextList
					})
			  }
			: (payload) => {
					setList((prevList) => {
						let nextList
						try {
							nextList = listReducer(prevList, payload)
						} catch (e) {
							setTimeout(() => setError(e), 0)
							nextList = prevList
						}

						return nextList
					})
			  },
		[listReducer]
	)

	const [bus, stats] = useOn(eventsListOrName, handleMutationTrigger, name)

	return [
		list,
		/* eslint-disable-next-line react-hooks/rules-of-hooks */
		(eventName, argsTransformer) => useThen(bus, eventName, argsTransformer),
		error,
		stats
	]
}

/**!
 * `useSignalsList()` ReactJS hook
 */

const useSignalsList = (
	eventsListOrName = '',
	listReducer,
	initial = [],
	/* @HINT: [name]: used to identify the event bus created and used in this hook */
	name = '<no name>'
) => {
	const [list, setList] = useSignalsState(initial)
	const [error, setError] = useSignalsState(null)
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const handleMutationTrigger = useCallback(
		typeof eventsListOrName !== 'string'
			? (event, payload) => {
					setList((prevList) => {
						let nextList
						try {
							nextList = listReducer(prevList, payload, event)
						} catch (e) {
							setTimeout(() => setError(e), 0)
							nextList = prevList
						}

						return nextList
					})
			  }
			: (payload) => {
					setList((prevList) => {
						let nextList
						try {
							nextList = listReducer(prevList, payload)
						} catch (e) {
							setTimeout(() => setError(e), 0)
							nextList = prevList
						}

						return nextList
					})
			  },
		[listReducer]
	)

	const [bus, stats] = useOn(eventsListOrName, handleMutationTrigger, name)

	return [
		list,
		// eslint-disable-next-line react-hooks/rules-of-hooks
		(eventName, argsTransformer) => useThen(bus, eventName, argsTransformer),
		error,
		stats
	]
}

/**!
 * `useComposite()` ReactJS hook
 */

const useComposite = (
	eventsListOrName = '',
	compositeReducer,
	initial = {},
	/* @HINT: [name]: used to identify the event bus created and used in this hook */
	name = '<no name>'
) => {
	const [composite, setComposite] = useState({ ...initial })
	const [error, setError] = useState(null)
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const handleMutationTrigger = useCallback(
		typeof eventsListOrName !== 'string'
			? (event, payload) => {
					setComposite((prevComposite) => {
						try {
							return { ...compositeReducer(prevComposite, payload, event) }
						} catch (e) {
							setTimeout(() => setError(e), 0)
							return prevComposite
						}
					})
			  }
			: (payload) => {
					setComposite((prevComposite) => {
						try {
							return { ...compositeReducer(prevComposite, payload) }
						} catch (e) {
							setTimeout(() => setError(e), 0)
							return prevComposite
						}
					})
			  },
		[compositeReducer]
	)

	const [bus, stats] = useOn(eventsListOrName, handleMutationTrigger, name)

	return [
		composite,
		// eslint-disable-next-line react-hooks/rules-of-hooks
		(eventName, argsTransformer) => useThen(bus, eventName, argsTransformer),
		error,
		stats
	]
}

/**!
 * `useSignalsComposite()` ReactJS hook
 */

const useSignalsComposite = (
	eventsListOrName = '',
	compositeReducer,
	initial = {},
	/* @HINT: [name]: used to identify the event bus created and used in this hook */
	name = '<no name>'
) => {
	const [composite, setComposite] = useSignalsState({ ...initial })
	const [error, setError] = useSignalsState(null)
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const handleMutationTrigger = useCallback(
		typeof eventsListOrName !== 'string'
			? (event, payload) => {
					setComposite((prevComposite) => {
						try {
							return { ...compositeReducer(prevComposite, payload, event) }
						} catch (e) {
							setTimeout(() => setError(e), 0)
							return prevComposite
						}
					})
			  }
			: (payload) => {
					setComposite((prevComposite) => {
						try {
							return { ...compositeReducer(prevComposite, payload) }
						} catch (e) {
							setTimeout(() => setError(e), 0)
							return prevComposite
						}
					})
			  },
		[compositeReducer]
	)

	const [bus, stats] = useOn(eventsListOrName, handleMutationTrigger, name)

	return [
		composite,
		// eslint-disable-next-line react-hooks/rules-of-hooks
		(eventName, argsTransformer) => useThen(bus, eventName, argsTransformer),
		error,
		stats
	]
}

/**!
 * `useCount()` ReactJS hook
 */

const useCount = (
	/* @HINT: [eventsList]: this list of events */
	eventsList = [],
	countReducer,
	{ start = 0, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER },
	/* @HINT: [name]: used to identify the event bus created and used in this hook */
	name = '<no name>'
) => {
	// eslint-disable react-hooks/rules-of-hooks
	if (
		typeof start !== 'number' ||
		typeof min !== 'number' ||
		typeof max !== 'number'
	) {
		throw new Error(
			'[react-busser]: "useCount()" incorrect count bounds data type'
		)
	}

	if (start < min || start > max) {
		throw new Error('[react-busser]: "useCount()" incorrect count bounds range')
	}

	const bounds = useRef({ min, max })
	const [count, setCount] = useState(start)
	const [error, setError] = useState(null)
	const handleMutationTrigger = useCallback(
		(event, directionOrCountItem) => {
			setCount((prevCount) => {
				const probableNextCount = prevCount + 1
				const probablePrevCount = prevCount - 1
				const limit = bounds.current

				try {
					return probablePrevCount < limit.min && probableNextCount > limit.max
						? prevCount
						: countReducer(prevCount, directionOrCountItem, event)
				} catch (e) {
					setTimeout(() => setError(e), 0)
					return prevCount
				}
			})
		},
		[countReducer]
	)
	const [bus, stats] = useOn(eventsList, handleMutationTrigger, name)

	return [
		count,
		// eslint-disable-next-line react-hooks/rules-of-hooks
		(eventName, argsTransformer) => useThen(bus, eventName, argsTransformer),
		error,
		stats
	]
}

/**!
 * `useSignalsCount()` ReactJS hook
 */

const useSignalsCount = (
	eventsList = [],
	countReducer,
	{ start = 0, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER },
	/* @HINT: [name]: used to identify the event bus created and used in this hook */
	name = '<no name>'
) => {
	if (
		typeof start !== 'number' ||
		typeof min !== 'number' ||
		typeof max !== 'number'
	) {
		throw new Error(
			'[react-busser]: "useSignalCount()" incorrect count bounds data type'
		)
	}

	if (start < min || start > max) {
		throw new Error(
			'[react-busser]: "useSignalCount()" incorrect count bounds range'
		)
	}

	const bounds = useRef({ min, max })
	const [count, setCount] = useSignalsState(start)
	const [error, setError] = useSignalsState(null)
	const handleMutationTrigger = useCallback(
		(event, directionOrCountItem) => {
			setCount((prevCount) => {
				const probableNextCount = prevCount + 1
				const probablePrevCount = prevCount - 1
				const limit = bounds.current

				try {
					return probablePrevCount < limit.min && probableNextCount > limit.max
						? prevCount
						: countReducer(prevCount, directionOrCountItem, event)
				} catch (e) {
					setTimeout(() => setError(e), 0)
					return prevCount
				}
			})
		},
		/* eslint-disable-next-line react-hooks/exhaustive-deps */
		[countReducer]
	)
	const [bus, stats] = useOn(eventsList, handleMutationTrigger, name)

	return [
		count,
		// eslint-disable-next-line react-hooks/rules-of-hooks
		(eventName, argsTransformer) => useThen(bus, eventName, argsTransformer),
		error,
		stats
	]
}

export {
	EventBusProvider,
	useSignalsComposite,
	useRoutingBlocked,
	useRoutingChanged,
	useSignalsCount,
	useSignalsList,
	useComposite,
	usePromised,
	useCount,
	useList,
	useUpon,
	useBus,
	useOn
}
