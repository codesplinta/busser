import '@testing-library/react-hooks/lib/dom/pure'
import React from 'react'
import { Router } from 'react-router-dom'
import { renderHook, act } from '@testing-library/react-hooks'

import { useBus, useRoutingChanged, EventBusProvider } from '../src'
import { stubBasicCallback, stubBusEventHandler } from './.helpers/test-doubles/stubs'
import { cleanup, waitFor } from '@testing-library/react'
import { getWrapperWithRouter } from './.helpers/utils'

/**
 *
 * @returns {(children: React.ReactNode) => JSX.Element}
 */
 const getEventBusProvider = () => {
	return ({ children }) => <EventBusProvider>{children}</EventBusProvider>
}

describe('Testing `useRoutingChanged` ReactJS hook', () => {
	/* @HINT: Get the `ReactRouter` history object and the Router Provider (factory function) */
	const [$history, getRouterWrapper] = getWrapperWithRouter(Router)

  afterEach(() => {
		/* @HINT: Need to reset the browser history to it's intial state after each test */
		/* @HINT: To avoid history <URL> state leaking into other test cases */
		$history.back()
		$history.replace('/', null)

		cleanup()
	})

  beforeEach(() => {
		/* @NOTE: clean up the spy so future assertions
    are unaffected by invocations of the method
    in this test */
		stubBasicCallback.mockClear()
    stubBusEventHandler.mockClear()
	})

	test('should render `useRoutingChanged` and fires correct event when brower history is updated', () => {
		const eventName = 'AN.EVENT'
		const eventTagName = 'A.Component'

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
				wrapper: getEventBusProvider()
			}
		)

		renderHook(
			() =>
				useRoutingChanged(eventName, $history, eventTagName, stubBasicCallback),
			{
				wrapper: getRouterWrapper()
			}
		)

    const [bus] = busResult.current

    bus.on(eventName, stubBusEventHandler)

		act(() => {
      $history.push('/next')
    })

		waitFor(() => {
			expect(stubBasicCallback).toHaveBeenCalled()
      expect(stubBasicCallback).toHaveBeenCalledTimes(1)
      expect(stubBusEventHandler).toHaveBeenCalled()
      expect(stubBusEventHandler).toHaveBeenCalledWith({ location: $history.location, action: $history.action })
		})
	})
})
