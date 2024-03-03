import '@testing-library/react-hooks/lib/dom/pure'
import { renderHook, act } from '@testing-library/react-hooks'
import { provisionFakeWebPageWindowObject } from './.helpers/utils'

import { useUnsavedChangesLock } from '../src'
import {
	stubBasicCallback,
	stubDialogProcessFactory
} from './.helpers/test-doubles/stubs'
import { promptMessageForTest } from './.helpers/fixtures'
import { createBrowserHistory } from 'history'

describe('Testing `useUnsavedChangesLock` ReactJS hook', () => {
	/* @HINT: Swap native browser `window.confirm` dialog trigger for a stubbed one */
	provisionFakeWebPageWindowObject(
		'confirm',
		stubDialogProcessFactory('confirm', false)
	)

	test('should render `useUnsavedChangesLock` hook and verify confirmation', () => {
		const history = createBrowserHistory()

		const { result, unmount } = renderHook(() =>
			useUnsavedChangesLock({
				useBrowserPrompt: true
			})
		)

		const { getUserConfirmation } = result.current

		expect(getUserConfirmation).toBeDefined()
		expect(typeof getUserConfirmation).toBe('function')

		act(() => {
			history.push('/next')
			getUserConfirmation(promptMessageForTest, stubBasicCallback)
		})

		expect(window.confirm).toHaveBeenCalled()
		expect(window.confirm).toHaveBeenCalledTimes(1)
		expect(window.confirm).toHaveBeenCalledWith(promptMessageForTest)

		expect(stubBasicCallback).not.toHaveBeenCalled()
		unmount()
	})
})
