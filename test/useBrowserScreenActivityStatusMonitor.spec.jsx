import '@testing-library/react-hooks/lib/dom/pure'
import { renderHook } from '@testing-library/react-hooks'

import { fireEvent } from '@testing-library/react'

import {
    stubBasicCallback,
    stubExtraCallback,
    stubObserverCallback
} from './.helpers/test-doubles/stubs'
import { useBrowserScreenActivityStatusMonitor } from '../src'
import { defaults } from '../src/common'

describe('Testing `useBrowserScreenActivityStatusMonitor` ReactJS hook', () => {
    let styleElement = null;
    const durationPadding = 100;
    const activityTimeoutDurationAsZero = 0;

    beforeEach(() => {
	/* @NOTE: 
 		clean up the spys so future assertions
        	are unaffected by invocations of the
        	callback in all subsequent test cases
	 */
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

    	/* @NOTE:
     		All pending timers must run to completion
       		so as not to setup temporal coupling due
	 	to timing dependencies across tests
   	*/
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

	/* @SMELL: Coupled to implementation; `setTimeout()` */
        expect(setTimeout).toHaveBeenCalled()
	/* @SMELL: Coupled to implementation; `setTimeout()` */
        expect(setTimeout).toHaveBeenNthCalledWith(2, expect.any(Function), (defaults.TimeoutDuration + durationPadding));

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
                ACTIVITY_TIMEOUT_DURATION: activityTimeoutDurationAsZero
            })
	)

	/* @SMELL: Coupled to implementation; `setTimeout()` */
        expect(setTimeout).toHaveBeenCalled()
    	/* @SMELL: Coupled to implementation; `setTimeout()` */
        expect(setTimeout).toHaveBeenNthCalledWith(2, expect.any(Function), (activityTimeoutDurationAsZero + durationPadding));

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
