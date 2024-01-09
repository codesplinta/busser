import '@testing-library/react-hooks/lib/dom/pure';
import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { provisionFakeWebPageWindowObject } from './.helpers/utils';

import { useSharedState, SharedGlobalStateProvider } from '../src';
import { fakeStorageFactory } from './.helpers/test-doubles/fakes';
import { storageKey, anEmptyArray } from './.helpers/fixtures';
import { waitFor } from '@testing-library/react';

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
	provisionFakeWebPageWindowObject('localStorage', fakeStorageFactory())

	test('should render `useSharedState` hook and update shared data', () => {
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

		waitFor(() => {
			expect(newStateAfterRerender).toBe(aNumbersArray)
			expect(window.localStorage.getItem(storageKey)).toBe(
				`{"list":[${String(aNumbersArray)}]}`
			)
		});
		unmount();
	})
})
