import '@testing-library/react-hooks/lib/dom/pure'
import React from 'react'
import { renderHook, act } from '@testing-library/react-hooks'

import { dummyHttpResponseDetailsObject } from './.helpers/fixtures'
import { stubBasicCallback } from './.helpers/test-doubles/stubs'

import { useBus, useHttpSignals, EventBusProvider } from '../src'
import { waitFor } from '@testing-library/react'

/**
 *
 * @returns {(children: React.ReactNode) => JSX.Element}
 */
const getEventBusProvider = () => {
	return ({ children }) => <EventBusProvider>{children}</EventBusProvider>
}

describe('Testing `useuseHttpSignals` ReactJS hook', () => {
	beforeEach(() => {
		/* @NOTE: clean up the spy so future assertions
    are unaffected by invocations of the method
    in this test */
		stubBasicCallback.mockClear()
	})

	test('should render `useHttpSignals` hook and ensure it fires necessary events', () => {
		const wrapper = getEventBusProvider()
		const eventName = 'request:started'
		const eventTagName = 'Http.Requests'

		const { result: busResult } = renderHook(
			() =>
				useBus(
					{
						subscribes: [eventName],
						fires: []
					},
					'Reciever.Hook'
				),
			{
				wrapper: wrapper
			}
		)
		const { result } = renderHook(() => useHttpSignals(eventTagName), {
			wrapper: wrapper
		})

		const { stats, signalRequestStarted } = result.current
		const [bus] = busResult.current

		bus.on(eventName, stubBasicCallback)

		expect(stats).toBeDefined()
		expect(typeof stats).toBe('object')

		expect(signalRequestStarted).toBeDefined()
		expect(typeof signalRequestStarted).toBe('function')

		expect(Object.keys(stats.eventsFired).length).toEqual(0)
		expect(stats.eventsFired[eventName]).not.toBeDefined()

		act(() => {
			signalRequestStarted(dummyHttpResponseDetailsObject)
		})

		const { stats: newStats } = result.current

		waitFor(() => {
			expect(newStats.eventsFired[eventName]).toBeDefined()
			expect(newStats.eventsFired[eventName].data).toMatchObject(
				dummyHttpResponseDetailsObject
			)

			expect(stubBasicCallback).toHaveBeenCalled()
			expect(stubBasicCallback).toHaveBeenCalledWith(dummyHttpResponseDetailsObject)
		})
	})
})
