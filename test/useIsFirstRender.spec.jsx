import '@testing-library/react-hooks/lib/dom/pure'
import { renderHook } from '@testing-library/react-hooks'

import { useIsFirstRender } from '../src'

describe('Testing `useIsFirstRender` ReactJS hook', () => {
	test('should render `useIsFirstRender` and correctly detects a first render', () => {
		const { result, rerender } = renderHook(() => useIsFirstRender())
		const isFirstRender = result.current

		expect(isFirstRender).toEqual(true)

		rerender()

		expect(result.current).toEqual(false)
	})
})
