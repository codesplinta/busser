import React, { useState } from 'react'
import { useTextFilteredList } from '../../src'

export const FilterComponent = ({ list }) => {
    const [uiState, setState] = useState({ list })
	const [{ list: mockList } ] = useTextFilteredList({ list: uiState.list }, {
        filterTaskName: "specific"
    })

	return (
        <>
         <ul>
             {mockList.map((listItem, index) => {
                 return (
                    <li data-key={listItem.id} key={`${String(index)}-${listItem.id}`}>
                        <input
                            type="checkbox"
                            checked={listItem.settled}
                            data-testid={listItem.id}
                            onChange={(e) => {
                                e.persist()
                                setState((prevState) => {
                              const nextState = prevState.list.slice(0);
                              const index = nextState.findIndex((item) =>
                                listItem && item["name"] === listItem["name"]
                              );
                              nextState.splice(index, 1, {
                                ...listItem,
                                settled: e.target.checked 
                              })
                              return { list: nextState }
                            })}
                            }/>
                        <span>{listItem.name}</span>
                    </li>
                 )
             })}
         </ul>
        </>
    )
}
