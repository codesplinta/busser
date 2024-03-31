import '@testing-library/react-hooks/lib/dom/pure'
import { renderHook } from '@testing-library/react-hooks'

import { dummyProps } from './.helpers/fixtures';
import { usePreviousProps } from '../src'

describe('Testing `usePreviousProps` ReactJS hook', () => {
  test('should render `usePreviousProps` and correctly returns the previous props upon re-render', () => {
    const { result, rerender, unmount } = renderHook(() =>
      usePreviousProps(dummyProps)
    )

    const previousProps = result.current;

    expect(previousProps).toBeUndefined()

    rerender({ title: "World", id: "cvu54aKL21aQ35oPli8n" })

    const nextPreviousProps = result.current;

    expect(nextPreviousProps).toMatchObject({ title: "Hello", id: "xWjud6538jSBudPiolcd" })
    unmount()
  })
});