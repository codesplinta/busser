import '@testing-library/react-hooks/lib/dom/pure'
import { renderHook } from '@testing-library/react-hooks'
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

	test('should render `useOutsideClick` and responds correctly to a click from outside the specific DOM node ref', async () => {
		const { result } = renderHook(() => useOutsideClick(stubBasicCallback))
		let [refElement] = result.current

		refElement.current = window.document.createElement('div')
		const outSideElement = window.document.createElement('button')

		outSideElement.innerText = 'Boom!'
		outSideElement.type = 'button'
		outSideElement.tabIndex = -1

		document.body.appendChild(outSideElement)
		document.body.appendChild(refElement.current)

		fireEvent.click(outSideElement)

		await waitFor(() => {
			expect(stubBasicCallback).toHaveBeenCalled()
			expect(stubBasicCallback).toHaveBeenCalledWith(refElement.current, outSideElement)
		})
	})

	test('should render `useOutsideClick` and responds correctly to a click from on (not outside) the specific DOM node ref', async () => {
		const { result } = renderHook(() => useOutsideClick(stubBasicCallback))
		let [refElement] = result.current

		refElement.current = window.document.createElement('div')

		document.body.appendChild(refElement.current)

		fireEvent.click(refElement.current)

		await waitFor(() => {
			expect(stubBasicCallback).not.toHaveBeenCalled()
		})
	})
})
