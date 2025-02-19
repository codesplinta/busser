import '@testing-library/react-hooks/lib/dom/pure'
import { Router } from 'react-router-dom'
import { renderHook, act } from '@testing-library/react-hooks'
import { waitFor, cleanup } from '@testing-library/react'

import {
    getWrapperWithRouter
} from './.helpers/utils'

import { useSearchParamStateValue } from '../src'

describe('Testing `useSearchParamStateValue` ReactJS hook', () => {
    /* @HINT: Get the `ReactRouter` history object and the Router Provider (factory function) */
    const [$history, getRouterWrapper] = getWrapperWithRouter(Router)
    const paramName = "level";

    afterEach(() => {
        /* @HINT: Need to reset the browser history to it's intial state after each test */
        /* @HINT: To avoid history <URL> state leaking into other test cases */
        $history.back()
        $history.replace(`/?${paramName}=2`, null)

        /* @HINT: cleanup */
        cleanup()
    })

    test('should render `useSearchParamStateValue` and check that search params are properly registred and updated', async () => {
        const { result } = renderHook(() => useSearchParamStateValue(paramName), {
            wrapper: getRouterWrapper()
        })

		const [searchParam, updater] = result.current

        expect(searchParam).toBeDefined()
        expect(typeof searchParam).toBe("object")
        expect(searchParam instanceof Object).toBe(true)
        expect(paramName in searchParam).toBe(true)

        waitFor(() => {
            expect(searchParam[paramName]).toBe("2");
        });

        expect(updater).toBeDefined()
        expect(typeof updater).toBe("function")

        updater("4")
        
        const [newerSearchParam] = result.current

        waitFor(() => {
            expect(paramName in newerSearchParam).toBe(true)
            expect(newerSearchParam[paramName]).toBe("4");
            expect($history.location.search).toBe(`/?${paramName}=4`)
        });
        
        $history.back()

        waitFor(() => {
            expect($history.location.search).toBe(`/?${paramName}=2`)
            console.log("searchy ::: ", $history.location.search)
        })
    })

    test('should render `useSearchParamStateValue` and ensure "overwriteHistory" config works correctly', async () => {
        const { result } = renderHook(() => useSearchParamStateValue(paramName), {
            wrapper: getRouterWrapper()
        })
		const [searchParam, updater] = result.current

        expect(searchParam instanceof Object).toBe(true)

        waitFor(() => {
            expect(searchParam[paramName]).toBe("2");
        });

        await act(async () => {
            return updater("6", { overwriteHistory: true })
        })
        
        const [newerSearchParam] = result.current

        waitFor(() => {
            expect(newerSearchParam[paramName]).toBe("6");
            expect($history.location.search).toBe(`/?${paramName}=6`);
        });

        $history.back()

        waitFor(() => {
            expect($history.location.search).not.toBe(`/?${paramName}=2`)
        })
    })
});