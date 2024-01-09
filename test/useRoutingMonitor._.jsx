import '@testing-library/react-hooks/lib/dom/pure';
import React from 'react';
import {
	provisionFakeWebPageWindowObject,
	setInitialRouteAndRenderHookWithRouter
} from './.helpers/utils';

import { act, renderHook } from '@testing-library/react-hooks';

import { useRoutingMonitor, useUnsavedChangesLock } from '../src';
import { fakeStorageFactory } from './.helpers/test-doubles/fakes';
import {
	stubBasicCallback,
	stubDialogProcessFactory
} from './.helpers/test-doubles/stubs';
import { promptMessageForTest } from './.helpers/fixtures';
import { waitFor } from '@testing-library/react';


describe('Testing `useRoutingMonitor` ReactJS hook', () => {
	/* @HINT: Swap native browser `window.sessionStorage` object for fake one */
	provisionFakeWebPageWindowObject('sessionStorage', fakeStorageFactory())

	/* @HINT: Swap native browser `window.confirm` dialog trigger for a stubbed one */
	provisionFakeWebPageWindowObject(
		'confirm',
		stubDialogProcessFactory('confirm', true)
	)

	test('should render `useRoutingMonitor` hook and check whether route changes are registered', async () => {
		// const getUserConfirmation = (message, callback) => {
		// 	const allowTransition = window.confirm(message)
		// 	window.setTimeout(() => {
		// 		callback(allowTransition)
		// 	}, 500)
		// }
    const { result } = renderHook(() => useUnsavedChangesLock({
      useBrowserPrompt: true
    }));

		const [history, { result }] = setInitialRouteAndRenderHookWithRouter(
			() =>
				useRoutingMonitor({
					unsavedChangesRouteKeysMap: {
						'/v1/post/settings/1': 'unsavedPostItems'
					},
					getUserConfirmation: result.current.getUserConfirmation,
					setupPageTitle: false,
					promptMessage: promptMessageForTest,
					appPathnamePrefix: '/v1/',
					onNavigation: stubBasicCallback
				}),
			{
				initialRoute: { path: '/v1/post/settings', title: 'Post Settings' },
				chooseMemoryRouter: false,
				getUserConfirmation: result.current.getUserConfirmation
			}
		)

		// const { result } = hook()
		const { navigationList, getBreadCrumbsList } = result.current

		expect(navigationList).toBeDefined()
		expect(getBreadCrumbsList).toBeDefined()

		expect(Array.isArray(navigationList)).toBe(true)
		expect(typeof getBreadCrumbsList).toBe('function')

		window.sessionStorage.setItem('unsavedPostItems', 'pending')

		act(() => {
			history.push('/v1/post/settings/1')
			//rerender();
		})

		const [newNavigationListAfterRerender] = result.current

		await waitFor(() => {
			expect(newNavigationListAfterRerender.length).toBe(2)
			expect(window.confirm).toHaveBeenCalled()
			expect(window.confirm).toHaveBeenCalledTimes(1)
			expect(window.confirm).toHaveBeenCalledWith(promptMessageForTest)
			expect(stubBasicCallback).toHaveBeenCalled()
			expect(stubBasicCallback).toHaveBeenCalledTimes(1)
			expect(window.sessionStorage.getItem('unsavedPostItems')).toBe('saved')
		})
		unmount()
	})
})
