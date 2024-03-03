import '@testing-library/react-hooks/lib/dom/pure'
import { renderHook, act } from '@testing-library/react-hooks'
import { provisionFakeWebPageWindowObject } from './.helpers/utils'

import { useBrowserStorage } from '../src'
import { fakeStorageFactory } from './.helpers/test-doubles/fakes'
import { storageKey } from './.helpers/fixtures'

describe('Testing `useBrowserStorage` ReactJS hook', () => {
	/* @HINT: Setup a fake `localStorage` object on the `window` object */
	provisionFakeWebPageWindowObject('localStorage', fakeStorageFactory())

	beforeEach(() => {
		/* @HINT: Clear the fake so its' contents are reset to it's intial state after each test */
		/* @HINT: To avoid contents state leaking into other test cases */
		window.localStorage.clear()
	})

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
