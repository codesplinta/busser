import '@testing-library/react-hooks/lib/dom/pure'
import { renderHook } from '@testing-library/react-hooks'

import {
    stubBasicCallback
} from './.helpers/test-doubles/stubs'
import { dummyPromptMessageForTest } from './.helpers/fixtures'

import { useBeforePageUnload } from '../src'

describe('Testing `useBeforePageUnload` ReactJS hook', () => {

	beforeEach(() => {
		/* @NOTE: clean up the spy so future assertions
        are unaffected by invocations of the method
        in this test */
		stubBasicCallback.mockClear()
	})

	test('should render `useBeforePageUnload` and verify that callback is called if `when` condition is true', () => {
        renderHook(() =>
            useBeforePageUnload(
                stubBasicCallback,
                { when: true, message: dummyPromptMessageForTest }
            )
        )

        expect(stubBasicCallback).not.toHaveBeenCalled()

        window.dispatchEvent(new Event("beforeunload"));

        expect(stubBasicCallback).toHaveBeenCalled()
    })

    test('should render `useBeforePageUnload` and verify that callback isn\'t called if `when` condition is false', () => {
        renderHook(() =>
            useBeforePageUnload(
                stubBasicCallback,
                { when: false, message: dummyPromptMessageForTest }
            )
        )

        expect(stubBasicCallback).not.toHaveBeenCalled()

        window.dispatchEvent(new Event("beforeunload"));

        expect(stubBasicCallback).not.toHaveBeenCalled()
    }, 30000)
})