import '@testing-library/react-hooks/lib/dom/pure'
import React from 'react'
import { renderHook, act } from '@testing-library/react-hooks'

import { stubBasicCallback } from './.helpers/test-doubles/stubs'
import { dummyEventBusPayload } from './.helpers/fixtures'
import { useBus, EventBusProvider } from '../src'

/**
 *
 * @returns {(children: React.ReactNode) => JSX.Element}
 */
const getEventBusProvider = () => {
	return ({ children }) => <EventBusProvider>{children}</EventBusProvider>
}

describe('Testing `useBus` ReactJS hook', () => {
	beforeEach(() => {
		/* @NOTE: clean up the spy so future assertions
    are unaffected by invocations of the method
    in this test */
		stubBasicCallback.mockClear()
	})

	test('should render `useBus` hook and respond to subscribed event(s)', () => {
		const eventName = 'AN.EVENT'
		const eventTagName = 'A.Component'

		const { result } = renderHook(
			() =>
				useBus(
					{
						fires: [eventName],
						subscribes: [eventName]
					},
					eventTagName
				),
			{
				wrapper: getEventBusProvider()
			}
		)

		const [bus, stats] = result.current

		expect(bus).toBeDefined()
		expect(stats).toBeDefined()

		expect(typeof bus).toBe('object')
		expect(typeof stats).toBe('object')

		bus.on(eventName, stubBasicCallback)

		act(() => {
			bus.emit(eventName, dummyEventBusPayload)
		})

		expect(stubBasicCallback).toHaveBeenCalledTimes(1)
		expect(stubBasicCallback).toHaveBeenCalledWith(dummyEventBusPayload)
		expect(stats.eventsFiredCount).toEqual(1)
		expect(stats.eventsSubscribedCount).toEqual(1)

		expect(Object.keys(stats.eventsFired)).toContain(eventName)
		expect(Object.keys(stats.eventsSubscribed)).toContain(eventName)
		expect(stats.eventsFired[eventName].name).toEqual(eventTagName)
		expect(stats.eventsSubscribed[eventName].name).toEqual(eventTagName)
	})
})
