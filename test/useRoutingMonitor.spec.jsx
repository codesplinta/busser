import '@testing-library/react-hooks/lib/dom/pure'
import { Router } from 'react-router-dom'
import { act, renderHook } from '@testing-library/react-hooks'

import { useRoutingMonitor, useUnsavedChangesLock } from '../src'
import { fakeStorageFactory } from './.helpers/test-doubles/fakes'
import {
	stubBasicCallback,
	stubBrowserEventHandler,
	stubDialogProcessFactory
} from './.helpers/test-doubles/stubs'
import { dummyPromptMessageForTest } from './.helpers/fixtures'
import { waitFor, cleanup } from '@testing-library/react'
import {
	provisionFakeWebPageWindowObject,
	getWrapperWithRouter
} from './.helpers/utils'

describe('Testing `useRoutingMonitor` ReactJS hook', () => {
	/* @HINT: Swap native browser `window.sessionStorage` object for fake one */
	provisionFakeWebPageWindowObject('sessionStorage', fakeStorageFactory())

	/* @HINT: Swap native browser `window.confirm` dialog trigger for a stubbed one */
	provisionFakeWebPageWindowObject(
		'confirm',
		stubDialogProcessFactory('confirm', true)
	)

	beforeEach(() => {
		/* @NOTE: clean up the spy so future assertions
		are unaffected by invocations of the method
		in this test */
		stubBasicCallback.mockClear()
		stubBrowserEventHandler.mockClear()
	})

	afterEach(() => {
		/* @HINT: Clear the fake so its' contents are reset to it's intial state after each test */
		/* @HINT: To avoid contents state leaking into other test cases */
		window.sessionStorage.clear()
	})

	/* @HINT: Get the `ReactRouter` history object and the Router Provider (factory function) */
	const [$history, getRouterWrapper] = getWrapperWithRouter(Router)

	afterEach(() => {
		/* @HINT: Need to reset the browser history to it's intial state after each test */
		/* @HINT: To avoid history <URL> state leaking into other test cases */
		$history.back()
		$history.replace('/', null)

		/* @HINT: cleanup */
		cleanup()
	})

	test('should render `useRoutingMonitor` hook and check whether route changes are intercepted correctly', async () => {
		const unsavedChangesStatusKey = 'unsavedPostItems'

		const { result: initialResult } = renderHook(() =>
			useUnsavedChangesLock({
				useBrowserPrompt: true
			})
		)

		const { result, unmount } = renderHook(
			() =>
				useRoutingMonitor({
					unsavedChangesRouteKeysMap: {
						'/v1/post/settings': unsavedChangesStatusKey
					},
					getUserConfirmation: initialResult.current.getUserConfirmation,
					promptMessage: dummyPromptMessageForTest,
					appPathnamePrefix: '/v1/',
					onNavigation: stubBasicCallback
				}),
			{
				wrapper: getRouterWrapper({
					getUserConfirmation: initialResult.current.getUserConfirmation
				})
			}
		)

		const { navigationList, getBreadCrumbsList } = result.current

		expect(navigationList).toBeDefined()
		expect(getBreadCrumbsList).toBeDefined()

		expect(Array.isArray(navigationList)).toBe(true)
		expect(typeof getBreadCrumbsList).toBe('function')

		window.sessionStorage.setItem(unsavedChangesStatusKey, 'pending')

		act(() => {
			window.addEventListener('beforediscardunsaveditems', stubBrowserEventHandler)
			$history.push('/v1/post')
			$history.push('/v1/post/settings')
		})

		const { navigationList: newNavigationListAfterRerender } = result.current

		waitFor(() => {
			expect(newNavigationListAfterRerender.length).toBe(3)
			expect(window.confirm).toHaveBeenCalled()
			expect(window.confirm).toHaveBeenCalledTimes(1)
			expect(window.confirm).toHaveBeenCalledWith(dummyPromptMessageForTest)
			expect(stubBasicCallback).toHaveBeenCalled()
			expect(stubBasicCallback).toHaveBeenCalledTimes(1)
			expect(stubBrowserEventHandler).toHaveBeenCalled()
			expect(stubBrowserEventHandler).toHaveBeenCalledTimes(1)
			expect(window.sessionStorage.getItem(unsavedChangesStatusKey)).toBe('saved')
		})
		unmount()
	})
})
