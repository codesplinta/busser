import '@testing-library/react-hooks/lib/dom/pure'
import React from 'react'
import { renderHook, act } from '@testing-library/react-hooks'

import { stubReturnedPromiseCallback } from './.helpers/test-doubles/stubs'

import { usePromised, EventBusProvider } from '../src'
import { waitFor, render } from '@testing-library/react'
import { TestComponent } from './.helpers/TestComponent'

/**
 *
 * @returns {(children: React.ReactNode) => JSX.Element}
 */
const getEventBusProvider = () => {
	return ({ children }) => <EventBusProvider>{children}</EventBusProvider>
}

describe('Testing `usePromised` ReactJS hook', () => {
	test('should render `usePromised` hook and respond resolved promise values', async () => {
		const eventName = 'AN.EVENT'
		const eventTagName = 'A.Component'

		const { result } = renderHook(
			() => usePromised(eventName, stubReturnedPromiseCallback, eventTagName),
			{
				wrapper: getEventBusProvider()
			}
		)

		const [, handlePromiseUnwraping, error, stats] = result.current

		expect(stats).toBeDefined()
		expect(handlePromiseUnwraping).toBeDefined()

		expect(typeof stats).toBe('object')
		expect(typeof handlePromiseUnwraping).toBe('function')
		expect(error).toBe(null)

		act(() => {
			/* @HINT: [Testing Workaround]; */
			render(
				<TestComponent
					callback={() => handlePromiseUnwraping(eventName)}
					args={[10]}
				/>
			)
		})

		/* @NOTE: modified result from re-render above */
		const [, , , statsAfterRerender] = result.current

		await waitFor(() => {
			expect(stubReturnedPromiseCallback).toHaveBeenCalledTimes(1)
			expect(stubReturnedPromiseCallback).toHaveBeenCalledWith(10)
			expect(statsAfterRerender.eventsFiredCount).toEqual(1)
			expect(statsAfterRerender.eventsSubscribedCount).toEqual(1)

			expect(Object.keys(statsAfterRerender.eventsFired)).toContain(eventName)
			expect(Object.keys(statsAfterRerender.eventsSubscribed)).toContain(eventName)
			expect(statsAfterRerender.eventsFired[eventName].name).toEqual(eventTagName)
			expect(statsAfterRerender.eventsSubscribed[eventName].name).toEqual(
				eventTagName
			)
		})
	})
})
