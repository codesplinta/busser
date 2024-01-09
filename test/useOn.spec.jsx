import '@testing-library/react-hooks/lib/dom/pure';
import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';

import { stubBasicCallback } from './.helpers/test-doubles/stubs';
import { mockEventBusPayload } from './.helpers/fixtures';
import { useOn, EventBusProvider } from '../src';

/**
 *
 * @returns {(children: React.ReactNode) => JSX.Element}
 */
const getEventBusProvider = () => {
	return ({ children }) => <EventBusProvider>{children}</EventBusProvider>
}

describe('Testing `useOn` ReactJS hook', () => {
	beforeEach(() => {
		/* @NOTE: clean up the spy so future assertions
        are unaffected by invocations of the method
        in this test */
		stubBasicCallback.mockClear()
	})

	test('should render `useOn` hook and respond to subscribed event(s)', () => {
		const eventName = 'AN.EVENT'
		const eventTagName = 'A.Component'

		const { result } = renderHook(
			() => useOn(eventName, stubBasicCallback, eventTagName),
			{
				wrapper: getEventBusProvider()
			}
		)

		const [bus, stats] = result.current

		expect(bus).toBeDefined()
		expect(stats).toBeDefined()

		expect(typeof bus).toBe('object')
		expect(typeof stats).toBe('object')

		act(() => {
			bus.emit(eventName, mockEventBusPayload)
		})

		expect(stubBasicCallback).toHaveBeenCalledTimes(1)
		expect(stubBasicCallback).toHaveBeenCalledWith(mockEventBusPayload)
		expect(stats.eventsFiredCount).toEqual(1)
		expect(stats.eventsSubscribedCount).toEqual(1)

		expect(Object.keys(stats.eventsFired)).toContain(eventName)
		expect(Object.keys(stats.eventsSubscribed)).toContain(eventName)
		expect(stats.eventsFired[eventName].name).toEqual(eventTagName)
		expect(stats.eventsSubscribed[eventName].name).toEqual(eventTagName)
	})
})
