'use strict'

import { useCallback, useEffect, useRef, useMemo, useState } from 'react'
import { useReactToPrint } from 'react-to-print'
import { signal, effect, useSignal, useComputed } from '@preact/signals-react'
/* @NOTE: `navigator.clipboard` is undefined in Safari v12.1.x- as well as the earlier versions 
  of other browsers like Chrome (Webkit), Firefox, Edge (EdgeHTML) */
/* @CHECK: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard#clipboard_availability */
import 'clipboard-polyfill/overwrite-globals' /* @_SHIM: # */

/**
 * @SEE: https://github.com/preactjs/signals/issues/307
 */
function useSignal$(value) {
	const $signal = useRef()
	return $signal.current !== null || $signal.current !== undefined
		? $signal.current
		: ($signal.current = signal(value))
}

export const useSignalsState = (initialState) => {
	const useSignal_ = useSignal ? useSignal : useSignal$
	const signal = useSignal_(
		typeof initialState === 'function' ? initialState() : initialState
	)

	return [
		signal,
		(dataOrFunction) => {
			if (typeof dataOrFunction === 'function') {
				signal.value = dataOrFunction(signal.peek())
				return
			}
			signal.value = dataOrFunction
		}
	]
}

export const useSignalsEffect = (
	callback = () => undefined,
	depenencyList = []
) => {
	/* eslint-disable-next-line react-hooks/exhaustive-deps */
	const $callback = useCallback(callback, depenencyList)

	useEffect(() => {
		return effect($callback)
		/* eslint-disable-next-line react-hooks/exhaustive-deps */
	}, [])
}

export const useAppState = (appState, useSignals = false) => {
	const statePrimitiveMap = {
		signals: useSignalsState,
		container: useState
	}

	return statePrimitiveMap[useSignals ? 'signals' : 'container'](appState)
}

export const useAppEffect = (effectCallback, useSignals = false) => {
	const statePrimitiveMap = {
		signals: useSignalsEffect,
		container: useEffect
	}

	return statePrimitiveMap[useSignals ? 'signals' : 'container'](effectCallback)
}

export const useSignalsComputed = useComputed

/**
 * printPageFactory
 *
 * @param {Function} printer
 * @returns {((componentRef: import('react').MutableRefObject<HTMLElement> | null, options: import('react-to-print').PrintOptions) => Promise<void>)}
 */
function printPageFactory(printer, options) {
	return (componentRef = null) => {
		let promise = null
		if (!componentRef) {
			promise = new Promise((resolve, reject) => {
				window.addEventListener('beforeprint', function onBeforePrinting() {
					options.onBeforePrint()
					window.removeEventListener('beforeprint', onBeforePrinting)
				});
				window.addEventListener('afterprint', function onAfterPrinting() {
					options.onAfterPrint()
					window.removeEventListener('afterprint', onAfterPrinting)
				});
				setTimeout(() => {
					/* @HINT: Programmatically printing text in the browser */
					try {
						/* @NOTE: `window.print()` is unsupported in Android v7.x+ | supported however in Android v5.x- */
						/* @CHECK: https://github.com/gregnb/react-to-print/issues/187 */

						/* @NOTE: Opera Mini all versions & Android Browser v2.1.x to v4.3.x also doesn't support `window.print()` */
						resolve(window.print())
					} catch (printError) {
						const error =
							printError instanceof Error ? printError : new Error('Cannot print page')
						if (typeof options.onPrintError === "function") {
							options.onPrintError('print', error)
						}
						reject(error)
					}
				}, 50)
			})
			return promise
		} else {
			Promise.resolve(
				printer(
					null,
					typeof options.content === 'function'
						? undefined
						: () => componentRef.current
				)
			)
		}
	}
}

/**
 * pasteTextFactory
 *
 * @param {void}
 * @returns {((selectedElement: HTMLElement | Node) => Promise<string>)}
 */
