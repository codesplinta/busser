import '@testing-library/react-hooks/lib/dom/pure';
import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';

import { stubListReducer } from './.helpers/test-doubles/stubs';

import { useList, EventBusProvider } from '../src';
import { waitFor, render } from '@testing-library/react';
import { TestComponent } from './.helpers/TestComponent';

/**
 *
 * @returns {(children: React.ReactNode) => JSX.Element}
 */
const getEventBusProvider = () => {
	return ({ children }) => <EventBusProvider>{children}</EventBusProvider>
}

describe('Testing `useList` ReactJS hook', () => {
	beforeEach(() => {
		/* @NOTE: clean up the spy so future assertions
    are unaffected by invocations of the method
    in this test */
		stubListReducer.mockClear()
	})

	test('should render `useList` hook and updates a list of items accordingly', async () => {
		const eventName = 'AN.EVENT'
		const eventTagName = 'A.Component'
		const initialList = [2]

		const { result } = renderHook(
			() => useList(eventName, stubListReducer, initialList, eventTagName),
			{
				wrapper: getEventBusProvider()
			}
		)

		const [list, handleListMutation, error, stats] = result.current

		expect(list).toBeDefined()
		expect(stats).toBeDefined()
		expect(handleListMutation).toBeDefined()

		expect(typeof list).toBe('object')
		expect(list instanceof Array).toBe(true)
		expect(list.length).toBe(1)
		expect(list).toEqual(expect.arrayContaining([2]))
		expect(typeof stats).toBe('object')
		expect(typeof handleListMutation).toBe('function')
		expect(error).toBe(null)

		act(() => {
			/* @HINT: [Testing Workaround]; */
			render(
				<TestComponent callback={() => handleListMutation(eventName)} args={[2]} />
			)
		})

		/* @NOTE: modified result from re-render above */
		const [newListAfterRerender, , , statsAfterRerender] = result.current

		await waitFor(() => {
			expect(stubListReducer).toHaveBeenCalledTimes(1)
			expect(stubListReducer).toHaveBeenCalledWith(initialList, 2)
			expect(newListAfterRerender).toEqual([2, 4])
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
