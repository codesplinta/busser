import '@testing-library/react-hooks/lib/dom/pure'
import { renderHook, act } from '@testing-library/react-hooks'

import { provisionFakeBrowserLocalStorageForTests } from 'mocklets'

import { useBrowserStorage } from '../src'
import { storageKey } from './.helpers/fixtures'

describe('Testing `useBrowserStorage` ReactJS hook', () => {
	/* @HINT: Setup a fake `localStorage` object on the `window` object */
	provisionFakeBrowserLocalStorageForTests()

	test('should render `useBrowserStorage` hook and check saving and retrieving storage data', () => {
		const { result } = renderHook(() =>
			useBrowserStorage({
				storageType: 'local'
			})
		)

		const { clearFromStorage, getFromStorage, setToStorage } = result.current

		expect(getFromStorage).toBeDefined()
		expect(typeof getFromStorage).toBe('function')

		expect(clearFromStorage).toBeDefined()
		expect(typeof clearFromStorage).toBe('function')

		expect(setToStorage).toBeDefined()
		expect(typeof setToStorage).toBe('function')

		act(() => {
			setToStorage(storageKey, { enabled: true })
			clearFromStorage(storageKey)
		})

		expect(window.localStorage.getItem(storageKey)).toBe(null)
		expect(window.localStorage.getItem(storageKey)).toEqual(
			getFromStorage(storageKey, null)
		)
	})
})
