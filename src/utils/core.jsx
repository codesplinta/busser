import React, {
	useEffect,
	useRef,
	useMemo,
	useState,
	useCallback,
	useContext
} from 'react'
import {
	useHistory,
	useLocation
} from 'react-router-dom'
import { useSignalsState, useSignalsEffect } from '../common/index'

import debounce from 'lodash.debounce'

import {
	stateValuesHasDiff,
	toUniqueItemList,
	extractPropertyValue,
	throttleFilterCallbackRoutine
} from '../helpers.js'

const SharedStateContext = React.createContext(null);

/**!
 * @SOURCE: https://github.com/jdthornton/uselockbodyscroll/blob/master/src/index.ts
 *
 * `useLockBodyScroll()` ReactJS hook
 */

export const useLockBodyScroll = (isActive: boolean = true) => {
  const _effect = typeof React.useLayoutEffect === "function"
  	? React.useLayoutEffect
	: React.useEffect;
  _effect(() => {
    if(isActive){
      const originalStyle = window.getComputedStyle(window.document.body).overflow;

      if (originalStyle !== "hidden") {
	/* @TODO: Add a <style> tag instead of this inline style */
      	window.document.body.style.overflow = "hidden";
      }

      return () => {
        window.document.body.style.overflow = originalStyle
      }
    }
  }, [isActive]);
}

/**!
 * @SOURCE: https://betterprogramming.pub/im-hooked-on-hooks-b519e5b9a498
 *
 * `useIsFirstRender()` ReactJS hook
 */
 export const useIsFirstRender = () => {
	const isFirst = useRef(true)

	if (isFirst.current) {
		isFirst.current = false
		return true
	}

	return isFirst.current
}

/*

/**
 * @desc Made compatible with {GeolocationPositionError} and {PositionError} cause
 * PositionError been renamed to GeolocationPositionError in typescript 4.1.x and making
 * own compatible interface is most easiest way to avoid errors.
 * /
export interface IGeolocationPositionError {
  readonly code: number;
  readonly message: string;
  readonly PERMISSION_DENIED: number;
  readonly POSITION_UNAVAILABLE: number;
  readonly TIMEOUT: number;
}

export interface GeoLocationSensorState {
  loading: boolean;
  accuracy: number | null;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  latitude: number | null;
  longitude: number | null;
  speed: number | null;
  timestamp: number | null;
  error?: Error | IGeolocationPositionError;
}

const useGeolocation = (options?: PositionOptions): GeoLocationSensorState => {
  const [state, setState] = useState<GeoLocationSensorState>({
    loading: true,
    accuracy: null,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    latitude: null,
    longitude: null,
    speed: null,
    timestamp: Date.now(),
  });
  let mounted = true;
  let watchId: any;

  const onEvent = (event: any) => {
    if (mounted) {
      setState({
        loading: false,
        accuracy: event.coords.accuracy,
        altitude: event.coords.altitude,
        altitudeAccuracy: event.coords.altitudeAccuracy,
        heading: event.coords.heading,
        latitude: event.coords.latitude,
        longitude: event.coords.longitude,
        speed: event.coords.speed,
        timestamp: event.timestamp,
      });
    }
  };
  const onEventError = (error: IGeolocationPositionError) =>
    mounted && setState((oldState) => ({ ...oldState, loading: false, error }));

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(onEvent, onEventError, options);
    watchId = navigator.geolocation.watchPosition(onEvent, onEventError, options);

    return () => {
      mounted = false;
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return state;
};

*/

/**!
 *
 */
