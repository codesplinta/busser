import '@testing-library/react-hooks/lib/dom/pure'
import React from 'react'
import { renderHook, act } from '@testing-library/react-hooks'

import { stubCompositeReducer } from './.helpers/test-doubles/stubs'
import { dummyCompositeObject } from './.helpers/fixtures'
import { useComposite, EventBusProvider } from '../src'
import { render, waitFor } from '@testing-library/react'
import { TestComponent } from './.helpers/TestComponent'

/**
 *
 * @returns {(children: React.ReactNode) => JSX.Element}
 */
const getEventBusProvider = () => {
	return ({ children }) => <EventBusProvider>{children}</EventBusProvider>
}

describe('Testing `useComposite` ReactJS hook', () => {
	beforeEach(() => {
		/* @NOTE: clean up the spy so future assertions
		are unaffected by invocations of the method
		in this test */
		stubCompositeReducer.mockClear()
	})
	test('should render `useComposite` hook and processes fired event(s)', async () => {
		const eventName = 'AN.EVENT'
		const eventTagName = 'A.Component'
		const eventPayloadArgument = { notifications: ['hello world'] }

		const { result } = renderHook(
			() =>
				useComposite(
					[eventName],
					stubCompositeReducer,
					dummyCompositeObject,
					eventTagName
				),
			{
				wrapper: getEventBusProvider()
			}
		)

		const [composite, handleCompositeMerging, error, stats] = result.current

		expect(composite).toBeDefined()
		expect(stats).toBeDefined()
		expect(handleCompositeMerging).toBeDefined()

		expect(typeof composite).toBe('object')
		expect(composite instanceof Object).toBe(true)
		expect(composite).toEqual(
			expect.objectContaining({
				notifications: []
			})
		)
		expect(typeof stats).toBe('object')
		expect(typeof handleCompositeMerging).toBe('function')
		expect(error).toBe(null)

		act(() => {
			/* @HINT: [Testing Workaround]; */
			render(
				<TestComponent
					callback={() => handleCompositeMerging(eventName)}
					args={[eventPayloadArgument]}
				/>
			)
		})

		/* @NOTE: modified result from re-render above */
		const [newCompositeAfterRerender, , , statsAfterRerender] = result.current

		await waitFor(() => {
			expect(stubCompositeReducer).toHaveBeenCalledTimes(1)
			expect(stubCompositeReducer).toHaveBeenCalledWith(
				composite,
				eventPayloadArgument,
				eventName
			)
			expect(newCompositeAfterRerender).toMatchObject({
				notifications: ['hello world'],
				read: 0,
				unread: 0
			})
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
