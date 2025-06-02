import '@testing-library/react-hooks/lib/dom/pure'
import { renderHook, act } from '@testing-library/react-hooks'
import { waitFor } from '@testing-library/react'

import { provisionFakeBrowserLocalStorageForTests } from 'mocklets'

import { useBrowserStorageEffectUpdates } from '../src'
import { storageKey } from './.helpers/fixtures'


describe('Testing `useBrowserStorageEffectUpdates` ReactJS hook', () => {
	/* @HINT: Setup a fake `localStorage` object on the `window` object */
	provisionFakeBrowserLocalStorageForTests()

	test('should render `useBrowserStorageEffectUpdates` hook and check saving and retrieving storage data as a primitive type', () => {
		const { result } = renderHook(() =>
			useBrowserStorageEffectUpdates(
                storageKey,
                "basic",
                'local',
                'enforceEffect'
            )
		)

		const [ storageValue, setStorageValue ] = result.current

		expect(storageValue).toBeDefined()
		expect(typeof storageValue).toBe('string')

		expect(setStorageValue).toBeDefined()
		expect(typeof setStorageValue).toBe('function')

        expect(storageValue).toBe("basic");
	/* @SMELL: Coupled to implementation; `localStorage` */
        expect(window.localStorage.getItem(storageKey)).toBe("basic");

		act(() => {
			setStorageValue("advanced");
		})

        waitFor(() => {
	    	expect(storageValue).toBe("advanced")
		/* @SMELL: Coupled to implementation; `localStorage` */
	    	expect(window.localStorage.getItem(storageKey)).toBe("advanced")
        });
	})

    test('should render `useBrowserStorageEffectUpdates` hook and check appendding to storage data as a reference type', () => {
	const { result } = renderHook(() =>
		useBrowserStorageEffectUpdates(
                storageKey,
                { coreType: "basic" },
                'local',
                'enforceEffect'
            )
	)

	const [ storageValue, setStorageValue ] = result.current

	expect(storageValue).toBeDefined()
	expect(typeof storageValue).toBe('object')
        expect(storageValue instanceof Object).toBe(true)

	expect(setStorageValue).toBeDefined()
	expect(typeof setStorageValue).toBe('function')

        expect(storageValue).toMatchObject({
            coreType: "basic"
        });
	/* @SMELL: Coupled to implementation; `localStorage` */
        expect(window.localStorage.getItem(storageKey)).toBe(
            `{"coreType":"basic"}`
        );

	act(() => {
		setStorageValue({ addedType: "advanced" }, { append: true });
	})

        waitFor(() => {
	    expect(storageValue).toMatchObject({
                coreType: "basic",
                addedType: "advanced"
	   });
	   /* @SMELL: Coupled to implementation; `localStorage` */
    	   expect(window.localStorage.getItem(storageKey)).toBe(
                `{"coreType":"basic","addedType":"advanced"}`
            );
        })
	})
})
