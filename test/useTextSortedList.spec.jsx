import '@testing-library/react-hooks/lib/dom/pure'
import { renderHook, act } from '@testing-library/react-hooks'

import {
    dummyListToSort
} from './.helpers/fixtures'
import { useTextSortedList, SORT_ORDER } from '../src'

describe('Testing `useTextSortedList` ReactJS hook', () => {
    test('should render `useTextSortedList` hook and properly sort an array of items', () => {
        const propertyInListToSortOn = "name";
        const { result } = renderHook(() =>
            useTextSortedList(
                dummyListToSort,
                SORT_ORDER.ASCENDING,
                propertyInListToSortOn
            )
		)

        const [ sortedList, handleSortFor ] = result.current;

        const dummyListSortedByNameInAscendingOrder = [
            { id: 3, name: "Frodo" },
            { id: 4, name: "Kreft" },
            { id: 2, name: "Menlo" },
            { id: 1, name: "Zasog" }
        ];
        
        const dummyListSortedByNameInDescendingOrder = [
            { id: 1, name: "Zasog" },
            { id: 2, name: "Menlo" },
            { id: 4, name: "Kreft" },
            { id: 3, name: "Frodo" }
        ];

        expect(sortedList).toBeDefined()
        expect(typeof sortedList).toBe("object")
        expect(sortedList instanceof Array).toBe(true)
        expect(sortedList).toMatchObject(dummyListSortedByNameInAscendingOrder)

        expect(handleSortFor).toBeDefined()
        expect(typeof handleSortFor).toBe("function")

        act(() => {
            handleSortFor(SORT_ORDER.DESCENDING, propertyInListToSortOn)
        });

        /* @NOTE: modified result from re-render above */
        const [ newSortedList ] = result.current;

        expect(newSortedList instanceof Array).toBe(true)
        expect(newSortedList).toMatchObject(dummyListSortedByNameInDescendingOrder)
    })
});