import '@testing-library/react-hooks/lib/dom/pure';
import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';

import { stubCountReducer } from './.helpers/test-doubles/stubs';
import { useCount, EventBusProvider } from '../src';
import { waitFor, render } from '@testing-library/react';
import { TestComponent } from './.helpers/TestComponent';

/**
 *
 * @returns {(children: React.ReactNode) => JSX.Element}
 */
const getEventBusProvider = () => {
	return ({ children }) => <EventBusProvider>{children}</EventBusProvider>
}

describe('Testing `useCount` ReactJS hook', () => {
	beforeEach(() => {
		/* @NOTE: clean up the spy so future assertions
    are unaffected by invocations of the method
    in this test */
		stubCountReducer.mockClear()
	})

	test('should render `useCount` hook and respond to subscribed events', async () => {
		const eventName = 'AN.EVENT'
		const eventTagName = 'A.Component'

		const { result } = renderHook(
			() => useCount([eventName], stubCountReducer, { start: 2 }, eventTagName),
			{
				wrapper: getEventBusProvider()
			}
		)

		const [count, handleCounting, error, stats] = result.current

		expect(count).toBeDefined()
		expect(stats).toBeDefined()
		expect(handleCounting).toBeDefined()

		expect(typeof count).toBe('number')
		expect(typeof stats).toBe('object')
		expect(typeof handleCounting).toBe('function')
		expect(error).toBe(null)

		act(() => {
			/* @HINT: [Testing Workaround]; */
			render(
				<TestComponent callback={() => handleCounting(eventName)} args={[1]} />
			)
		})

		/* @NOTE: modified result from re-render above */
		const [newCountAfterRerender, , , statsAfterRerender] = result.current

		await waitFor(() => {
			expect(stubCountReducer).toHaveBeenCalled()
			expect(stubCountReducer).toHaveBeenCalledTimes(1)
			expect(stubCountReducer).toHaveBeenCalledWith(2, 1, eventName)
			expect(newCountAfterRerender).toEqual(3)
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
