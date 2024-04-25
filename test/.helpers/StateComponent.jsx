import React from 'react'
import { useSharedState } from '../../src'

export const StateComponent = () => {
    const [sharedState] = useSharedState("list")

	return (
        <ul>
            {sharedState.map((listItem, index) => {
                return (
                    <li key={`${String(index)}-${listItem}`}>
                        <span>{listItem}</span>
                    </li>
                )
            })}
        </ul>
    )
}
