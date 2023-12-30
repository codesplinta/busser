export const stubListReducer = jest.fn((previousList, eventPayload) => {
	return previousList.concat([eventPayload * 2])
})
export const stubCountReducer = jest.fn((count = 0, eventPayload = 0) => {
	return count + eventPayload
})
export const stubCompositeReducer = jest.fn((composite, eventPayload) => {
	return Object.assign(composite, eventPayload)
})

export const stubReturnedPromiseCallback = jest.fn(
	(number) =>
		new Promise((resolve) => {
			setTimeout(() => resolve(number * 2), 500)
		})
)
export const stubBasicCallback = jest.fn(() => undefined)
export const stubEffectsCallback = jest.fn(() => () => undefined)

/**
 *
 * @param {String} type
 * @param {(Boolean | Undefined)} returnType
 * @returns
 */
export const stubDialogProcessFactory = (type, returnType) =>
	(function () {
		const prompts = {
			alert: function () {
				return
			},
			prompt: jest.fn().mockImplementation(() => returnType),
			confirm: jest.fn().mockImplementation(() => returnType)
		}

		return prompts[type]
	})()
