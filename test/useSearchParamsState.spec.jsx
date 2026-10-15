import '@testing-library/react-hooks/lib/dom/pure'
import { Router } from 'react-router-dom'
import { renderHook, act } from '@testing-library/react-hooks'

import { getWrapperWithRouter } from './.helpers/utils'

import { useSearchParamsState } from '../src'
import { cleanup, waitFor } from '@testing-library/react'

describe('Testing `useSearchParamsState` ReactJS hook', () => {
	/* @HINT: Get the `ReactRouter` history object and the Router Provider (factory function) */
	const [$history, getRouterWrapper] = getWrapperWithRouter(Router)

	afterEach(() => {
		/* @HINT: Need to reset the browser history to it's intial state after each test */
		/* @HINT: To avoid history <URL> state leaking into other test cases */
		
		if (typeof $history.back === "function") {
		  /* @INFO: React-Router v6+ and History v5 - Newer method name `back()` */
		  $history.back()
		} else {
		  /* @INFO: React-Router v4/v5 and History v4 - Legacy method name `goBack()` */
		  $history.goBack()
		}
		$history.replace('/', null)

		//window.history.pushState(null, document.title, '/')

		cleanup()
	})

	test('should render `useSearchParamsState` hook and update URL/history query params details with a default value', () => {
		const { result, unmount } = renderHook(
			() => useSearchParamsState('hello', false, 'ok'),
			{
				wrapper: getRouterWrapper()
			}
		)

		const [state, setState] = result.current

		expect(state).toBeDefined()
		expect(typeof state).toBe('string')

		expect(setState).toBeDefined()
		expect(typeof setState).toBe('function')

		expect(state).toBe('ok')
		expect($history.location.search).toBe('?hello=ok')

		act(() => {
			$history.push('/?open=true')
			/* @HINT: This call below `setState('not-ok')` causes no re-render */
			setState('not-ok')
		})

		waitFor(() => {
			expect(state).toBe('not-ok')
			expect($history.location.search).toBe('?hello=not-ok&open=true')
		})
		unmount()
	})

	test('should render `useSearchParamsState` hook and update URL/history query params details without a default value', () => {
		const { result, unmount } = renderHook(() => useSearchParamsState('hello'), {
			wrapper: getRouterWrapper()
		})

		const [state, setState] = result.current

		expect(state).toBe(null)

		expect(setState).toBeDefined()
		expect(typeof setState).toBe('function')

		expect(state).toBe(null)
		expect($history.location.search).toBe('')

		act(() => {
			$history.push('/?open=true')
			/* @HINT: This call below `setState('not-ok')` causes no re-render */
			setState('not-ok')
		})

		waitFor(() => {
			expect(state).toBe('not-ok')
			expect($history.location.search).toBe('?hello=not-ok&open=true')
		})
		unmount()
	})
})
