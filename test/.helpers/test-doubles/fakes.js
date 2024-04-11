export const fakeIntersectionObserverFactory = () => (function () {
	/* @SOURCE: `GoogleChromeLabs/intersection-observer` */
	/* @CHECK: https://github.com/GoogleChromeLabs/intersection-observer/blob/main/intersection-observer.js#L661C32-L676C3 */
	const parseRootMargin = (rootMargin) => {
		const marginString = rootMargin || '0px';
		const margins = marginString.split(/\s+/).map(function(margin) {
		const [ , value, unit ] = /^(-?\d*\.?\d+)(px|%)$/.exec(margin) || [, "", null];

		  if (!unit) {
			throw new Error('rootMargin must be specified in pixels or percent');
		  }

		  return { value: parseFloat(value), unit };
		});

		margins[1] = margins[1] || margins[0];
		margins[2] = margins[2] || margins[0];
		margins[3] = margins[3] || margins[1];
	  
		return margins;
	};
	
	/* @SOURCE: `GoogleChromeLabs/intersection-observer` */
	/* @CHECK: https://github.com/GoogleChromeLabs/intersection-observer/blob/main/intersection-observer.js#L323C32-L339C3 */
	const expandViewPortRectByRootMargin = (viewPortRect, rootMargin) => {
		const [ topMargin, rightMargin, bottomMargin, leftMargin ] = parseRootMargin(
		  rootMargin
		).map(function(margin, index) {
		  	return margin.unit == 'px' ? margin.value :
				margin.value * (
					index % 2
						? viewPortRect.width
						: viewPortRect.height
					) / 100;
		});
		const newRect = {
		  top: viewPortRect.top - topMargin,
		  right: viewPortRect.right + rightMargin,
		  bottom: viewPortRect.bottom + bottomMargin,
		  left: viewPortRect.left - leftMargin
		};
		newRect.width = newRect.right - newRect.left;
		newRect.height = newRect.bottom - newRect.top;
	  
		newRect.x = newRect.left;
		newRect.y = newRect.top;

		return newRect;
	};

	const isInViewPort = (target, viewPort, options) => {
		const rect = target.getBoundingClientRect()
		const viewPortRect = expandViewPortRectByRootMargin(
			viewPort.getBoundingClientRect(),
			options.rootMargin
		)

		return (
		    rect.left >= viewPortRect.x &&
		    rect.top >= viewPortRect.y &&
		    rect.right <= viewPortRect.right &&
		    rect.bottom <= viewPortRect.bottom
		)
	}

	/* @SOURCE: `Blog Post` */
	/* @CHECK: https://junhyunny.github.io/javascript/jest/testing-library/test-driven-development/how-to-test-intersection-observer/ */
	class IntersectionObserver {
		constructor(callback, options) {
			if (typeof callback != 'function') {
				throw new Error('callback must be a function');
			}
			
			if (
				options.root &&
				options.root.nodeType !== 1 &&
				options.root.nodeType !== 9
			) {
				throw new Error('root must be a Document or Element');
			}

			const viewPort = options.root === null || options.root.nodeType === 9
				? window.document.documentElement
				: options.root
			
			this.entries = [];

			viewPort.addEventListener('scroll', () => {
				this.entries.map((entry) => {
					entry.isIntersecting = isInViewPort(
						entry.target,
						viewPort,
						options
					)
				})
				callback(this.entries, this)
			}, false)
		}

		
		observe (target) {
			this.entries.push({ isIntersecting: false, target })
		}
	
		unobserve (target) {
			this.entries = this.entries.filter((entry) => entry.target !== target)
		}
	
		disconnect() {
			this.entries = []
		}
	}
	  
	return IntersectionObserver;  
})();

export const fakeStorageFactory = () =>
	(function () {
		let __keys = []
		let __map = {}

		const storageFake = new Proxy(
			Object.freeze({
				setItem(key, value) {
					if (typeof key !== 'string') {
						return
					}

					if (typeof value !== 'string') {
						return
					}

					__keys.push(key)
					__map[key] = value
				},
				removeItem(key) {
					const index = __keys.indexOf(key)
					if (index === -1) {
						return
					}
					__keys.splice(index, 1)
					delete __map[key]
				},
				key(keyIndex) {
					if (typeof keyIndex !== 'number') {
						return null
					}
					return __keys[keyIndex] || null
				},
				length: -1,
				clear() {
					__keys = []
					__map = {}
				},
				getItem(key) {
					if (typeof key !== 'string') {
						return null
					}
					return __map[key] || null
				}
			}),
			{
				get: (target, property) => {
					if (typeof target[property] !== 'number') {
						return target[property]
					} else {
						if (property === 'length') {
							return __keys.length
						}
					}
				},
				set: (target, prop) => {
					if (Boolean(target[prop])) {
						throw new Error(`${prop}: readonly`)
					}
				}
			}
		)

		return storageFake
	})()