function pasteTextFactory() {
	return (selectedElement) => {
		const isPasteSupported = document.queryCommandSupported
				&& document.queryCommandSupported("insertText") || document.queryCommandEnabled("insertText");
		/* @NOTE: Firefox v63.x+ does not support `Clipboard.prototype.readText()` */
		try {
			return navigator.clipboard.readText().then((clipText) => {
				if (typeof clipText !== "string"
					&& selectedElement) {
					const activeElement = selectedElement;
					if (activeElement) {
						if (
							activeElement.contentEditable === 'true' ||
							activeElement.contentEditable === 'inherit' ||
							activeElement.nodeName !== '#document'
						) {
							activeElement.focus();
							const caretPosition =
								typeof activeElement.selectionStart === 'number'
									? activeElement.selectionStart
									: -1
							if (caretPosition !== -1) {
								if (isPasteSupported) {
									try {
										if (document.execCommand('insertText', false, clipText)) {
											return ''
										}
									} catch (_) {
										/* eslint-disable no-empty */
									}
								}
							}
							
						}
					}
				}
				return clipText;
			});
		} catch (error) {
			if (!selectedElement) {
				const textarea = document.getElementById("__react-busser-clipboard");
				if (textarea) {
					if (isPasteSupported) {
						try {
							if (document.execCommand('insertText', false, textarea.value)) {
								return Promise.resolve(textarea.value);
							}
							throw new Error("Cannot copy to clipboard");
						} catch ($error) {
							if (!window.name.startsWith(':- ')) {
								return Promise.reject($error);
							}
							const text = window.name.replace(':- ', '');
							if (document.execCommand('insertText', false, text)) {
								window.name = "";
								return Promise.resolve(text);
							}
						}
					}
				}
				return Promise.reject(new Error("Cannot copy to clipboard"));
			} else if (document.hasFocus()) {
				return Promise.resolve(window.name);
			}

			return Promise.reject(error)
		}
	};
}

/**
 * copyTextFactory
 *
 * @param {void}
 * @returns {((text: string, selectedElement: HTMLElement | Node) => Promise<boolean>)}
 */
function copyTextFactory() {
	return (text = '', selectedElement) => {
		/* @NOTE: `navigator.clipboard.writeText(...)` throws vague error in Safari v13.1.x+ even when called in a real user context */
		/* @CHECK: https://developer.apple.com/forums/thread/691873 */
		try {
			if (typeof navigator !== "undefined" && typeof navigator.clipboard !== "undefined") {
				if (typeof navigator.permissions !== "undefined"
					&& typeof navigator.permissions.query === "function") {
					const type = "text/plain";
					const blob = new Blob([text], { type });
					const data = [new window.ClipboardItem({ [type]: blob })];
					return navigator.permissions.query({name: "clipboard-write"}).then((permission) => {
						if (permission.state === "granted" || permission.state === "prompt") {
							return navigator.clipboard.write(data).then(() => false)
						}
					}, () => {
						return Promise.reject(new Error("Permission not granted!"));
					});
				}
				/* @HINT: Programmatically copying text in the browser: `navigator.clipboard.writeText(...)` */
				return navigator.clipboard.writeText(text).then(() => false)
			}
		} catch (error) {
			const isCopySupported = document.queryCommandSupported
				&& document.queryCommandSupported("copy") || document.queryCommandEnabled("copy");
			const textarea = document.getElementById("__react-busser-clipboard");
			if (!selectedElement && textarea) {
				textarea.textContent = text;
				const caretPosition =
					typeof textarea.selectionStart === 'number'
						? textarea.selectionStart
						: -1;
				textarea.focus();
				if (caretPosition !== -1) {
					textarea.select();
				} else {
					textarea.setSelectionRange(0, text.length);
				}
				try {
					if (isCopySupported) {
						if (document.execCommand("copy")) {
							return Promise.resolve(true)
						}
					}
					throw new Error("Cannot copy to clipboard");
				} catch (e) {
					return Promise.reject(e);
				}
			} else if (document.hasFocus()) {
				/* @HINT: Programmatically copying text in the browser */
				const activeElement = selectedElement || document.activeElement
				if (activeElement && typeof activeElement.tagName === "string") {
					if (
						activeElement.contentEditable === 'true' ||
						activeElement.contentEditable === 'inherit' ||
						activeElement.nodeName !== '#document'
					) {
						let selection = document.getSelection();

						if (typeof activeElement.select === 'function'
							&& ["INPUT", "TEXTAREA"].includes(activeElement.tagName)) {
							activeElement.setSelectionRange(0, 9999);
							selection = document.getSelection();
						} else { 
							const range = document.createRange();  

							try {
								range.setStart(activeElement.firstChild, 0);
								range.setEnd(
									activeElement.firstChild,
									activeElement.innerText.length
								);
							} catch {
								/* eslint-disable no-empty */
							}

							selection.removeAllRanges(); 
							selection.addRange(range);
						}

						if (selection.focusNode === null) {
							const textarea = document.getElementById("__react-busser-clipboard");
							if (textarea) {
								textarea.textContent = text;
								textarea.focus()
								textarea.select()
								selection = document.getSelection();
							}
						}
						
						const selectedText = selection.focusNode !== null ? selection.toString() : text;
						if (isCopySupported) {
							try {
								if (
									document.execCommand(
										'copy'
									)
								) {
									return Promise.resolve(true);
								}
							} catch {
								/* 
								 @HINT: Can't use the native browser clipboard since it's API isn't implemented,
										so use the next best thing: the `name` property of the window
								*/
								if (window.name === "") {
									window.name = ':- '+selectedText;
									return Promise.resolve(false);
								}
								return Promise.reject(new Error("Cannot copy to clipboard"));
							}
						}
						return Promise.reject(new Error("Cannot copy to clipboard"));
					}
				}
			}
			return Promise.reject(error)
		}
	}
}

