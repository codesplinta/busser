import '@testing-library/react-hooks/lib/dom/pure'
import { renderHook, act } from '@testing-library/react-hooks'

import { stubEffectsCallback } from './.helpers/test-doubles/stubs'
import {
	mockSearchFilterListComplexObjects,
	mockSearchFilterListSimpleObjects,
	mockSearchFilterListSimpleStrings
} from './.helpers/fixtures'
import { useTextFilteredList } from '../src'
import { waitFor } from '@testing-library/react'

describe('Testing `useTextFilteredList` ReactJS hook', () => {
	beforeEach(() => {
		/* @NOTE: clean up the spy so future assertions
		are unaffected by invocations of the method
		in this test */
		stubEffectsCallback.mockClear()
	})

	test('should render `useTextFilteredList` hook and filter a list of strings', async () => {
		const { result, unmount } = renderHook(() =>
			useTextFilteredList(
				{
					text: '',
					list: mockSearchFilterListSimpleStrings
				},
				{
					filterTaskName: 'specific',
					filterUpdateCallback: stubEffectsCallback
				}
			)
		)

		const [controller, handleChange] = result.current

		expect(controller).toBeDefined()
		expect(typeof handleChange).toBe('function')

		const event = new Event('change')
		const inputElement = window.document.createElement('input')
		inputElement.name = 'search'
		inputElement.type = 'text'
		inputElement.value = 'Bot'

		Object.defineProperty(event, 'target', {
			value: inputElement,
			writable: false
		})

		act(() => {
			handleChange(event)
		})

		/* @NOTE: modified result from re-render above */
		const [newControllerAfterRerender] = result.current

		await waitFor(() => {
			expect(newControllerAfterRerender.text).toBe('Bot')
			expect(newControllerAfterRerender.list.length).toEqual(1)
			expect(newControllerAfterRerender.list).toContain('Bot Five')
			expect(stubEffectsCallback).toHaveBeenCalledTimes(1)
			expect(stubEffectsCallback).toHaveBeenCalledWith(newControllerAfterRerender)
		})
		unmount()
	})

	test('should render `useTextFilteredList` hook and filter a list of simple objects by `name` property', async () => {
		const { result, unmount } = renderHook(() =>
			useTextFilteredList(
				{
					text: '',
					list: mockSearchFilterListSimpleObjects
				},
				{
					filterTaskName: 'specific',
					filterUpdateCallback: stubEffectsCallback
				}
			)
		)

		const [controller, handleChange] = result.current

		expect(controller).toBeDefined()
		expect(typeof handleChange).toBe('function')

		const event = new Event('change')
		const inputElement = window.document.createElement('input')
		inputElement.name = 'search'
		inputElement.type = 'text'
		inputElement.value = 'No'

		Object.defineProperty(event, 'target', {
			value: inputElement,
			writable: false
		})

		act(() => {
			handleChange(event, ['name'])
		})

		/* @NOTE: modified result from re-render above */
		const [newControllerAfterRerender] = result.current

		await waitFor(() => {
			expect(newControllerAfterRerender.text).toBe('No')
			expect(newControllerAfterRerender.list.length).toEqual(1)
			expect(newControllerAfterRerender.list).toMatchObject([
				{
					name: 'Note Two',
					id: 'ef88-ff24-d1a5cb40-08da-66df',
					status: 'inactive'
				}
			])
			expect(stubEffectsCallback).toHaveBeenCalledTimes(1)
			expect(stubEffectsCallback).toHaveBeenCalledWith(newControllerAfterRerender)
		})
		unmount()
	})

	test('should render `useTextFilteredList` hook and filter a list of complex objects with nested `status` property', async () => {
		const { result, unmount } = renderHook(() =>
			useTextFilteredList(
				{
					text: '',
					list: mockSearchFilterListComplexObjects
				},
				{
					filterTaskName: 'specific',
					filterUpdateCallback: stubEffectsCallback
				}
			)
		)

		const [controller, handleChange] = result.current

		expect(controller).toBeDefined()
		expect(typeof handleChange).toBe('function')

		const event = new Event('change')
		const inputElement = window.document.createElement('input')
		inputElement.name = 'search'
		inputElement.type = 'text'
		inputElement.value = 'inact'

		Object.defineProperty(event, 'target', {
			value: inputElement,
			writable: false
		})

		act(() => {
			handleChange(event, ['metadata.status'])
		})

		/* @NOTE: modified result from re-render above */
		const [newControllerAfterRerender] = result.current

		await waitFor(() => {
			expect(newControllerAfterRerender.list).toContainEqual(
				expect.objectContaining({
					name: 'Note Two',
					id: 'ef88-ff24-d1a5cb40-08da-66df',
					metadata: { status: 'inactive' }
				})
			)
			expect(stubEffectsCallback).toHaveBeenCalledTimes(1)
			expect(stubEffectsCallback).toHaveBeenCalledWith(newControllerAfterRerender)
		})
		unmount()
	})
})
