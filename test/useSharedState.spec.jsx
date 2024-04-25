import '@testing-library/react-hooks/lib/dom/pure'
import React from 'react'
import { renderHook, act } from '@testing-library/react-hooks'

import { provisionFakeBrowserLocalStorageForTests } from 'mocklets'

import { storageKey, anEmptyArray } from './.helpers/fixtures'

import { useSharedState, SharedGlobalStateProvider } from '../src'
import { waitFor, screen, within, render } from '@testing-library/react'
import { StateComponent } from './.helpers/StateComponent'

/**
 *
 * @param initialGlobalState
 * @param persistence
 * @returns {((children: React.ReactNode) => JSX.Element | Function)}
 */
const getSharedGlobalStateProvider = (initialGlobalState, persistence) => {
	return ({ children }) => (
		<SharedGlobalStateProvider
			initialGlobalState={initialGlobalState}
			persistence={persistence}
		>
			{children}
		</SharedGlobalStateProvider>
	)
}

describe('Testing `useSharedState` ReactJS hook', () => {
	/* @HINT: Setup a fake `localStorage` object on the `window` object */
	provisionFakeBrowserLocalStorageForTests()

	test('should render `useSharedState` hook and update shared data', async () => {
		const { result, unmount } = renderHook(() => useSharedState('list'), {
			wrapper: getSharedGlobalStateProvider(
				{ list: anEmptyArray },
				{ persistOn: 'local', persistKey: storageKey }
			)
		})

		const [state, setState] = result.current
		const aNumbersArray = [1, 2]

		expect(state).toBeDefined()
		expect(typeof state).toBe('object')

		expect(setState).toBeDefined()
		expect(typeof setState).toBe('function')

		expect(JSON.stringify(state)).toBe(JSON.stringify(anEmptyArray))
		expect(
			JSON.parse(window.localStorage.getItem(storageKey) || '{}')
		).toMatchObject({ list: [] })

		act(() => {
			/* @HINT: This call below `setState()` causes a re-render */
			setState({ slice: 'list', value: aNumbersArray })
		})

		/* @NOTE: modified result from re-render above */
		const [newStateAfterRerender] = result.current

		await waitFor(() => {
			expect(newStateAfterRerender).toBe(aNumbersArray)
			expect(window.localStorage.getItem(storageKey)).toBe(
				`{"list":[${String(aNumbersArray)}]}`
			)
		})
		unmount()
	})

	test('should render `useSharedState` hook and ensure that when no slice is provided, the hook return all `initialGlobalState`', () => {
		const { result, unmount } = renderHook(() => useSharedState(), {
			wrapper: getSharedGlobalStateProvider(
				{ list: anEmptyArray, config: { a: 1 } },
				{ persistOn: 'local', persistKey: storageKey }
			)
		})

		const [state] = result.current

		expect(state).toMatchObject({
		  list: anEmptyArray.slice(),
		  config: { a: 1 }
		})
		unmount()
	})
	test('should render `useSharedState` hook and ensure that all subscription callbacks are fired upon updating shared state', async () => {
		const wrapper = getSharedGlobalStateProvider(
			{ list: anEmptyArray },
			{ persistOn: 'local', persistKey: storageKey }
		);
	
		const { result, unmount } = renderHook(() => useSharedState('list'), {
			wrapper
		})

		const { unmount: unmount$ } = render(
			<StateComponent />,
			{
				wrapper
			}
		)

		const list = screen.queryByRole("list")
		expect(
		  list
		).toBeInTheDocument()

		const [, setState] = result.current
		const aNumbersArray = [1, 2]

		act(() => {
			/* @HINT: This call below `setState()` causes a re-render */
			setState({ slice: 'list', value: aNumbersArray })
		})

		await waitFor(() => {
			const { getAllByRole } = within(list)
  			const items = getAllByRole("listitem")
  			const numbers = items.map(item => item.textContent)

  			expect(numbers).toMatchInlineSnapshot(`
			Array [
			  "1",
			  "2",
			]
			`)
		})
		unmount()
		unmount$()
	})
})
