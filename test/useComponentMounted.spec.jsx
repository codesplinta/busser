import '@testing-library/react-hooks/lib/dom/pure'
import { renderHook, act } from '@testing-library/react-hooks'


import { useComponentMounted } from '../src'

describe('Testing `useComponentMounted` ReactJS hook', () => {
	test('should render `useComponentMounted` and correctly reports the status for a mounted component', () => {
        const { result, rerender } = renderHook(() =>
            useComponentMounted()
		)

        const isComponentMounted = result.current;

        expect(isComponentMounted).toBe(false)

        rerender()

        const nextRenderIsComponentMounted = result.current
        
        expect(nextRenderIsComponentMounted).toBe(true)
	})
});