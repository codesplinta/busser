import React, { useEffect } from 'react'

let actor

export const TestComponent = ({ callback, args }) => {
	actor = callback()

	useEffect(() => {
		if (!actor.called) {
			if (typeof actor === 'function') {
				try {
					actor.apply(null, args)
					actor.called = 1
				} catch (_) {
					actor.call(null, args)
				}
			}
		}
	}, [])

	return null
}
