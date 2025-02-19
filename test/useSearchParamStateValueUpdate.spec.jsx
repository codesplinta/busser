import '@testing-library/react-hooks/lib/dom/pure'
import { Router } from 'react-router-dom'
import { renderHook, act } from '@testing-library/react-hooks'
import { waitFor, cleanup } from '@testing-library/react'

import {
    getWrapperWithRouter
} from './.helpers/utils'

import { useSearchParamStateValueUpdate } from '../src'

describe('Testing `useSearchParamStateValueUpdate` ReactJS hook', () => {
    /* @HINT: Get the `ReactRouter` history object and the Router Provider (factory function) */
    const [$history, getRouterWrapper] = getWrapperWithRouter(Router)
    const paramName = "search";

    afterEach(() => {
        /* @HINT: Need to reset the browser history to it's intial state after each test */
        /* @HINT: To avoid history <URL> state leaking into other test cases */
        $history.back()
        $history.replace(`/?${paramName}=dinner`, null)

        /* @HINT: cleanup */
        cleanup()
    })

    test('should render `useSearchParamStateValueUpdate` and update the URL query param via the "updater()"', () => {
        const { result } = renderHook(() => useSearchParamStateValueUpdate(paramName), {
            wrapper: getRouterWrapper()
        })
		const updater = result.current;

        expect(updater).toBeDefined()
        expect(typeof updater).toBe("function")

        act(() => {
            updater("lunch")
        })

        waitFor(() => {
            expect($history.location.search).toBe(`/?${paramName}=lunch`)
        })
    })
});