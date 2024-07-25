import React from 'react'
import {
	Router,
	MemoryRouter,
} from 'react-router-dom'
import { createBrowserHistory, createMemoryHistory } from 'history'

import isEmpty from 'lodash.isempty'

/**
 * Validates  properties on the `window` object that can be overriden.
 * 
 * @param {String} property
 * @throws Error
 *
 * @returns void
 */
function assertReadonlyGlobalsNotMutable(property) {
	const readOnlyGlobalObjects = [
		'origin',
		'history',
		'clientInformation',
		'caches',
		'closed',
		'crypto',
		'fetch'
	]

	if (readOnlyGlobalObjects.includes(property)) {
		throw new Error(
			`Cannot override sensitive readonly global object: "${property}"`
		)
	}
}

/**
 * Helps setup initial route for a test
 *
 * @param {import('history').History} history
 * @param {{ path: String, title?: String, state?: Object }} initialRoute
 *
 * @returns {void}
 */
export function setupInitialRoute(
	history,
	initialRoute = { path: '/', title: '', state: undefined }
) {
	if (initialRoute) {
		const isHistoryStateEmpty = !initialRoute.state || isEmpty(initialRoute.state)

		if (history.location === null) {
			window.history.pushState(
				isHistoryStateEmpty ? null : initialRoute.state,
				initialRoute.title || '',
				initialRoute.path
			)
		} else {
			if (isHistoryStateEmpty) {
				history.push(initialRoute.path)
			} else {
				history.push(initialRoute.path, initialRoute.state)
			}
		}
	}
}

/**
 * A custom wrapper to provision a router for a real consumer component
 * or a real hook
 *
 * THis is use when testing an actual consumer component or hook making
 * use of the router or it's hooks: `useHistory()`, `useNavigate()` or
 * `useLocation()`
 *
 * @param {import('react').ComponentClass} Router
 * @param {Boolean} chooseMemoryRouter
 *
 * @returns {[import('history').History, (optionalProps: { getUserConfirmation?: Function, initialEntries?: Array, basename?: String, keyLength?: Number }) => ((props: { children: React.ReactNode }) => JSX.Element)]}
 *
 * @see https://testing-library.com/docs/example-react-router/
 */
export function getWrapperWithRouter(Router, chooseMemoryRouter = false) {
	let history

	if (chooseMemoryRouter) {
		history = createMemoryHistory()
	} else {
		history = createBrowserHistory()
	}

	return [
		history,
		({ getUserConfirmation, initialEntries, basename, keyLength } = {}) =>
			({ children }) =>
				(
					<Router
						history={history}
						getUserConfirmation={
							getUserConfirmation ? getUserConfirmation : undefined
						}
						keyLength={keyLength ? keyLength : undefined}
						initialEntries={initialEntries ? initialEntries : undefined}
						basename={basename ? basename : undefined}
					>
						{children}
					</Router>
				)
	]
}

/**
 * A custom render to setup a router for a real consumer component.
 * It also creates initial route with state.
 *
 * This is used when testing an actual consumer component making use
 * of the router
 *
 * @param {Boolean} chooseMemoryRouter
 * @param {{ path: String, title?: String, state?: Object }} initialRoute
 *
 * @returns {[import('history').History, (optionalProps: { getUserConfirmation?: Function, initialEntries?: Array, basename?: String, keyLength?: Number }) => ((props: { children: React.ReactNode }) => JSX.Element)]}
 */
export const setInitialRouteAndReturnRouterProvider = (
	chooseMemoryRouter = false,
	initialRoute = { path: '/', title: '', state: undefined }
) => {
	const [$history, getRouterWrapperProvider] = getWrapperWithRouter(
		chooseMemoryRouter ? MemoryRouter : Router,
		chooseMemoryRouter || false
	)

	setupInitialRoute($history, initialRoute)

	return [$history, getRouterWrapperProvider]
}

