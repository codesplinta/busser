import React, { useEffect } from 'react'

let actor

export const TestComponent = ({ callback, args }) => {
	actor = callback()

	useEffect(() => {
		if (!actor.called) {
			if (typeof actor === 'function') {
				try {
					const result = actor.apply(null, args)
					actor.called = 1;
					if (result instanceof Promise) {
						callback.returned = result;
					}
				} catch (_) {
					actor.call(null, args)
				}
			}
		}
	}, [])

	return null
}