/**!
 * `useUICommands` ReactJS hook
 */
export const useUICommands = (
	options = {
		print: {}
	}
) => {
	/* @HINT: !!! COMMAND DESGIN PATTERN !!! */
	const allOptions = Object.assign(
		{},
		{
			documentTitle: '',
			onBeforeGetContent: () => Promise.resolve(undefined),
			onBeforePrint: () => undefined,
			onAfterPrint: () => undefined,
			onPrintError: () => undefined,
			removeAfterPrint: true,
			nowPrinting: () => undefined
		},
		options.print
	)

	useEffect(() => {
		if (typeof navigator.clipboard === "undefined"
			|| (typeof navigator.clipboard.writeText === "undefined"
			  || typeof navigator.clipboard.readText === "undefined")) {
			let textarea = document.getElementById("__react-busser-clipboard");
			if (!textarea) {
				textarea = document.createElement("textarea");
				textarea.style.position = "fixed";
				textarea.style.width = '2em';
				textarea.style.height = '1em';
				textarea.style.padding = "0px";
				textarea.style.border = 'none';
				textarea.style.outline = 'none';
				textarea.style.boxShadow = 'none';
				textarea.style.fontSize = "0px";
				textarea.id = "__react-busser-clipboard";
				textarea.style.opacity = "0";
				textarea.tabIndex = 0;
				textarea.dataset.clipboardObject = "polyfill-stub";
				textarea.style.backgroundColor = 'transparent';

				document.body.appendChild(textarea);
			}
		}
		const printMq =
			typeof window !== 'undefined' &&
			'matchMedia' in window &&
			window.matchMedia('print')

		const mqEvent = (mqListOrEvent) => {
			const isPrinting = !!mqListOrEvent.matches

			if (isPrinting) {
				allOptions.nowPrinting()
			}
		}

		if (printMq) {
			try {
				printMq.addListener(mqEvent)
			} catch {
				printMq.addEventListener('change', mqEvent)
			}
		}

		return () => {
			if (typeof navigator.clipboard === "undefined"
				|| (typeof navigator.clipboard.writeText === "undefined"
					|| typeof navigator.clipboard.readText === "undefined")) {
				let textarea = document.getElementById(
					"__react-busser-clipboard"
				);
				if (textarea && textarea.parentNode) {
					textarea.parentNode.removeChild(textarea);
				}
			}

			if (printMq) {
				try {
					printMq.removeListener(mqEvent)
				} catch {
					printMq.removeEventListener('change', mqEvent)
				}
			}
		};
	/* eslint-disable-next-line react-hooks/exhaustive-deps */
	}, []);

	const printer = useReactToPrint(allOptions)
	const commands = useRef({
		copy: copyTextFactory(),
		paste: pasteTextFactory(),
		print: printPageFactory(printer, allOptions)
	}).current

	return useMemo(
		() => ({
			hub: {
				copy(...args) {
					return commands.copy.apply(null, args);
				},
				paste(...args) {
					return commands.paste.apply(null, args);
				},
				print(...args) {
					return commands.print.apply(null, args);
				}
			}
		}),
		/* eslint-disable-next-line react-hooks/exhaustive-deps */
		[]
	);
}


