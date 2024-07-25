import '@testing-library/react-hooks/lib/dom/pure'
import { renderHook } from '@testing-library/react-hooks'
import { provisionFakeBrowserIntersectionObserverForTests } from 'mocklets'

import { dummyParagraphText } from './.helpers/fixtures'

import { fireEvent, waitFor } from '@testing-library/react'
import { useIsDOMElementVisibleOnScreen } from '../src'

describe('Testing `useIsDOMElementVisibleOnScreen` ReactJS hook', () => {
    let domElement = null;
    let styleElement = null;

    /* @HINT: Setup a fake shim for `InstersectionObserver` class on the `window` object */
    provisionFakeBrowserIntersectionObserverForTests()

	beforeEach(() => {
		/* @NOTE: Provision DOM nodes and CSS internal style sheet for tests */
		domElement = window.document.createElement('p');
        domElement.className = "description";

        domElement.textContent = dummyParagraphText;
        
        styleElement = window.document.createElement('style')
        styleElement.innerHTML = `
        html,
        body {
          width: 100%;
          margin: 0;
          height: 100%;
        }

        .description {
          margin-top: 1000px;
          color: grey;
          min-height: 50px;
          width: 100%;
        }
        `;
        window.document.body.appendChild(styleElement)
        window.document.body.appendChild(domElement)
        fireEvent.scroll(
            window.document.body,
            { target: { scrollY: 0 } }
        )
	})

    afterEach(() => {
        /* @NOTE: Provision DOM nodes and CSS internal style sheet for tests */
        window.document.body.removeChild(domElement)
        window.document.body.removeChild(styleElement)

        domElement = null
        styleElement = null;
    })

	test('should render `useIsDOMElementVisibleOnScreen` and ensure intersecting status is correctly reported', async () => {
        const { result, rerender } = renderHook(() =>
            useIsDOMElementVisibleOnScreen({
                root: window.document.body,
                rootMargin: "0px",
                threshold: 1
            })
        )

        const [ isIntersecting, domElementRef ] = result.current;

        expect(domElementRef.current).toBe(null);
        expect(isIntersecting).toBe(false);

        domElementRef.current = domElement;
        rerender();

        fireEvent.scroll(
            window.document.body,
            { target: { scrollY: 1500 } }
        )

        const [ newIsIntersectingAfterRerender ] = result.current;
    
        await waitFor(() => {
            expect(newIsIntersectingAfterRerender).toBe(true)
        })
    })
})