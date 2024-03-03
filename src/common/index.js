'use strict'

import { useCallback, useEffect, useRef, useMemo, useState } from 'react'
import { useReactToPrint } from 'react-to-print'
import { signal, effect, useSignal, useComputed } from '@preact/signals-react'
/* @NOTE: `navigator.clipboard` is undefined in Safari 12.1.x as well as the earlier versions 
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
				setTimeout(() => {
					/* @HINT: Programmatically printing text in the browser */
					try {
						window.addEventListener('beforeprint', function onBeforePrinting() {
							options.onBeforePrint()
							window.removeEventListener('beforeprint', onBeforePrinting)
						})
						window.addEventListener('afterprint', function onAfterPrinting() {
							options.onAfterPrint()
							window.removeEventListener('afterprint', onAfterPrinting)
						})
						/* @NOTE: `window.print()` is unsupported in Android v7.x+ | supported however in Android v5.x- */
						/* @CHECK: https://github.com/gregnb/react-to-print/issues/187 */

						/* @NOTE: Opera Mini all versions & Android Browser v2.1.x to v4.3.x also doesn't support `window.print()` */
						resolve(window.print())
					} catch (printError) {
						const error =
							printError instanceof Error ? printError : new Error('Cannot print page')
						options.onPrintError('print', error)
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
		/* @NOTE: Firefox v63.x+ does not support `Clipboard.prototype.readText()` */
		try {
			return navigator.clipboard.readText().then((clipText) => {
				/* @HINT: Programmatically pasting text in the browser: `document.queryCommandEnabled(...)` */
				if (document.queryCommandEnabled('insertText')) {
					const activeElement = selectedElement || document.activeElement
					const selection = document.getSelection()
					if (activeElement) {
						if (
							activeElement.contentEditable === 'true' ||
							activeElement.contentEditable === 'inherit'
						) {
							if (selection === null || selection !== null) {
								const caretPosition =
									typeof activeElement.selectionStart === 'number'
										? activeElement.selectionStart
										: -1
								if (caretPosition !== -1) {
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
				return clipText
			})
		} catch (error) {
			if (document.hasFocus()) {
				const activeElement = selectedElement || document.activeElement
				if (activeElement) {
					if (
						activeElement.contentEditable === 'true' ||
						activeElement.contentEditable === 'inherit' ||
						activeElement.nodeName !== '#document'
					) {
						const selection = document.getSelection()

						if (selection === null || selection.toString().length === 0) {
							const caretPosition =
								typeof activeElement.selectionStart === 'number'
									? activeElement.selectionStart
									: -1
							if (document.queryCommandEnabled('paste')) {
								try {
									if (document.execCommand('paste', false, window.name)) {
										return Promise.resolve(window.name)
									}
								} catch (_) {
									/* eslint-disable no-empty */
								}
							} else if (document.queryCommandEnabled('insertText')) {
								if (caretPosition !== -1) {
									try {
										if (document.execCommand('insertText', false, window.name)) {
											return Promise.resolve(window.name)
										}
									} catch (_) {
										/* eslint-disable no-empty */
									}
								}
							}
						}
					}
				}
			}

			Promise.reject(error)
		}
	}
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
			/* @HINT: Programmatically copying text in the browser: `navigator.clipboard.writeText(...)` */
			return navigator.clipboard.writeText(text).then(() => true)
		} catch (error) {
			if (document.hasFocus()) {
				/* @HINT: Programmatically copying text in the browser */
				const activeElement = selectedElement || document.activeElement
				if (activeElement) {
					if (
						activeElement.contentEditable === 'true' ||
						activeElement.contentEditable === 'inherit' ||
						activeElement.nodeName !== '#document'
					) {
						const selection = document.getSelection()

						if (selection !== null) {
							const selectedText = selection.toString()
							let copied = false
							if (document.queryCommandEnabled('copy')) {
								try {
									if (
										document.execCommand(
											'copy',
											false,
											selectedText.length > 0 ? selectedText : text
										)
									) {
										copied = true
									}
								} catch (_) {
									/* @HINT: Can't use the native browser clipboard, so use the next best thing: the `name` property of the window */
									window.name = selectedText.length > 0 ? selectedText : text
									copied = true
								}
							}
							return Promise.resolve(copied)
						}
					}
				}
			}
			return Promise.reject(error)
		}
	}
}

export const useUICommands = (
	options = {
		print: {}
	}
) => {
	/* @HINT: !!! COMMAND DESGIN PATTERN !!! */
	const allOptions = Object.assign(
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
		const printMq =
			typeof window !== 'undefined' &&
			window.matchMedia &&
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
			} catch (_) {
				printMq.addEventListener('change', mqEvent)
			}
		}

		return () => {
			try {
				printMq.removeListener(mqEvent)
			} catch (_) {
				printMq.removeEventListener('change', mqEvent)
			}
		}
		/* eslint-disable-next-line react-hooks/exhaustive-deps */
	}, [])

	const printer = useReactToPrint(allOptions)
	const commands = useRef({
		copy: copyTextFactory(),
		paste: pasteTextFactory(),
		print: printPageFactory(printer)
	}).current

	return useMemo(
		() => ({
			hub: {
				execute(commandName = '', ...args) {
					if (typeof commands[commandName] === 'function') {
						const commandRoutine = commands[commandName]
						return commandRoutine.apply(null, args)
					}
					return Promise.reject(
						new Error(`UI Command: "${commandName}" not registered/found`)
					)
				}
			}
		}),
		/* eslint-disable-next-line react-hooks/exhaustive-deps */
		[]
	)
}
