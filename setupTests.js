// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

import mediaQuery from 'css-mediaquery';

/* @NOTE: ATTRIBUTION# */
/*
MIT License

Copyright (c) Jason Miller (https://jasonformat.com/)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
function mitt (allEventsMap = {}) {
    const all = Object.create(null)
    return {
      on (type, handler) {
        allEventsMap[type] = -1;
        (all[type] || (all[type] = [])).push(handler)
      },
      off (type, handler) {
        if (typeof allEventsMap[type] !== 'undefined') {
          delete allEventsMap[type]
        }
        if (all[type]) {
          all[type].splice(all[type].indexOf(handler) >>> 0, 1)
        }
      },
      emit (type) {
        if (allEventsMap[type]) {
          allEventsMap[type] = 1
        }
  
        const _len = arguments.length
        const evts = new Array(_len > 1 ? _len - 1 : 0)
  
        for (let _key = 1; _key < _len; _key++) {
          evts[_key - 1] = arguments[_key]
        }
        (all[type] || []).slice().forEach((handler) => {
          handler(...evts)
        })
      }
    }
}

/* @HINT: JSDOM doesn't implement `window.matchMedia` */
window.matchMedia = (function () {
    const eventsMap = {}
    const emitter = mitt(eventsMap)

    const mediaQueryMatcher = query => {
        if (typeof query === 'undefined') {
            throw new TypeError(
                "Failed to execute 'matchMedia' on 'Window': 1 argument required, but only 0 present."
            )
        }

        let _onchangeHandler = null

        const calculateMatches = (_query) => {
            if (typeof _query !== "string") {
                return false;
            }
            /* eslint-disable-next-line */
            const queryPattern = /^(?:screen and )?\((min|max)\-(width)(?:[ ]*)\:(?:[ ]*)([\d]+?)(px|r?em)\)$/
            const viewPortWidth = window.innerWidth || window.document.documentElement.clientWidth
            const [, range, dimension, size, unit] = queryPattern.exec(_query.trim()) || [_query, '', '', '', '']

            if (dimension === 'width' && unit === 'px') {
            return range === 'min'
                ? viewPortWidth >= parseInt(size)
                : viewPortWidth <= parseInt(size)
            }

            return mediaQuery.match(_query, {
                type: "screen",
                width: window.innerWidth
            })
        }
        const _dispatchEvent = (event) => {
            const _modifiedEvent = 'matches' in event && event.media === 'print' ? event : Object.assign(
            {},
            event,
            { matches: calculateMatches(query) }
            )

            if (typeof _onchangeHandler === 'function') {
                _onchangeHandler(_modifiedEvent)
                return;
            }
            
            emitter.emit('change', _modifiedEvent)
        }

        window.addEventListener('resize', () => {
            _dispatchEvent({
                media: query,
                type: 'change'
            })
        })

        return {
            get matches () {
                return query === 'print' ? window.__isPrint : calculateMatches(query)
            },
            get media () {
                if (typeof query === 'object') {
                    return 'not all'
                }
                return String(query)
            },
            set onchange (handler) {
                _onchangeHandler = handler
            },
            get onchange  () {
                return _onchangeHandler
            },
            addListener (callback) {
                /* @NOTE: deprecated */
                emitter.on('change', callback)
            },
            removeListener (callback) {
                /* @NOTE: deprecated */
                emitter.off('change', callback)
            },
            addEventListener (event, callback) {
                emitter.on(event, callback)
            },
            removeEventListener (event, callback) {
                emitter.off(event, callback)
            },
            dispatchEvent: _dispatchEvent
        };
    };

    return jest.fn(mediaQueryMatcher);
}())

window.MediaQueryListEvent = (type, options = {}) => {
  const event = new Event(type, { cancelable: false });
  return Object.assign(event, options);
};

const $originalWindowPrint = window.print;

window.print = jest.fn(() => {
    window.dispatchEvent(new Event("beforeprint"))

    window.__isPrint = true;

    const mediaQueryList = window.matchMedia('print');  
 
    const event = new window.MediaQueryListEvent('change', {  
        matches: true,  
        media: 'print'  
    });

    mediaQueryList.dispatchEvent(event);  

    window.setTimeout(() => {
        window.dispatchEvent(new Event("afterprint"))

        delete window['__isPrint'];
    }, 0);

    if (typeof $originalWindowPrint === "function") {
        /* @HINT: The call to this function throws the JSDOM `notImplemented(name, window)` error */
        return $originalWindowPrint();
    }
});

/* @TODO: Remove the logic below after the next version/release of `mocklets` is installed on this project (react-busser) */

// There should be a single listener which simply prints to the
// console. We will wrap that listener in our own listener.
const listeners = window._virtualConsole.listeners('jsdomError');
const originalListener = listeners && listeners[0];

window._virtualConsole.removeAllListeners('jsdomError');

// Add a new listener to swallow JSDOM errors that orginate from prompting the print dialog using `window.print()`.
window._virtualConsole.addListener('jsdomError', error => {
  if (
    error.type !== 'not implemented' &&
    (error.message !== 'Not implemented: window.print'
    || error.message !== 'Not implemented: navigation (except hash changes)') &&
    originalListener
  ) {
    originalListener(error);
  }

  // swallow error
});