/**
 * A custom render to setup providers with a real consumer component.
 * Extends regular render options with `providerProps` to allow
 * injecting different scenarios to test with.
 *
 * This is used when testing a actual consumer component making use
 * of the provider
 *
 * @param {import('react').Provider} Provider
 *
 * @returns {((import('react').ReactElement, { providerProps: any }, import('@testing-library/react').RenderOptions) => import('@testing-library/react').RenderResult)}
 *
 * @see https://testing-library.com/docs/react-testing-library/setup#custom-render
 */
export function getCustomRendererFor(Provider) {
	return (WrappedComponent, { providerProps }, renderOptions = {}) => {
		return render(
			<Provider value={providerProps}>{WrappedComponent}</Provider>,
			renderOptions
		)
	}
}

/**
 * A custom render to setup provider with a test context consumer component.
 * Extends regular render options with a custom props to allow inpecting
 * state changes.
 *
 * This is used to render a provider while testing it directly.
 *
 * @param {import('react').Provider} Provider
 * @param {{ children: import('react').ReactNode }} props
 * @param {import('@testing-library/react').RenderOptions} renderOptions
 *
 * @returns {import('@testing-library/react').RenderResult}
 */
export const renderProvider = (Provider, props, renderOptions) => {
	return render(<Provider>{props.children}</Provider>, renderOptions)
}

/**
 * A helper utility for replacing native object and BOM APIs in web browsers
 * with a fake implementation/replica so as to make testing a lot easier.
 *
 * @param {String} property
 * @param {*} fakeOrMock
 *
 * @returns void
 */
export const provisionFakeWebPageWindowObject = (property, fakeOrMock = null) => {
	const { [property]: originalProperty } = window
	const isWindowLocation = property === 'location'

	const origLocation = window.document.location.href;
	let location = '';

	if (isWindowLocation) {
		location = origLocation;
	}

	beforeAll(() => {
		assertReadonlyGlobalsNotMutable(property)
		delete window[property]

		if (isWindowLocation) {
      		/*! attribution */
      		/* @CHECK: https://github.com/jestjs/jest/issues/890#issuecomment-347580414 */
			const parser = window.document.createElement('a');
      		const descriptors = Object.getOwnPropertyDescriptors(originalProperty);
			window.location = {
				assign: jest.fn((url) => {
					location = url
					descriptors.assign.value.call(originalProperty, url)
				}),
				reload: jest.fn((forcedReload = false) => {
					if (forcedReload) {
						descriptors.reload.value.call(originalProperty, forcedReload)
					} else {
						descriptors.reload.value.call(originalProperty)
					}
				}),
				replace: jest.fn((url) => {
					location = url
					descriptors.replace.value.call(originalProperty, url)
				}),
				toString () {
					return location
				}
			};
			['href', 'protocol', 'host', 'hostname', 'origin', 'port', 'pathname', 'search', 'hash'].forEach(prop => {
				Object.defineProperty(window.location, prop, {
					get: function() {
						parser.href = location;

						if (prop === 'href') {
							return (parser[prop]).replace(/\/$/, '')
						}
						return parser[prop];
					},
					set: function (value) {
						if (prop === 'href') {
							location = value;
							descriptors.href.set.call(originalProperty, value)
							return;
						}

            			/* @TODO: Handle all remaining properties */

						if (prop === 'origin') {
              				throw new TypeError('Cannot redefine property: origin')
            			}
					}
				});
			});
		} else {
			let clone = null;
			
			if (typeof originalProperty === 'object') {
				clone = Object.create(Object.getPrototypeOf(originalProperty));
				const descriptors = Object.getOwnPropertyDescriptors(originalProperty);
				Object.defineProperties(clone, descriptors);
			}
    
			Object.defineProperty(window, property, {
				configurable: true,
				writable: true,
				value: clone ? clone : fakeOrMock
			})
		}
	})

	afterEach(() => {
		if (isWindowLocation) {
			location = origLocation;
		} 
	})

	afterAll(() => {
		if (Boolean(originalProperty)) {
			if (!isWindowLocation) {
				window[property] = originalProperty
			}
		}
	})
}
