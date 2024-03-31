import '@testing-library/react-hooks/lib/dom/pure'
import { renderHook, act } from '@testing-library/react-hooks'

import { useSignalsState } from '../src'

describe('Testing `useSignalsState` ReactJS hook', () => {
	test('should render `useSignalsState` hook and check that state updates accordingly', () => {
		const initialCountValue = 0
		const nextCountValue = 2

		const { result } = renderHook(() => useSignalsState(initialCountValue))

		const [count, setCount] = result.current

		expect(count).toBeDefined()
		expect(typeof count.value).toBe('number')

		expect(setCount).toBeDefined()
		expect(typeof setCount).toBe('function')

		setCount((previousCountValue) => {
			return previousCountValue + 2
		})

		/* @HINT: Updates made signals don't need to be waited on using `act()` and `waitFor()` */
		/* @HINT: So, assertions can be made synchronously */
		expect(count.value).toBe(nextCountValue)
	})
})
