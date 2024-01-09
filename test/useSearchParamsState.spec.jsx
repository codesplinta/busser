import '@testing-library/react-hooks/lib/dom/pure';
import React from 'react';
import {
  Router,
} from 'react-router-dom';
import {
  History,
  createBrowserHistory
} from 'history';
import { renderHook, act } from '@testing-library/react-hooks';

import { useSearchParamsState } from '../src';
import { cleanup, waitFor } from '@testing-library/react';

/**
 *
 * @param {History} history
 * @returns {((children: React.ReactNode) => JSX.Element | Function)}
 */
 const getRouterProvider = (history) => {
  return ({ children }) => (
    <Router
      history={history}
    >
      {children}
    </Router>
  );
}

describe('Testing `useSearchParamsState` ReactJS hook', () => {
  const $history = createBrowserHistory();
  afterEach(() => {
    /* @HINT: Need to reset the browser history to it's intial state after each test */
    /* @HINT: To avoid history <URL> state leaking into other test cases */
    $history.back();
    $history.replace('/', null);

    cleanup();
  });

  test('should render `useSearchParamsState` hook and update URL/history query params details with a default value', () => {
    const { result, unmount } = renderHook(() => useSearchParamsState('hello', 'ok'), {
      wrapper: getRouterProvider(
        $history
      )
    })

    const [state, setState] = result.current

    expect(state).toBeDefined()
    expect(typeof state).toBe('string')

    expect(setState).toBeDefined()
    expect(typeof setState).toBe('function')

    expect(state).toBe('ok')
    expect($history.location.search).toBe('')

    act(() => {
      $history.push('/?open=true');
      /* @HINT: This call below `setState('not-ok')` causes no re-render */
      setState('not-ok')
    })

    waitFor(() => {
      expect(state).toBe('not-ok')
      expect($history.location.search).toBe('?hello=not-ok&open=true')
    });
    unmount();
  })

  test('should render `useSearchParamsState` hook and update URL/history query params details without a default value', () => {
    const { result, unmount } = renderHook(() => useSearchParamsState('hello'), {
      wrapper: getRouterProvider(
        $history
      )
    })

    const [state, setState] = result.current

    expect(state).toBe(null)

    expect(setState).toBeDefined()
    expect(typeof setState).toBe('function')

    expect(state).toBe(null)
    expect($history.location.search).toBe('')

    act(() => {
      $history.push('/?open=true');
      /* @HINT: This call below `setState('not-ok')` causes no re-render */
      setState('not-ok')
    })

    waitFor(() => {
      expect(state).toBe('not-ok')
      expect($history.location.search).toBe('?hello=not-ok&open=true')
    });
    unmount();
  })
})


