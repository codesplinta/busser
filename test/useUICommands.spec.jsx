import '@testing-library/react-hooks/lib/dom/pure'
import { renderHook, act } from '@testing-library/react-hooks'

import { stubBrowserEventHandler, stubObserverCallback } from './.helpers/test-doubles/stubs'
import { useUICommands } from '../src'

const writeTextSpy = jest.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();

describe('Testing `useUICommands` ReactJS hook', () => {
    const textToCopy = "<API KEY>";
    beforeAll(() => {
        /* @HINT: JSDOM doesn't support/implement `document.queryCommandSupported()` function */
        Object.defineProperty(document, 'queryCommandSupported', {
            writable: false,
            value (command = '') {
                if (command === 'copy' || command === 'paste') {
                    return true
                }

                return false
            } 
        })

        /* @HINT: JSDOM doesn't suuport/implement `document.execCommand()` function */
        Object.defineProperty(document, 'execCommand', {
            writable: false,
            value (command = '') {
                let result = false;
                switch (command) {
                    case 'copy':
                    case 'paste':
                        window.dispatchEvent(new Event(command));
                        result = true
                    break;
                    default:
                        result = false
                    break;
                }

                return result;
            }
        });
    })

    afterEach(() => {
        writeTextSpy.mockRestore();
    })

    test('should render `useUICommands` hook and ensure "copy()" command works correctly', async () => { 
        const { result } = renderHook(() =>
            useUICommands({
              print: {
                onBeforePrint: stubBrowserEventHandler,
                nowPrinting: stubObserverCallback
              }
            })
		)

        const { hub } = result.current;

        expect(hub).toBeDefined()
        expect(typeof hub).toBe("object")
        expect(hub instanceof Object).toBe(true)

        expect('copy' in hub).toBe(true)

        await act(async () => {
            return hub.copy(textToCopy)
        })
        
        expect(writeTextSpy).toHaveBeenCalled()
        expect(writeTextSpy).toHaveBeenCalledTimes(1)
        expect(writeTextSpy).toHaveBeenCalledWith(textToCopy);
    })

    test('should render `useUICommands` hook and ensure "print()" command works correctly', async () => { 
        const { result, unmount } = renderHook(() =>
            useUICommands({
              print: {
                onBeforePrint: stubBrowserEventHandler,
                nowPrinting: stubObserverCallback
              }
            })
		)

        const { hub } = result.current;

        expect(hub).toBeDefined()
        expect(typeof hub).toBe("object")
        expect(hub instanceof Object).toBe(true)

        expect('print' in hub).toBe(true)

        await act(async () => {
            return hub.print()
        })

        
        expect(window.print).toHaveBeenCalled();
        expect(window.print).toHaveBeenCalledTimes(1)
        expect(stubBrowserEventHandler).toHaveBeenCalled()
        expect(stubObserverCallback).toHaveBeenCalled();
        expect(stubObserverCallback).toHaveBeenCalledTimes(1)

        unmount();
    })
});