class BrowserScreenActivityTracker {
	constructor(options = {}) {
	  	let activeMethod = {}
	  	const activity = this
  
		activity.awayTimeout = typeof options.awayTimeout !== "number" ? 3000 : options.awayTimeout
		activity.onAway = options.onAway
		activity.onStopped = options.onStopped
		activity.onAwayBack = options.onAwayBack
		activity.onScreenVisible = options.onVisible
		activity.onScreenHidden = options.onHidden

	  	this.isUserAway = false
  
		this.isStopped = true
  
		this.lastActive = new Date().getTime()
  
		this.awayTimestamp = 0
  
	  	this.listener = undefined
  
	  	this.awayTimer = null
  
	  	this._isVisible = true

  
		this.setup = function() {
			activeMethod.$$onload = window.onload
			activeMethod.$$onclick = window.onclick
			activeMethod.$$onpointermove = window.onpointermove
			activeMethod.$$onmousedown = window.onmousedown
			activeMethod.$$ontouchstart = window.ontouchstart
			activeMethod.$$onkeydown = window.onkeydown
			activeMethod.$$onscroll = window.onscroll
			activeMethod.$$onmouseover = window.onmouseover
			/* @ts-ignore */
			activeMethod.$$onmousewheel = window.onmousewheel
			activeMethod.$$onfocus = window.onfocus
			activeMethod.$$_reSize = null;
	
			window.onload = function() {
				if (activeMethod.$$onload) {
					activeMethod.$$onload()
				}
				activity.onActive()
			}

			window.onclick = function() {
				if (activeMethod.$$onclick) {
					activeMethod.$$onclick()
				}
				activity.onActive()
			}

			activeMethod.$$_reSize = function () {
				activity.onActive();
			}
			window.addEventListener('resize', activeMethod.$$_reSize, false)

			window.onpointermove = function() {
				if (activeMethod.$$onpointermove) {
					activeMethod.$$onpointermove()
				}
				activity.onActive()
			}
	
			window.onmousedown = function() {
				if (activeMethod.$$onmousedown) {
					activeMethod.$$onmousedown()
				}
				activity.onActive()
			}
	
			window.ontouchstart = function() {
				if (activeMethod.$$ontouchstart) {
					activeMethod.$$ontouchstart()
				}
				activity.onActive()
			}
	
			window.onkeydown = function() {
				if (activeMethod.$$onkeydown) {
					activeMethod.$$onkeydown()
				}
				activity.onActive()
			}
	
			window.onscroll = function() {
				if (activeMethod.$$onscroll) {
					activeMethod.$$onscroll()
				}
				activity.onActive()
			}
	
			/* @ts-ignore */
			window.onmousewheel = function() {
				if (activeMethod.$$onmousewheel) {
					activeMethod.$$onmousewheel()
				}
				activity.onActive()
			}
	
			window.onfocus = function() {
				if (activeMethod.$$onfocus) {
					activeMethod.$$onfocus()
				}
				activity.onActive()
			}
	
			window.onmouseover = function() {
				if (activeMethod.$$onmouseover) {
					activeMethod.$$onmouseover()
				}
				activity.onActive()
			}
		}
	
		this.teardown = function() {
			window.onfocus = activeMethod.$$onfocus
			window.onload = activeMethod.$$onload
			window.onclick = activeMethod.$$onclick
			window.onpointermove = activeMethod.$$onpointermove
			window.onmousedown = activeMethod.$$onmousedown
			window.ontouchstart = activeMethod.$$ontouchstart || null
			window.onkeydown = activeMethod.$$onkeydown
			window.onscroll = activeMethod.$$onscroll
			/* @ts-ignore */
			window.onmousewheel = activeMethod.$$onmousewheel
			window.onmouseover = activeMethod.$$onmouseover

			window.removeEventListener('resize', activeMethod.$$_reSize, false)
			activeMethod.$$_reSize = null
			activeMethod = {}
			this.lastActive = new Date().getTime()
			this._isVisible = true
		}
	}
  
	onActive() {
	  this.awayTimestamp = new Date().getTime() + this.awayTimeout
  
	  if (this.isUserAway) {
		if (typeof this.onAwayBack === "function") {
		  this.onAwayBack()
		}
  
		this.start()
	  }
  
	  this.isUserAway = false
  
	  return true
	}
  
