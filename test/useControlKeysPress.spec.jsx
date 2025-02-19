import '@testing-library/react-hooks/lib/dom/pure'
import { renderHook } from '@testing-library/react-hooks'
import { stubBasicCallback } from './.helpers/test-doubles/stubs'

import { fireEvent, waitFor } from '@testing-library/react'
import { useControlKeysPress } from '../src'

describe('Testing `useControlKeysPress` ReactJS hook', () => {
	beforeEach(() => {
		/* @NOTE: clean up the spy so future assertions
		are unaffected by invocations of the method
		in this test */
		stubBasicCallback.mockClear()
	})

	test('should render `useControlKeysPress` and correctly responds to only control keys', async () => {
		renderHook(() =>
			useControlKeysPress(stubBasicCallback, ['Enter', 'Tab', 'Escape'])
		)

		const target = window.document.createElement('input')
		target.type = 'text'
		target.inputMode = 'numeric'
		target.pattern = '[0-9]+'
		target.name = 'quota'
		target.tabIndex = -1

		window.document.body.appendChild(target);


		fireEvent.change(target, { target: { value: '9200' } });
		fireEvent.keyUp(target, {
			key: 'Enter',
			code: 'Enter',
			charCode: 13
		})

		await waitFor(() => {
			expect(stubBasicCallback).toHaveBeenCalled()
			expect(stubBasicCallback).toHaveBeenCalledTimes(1)
			expect(stubBasicCallback).toHaveBeenCalledWith('Enter', target)
		})
	})
})
