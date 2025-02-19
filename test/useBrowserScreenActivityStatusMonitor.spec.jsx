import '@testing-library/react-hooks/lib/dom/pure'
import { renderHook } from '@testing-library/react-hooks'

import { fireEvent } from '@testing-library/react'

import {
    stubBasicCallback,
    stubExtraCallback,
    stubObserverCallback
} from './.helpers/test-doubles/stubs'
import { useBrowserScreenActivityStatusMonitor } from '../src'

describe('Testing `useBrowserScreenActivityStatusMonitor` ReactJS hook', () => {
    let styleElement = null;

    beforeEach(() => {
		/* @NOTE: clean up the spys so future assertions
        are unaffected by invocations of the method
        in this test */
		stubBasicCallback.mockClear()
        stubExtraCallback.mockClear()
        stubObserverCallback.mockClear()

        styleElement = window.document.createElement('style')
        styleElement.innerHTML = `
        html,
        body {
          width: 100%;
          margin: 0;
          height: 100%;
        }
        `;
        window.document.head.appendChild(styleElement)
        fireEvent.scroll(
            window.document.body,
            { target: { scrollY: 0 } }
        )

        jest.useFakeTimers()
	})

    // Running all pending timers and switching to real timers using Jest
    afterEach(() => {
        window.document.head.removeChild(styleElement)

        styleElement = null;

        jest.runOnlyPendingTimers()
        jest.useRealTimers()
    })

    test('should render `useBrowserScreenActivityStatusMonitor` hook and check proper setup and teardown', () => {
        const { result, unmount } = renderHook(() =>
            useBrowserScreenActivityStatusMonitor({
                onPageNotActive: stubExtraCallback,
                onPageNowActive: stubBasicCallback,
                onStopped: stubObserverCallback,
            })
		)

        expect(setTimeout).toHaveBeenCalled()
        expect(setTimeout).toHaveBeenNthCalledWith(2, expect.any(Function), 3100);
        expect(stubObserverCallback).not.toHaveBeenCalled()
        expect(stubBasicCallback).not.toHaveBeenCalled()
        expect(stubExtraCallback).not.toHaveBeenCalled()

        unmount();
        expect(stubObserverCallback).toHaveBeenCalled();
    })

    test('should render `useBrowserScreenActivityStatusMonitor` hook and check screen activity callbacks are fired correctly', async () => {
        const { result, unmount } = renderHook(() =>
            useBrowserScreenActivityStatusMonitor({
                onPageNotActive: stubExtraCallback,
                onPageNowActive: stubBasicCallback,
                onStopped: stubObserverCallback,
                ACTIVITY_TIMEOUT_DURATION: 0
            })
		)

        expect(setTimeout).toHaveBeenCalled()
        expect(setTimeout).toHaveBeenNthCalledWith(2, expect.any(Function), 100);
        expect(stubObserverCallback).not.toHaveBeenCalled()
        expect(stubBasicCallback).not.toHaveBeenCalled()
        expect(stubExtraCallback).not.toHaveBeenCalled();

        jest.runOnlyPendingTimers();
        fireEvent(window, new Event("resize"));

        expect(stubBasicCallback).toHaveBeenCalled();
        expect(stubExtraCallback).toHaveBeenCalled();

        unmount();
        expect(stubObserverCallback).toHaveBeenCalled();
    })
});