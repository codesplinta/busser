import '@testing-library/react-hooks/lib/dom/pure';
import { renderHook, act } from '@testing-library/react-hooks';

import { useSignalsState, useSignalsEffect } from '../src';
import { stubBasicCallback } from './.helpers/test-doubles/stubs';

describe('Testing `useSignalsEffect` ReactJS hook', () => {
  test('should render `useSignalsEffect` hook and check that effect is fired accordingly', () => {
    const initialCountValue = 0

    renderHook(() => useSignalsEffect(stubBasicCallback, []));
    const { result } = renderHook(() => useSignalsState(initialCountValue));

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

    expect(stubBasicCallback).toHaveBeenCalledTimes(1);
    expect(stubBasicCallback).toHaveBeenCalledWith();
  })
})
