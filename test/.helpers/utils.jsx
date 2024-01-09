import React from 'react';
import {
	BrowserRouter,
	Router,
	BrowserRouterProps,
	MemoryRouter,
	MemoryRouterProps,
	RouterProps
} from 'react-router-dom';
import {
	History,
	LocationDescriptor,
	createBrowserHistory,
	createMemoryHistory
} from 'history'
import { render } from '@testing-library/react'
import {
	renderHook,
	RenderHookResult,
	RenderHookOptions
} from '@testing-library/react-hooks'

import isEmpty from 'lodash.isempty'

/**
 *
 * @param {String} property
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
 *
 *
 * @param {import('history').History} history
 * @param {{ path: String, title?: String, state?: Object }} initialRoute
 */
function setupInitialRoute(
	history,
	initialRoute = { path: '/', title: '', state: undefined }
) {
	if (initialRoute) {
		const isHistoryStateEmpty = isEmpty(initialRoute.state)

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
 * @param {React.ComponentClass} Router
 * @param {Boolean} chooseMemoryRouter
 * @param {{ basename?: String, initialEntries: Array, keyLength?: Number, getUserConfirmation?: Function }} optionalProps
 *
 * @returns {[import('history').History, ((props: { children: React.ReactNode }) => JSX.Element)]}
 */
export function getWrapperWithRouter(
	Router,
	chooseMemoryRouter,
	optionalProps = {
		getUserConfirmation: undefined,
		initialEntries: undefined,
		basename: undefined,
		keyLength: undefined
	}
) {
	let history;

	if (chooseMemoryRouter) {
		history = createMemoryHistory()
		delete optionalProps['basename']
	} else {
		history = createBrowserHistory()
		delete optionalProps['initialEntries']
	}

	return [
		history,
		({ children }) => (
			<Router
				history={history}
				getUserConfirmation={optionalProps.getUserConfirmation}
				keyLength={optionalProps.keyLength}
				initialEntries={optionalProps.initialEntries}
				basename={optionalProps.basename}
			>
				{children}
			</Router>
		)
	]
}

/**
 * A custom render to setup a router for a real consumer component.
 * It also creates initial route with state as it renders the real
 * consumer component.
 *
 * This is used when testing an actual consumer component making use
 * of the router
 *
 * @param {React.ReactElement} Component
 * @param {{ chooseMemoryRouter: Boolean, getUserConfirmation?: Function, initialEntries: Array }} routingOptions
 * @param {import('@testing-library/react').RenderOptions} renderOptions
 *
 * @returns {[History, RenderHookResult]}
 */
export function setInitialRouteAndRenderComponentWithRouter(
	Component,
	routingOptions = {
		initialRoute: { path: '/', title: '', state: undefined },
		chooseMemoryRouter: false,
		getUserConfirmation: undefined,
		initialEntries: undefined
	},
	renderOptions = {}
) {
	const [$history, WrapperComponent] = getWrapperWithRouter(
		routingOptions.chooseMemoryRouter ? MemoryRouter : Router,
		routingOptions.chooseMemoryRouter || false,
		{
			getUserConfirmation: routingOptions.getUserConfirmation,
			initialEntries: routingOptions.initialEntries
		}
	)

	setupInitialRoute($history, routingOptions.initialRoute)

	return [
		$history,
		render(
			Component,
			Object.assign(renderOptions, {
				wrapper: WrapperComponent()
			})
		)
	]
}

/**
 * A custom render to setup a router for a real consumer hook.
 * It also creates initial route with state as it renders the real
 * consumer hook.
 *
 * This is used when testing an actual consumer hook making use of
 * the router
 *
 * @param {Function} Hook
 * @param {{ chooseMemoryRouter: Boolean, getUserConfirmation?: Function, initialEntries: Array }} routingOptions
 * @param {import('@testing-library/react-hooks').RenderHookOptions=} renderOptions
 *
 * @returns {[History, RenderHookResult]}
 */
export function setInitialRouteAndRenderHookWithRouter(
	Hook,
	routingOptions = {
		initialRoute: { path: '/', title: '', state: undefined },
		chooseMemoryRouter: false,
		getUserConfirmation: undefined,
		initialEntries: undefined
	},
	renderOptions = {}
) {
	const [$history, WrapperComponent] = getWrapperWithRouter(
		routingOptions.chooseMemoryRouter ? MemoryRouter : Router,
		routingOptions.chooseMemoryRouter || false,
		{
			getUserConfirmation: routingOptions.getUserConfirmation,
			initialEntries: routingOptions.initialEntries
		}
	)

	setupInitialRoute($history, routingOptions.initialRoute)

	return [
		$history,
		renderHook(
      Hook,
      Object.assign(renderOptions, {
        wrapper: WrapperComponent
      })
    )
	]
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
 * @returns {(() => import('@testing-library/react').RenderResult)}
 *
 * @see https://testing-library.com/docs/react-testing-library/setup#custom-render
 */
export function getCustomRendererFor(Provider) {
	return (WrappedComponent, { providerProps }, renderOptions = undefined) => {
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
 * with a fake implementation replica so as to make testing a lot easier.
 *
 * @param {String} property
 * @param {*} value
 *
 * @returns {void}
 */
export const provisionFakeWebPageWindowObject = (property, value) => {
	const { [property]: originalProperty } = window

	beforeAll(() => {
		assertReadonlyGlobalsNotMutable(property)
		delete window[property]

		Object.defineProperty(window, property, {
			configurable: true,
			writable: true,
			value
		})
	})

	afterAll(() => {
		if (Boolean(originalProperty)) {
			window[property] = originalProperty
		}
	})
}