export const useGeoLocation = () => {
  const [isLoading, setLoading] = React.useState<boolean>(false);
  const { setToStorage, getFromStorage } = useBrowserStorage({
    storageType: "session",
  });

  const devLocation = {
    lat: 43.55860879999999,
    lng: -79.70326799999999,
  };
  const defaultLocation = {
    lat: 0,
    lng: 0,
  };

  useEffect(() => {
    if (devEnv) {
      setToStorage("user_center_choords", devLocation);
      if (isLoading) {
        setLoading(false);
      }
    } else if (navigator.geolocation) {
      setLoading((prevLoading) => {
        if (prevLoading) {
          return prevLoading;
        }
        return true;
      });
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          if (
            devLocation.lat === null ||
            devLocation.lat !== userLocation.lat
          ) {
            setToStorage("user_center_choords", userLocation);
          }
          if (isLoading) {
            setLoading(false);
          }
        },
        (err) => {
          console.error("Geolocation error:", err);
          console.error(err.message);
          if (isLoading) {
            setLoading(false);
          }
        },
        {
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    } else {
      if (isLoading) {
        setLoading(false);
      }
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [isLoading]);

  return {
    isLoading,
    getLocation: getFromStorage<{ lat: number; lng: number }>(
      "user_center_choords",
      devEnv ? devLocation : defaultLocation
    ),
  };
};

/**!
 * `useBroswserNetworkStatus` ReactJS hook
 */
export const useBroswserNetworkStatus = () => {
  const [connectionState, setNetworkConnectionState] = useState(() => {
	return {
	    online: true,
	    previousOnline: true,
	    lastChanged: new Date(),
	    connectionType: 'slow-2g',
	};
  });

  useEffect(() => {
    const browserNetworkState = (window.navigator.connection 
			   	|| window.navigator.mozConnection
			   		|| window.navigator.webkitConnection)
    const handleStateChange = () => {
      setNetworkConnectionState(getCurrentConnectionState);
    };

    function getCurrentConnectionState (previousConnectionState) {
	  const online = window.navigator.onLine;
	  const previousOnline = previousConnectionState.previousOnline;
	
	  return {
	    online,
	    previousOnline,
	    lastChanged: online !== previousOnline
		    ? new Date() : previousConnectionState.lastChanged,
	    connectionType: browserNetworkState?.effectiveType || previousConnectionState.effectiveType,
	  };
    }

    try {
      	window.addEventListener('online', handleStateChange, { passive: true });
    	window.addEventListener('offline', handleStateChange, { passive: true });
    } catch {
     	window.addEventListener('online', handleStateChange, false);
    	window.addEventListener('offline', handleStateChange, false);
    }

    if (browserNetworkState) {
	try {
      	     browserNetworkState.addEventListener('change', handleStateChange, { passive: true });
	} catch {
	     browserNetworkState.addEventListener('change', handleStateChange, false);
	}
    }

    if (connectionState.online === false 
	&& connectionState.online !== connectionState.previousOnline) {
	  setNetworkConnectionState(getCurrentConnectionState); 
    }

    return () => {
      window.removeEventListener('online', handleStateChange);
      window.removeEventListener('offline', handleStateChange);

      if (browserNetworkState) {
        browserNetworkState.removeEventListener('change', handleStateChange);
      }
    };
  }, []);

  return connectionState;
}

/**!
 * `useWindowSize()` ReactJS hook
 */
export const useWindowSize = ({ width = 0, height = 0 } = {}) => {
	const [size, setSize] = useState(() => {
		if (typeof window === "undefined") {
			return { width, height };
		}
		return { width: window.outerWidth, height: window.outerHeight };
        });

	useEffect(() => {
		const onResize = () => {
			setSize({ width: window.outerWidth, height: window.outerHeight });
		};
		window.addEventListener("resize", onResize);

		if (width !== window.outerWidth || height !== window.outerHeight) {
			setSize({ width: window.outerWidth, height: window.outerHeight });
		}

		return () => {
			window.removeEventListener("resize", onResize);
		};
	}, []);

	return size;
};

/**!
 * `useBrowserStorage()` ReactJS hook
 */

export const useBrowserStorage = ({ storageType = 'local' }) => {
	return {
		setToStorage(key = '', value = null) {
			/* @HINT: deciding what storage type to write to `localStorage` | `sessionStorage` */
			const storageDriver =
				storageType === 'session' ? sessionStorage : localStorage
			if (storageDriver && typeof storageDriver.setItem === 'function') {
				try {
					if (value !== null) {
						if (typeof key === 'string') {
							storageDriver.setItem(
								key,
								typeof value === 'string' ? value : JSON.stringify(value)
							)
							return true
						}
					}
				} catch (error) {
					const storageError = error
					if (storageError.name === 'QuotaExceededError') {
						return false
					}
				}
			}
			return false
		},
		hasKeyInStorage(key = '') {
			const storageDriver =
				storageType === 'session' ? sessionStorage : localStorage
			return Object.keys(storageDriver).filter(
				($key) => $key.toLowerCase() === key.toLowerCase()
			).length > 0;
		},
		hasKeyPrefixInStorage(keyPrefix = '') {
			const storageDriver =
				storageType === 'session' ? sessionStorage : localStorage
			return Object.keys(storageDriver).filter(
				($key) => $key.toLowerCase().startsWith(keyPrefix.toLowerCase())
			).length > 0;
		},
		clearFromStorage(key = '') {
			/* @HINT: As the component unmounts, we want to delete from `localStorage` | `sessionStorage` */
			const storageDriver =
				storageType === 'session' ? sessionStorage : localStorage
			if (storageDriver && typeof storageDriver.removeItem === 'function') {
				try {
					storageDriver.removeItem(key)
				} catch (_) {
					return false
				}
				return true
			}
			return false
		},
		getFromStorage(key = '', defaultPayload = {}) {
			if (typeof window === 'undefined') {
				return defaultPayload;
			}
			/* @HINT: */
			const storageDriver =
				storageType === 'session' ? sessionStorage : localStorage
			/* @HINT: We want to fetch from `sessionStorage` */
			let stringifiedPayload = null

			try {
				if (storageDriver && typeof storageDriver.getItem === 'function') {
					stringifiedPayload = storageDriver.getItem(key);
					if (
						stringifiedPayload === null &&
						typeof defaultPayload !== "undefined"
					  ) {
						storageDriver.setItem(
						key,
						typeof defaultPayload === "string"
							? defaultPayload
							: JSON.stringify(defaultPayload)
						);
					}
				}
			} catch (error) {
				const storageError = error
				if (storageError.name === 'SecurityError') {
					stringifiedPayload = null
				}
			}

			let payload = null
			try {
				payload = !stringifiedPayload
					? defaultPayload
					: JSON.parse(stringifiedPayload)
			} catch (err) {
				const error = err
				payload = defaultPayload
				if (error.name === 'SyntaxError') {
					if (stringifiedPayload !== null) {
						payload = stringifiedPayload
					}
				}
			}

			return payload
		}
	}
}

const atomObservableCallbacks = new Set();

const atomObservableFactory = (function ($atomObservableCallbacks) {
	return (shared, persistence, setToStorage) => {
		return {
			getState (key) {
				if (key === '' || !key) {
					return JSON.parse(JSON.stringify(shared.current))
				}

				if (key && typeof key === 'string') {
					return shared.current[key]
				}
				return {}
			},
			dispatch (updatePayload) {
				let slice, value;

				const stale = this.getState('')

				if (typeof updatePayload === "function") {
				   ({ slice, value } = updatePayload(stale))
				} else {
				   ({ slice, value } = updatePayload)
				}

				if (typeof slice === 'undefined') {
					shared.current = value
				} else {
					shared.current[slice] = value
				}

				if (persistence.persistOn !== 'none') {
					setToStorage(persistence.persistKey, shared.current)
				}

				for (const callbackAndKey of $atomObservableCallbacks) {
					const [callback, key] = callbackAndKey

					const staleType = key ? typeof stale[key] : typeof stale
					const sharedType = key ? typeof shared.current[key] : typeof shared.current

					let shouldUpdate = false

					if (staleType === 'object' || sharedType === 'object') {
						shouldUpdate = stateValuesHasDiff(shared.current, stale)
					} else {
						if (key) {
							shouldUpdate = stale[key] !== shared.current[key]
						} else {
							shouldUpdate = stale !== shared.current
						}
					}

					/* @HINT: Always call the `callback` when there is no `key` */
					if (key) {
						/* @HINT: Only check if we should call the `callback` if there is a `key` */
						if (!shouldUpdate) {
							continue
						}
					}

					callback(key ? shared.current[key] : shared.current)
				}
			},
			subscribe(callback, key) {
				const callbackAndKey = [callback, key]
				$atomObservableCallbacks.add(callbackAndKey)

				return () => {
					$atomObservableCallbacks.delete(callbackAndKey)
				}
			}
		}
	}
}(atomObservableCallbacks));

export const SharedGlobalStateProvider = ({
	children,
	initialGlobalState = {},
	persistence = { persistOn: 'none', persistKey: '___$key___' }
}) => {
	const hooksEnabled =
		{}.hasOwnProperty.call(React, 'useMemo') &&
		{}.hasOwnProperty.call(React, 'useCallback')

	if (!hooksEnabled) {
		return new Error(
			"SharedGlobalStateProvider[Error]: You are using a ReactJS version that doesn't support memo hooks"
		)
	}

	/* eslint-disable-next-line react-hooks/rules-of-hooks */
	const { setToStorage, getFromStorage, hasKeyInStorage } = useBrowserStorage({
		storageType:
			persistence.persistOn === 'local' ? persistence.persistOn : 'session'
	})
	/* eslint-disable-next-line react-hooks/rules-of-hooks */
	const shared = useRef(
		getFromStorage(
			persistence.persistKey, initialGlobalState || {}
		)
	);

	/* eslint-disable-next-line react-hooks/rules-of-hooks */
	const box = useMemo(() => {
		return atomObservableFactory(shared, persistence, setToStorage);
	/* eslint-disable-next-line react-hooks/exhaustive-deps */
	}, [shared, persistence.persistKey, persistence.persistOn]);

	if (persistence.persistOn !== 'none'
		&& !hasKeyInStorage(persistence.persistKey)) {
		setToStorage(persistence.persistKey, shared.current)
	}

	return (
		<SharedStateContext.Provider value={box}>
			{children}
		</SharedStateContext.Provider>
	)
}

/**!
 * `useBrowserStorageEvent()` ReactJS hook
 */

export const useBrowserStorageEvent = (callback) => {
  const onStorageMutated = (event) => {
	callback(event)
  };
  useEffect(() => {
	window.addEventListener("storage", onStorageMutated);

	return () => {
	  window.removeEventListener("storage", onStorageMutated)
	}
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);
}

/**!
 * `useBrowserStorageWithEncryption()` ReactJS hook
 */

export const useBrowserStorageWithEncryption = ({ storageType = 'local' }) => {
	const sharedGlobalStateBox = useContext(SharedStateContext)

	if (sharedGlobalStateBox === null) {
		throw new Error(
			'useBrowserStorageWithEncryption[Error]: Load shared state provider before using hook'
		)
	}

	/**
	 * @USAGE:
	 *
	 * encryptionHelpers = {
	 *  encrypt = (data) => String(data),
	 *  decrypt = (data) => data
	 * }
	 */
	let encryptionHelpers = sharedGlobalStateBox.getState('$__encryption-helpers')

	if (!encryptionHelpers) {
		console.error(
			'`useBrowserStorageWithEncryption()` is missing `encryptionHelpers` from shared state'
		)
		encryptionHelpers = {}
	}

	const { encrypt = (data) => String(data), decrypt = (data) => data } =
		encryptionHelpers
	const {
		setToStorage,
		clearFromStorage,
		hasKeyInStorage,
		hasKeyPrefixInStorage,
		getFromStorage
	} = useBrowserStorage({
		storageType
	})

	return {
		setToStorage(key, value = null) {
			const payload = encrypt(value)
			if (typeof payload === 'string') {
				return setToStorage(key, payload)
			}
			return false
		},
		hasKeyInStorage (key = '') {
			return hasKeyInStorage(key)
		},
		hasKeyPrefixInStorage (key = '') {
			return hasKeyPrefixInStorage(key);
		},
		clearFromStorage(key = '') {
			return clearFromStorage(key)
		},
		getFromStorage(key, defaultPayload = {}) {
			const payload = decrypt(getFromStorage(key, defaultPayload))
			return !payload ? defaultPayload : payload
		}
	}
}

/**!
 * `useEffectCallback()` ReactJS hook
 */

export const useEffectCallback = (callback) => {
	const ref = useRef(null)
	useEffect(() => {
		if (typeof callback === 'function') {
			ref.current = callback
		}
	}, [callback])
	return useCallback((...args) => {
		const f_callback = ref.current
		return f_callback !== null ? f_callback(...args) : undefined
		/* eslint-disable-next-line react-hooks/exhaustive-deps */
	}, [])
}

/**!
 * `useOutsideClick()` ReactJS hook
 */

export function useOutsideClick(callback = () => undefined) {
	const reference = useRef(null)
	const handleDocumentClick = (event) => {
		if (!reference.current) {
			return;
		}
			
		if (!reference.current.contains(event.target)) {
			if (typeof callback === 'function') {
				callback(reference.current, event.target)
			}
		}
	}

	useEffect(() => {
		window.document.addEventListener('click', handleDocumentClick)
		return () => {
			window.document.removeEventListener('click', handleDocumentClick)
		}
		/* eslint-disable-next-line react-hooks/exhaustive-deps */
	}, [])

	return [reference]
}

export const useControlKeysPress = (callback = () => undefined, keys = []) => {
	const handleDocumentControlKeys = (event) => {
		if (keys.includes(event.key)) {
			if (typeof callback === 'function') {
				callback(event.key, event.target)
			}
		}
	}

	useEffect(() => {
		window.document.addEventListener('keyup', handleDocumentControlKeys)
		return () => {
			window.document.removeEventListener('keyup', handleDocumentControlKeys)
		}
		/* eslint-disable-next-line react-hooks/exhaustive-deps */
	}, [])
}

const textSortAlgorithm = {
	/* @CHECK: https://stackoverflow.com/a/979325 */
	sortBy (order = "ASC", field = null, primer = (value) => value) {
		const key = typeof field === 'string' || typeof field === 'number' ?
		  function(item) {
			if (typeof item !== 'object') {
			  return item;
			}
			return primer ? primer(item[field]) : item[field]
		  } :
		  function(item) {
			return primer ? primer(item) : item
		  };
	  
		const reverse = order === "ASC" ? 1 : -1;
	  
		return function(previousItem, nextItem) {
		  const $previousItem = key(previousItem)
		  const $nextItem = key(nextItem)
		  
		  /* eslint-disable-next-line */
		  return reverse * (($previousItem > $nextItem) - ($nextItem > $previousItem));
		}
	}
};

const textFilterAlgorithms = {
	/* @NOTE: `specific` text search filtering alogrithm */
	specific(filterText = '', filterList = [], filterListItemKeys = ['']) {
		if (filterText === '') {
			return filterList
		}

		return filterList.filter((filterListItem) => {
			return filterListItemKeys.reduce((finalStatusResult, filterListItemKey) => {
				const listItem =
					typeof filterListItem !== 'object'
						? filterListItem
						: extractPropertyValue(filterListItemKey, filterListItem)
				const haystack =
					typeof listItem === 'string'
						? listItem.toLowerCase()
						: String(listItem).toLowerCase()
				const needle = filterText.toLowerCase()

				return (
					filterText === '' || haystack.indexOf(needle) > -1 || finalStatusResult
				)
			}, false)
		})
	},
	/* @NOTE: `fuzzy` text search filtering alogrithm */
	fuzzy(filterText = '', filterList = [], filterListItemKeys = ['']) {
		if (filterText === '') {
			return filterList
		}

		/* @HINT: get all characters from the filter text search term */
		const characters = filterText.split('')

		/* @HINT: flatten the multi-dimesional list (array) */
		const chunks = Array.prototype.concat.apply(
			[],
			characters.map((character) => {
				return filterList.filter((filterListItem) => {
					return filterListItemKeys.reduce(
						(finalStatusResult, filterListItemKey) => {
							const needle = character.toLowerCase()
							const listItem =
								typeof filterListItem !== 'object'
									? filterListItem
									: extractPropertyValue(filterListItemKey, filterListItem)
							const haystack =
								typeof listItem === 'string'
									? listItem.toLowerCase()
									: String(listItem).toLowerCase()
							const radix = haystack.indexOf(needle)
							let result = true

							if (radix === -1) {
								result = false
							}
							return result || finalStatusResult
						},
						false
					)
				})
			})
		)

		/* @HINT: Remove duplicates from the final result */
		return toUniqueItemList(
			filterListItemKeys.flatMap((filterListItemKey) =>
				toUniqueItemList(chunks, filterListItemKey)
			)
		)
	},
	/* @NOTE: `complete` text search filtering alogrithm */
	complete(filterText = '', filterList = [], filterListItemKeys = ['']) {
		return filterList.filter((filterListItem) => {
			return filterListItemKeys.reduce((finalStatusResult, filterListItemKey) => {
				const listItem =
					typeof filterListItem !== 'object'
						? filterListItem
						: extractPropertyValue(filterListItemKey, filterListItem)
				const haystack =
					typeof listItem === 'string'
						? listItem.toLowerCase()
						: String(listItem).toLowerCase()
				const needle = filterText.toLowerCase()

				let result = true,
					radix = -1,
					charPosition = 0,
					charValue = needle[charPosition] || null

				while (null !== charValue) {
					radix = haystack.indexOf(charValue, radix + 1)
					if (radix === -1) {
						result = false
						break
					}
					charPosition += 1
					charValue = needle[charPosition] || null
				}
				return result || finalStatusResult
			}, false)
		})
	}
};

/* @NOTE: a basic `Stack` data-structure definition */
class Stack {
	constructor(data = []) {
		this.length = 0
		if (Array.isArray(data)) {
			this.push.apply(this, data)
		}
	}

	isEmpty() {
		return this.length === 0
	}

	size() {
		return this.length
	}

	peek() {
		return this[this.size() - 1]
	}

	peer() {
		return this[0];
	}

	dropBottom () {
		return Array.prototype.shift.call(this)
	}

	push(...args) {
		return Array.prototype.push.apply(this, args)
	}

	pop() {
		return Array.prototype.pop.call(this)
	}

	replaceTop(...args) {
		this.pop()
		this.push(...args)
	}

	toJSON() {
		return '[ ' + Array.prototype.slice.call(this, 0).join(', ') + ' ]'
	}

	toObject() {
		try {
			return JSON.parse(this.toJSON())
		} catch (error) {
			if (error instanceof Error) {
				if (error.name === 'SyntaxError') {
					return Array.prototype.slice.call(this, 0, this.size())
				}
			}
			return []
		}
	}
}

/**!
 * @SOURCE: https://betterprogramming.pub/im-hooked-on-hooks-b519e5b9a498
 *
 * `useComponentMounted()` ReactJS hook
 */

export const useComponentMounted = () => {
	const isMounted = useRef(false)

	useEffect(() => {
		isMounted.current = true

		return () => {
			isMounted.current = false
		}
	}, [])

	return isMounted.current
}


/**!
 * @SOURCE: https://betterprogramming.pub/im-hooked-on-hooks-b519e5b9a498
 *
 * `usePreviousProps()` ReactJS hook
 */

 export const usePreviousProps = (value = undefined) => {
	const ref = useRef(undefined);

	useEffect(() => {
		if (ref.current !== value) {
			ref.current = value
		}
	}, [value])

	return ref.current
}

/**!
 * @SOURCE: https://betterprogramming.pub/im-hooked-on-hooks-b519e5b9a498
 *
 * `usePageFocused()` ReactJS hook
 */

export const usePageFocused = () => {
	const [isFocused, setIsFocused] = useState(() => {
		if (typeof window !== 'undefined') {
			return document.hasFocus()
		}
		return false
	})

	const handleFocus = () => {
		setIsFocused(document.hasFocus())
	}

	useEffect(() => {
		window.addEventListener('blur', handleFocus)
		window.addEventListener('focus', handleFocus)

		return () => {
			window.removeEventListener('blur', handleFocus)
			window.removeEventListener('focus', handleFocus)
		}
	}, []);

	return isFocused;
};

/**!
 *
 * `useSignalsPageFocused()` ReactJS hook
 */

export const useSignalsPageFocused = () => {
	const [isFocused, setIsFocused] = useSignalsState(() => {
		if (typeof window !== 'undefined') {
			return document.hasFocus()
		}
		return false
	})

	const handleFocus = () => {
		setIsFocused(document.hasFocus())
	}

	useSignalsEffect(() => {
		window.addEventListener('blur', handleFocus)
		window.addEventListener('focus', handleFocus)

		return () => {
			window.removeEventListener('blur', handleFocus)
			window.removeEventListener('focus', handleFocus)
		}
	}, []);

	return isFocused;
}

/**!
 * `useBeforePageUnload()` ReactJS hook
 */

export const useBeforePageUnload = (
	callback = () => undefined,
	{ when = false, message = "", extraWatchProperty = "" }
) => {
	useEffect(() => {
		function handleBeforeUnload (event) {
			event.preventDefault()
			callback.call(null, event.target)
			window.removeEventListener('beforeunload', handleBeforeUnload);
			if (message !== "") {
				event.returnValue = message
				return message
			} else {
				event.returnValue = undefined;
				return;
			}
		}

		if (when) {
			window.addEventListener('beforeunload', handleBeforeUnload)
		}

		return () => {
			if (when) {
				window.removeEventListener('beforeunload', handleBeforeUnload)
			}
		}
		/* eslint-disable-next-line react-hooks/exhaustive-deps */
	}, [when, message, extraWatchProperty])
};

/**!
 * `useSignalsBeforePageUnload()` ReactJS hook
 */

 export const useSignalsBeforePageUnload = (
	callback = () => undefined,
	{ when = false, message = "", extraWatchProperty = "" }
) => {
	useSignalsEffect(() => {
		const handleBeforeUnload = (event) => {
			event.preventDefault()
			callback.call(null, event.target)
			window.removeEventListener('beforeunload', handleBeforeUnload);
			if (message !== "") {
				event.returnValue = message
				return message
			} else {
				event.returnValue = undefined;
				return;
			}
		}

		if (when) {
			window.addEventListener('beforeunload', handleBeforeUnload)
		}

		return () => {
			if (when) {
				window.removeEventListener('beforeunload', handleBeforeUnload)
			}
		}
	/* eslint-disable-next-line react-hooks/exhaustive-deps */
	}, [when, message, extraWatchProperty])
}

/* @NOTE: `useSearchParams` is only defined in React-Router v6 not v5 */
const useSearchParams = (canReplace = false) => {
		const pageLocation = useLocation()
		const history = useHistory()
		const searchParams = new URLSearchParams(
			pageLocation ? pageLocation.search : history.location.search
		)

		const setURLSearchParams = (
			newSearchParams,
			unloadPageOnNavigate = false
		) => {
			const nextSearchParams = new URLSearchParams(newSearchParams)

			const url = new URL(
				`${pageLocation.pathname}${nextSearchParams
					.toString()
					.replace(/^([^?]+)/, '?$1')}`,
				window.location.origin
			)

			if (unloadPageOnNavigate) {
				window.location.assign(url.href)
			} else {
				if (newSearchParams instanceof URLSearchParams) {
					history.replace(url.href.replace(window.location.origin, ''));
					return;
				}
				if (canReplace) {
				  	history.replace(url.href.replace(window.location.origin, ''))
				} else {
					history.push(url.href.replace(window.location.origin, ''))
				}
			}
		}

		return [searchParams, setURLSearchParams]
	};

/**!
 * @SOURCE_COPY: https://blog.logrocket.com/use-state-url-persist-state-usesearchparams/
 *
 * `useSearchParamsState()` ReactJS hook
 */

export function useSearchParamsState(searchParamName, canReplace, defaultValue) {
	const [searchParams, setSearchParams] = useSearchParams(
		typeof canReplace === "boolean" ? canReplace : false
	);
	
	const acquiredSearchParam = searchParams.get(
		typeof searchParamName === "string" ? searchParamName : ""
	);
	const searchParamsState =
		acquiredSearchParam !== null && acquiredSearchParam !== undefined
			? acquiredSearchParam
			: defaultValue || null

	useEffect(() => {
		if (defaultValue && !acquiredSearchParam) {
			searchParams.set(searchParamName, defaultValue)
		    setSearchParams(new URLSearchParams(searchParams.toString()));
		}
	/* eslint-disable-next-line react-hooks/exhaustive-deps */
	},[defaultValue]);

	const getNextEntries = (newState) => {
		return typeof Object.fromEntries === 'function'
			? Object.assign({}, Object.fromEntries(searchParams.entries()), {
					[searchParamName]: encodeURIComponent(newState)
			  })
			: Object.assign(
					{},
					[...searchParams.entries()].reduce(
						(oldState, [key, value]) => ({ ...oldState, [key]: value }),
						{}
					),
					{ [searchParamName]: encodeURIComponent(newState) }
			  )
	};

	const setSearchParamsState = (newState) => {
		let nextEntries = {};
		if (typeof newState === "string") {
			nextEntries = getNextEntries(newState)
		} else if (typeof newState === "function") {
			nextEntries = getNextEntries(newState(searchParams.get(searchParamName)))
		}
		setSearchParams(nextEntries)
	};

	const unsetSearchParamsState = () => {
		const nextEntries = getNextEntries(undefined)
		delete nextEntries[searchParamName]
		setSearchParams(nextEntries)
	};

	return [searchParamsState, setSearchParamsState, unsetSearchParamsState]
}

/* @SOURCE: `GoogleChromeLabs/intersection-observer` */
/* @CHECK: https://github.com/GoogleChromeLabs/intersection-observer/blob/main/intersection-observer.js#L661C32-L676C3 */
const parseRootMargin = (rootMargin) => {
    const marginString = rootMargin || '0px'
    const margins = marginString.split(/\s+/).map(function (margin) {
      const [, value, unit] = /^(-?\d*\.?\d+)(px|%)$/.exec(margin) || [undefined, '', null]

      if (!unit || !value) {
        throw new Error('rootMargin must be specified in pixels or percent')
      }

      return { value: parseFloat(value), unit }
    })

    margins[1] = margins[1] || margins[0]
    margins[2] = margins[2] || margins[0]
    margins[3] = margins[3] || margins[1]

    return margins
}

/**!
 * `useIsDOMElementVisibleOnScreen()` ReactJS hook
 */
export const useIsDOMElementVisibleOnScreen = (options = { root: null, rootMargin: "0px", threshold: 0 }) => {
	const domElementRef = useRef(null);
	const [isIntersecting, setIsIntersecting] = useState(false);
	const [intersectionRatio, setIntersectionRatio] = useState(() => {
		//intersectionRatio
	    const [topMargin, rightMargin, bottomMargin, leftMargin] = options.rootMargin.includes(" ") ? parseRootMargin(
	      options.rootMargin
	    ).map(function (margin, index) {
	      return margin.unit === 'px'
		? margin.value
		: margin.value * (
		  index % 2
		    ? viewPortRect.width
		    : viewPortRect.height
		) / 100
	    }) : [parseFloat(options.rootMargin), parseFloat(options.rootMargin), parseFloat(options.rootMargin), parseFloat(options.rootMargin)];
	    return topMargin === 0 ? 0.0 : topMargin;
	});

	useEffect(() => {
		const domElement = domElementRef.current;
		const iterator = (entry) => {
			setIntersectionRatio(() => entry.intersectionRatio);
			return setIsIntersecting(() => entry.isIntersecting)
		}
		const callback = (entries) => entries.forEach(iterator)
		const observer = new window.IntersectionObserver(callback, options)

		if (domElement) {
			observer.observe(domElement)
		}
		return () => domElement && observer.unobserve(domElement)
	}, [options])

	return [isIntersecting, domElementRef, intersectionRatio];
};

/**!
 * `useSignalsIsDOMElementVisibleOnScreen()` ReactJS hook
 */
 export const useSignalsIsDOMElementVisibleOnScreen = (options = { root: null, rootMargin: "0px", threshold: 0 }) => {
	const domElementRef = useRef(null);
	const [isIntersecting, setIsIntersecting] = useSignalsState(false);
	const [intersectionRatio, setIntersectionRatio] = useSignalsState(() => {
		//intersectionRatio
	    const [topMargin, rightMargin, bottomMargin, leftMargin] = options.rootMargin.includes(" ") ? parseRootMargin(
	      options.rootMargin
	    ).map(function (margin, index) {
	      return margin.unit === 'px'
		? margin.value
		: margin.value * (
		  index % 2
		    ? viewPortRect.width
		    : viewPortRect.height
		) / 100
	    }) : [parseFloat(options.rootMargin), parseFloat(options.rootMargin), parseFloat(options.rootMargin), parseFloat(options.rootMargin)];
	    return topMargin === 0 ? 0.0 : topMargin;
	});

	useSignalsEffect(() => {
		const domElement = domElementRef.current;
		const iterator = (entry) => {
			setIntersectionRatio(() => entry.intersectionRatio);
			return setIsIntersecting(() => entry.isIntersecting)
		}
		const callback = (entries) => entries.forEach(iterator)
		const observer = new window.IntersectionObserver(callback, options)

		if (domElement) {
			observer.observe(domElement)
		}
		return () => domElement && observer.unobserve(domElement)
	}, [options])

	return [isIntersecting, domElementRef, intersectionRatio];
}

/**!
 * `useUnsavedChangesLock()` ReactJS hook
 */

export const useUnsavedChangesLock = ({ useBrowserPrompt = false }) => {
	const [verifyConfimation, setVerifyConfirmation] = useState(false);
	const [verifyConfirmCallback, setVerifyConfirmCallback] = useState(null);

	const getUserConfirmation = useCallback(
		(message, callback) => {
			if (useBrowserPrompt) {
				const allowTransition = window.confirm(message)
				window.setTimeout(() => {
					if (typeof callback === 'function') {
						callback(allowTransition)
					}
				}, 1000)
			} else {
				setVerifyConfirmCallback((status) => {
					if (typeof callback === 'function') {
						callback(status)
					}
				})
				setVerifyConfirmation(true)
			}
		},
		/* eslint-disable-next-line react-hooks/exhaustive-deps */
		[useBrowserPrompt]
	);

	return {
		verifyConfimation,
		getUserConfirmation,
		allowTransition: () => {
			setVerifyConfirmation(false)
			if (verifyConfirmCallback !== null) {
				verifyConfirmCallback(true)
			}
		},
		blockTransition: () => {
			setVerifyConfirmation(true)
			if (verifyConfirmCallback !== null) {
				verifyConfirmCallback(false)
			}
		}
	}
}

const transformToNavigationList = (flattenedLocationList = []) => {
	return flattenedLocationList.map((flattenedLocation) => {
		const { pathname, search, hash } = new URL(flattenedLocation.url);
		return {
			key: flattenedLocation.key,
			pathname,
			search,
			hash,
			state: flattenedLocation.state
		};
	});
};

/**!
 * `useRoutingMonitor()` ReactJS hook
 */

export const useRoutingMonitor = ({
	unsavedChangesRouteKeysMap = {
		'/': '$___root_unsaved_items__'
	},
	appPathnamePrefix = '/',
	getUserConfirmation,
	promptMessage = 'You have unsaved items on this web page. Would you like to discard them ?',
	shouldBlockRoutingTo = () => false,
	onNavigation = () => undefined
}) => {
	const currentLocation = useLocation();
	const history = useHistory()
	const { setToStorage, getFromStorage, clearFromStorage } = useBrowserStorage({
		storageType: 'session'
	});
	/* @HINT: 
 		cache the first location object from `useLocation()` only on first render;
 		ignore subsequent re-renders...
   	*/
	const startLocation = useRef(currentLocation).current;
	/* @HINT:
 		Extract navigation list - array of location objects mirroring the history stack of the browser
   	*/
	const navigationList = useRef(transformToNavigationList(getFromStorage('$__nav_stack', [{
		url: `${document.location.origin}${startLocation.pathname}${startLocation.search||''}${startLocation.hash||''}`,
		key: startLocation.key || 'default',
		state: startLocation.state
	}])));

	/**
	 * @callback calculateNextNavigationList
	 *
	 * @param {Array.<import('history').Location>} navigationList
	 * @param {String} navigationStackAction
	 * @param {import('history').Location} location
	 *
	 * @returns {Array.<import('history').Location>}
	 */
	const calculateNextNavigationList = (
		navigationList,
		navigationStackAction,
		location
	) => {
		const navigationStack = new Stack(
			navigationList.current ? navigationList.current.slice(0) : []
		)
		const stackActionCommand = navigationStackAction.toLowerCase()

		switch (stackActionCommand) {
			case 'pop':
			case 'push':
			case 'replace':
				if (stackActionCommand !== 'replace') {
					if (stackActionCommand === 'pop') {
						setToStorage('$__former_url', navigationStack.peek().pathname)
						navigationStack.pop()
					} else {
						/* @HINT: Update the last loaded URL so it is consistent with the next page route change */
						setToStorage('$__former_url', navigationStack.peek().pathname)
						if (navigationStack.size() >= 10) {
							navigationStack.dropBottom();
						}
						navigationStack.push(location)
					}
				} else {
					setToStorage('$__former_url', navigationStack.peek().pathname)
					navigationStack.replaceTop(location)
				}
				return navigationStack.toObject()
			default:
				return navigationStack.toObject()
		}
	}

	const routeChangeProcessCallbackFactory = (
		unsavedChangesKey,
		location,
		unblock
	) => {
		return (shouldDiscardUnsavedItems) => {
			if (shouldDiscardUnsavedItems) {
				setToStorage(unsavedChangesKey, 'saved')
				/* @HINT: 
					There are parts of this React app that should listen for this custom event 
          				["beforediscardunsaveditems"] and act accordingly
				*/
				/* @NOTE:
    					Event ["discardunsaveditems"] is fired here so that items yet to saved are
          				prepared to be discarded and not saved
	      			*/
				window.dispatchEvent(new Event('beforediscardunsaveditems'))

				return shouldBlockRoutingTo(location.pathname)
					? false
					: (unblock(), undefined)
			} else {
				/* @HINT: Store signal for unsaved items on the Dashboard as pending */
				setToStorage(unsavedChangesKey, 'pending')
				return false
			}
		}
	}

	/**
	 * @callback onBeforeRouteChange
	 *
	 * @param {import('history').Location} location
	 * @param {Function} unblock
	 *
	 * @returns {void}
	 */
	const onBeforeRouteChange = (location, unblock) => {
		/* @HINT: 
  			The last loaded page URL is stored in session storage and retrieved upon 
      			the next page route change
	 	*/
		const formerPathname = getFromStorage('$__former_url', startLocation.pathname)
		const unsavedChangesKey =
			unsavedChangesRouteKeysMap[formerPathname.replace(appPathnamePrefix, '/')] ||
			''

		/* @HINT: Fetch signal for unsave items on the app by the user */
		const unsavedItemsStatus = getFromStorage(unsavedChangesKey, 'saved')
		/* @HINT: If the there are items to be "saved", then prompt the user with a dialog box message */
		if (unsavedItemsStatus !== 'saved') {
			return getUserConfirmation(
				promptMessage,
				routeChangeProcessCallbackFactory(unsavedChangesKey, location, unblock)
			)
		}
	}

	/**
	 * @callback onRouteChange
	 *
	 * @param {import('history').Location} location
	 * @param {import('history').Action} action
	 *
	 * @returns {Boolean}
	 */
	const onRouteChange = (location, action) => {
		/* @HINT: The last loaded page URL is stored in session storage and retrieved upon 
      the next page route change */
		const $serializedNavigationStack = getFromStorage('$__nav_stack', [{
			url: `${document.location.origin}${startLocation.pathname}${startLocation.search||''}${startLocation.hash||''}`,
			key: startLocation.key || 'default',
			state: startLocation.state
		}])

		const nextNavigationList = calculateNextNavigationList(
			navigationList.current,
			action,
			location
		)
		setToStorage(
			'$__nav_stack',
			nextNavigationList.map(
				(stackItem) => ({
					url: `${document.location.origin}${stackItem.pathname}${startLocation.search||''}${startLocation.hash||''}`,
					key: stackItem.key || 'default',
					state: stackItem.state
				})
			)
		)
		navigationList.current = nextNavigationList;

		const navigationDirectionKeysMap = {
			0: 'refreshnavigation',
			'-1': 'backwardnavigation',
			1: 'forwardnavigation',
			'-9': 'freshnavigation'
		}

		return onNavigation(history, {
			currentPathname: location.pathname,
			previousPathname: (
				$serializedNavigationStack[$serializedNavigationStack.length - 1] || ''
			).replace(document.location.origin, ''),
			navigationDirection:
				navigationDirectionKeysMap[
					action === 'PUSH' ? '1' : (action === 'POP' && '-1') || '0'
				]
		})
	}

	useEffect(() => {
		/* @HINT: block browser navigation before a route change */
		const unblock = history.block((location) => {
			return onBeforeRouteChange(location, unblock)
		})

		/* @HINT: listen for browser navigation on a route change */
		const unlisten = history.listen((location, action) => {
			return onRouteChange(location, action)
		})

		return () => {
			/* @HINT: If there is a listener set for the "beforeunload" event */
			if (typeof unblock === 'function') {
				/* @HINT: Then, at this point, assume all unsaved items are saved  
          			and then remove the listener for "beforeunload" event */
				for (const unsavedChangesKey in unsavedChangesRouteKeysMap) {
					/* eslint-disable-next-line no-prototype-builtins */
					if (unsavedChangesRouteKeysMap.hasOwnProperty(unsavedChangesKey)) {
						setToStorage(unsavedChangesKey, 'saved')
					}
				}
				unblock()
			}
			unlisten()
		}
		/* eslint-disable-next-line react-hooks/exhaustive-deps */
	}, [history])

	useEffect(() => {
		function onBeforePageUnload (e) {
		  e.preventDefault();
		  window.setTimeout(() => {
			if (!window || window.closed) {
				clearFromStorage('$__former_url')
				clearFromStorage('$__nav_stack')
			}
		  }, 0);
		  window.removeEventListener('beforeunload', onBeforePageUnload);
		  e.returnValue =  undefined
		  return;
		}
		window.addEventListener('beforeunload', onBeforePageUnload);
		
		return () => {
			window.removeEventListener('beforeunload', onBeforePageUnload);
		}
	/* eslint-disable-next-line react-hooks/exhaustive-deps */
	}, []);


	return useMemo(() => {
	    const navigationContext = {
		get navigationList() {
			return navigationList.current;
		},
		getBreadCrumbsList(pathname = '/', pathnamePrefix = "", maxSize = 5) {
			let prependRootPathname = null
			const fullNavigationList = navigationList.current.slice(0).reverse()
			const breadcrumbsList = []
			/* @HINT: instead of using `.split()`, we use `.match()` */
			const [firstPathnameFragment, ...remainingPathnameFragments] =
				pathname.match(/(?:^\/)?[^/]+/g)
			const fragmentsLength = remainingPathnameFragments.length + 1;
			const $appPathnamePrefix = pathnamePrefix ? pathnamePrefix : appPathnamePrefix;
			const currentPagePathname = pathname.startsWith($appPathnamePrefix)
				? firstPathnameFragment
				: `${
					$appPathnamePrefix.startsWith('/')
						? $appPathnamePrefix
						: '/' + $appPathnamePrefix
				  }${
					$appPathnamePrefix.endsWith('/')
						? firstPathnameFragment.replace(/^\//, '')
						: firstPathnameFragment.replace(/^([^/])/, '/$1')
				  }`

			for (let count = 0; count < fullNavigationList.length; count++) {
				const navListItem = fullNavigationList[count]
				const navListItemPathnameFragmentsLength =
					navListItem.pathname.split('/').length - 1
				if (navListItem.pathname.includes(currentPagePathname)) {
					if (
						!breadcrumbsList
							.map((breadcrumbsListItem) => breadcrumbsListItem.pathname)
							.includes(navListItem.pathname)
					) {
						if (navListItemPathnameFragmentsLength <= fragmentsLength) {
							breadcrumbsList.push(navListItem)
						}
					}
				} else {
					if (navListItem.pathname === '/') {
						prependRootPathname = navListItem
					}
					break
				}
			}

			if (prependRootPathname !== null) {
				breadcrumbsList.push(prependRootPathname)
			}

			return breadcrumbsList.length <= maxSize ? breadcrumbsList.reverse() : breadcrumbsList.slice(0, maxSize).reverse()
		}
	    };

	    return {
	      getBreadCrumbsList: (pathnamePrefix = "", maxSize = 5) => navigationContext.getBreadCrumbsList(currentLocation.pathname, pathnamePrefix, maxSize), 
	      navigationList: navigationContext.navigationList,
	      currentLocation
	    };
        }, [currentLocation.key, currentLocation.pathname]);
}

/**!
 * `usePreviousRoutePathname()` ReactJS hook
 */

export const usePreviousRoutePathname = () => {
	const { getFromStorage } = useBrowserStorage({
	  storageType: "session"
	});

	return  getFromStorage('$__former_url', null);
};

/**!
 * `useTextFilteredList()` ReactJS hook
 */

export function useTextFilteredList(
	{ text = '', page = 1, list },
	{
		filterTaskName = 'specific',
		fetchRemoteFilteredList = () => Promise.resolve([]),
		filterUpdateCallback = (controller) => () => void controller,
		onListChanged = (controller) => void controller
	}
) {
	//const = useBus();
	const shared = useRef(textFilterAlgorithms)
	const sharedGlobalStateBox = useContext(SharedStateContext)

	/**
	 * @USAGE:
	 *
	 * algorithms = {
	 *  [string]: () => ([])
	 * }
	 */

	/* @HINT: Fetch all the default text search algorithm functions from React context */
	let algorithms = useMemo(() => shared.current, [])
	let extraAlgorithms

	if (sharedGlobalStateBox) {
		extraAlgorithms = sharedGlobalStateBox.getState('$___text-filter-algos')
	}

	algorithms = Object.assign(algorithms, extraAlgorithms || {})

	/* @HINT: Select the text search algorithm function chosen by the client code (via `filterTaskName` argument) for text query purposes */
	const filterTextAlgorithmRunner = algorithms
		? algorithms[filterTaskName]
		: () => []

	/* @HINT: Setup the search query controller values - values that control the processing of the text search */
	const [controller, setController] = useState(() => ({
		text,
		isLoading: false,
		list,
		page
	}))
	/* @HINT: Use a debounce function to batch keystrokes together and make calls to the server only after typing has ceased */
	const delayedFetchRemoteFilteredList = useRef(
		debounce((searchTerm, listItemKeys) => {
			if (typeof fetchRemoteFilteredList === 'function') {
				return fetchRemoteFilteredList(searchTerm, listItemKeys)
			}
			return Promise.resolve([])
		}, 50)
	).current

	/* @HINT: Setup function to handle `onChange` event of any <input> or <textarea> element used to enter text search query */
	const handleFilterTrigger = useCallback(
		(filterListAlgoRunner, event, listItemKeys = ['']) => {
			/* @HINT: Only react to `chnage` events from text inputs */
			if (
				event &&
				event.type === 'change' &&
				'value' in event.target &&
				!event.defaultPrevented
			) {
				/* @HINT: get the search query from the <input> or <textarea> element */
				const searchTerm = event.target.value

				/* @HINT: Update the state depending on whether a 
          			search term was entered into the text input element */
				if (searchTerm !== '') {
					setController((prevController) => ({
						...prevController,
						text: searchTerm,
						isLoading: true
					}))
				} else {
					setController((prevController) => ({
						...prevController,
						text: searchTerm,
						isLoading: false,
						list,
						page: 1
					}))
					return
				}

				/* @HINT: Perform the text search using the search query on the list of items to search from */
				const filteredList = filterListAlgoRunner(searchTerm, list, listItemKeys)

				/* @HINT: If the text search algorithm function didn't return any results (on the client-side)... */
				if (filteredList.length === 0) {
					/* @HINT: ...then, use the debounced function to fetch a list of items from 
            			the server-side that may match the search query */
					(
						delayedFetchRemoteFilteredList(searchTerm, listItemKeys) ||
						new Promise((resolve) => {
							resolve([])
						})
					).then((fetchedList) =>
						setController((prevController) => ({
							...prevController,
							isLoading: false,
							page: 1,
							/* @ts-ignore */
							list: fetchedList.__fromCache
								? filterListAlgoRunner(searchTerm, fetchedList, listItemKeys)
								: fetchedList
						}))
					)
					return
				}

				/* @HINT: filtering on the client-side returned results so update state accordingly */
				setController({
					text: searchTerm,
					isLoading: false,
					list: filteredList,
					page: 1
				})
			}
		},
		[delayedFetchRemoteFilteredList, list]
	)

	useEffect(() => {
		/* @NOTE: The conditions and nested `if`s' are necessary */
		/* @NOTE: They are necessary so the `useState()` setter is not called in an infinite loop */
		if (list.length === 0) {
			if (controller.list.length !== list.length) {
				if (controller.text === '') {
					setController((prevController) => ({
						...prevController,
						list
					}))
				}
			}
			return
		}

		if (controller.text === '') {
			if (controller.list.length === 0
					|| controller.list.length !== list.length
						|| controller.list !== list) {
				setController((prevController) => ({
					...prevController,
					list
				}))
			} else {
				if (controller.page !== page) {
					setController((prevController) => ({
						...prevController,
						page,
						list
					}))
				}
			}
		} else {
			if (controller.text === text) {
				if (controller.list !== list) {
					setController((prevController) => ({
						...prevController,
						list
					}))
				}
			}
		}
	}, [list, text, controller, page])

	useEffect(() => {
		const throttledFilterUpdateCallback = throttleFilterCallbackRoutine(
			filterUpdateCallback,
			[controller],
			1500
		)
		let shutdownCallback = function () {
			return undefined
		}

		shutdownCallback.unchanged = 1

		if (controller.text !== text) {
			if (shutdownCallback.unchanged === 1) {
				shutdownCallback = throttledFilterUpdateCallback()
			}
		}

		return () => {
			if (typeof shutdownCallback === "function") {
				shutdownCallback()
			}
		}
	/* eslint-disable-next-line react-hooks/exhaustive-deps */
	}, [text, controller])

	useEffect(() => {
		if (controller.list !== list || controller.text !== text) {
		   onListChanged({ ...controller, list })
		}
	/* eslint-disable-next-line react-hooks/exhaustive-deps */
	}, [list, text, controller])

	/* @HINT: Finally, return controller and chnage event handler factory function */
	return [controller, handleFilterTrigger.bind(null, filterTextAlgorithmRunner)]
}

/**!
 * `useSearchParamStateValueUpdate()` ReactJS hook
 */
 export const useSearchParamStateValueUpdate = (paramName = "filter") => {
	const history = useHistory();
	const currentSearchParams = history.location.search;
	
	const reduceUrlSearchStringToQueryStringObject = (url) => {
		if (typeof url !== "string" || url === "") {
			return {};
		}
	
		const $url = url.startsWith("?") ? url : "?" + url;
	
		return $url
		.slice($url.indexOf("?"))
		.slice(1)
		.split("&")
		.map((querySlice) => {
			return querySlice.split("=");
		})
		.reduce((queryPairMap, previousQuerySlicePair) => {
			const [key, value] = previousQuerySlicePair;
			queryPairMap[key] = decodeURIComponent(value);
			return queryPairMap;
		}, {});
	};
	
	const changeSearchParamValue = (paramValue = "", { overwriteHistory = false } = {}) => {
		const currentSearchParamsObject = Object.assign(
			{},
			reduceUrlSearchStringToQueryStringObject(currentSearchParams),
			{ [paramName]: paramValue }
		);
		const params = new URLSearchParams(currentSearchParamsObject);

		if (overwriteHistory) {
			history.replace(`${window.location.pathname}?${params.toString()}`);
		} else {
			history.push(`${window.location.pathname}?${params.toString()}`);
		}
	};
	
	return changeSearchParamValue;
};

/**!
 * `useSearchParamStateValue()` ReactJS hook
 */
export const useSearchParamStateValue = (paramName = "filter") => {
	const locationSearch = useLocation().search;
  	const updateSearchParamFilterValue = useSearchParamStateValueUpdate(paramName);
  	const params = new URLSearchParams(locationSearch);

	return [
		{ [paramName]: params.get(paramName) ?? "" },
		updateSearchParamFilterValue,
	];
};

const SORT_ORDER = {
	ASCENDING: "ASC"
};

/**!
 * `useTextSortedList()` ReactJS hook
 */
 export const useTextSortedList = (listToSort = [], defaultSortOrder = SORT_ORDER.ASCENDING, propertyToSortOn = null) => {
    const [sortedList, setSorted] = useState(() => {
      return listToSort.slice(0).sort(
		typeof propertyToSortOn === 'string' || typeof propertyToSortOn === 'number'
		? textSortAlgorithm.sortBy(defaultSortOrder, propertyToSortOn)
		: textSortAlgorithm.sortBy(defaultSortOrder)
	  )
    });

	useEffect(() => {
	  	setSorted(listToSort.slice(0).sort(
		  	textSortAlgorithm.sortBy(defaultSortOrder, propertyToSortOn))
		);
	}, [listToSort, defaultSortOrder, propertyToSortOn]);

    const handleSortFor = (sortOrder = SORT_ORDER.ASCENDING, propertyToSortOn) => {
      /* eslint-disable */
      setSorted((prevSortedList) => {
        return prevSortedList.slice(0).sort(
            typeof propertyToSortOn === 'string' || typeof propertyToSortOn === 'number'
            ? textSortAlgorithm.sortBy(sortOrder, propertyToSortOn)
            : textSortAlgorithm.sortBy(sortOrder)
        );
      });
    };

    return [sortedList, handleSortFor, textSortAlgorithm.sortBy]
}


/**!
 * `useBrowserStorageEffectUpdates` ReactJS hook
 */
export const useBrowserStorageEffectUpdates = (
	storageKey,
	storageDefaultValue,
	storageType = "local",
	storageMode = "enforceEffect"
  ) => {
	const mode = !storageKey ? "bypassEffect" : storageMode;
	const { setToStorage, getFromStorage, clearFromStorage } = useBrowserStorage({
	  storageType /* @HINT: makes use of `window.localStorage` by default */
	});
	const [storageValueUpdate, setStorageValueUpdate] = useState(() => {
	  return mode === "bypassEffect"	
		  ? storageDefaultValue		
		  : getFromStorage(storageKey, storageDefaultValue)
	});
  
     useBeforePageUnload(() => {
	  const isClosed = window.closed;
	  
	  window.setTimeout(() => {
	     if (isClosed
	       || !window
		 || window.closed) {
		clearFromStorage(storageKey);
	     }
	   }, 0);
  
	  return undefined;
	}, { when: Boolean(storageKey), message: "", extraWatchProperty: storageKey });
  
	useEffect(() => {
	  if (mode === "enforceEffect") {
	    setToStorage(storageKey, storageValueUpdate);
	  }
	/* eslint-disable-next-line react-hooks/exhaustive-deps */
	}, [JSON.stringify(storageValueUpdate), storageKey, mode]);
  
	  const setNextUpdateToStorage = (nextStorageValueUpdate, { append = false } = {}) => {
		setStorageValueUpdate((previousStorageValue) => {
		  let currentStorageValue = '';
	  
		   if (typeof storageValueUpdate !== 'string') {
			 currentStorageValue = JSON.stringify(nextStorageValueUpdate);
		   } else {
			 currentStorageValue = nextStorageValueUpdate;
		   }
	  
		   if (JSON.stringify(previousStorageValue) === currentStorageValue) {
			 return previousStorageValue;
		   }
	  
		   if (append) {
			 const freshStorageValue = mode === "bypassEffect"
			 ? previousStorageValue
			 : getFromStorage(storageKey);
	  
			 if (freshStorageValue && nextStorageValueUpdate
			   && typeof nextStorageValueUpdate === "object"
				 && typeof freshStorageValue === "object") {
			   const newerStorageValue = Array.isArray(nextStorageValueUpdate) && Array.isArray(freshStorageValue)
				 ? freshStorageValue.concat(nextStorageValueUpdate)
				  : Object.assign(
					freshStorageValue,
					nextStorageValueUpdate
				  );
	  
				 if (JSON.stringify(freshStorageValue) === JSON.stringify(newerStorageValue)) {
				   return previousStorageValue;
				 }
	  
				 return newerStorageValue;
			   }
		     }
	  
		     return nextStorageValueUpdate;
		  });
	   }
  
	return [storageValueUpdate, setNextUpdateToStorage];
};

/**!
 * `useStateUpdatesWithHistory` ReactJS hook
 */
export const useStateUpdatesWithHistory = (initialState, { capacity = 10, persistKey = "", onRedo = (() => undefined), onUndo = (() => undefined) } = {}) => {
     	const [stateUpdate, setStateUpdate] = useBrowserStorageEffectUpdates = (
		persistKey,
		initialState,
		"session",
		"enforceEffect"
	);
	const historyList = useRef([initialState]);
	const historyListPointer = useRef(0);

	useEffect(() => {
		const onHistoryUndo = () => {
			onUndo();
		};
		const onHistoryRedo = () => {
			onRedo();
		};
		window.addEventListener("_localhistory.undo", onHistoryUndo);
		window.addEventListener("_localhistory.redo", onHistoryRedo);
		return () => {
			/* @NOTE:
   
   			   Help the GC clean up retained references 
   			   within closures `undo`, `redo`, `push` and `reset`
	 		*/
			historyList.current = null;
			historyListPointer = null;

			window.removeEventListener("_localhistory.undo", onHistoryUndo);
			window.removeEventListener("_localhistory.redo", onHistoryRedo);
		};
	}, []);

	const statuses = useMemo(() => {
		return {
			canUndo: historyListPointer.current > 0,
			canRedo: historyListPointer.current < historyList.current.length - 1
		};
	}, [stateUpdate]);

	const push = useCallack((newValue) => {
		const newHistoryList = historyList.current.slice(0, historyListPointer.current + 1);
		if (newHistoryList.length >= capacity) {
			newHistoryList.shift();
		}
		historyList.current = [...newHistoryList, newValue];
		historyListPointer = historyList.current.length - 1;
		setStateUpdate(newValue, { append: false });
	}, [capacity]);

	const undo = useCallback(() => {
		if (historyListPointer.current > 0) {
			historyListPointer.current--;
			const currentPoint = historyListPointer.current;
			if (currentPoint >= 0 && currentPoint <= historyList.current.length - 1) {
				setStateUpdate(historyList.current[currentPoint], { append: false });
				setTimeout(() => {
					window.dispatchEvent(new CustomEvent("_localhistory.undo"));
				}, 0);
				return true;
			}
		}
		return false;
	},[]);

	const reset = useCallback((newInitialState = null) => {
		historyList.current = !newInitialState || typeof newInitialState !== typeof initialState
			? [initialState]
			: [newInitialState];
		historyListPointer.current = 0;
		setStateUpdate(historyList.current, { append: false });
	}, [initialState]);

	const redo = useCallack(() => {
		if (historyListPointer.current < historyList.current.length - 1) {
			historyListPointer.current++;
			const currentPoint = historyListPointer.current;
			if (currentPoint >= 0 && currentPoint <= historyList.current.length - 1) {
				setStateUpdate(historyList.current[currentPoint], { append: false });
				setTimeout(() => {
					window.dispatchEvent(new CustomEvent("_localhistory.redo"));
				}, 0);
				return true;
			}
		}
		return false;
	}, []);

	return [stateUpdate, { push, redo, undo, reset, statuses }];
};

/**!
 * `useTextFilteredSignalsList()` ReactJS hook
 */

export function useTextFilteredSignalsList(
	{ text = '', page = 1, list },
	{
		filterTaskName = 'specific',
		fetchRemoteFilteredList = () => Promise.resolve([]),
		filterUpdateCallback = (controller) => () => void controller,
		onListChanged = (controller) => void controller
	}
) {
	const shared = useRef(textFilterAlgorithms)
	const sharedGlobalStateBox = useContext(SharedStateContext)

	/**
	 * @USAGE:
	 *
	 * algorithms = {
	 *  [string]: () => ([])
	 * }
	 */

	/* @HINT: Fetch all the default text search algorithm functions from React context */
	let algorithms = useMemo(() => shared.current, [])
	let extraAlgorithms

	if (sharedGlobalStateBox) {
		extraAlgorithms = sharedGlobalStateBox.getState('$___text-filter-algos')
	}

	algorithms = Object.assign(algorithms, extraAlgorithms || {})

	/* @HINT: Select the text search algorithm function chosen by the client code (via `filterTaskName` argument) for text query purposes */
	const filterTextAlgorithmRunner = algorithms
		? algorithms[filterTaskName]
		: () => []

	/* @HINT: Setup the search query controller values - values that control the processing of the text search */
	const [controller, setController] = useSignalsState(() => ({
		text,
		isLoading: false,
		list,
		page
	}));
	/* @HINT: Use a debounce function to batch keystrokes together and make calls to the server only after typing has ceased */
	const delayedFetchRemoteFilteredList = useRef(
		debounce((searchTerm, listItemKeys) => {
			if (typeof fetchRemoteFilteredList === 'function') {
				return fetchRemoteFilteredList(searchTerm, listItemKeys)
			}
			return Promise.resolve([])
		}, 500)
	).current

	/* @HINT: Setup function to handle `onChange` event of any <input> or <textarea> element used to enter text search query */
	const handleFilterTrigger = useCallback(
		(filterListAlgoRunner, event, listItemKeys = ['']) => {
			/* @HINT: Only react to `chnage` events from text inputs */
			if (
				event &&
				event.type === 'change' &&
				'value' in event.target &&
				!event.defaultPrevented
			) {
				/* @HINT: get the search query from the <input> or <textarea> element */
				const searchTerm = event.target.value

				/* @HINT: Update the state depending on whether a 
          			search term was entered into the text input element */
				if (searchTerm !== '') {
					setController((prevController) => ({
						...prevController,
						text: searchTerm,
						isLoading: true
					}))
				} else {
					setController((prevController) => ({
						...prevController,
						text: searchTerm,
						isLoading: false,
						list,
						page: 1
					}))
					return
				}

				/* @HINT: Perform the text search using the search query on the list of items to search from */
				const filteredList = filterListAlgoRunner(searchTerm, list, listItemKeys)

				/* @HINT: If the text search algorithm function didn't return any results (on the client-side)... */
				if (filteredList.length === 0) {
					/* @HINT: ...then, use the debounced function to fetch a list of items from 
            			the server-side that may match the search query */
					(
						delayedFetchRemoteFilteredList(searchTerm, listItemKeys) ||
						new Promise((resolve) => {
							resolve([])
						})
					).then((fetchedList) =>
						setController((prevController) => ({
							...prevController,
							isLoading: false,
							page: 1,
							/* @ts-ignore */
							list: fetchedList.__fromCache
								? filterListAlgoRunner(searchTerm, fetchedList, listItemKeys)
								: fetchedList
						}))
					)
					return
				}

				/* @HINT: filtering on the client-side returned results so update state accordingly */
				setController({
					text: searchTerm,
					isLoading: false,
					list: filteredList,
					page: 1
				})
			}
		},
		/* eslint-disable-next-line react-hooks/exhaustive-deps */
		[delayedFetchRemoteFilteredList, list]
	)

	useSignalsEffect(() => {
		/* @NOTE: The conditions and nested `if`s' are necessary */
		/* @NOTE: They are necessary so the `useState()` setter is not called in an infinite loop */
		if (list.length === 0) {
			if (controller.list.length !== list.length) {
				if (controller.text === '') {
					setController((prevController) => ({
						...prevController,
						list
					}))
				}
			}
			return
		}

		if (controller.text === '') {
			if (controller.list.length === 0
				|| controller.list.length !== list.length
					|| controller.list !== list) {
				setController((prevController) => ({
					...prevController,
					list
				}))
			} else {
				if (controller.page !== page) {
					setController((prevController) => ({
						...prevController,
						page,
						list
					}))
				}
			}
		} else {
			if (controller.text === text) {
				if (controller.list !== list) {
					setController((prevController) => ({
						...prevController,
						list
					}))
				}
			}
		}
	}, [list, text, controller, page])

	useSignalsEffect(() => {
		const throttledFilterUpdateCallback = throttleFilterCallbackRoutine(
			filterUpdateCallback,
			[controller],
			1500
		)
		let shutdownCallback = function () {
			return undefined
		}

		shutdownCallback.unchanged = 1

		if (controller.text !== text) {
			if (shutdownCallback.unchanged === 1) {
				shutdownCallback = throttledFilterUpdateCallback()
			}
		}

		return () => {
			if (typeof shutdownCallback === "function") {
				shutdownCallback()
			}
		}
	/* eslint-disable-next-line react-hooks/exhaustive-deps */
	}, [text, controller])

	
	useSignalsEffect(() => {
		if (controller.list !== list) {
		   onListChanged({ ...controller, list })
		}
	/* eslint-disable-next-line react-hooks/exhaustive-deps */
	}, [list, controller])

	/* @HINT: Finally, return controller and chnage event handler factory function */
	return [controller, handleFilterTrigger.bind(null, filterTextAlgorithmRunner)]
}

/**!
 * `useSharedState()` ReactJS hook
 */

export const useSharedState = (slice = '') => {
	const sharedGlobalStateBox = useContext(SharedStateContext)

	if (sharedGlobalStateBox === null) {
		throw new Error('useSharedState[Error]: Load provider before using hook')
	}

	const [shared, setSharedState] = useState(sharedGlobalStateBox.getState(slice ? slice : ''))

	useEffect(() => {
		const unsubscribe = sharedGlobalStateBox.subscribe(
			setSharedState,
			slice ? slice : ''
		)
		return () => {
			unsubscribe()
		}
	/* eslint-disable-next-line react-hooks/exhaustive-deps */
	}, [])

	return [
		shared,
		sharedGlobalStateBox.dispatch.bind(sharedGlobalStateBox)
	]
}

/**!
 * `useSharedSignalsState()` ReactJS hook
 */

export const useSharedSignalsState = (slice = '') => {
	const sharedGlobalStateBox = useContext(SharedStateContext)

	if (sharedGlobalStateBox === null) {
		throw new Error(
			'useSharedSignalsState[Error]: Load provider before using hook'
		)
	}

	const [shared, setSharedState] = useSignalsState(
		sharedGlobalStateBox.getState(slice ? slice : '')
	)

	useSignalsEffect(() => {
		const unsubscribe = sharedGlobalStateBox.subscribe(
			setSharedState,
			slice ? slice : ''
		)
		return () => unsubscribe()
	/* eslint-disable-next-line react-hooks/exhaustive-deps */
	}, [])

	return [
		shared,
		sharedGlobalStateBox.dispatch.bind(sharedGlobalStateBox)
	]
}
