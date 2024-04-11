import '@testing-library/react-hooks/lib/dom/pure'
import { renderHook, act } from '@testing-library/react-hooks'
import { stubBasicCallback } from './.helpers/test-doubles/stubs'

import { fireEvent, waitFor } from '@testing-library/react'
import { useOutsideClick } from '../src'

describe('Testing `useOutsideClick` ReactJS hook', () => {
	beforeEach(() => {
		/* @NOTE: clean up the spy so future assertions
		are unaffected by invocations of the method
		in this test */
		stubBasicCallback.mockClear()
	})

	test('should render `useOutsideClick` and responds correctly to a click from outside a specific DOM node', () => {
		const { result } = renderHook(() => useOutsideClick(stubBasicCallback))
		let [refElement] = result.current

		refElement.current = window.document.createElement('div')

		act(() => {
			fireEvent.click(refElement.current)
			fireEvent.mouseUp(document)
		})

		waitFor(() => {
			expect(stubBasicCallback).toHaveBeenCalled()
			expect(stubBasicCallback).toHaveBeenCalledWith(refElement.current, document)
		})
	})
})