	start() {
	  const activity = this
  
	  if (this.listener === undefined) {
		this.listener = () => {
		  activity.handleVisibilityChange()
		}
  
		if (typeof document.addEventListener === "function") {
		  window.addEventListener("focus", this.listener, false)
		  if (typeof document.hidden !== "undefined") {
			document.addEventListener("visibilitychange", this.listener, false)
		  } else {
			document.addEventListener(
			  "webkitvisibilitychange",
			  this.listener,
			  false
			)
		  }
		}
	  }
  
	  this.awayTimestamp = new Date().getTime() + this.awayTimeout
  
	  if (this.awayTimer !== null) {
		clearTimeout(this.awayTimer)
	  }
  
	  if (typeof this.setup === "function") {
		if (this.isStopped) {
		  this.setup()
		}
	  }
  
	  this.awayTimer = setTimeout(() => {
		return activity.checkAway()
	  }, this.awayTimeout + 100)
  
	  this.isStopped = false
	  return this
	}
  
	stop() {
	  if (this.awayTimer !== null) {
		clearTimeout(this.awayTimer)
	  }
  
	  if (this.listener !== undefined) {
		if (typeof document.removeEventListener === "function") {
		  window.removeEventListener("focus", this.listener, false)
		  document.removeEventListener("visibilitychange", this.listener, false)
  
		  document.removeEventListener(
			"webkitvisibilitychange",
			this.listener,
			false
		  )
		}
		this.listener = undefined
	  }
  
	  this.isStopped = true
	  if (typeof this.onStopped === "function") {
		this.onStopped()
		if (typeof this.teardown === "function") {
		  this.teardown()
		}
	  }
	  return this
	}
  
	setAwayTimeout(ms) {
	  this.awayTimeout = parseInt(ms, 10)
	  return this
	}
  
	checkAway() {
	  const activity = this
	  const currentTime = new Date().getTime()
  
	  if (currentTime < this.awayTimestamp) {
		this.isUserAway = false
  
		this.awayTimer = setTimeout(() => {
		  return activity.checkAway()
		}, this.awayTimestamp - currentTime + 100)
  
		return
	  }
  
	  if (this.awayTimer !== null) {
		clearTimeout(this.awayTimer)
	  }
  
	  this.isUserAway = true
	  this.lastActive = new Date().getTime()
  
	  if (typeof this.onAway === "function") {
		this.onAway()
	  }
	}
  
	handleVisibilityChange() {
	  if (
		typeof this.onScreenHidden === "function" &&
		document.visibilityState === "hidden"
	  ) {
		if (!this._isVisible) {
		  return
		}
		if (this.awayTimer !== null) {
		  clearTimeout(this.awayTimer)
		}
		this._isVisible = false
		this.isUserAway = true
		this.lastActive = new Date().getTime()
		this.onScreenHidden()
		if (typeof this.onAway === "function") {
		  this.onAway()
		}
		return
	  }
  
	  if (!document.hasFocus()) {
		if (
		  typeof this.onScreenVisible === "function" &&
		  (("hidden" in document && document.hidden === false) ||
			document.visibilityState === "visible")
		) {
		  if (this._isVisible) {
			return
		  }
		  this._isVisible = true
		  this.onActive()
		  this.onScreenVisible()
		}
	  }
	}
}
  


/**!
 * `useBrowserScreenActivityStatusMonitor` ReactJS hook
 */
export const useBrowserScreenActivityStatusMonitor = ({
	onPageNotActive = () => undefined,
	onPageNowActive = () => undefined,
	onStopped = () => undefined,
	onPageHidden = () => undefined,
	onPageVisible = () => undefined,
	ACTIVITY_TIMEOUT_DURATION = 3000
}) => {
	const [tracker] = useState(() => { 
		const tracker = new BrowserScreenActivityTracker({
	   		awayTimeout: ACTIVITY_TIMEOUT_DURATION,
	   		onAway: onPageNotActive,
			onAwayBack: onPageNowActive,
			onVisible: onPageVisible,
			onStopped,
			onHidden: onPageHidden
	 	});
	 	return tracker;
   	});
 
	useEffect(() => {
		if (tracker.isStopped) {
			tracker.start();
		}

		return () => {
			if (!tracker.isStopped) {
				tracker.stop();
			}
		}
	/* eslint-disable-next-line react-hooks/exhaustive-deps */ 
	}, []);
 
   	return {
		updatePageActivityTimeoutInMilliseconds (timeout) {
			tracker.setAwayTimeout(String(timeout));
		}
   	}
};
