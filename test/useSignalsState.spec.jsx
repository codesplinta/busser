import '@testing-library/react-hooks/lib/dom/pure'
import React from 'react'
import { renderHook, act } from '@testing-library/react-hooks'

import { useSignalsState } from '../src'

describe('Testing `useSignalsState` ReactJS hook', () => {
	test('should render `useSignalsState` hook and check state updates accordingly', () => {
		const initialCountValue = 0
		const nextCountValue = 2

		const { result } = renderHook(() => useSignalsState(initialCountValue))

		const [count, setCount] = result.current

		expect(count).toBeDefined()
		expect(typeof count.value).toBe('number')

		expect(setCount).toBeDefined()
		expect(typeof setCount).toBe('function')

		act(() => {
			setCount((previousCountValue) => {
				return previousCountValue + 2
			})
		})

		expect(count.value).toBe(nextCountValue)
	})
})
