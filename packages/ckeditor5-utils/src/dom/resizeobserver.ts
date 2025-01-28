/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/resizeobserver
 */

import global from './global.js';

/**
 * A helper class which instances allow performing custom actions when native DOM elements are resized.
 *
 * ```ts
 * const editableElement = editor.editing.view.getDomRoot();
 *
 * const observer = new ResizeObserver( editableElement, entry => {
 * 	console.log( 'The editable element has been resized in DOM.' );
 * 	console.log( entry.target ); // -> editableElement
 * 	console.log( entry.contentRect.width ); // -> e.g. '423px'
 * } );
 * ```
 *
 * It uses the [native DOM resize observer](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)
 * under the hood.
 */
export default class ResizeObserver {
	/**
	 * The element observed by this observer.
	 */
	private readonly _element: Element;

	/**
	 * The callback executed each time {@link #_element} is resized.
	 */
	private readonly _callback: ( entry: ResizeObserverEntry ) => void;

	/**
	 * The single native observer instance shared across all {@link module:utils/dom/resizeobserver~ResizeObserver} instances.
	 */
	private static _observerInstance: InstanceType<typeof global.window.ResizeObserver> | null = null;

	/**
	 * A mapping of native DOM elements and their callbacks shared across all
	 * {@link module:utils/dom/resizeobserver~ResizeObserver} instances.
	 */
	private static _elementCallbacks: Map<Element, Set<( entry: ResizeObserverEntry ) => void>> | null = null;

	/**
	 * Creates an instance of the `ResizeObserver` class.
	 *
	 * @param element A DOM element that is to be observed for resizing. Note that
	 * the element must be visible (i.e. not detached from DOM) for the observer to work.
	 * @param callback A function called when the observed element was resized. It passes
	 * the [`ResizeObserverEntry`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserverEntry)
	 * object with information about the resize event.
	 */
	constructor( element: Element, callback: ( entry: ResizeObserverEntry ) => void ) {
		// **Note**: For the maximum performance, this class ensures only a single instance of the native
		// observer is used no matter how many instances of this class were created.
		if ( !ResizeObserver._observerInstance ) {
			ResizeObserver._createObserver();
		}

		this._element = element;
		this._callback = callback;

		ResizeObserver._addElementCallback( element, callback );
		ResizeObserver._observerInstance!.observe( element );
	}

	/**
	 * The element observed by this observer.
	 */
	public get element(): Element {
		return this._element;
	}

	/**
	 * Destroys the observer which disables the `callback` passed to the {@link #constructor}.
	 */
	public destroy(): void {
		ResizeObserver._deleteElementCallback( this._element, this._callback );
	}

	/**
	 * Registers a new resize callback for the DOM element.
	 */
	private static _addElementCallback( element: Element, callback: ( entry: ResizeObserverEntry ) => void ): void {
		if ( !ResizeObserver._elementCallbacks ) {
			ResizeObserver._elementCallbacks = new Map();
		}

		let callbacks = ResizeObserver._elementCallbacks.get( element );

		if ( !callbacks ) {
			callbacks = new Set();
			ResizeObserver._elementCallbacks.set( element, callbacks );
		}

		callbacks.add( callback );
	}

	/**
	 * Removes a resize callback from the DOM element. If no callbacks are left
	 * for the element, it removes the element from the native observer.
	 */
	private static _deleteElementCallback( element: Element, callback: ( entry: ResizeObserverEntry ) => void ): void {
		const callbacks = ResizeObserver._getElementCallbacks( element );

		// Remove the element callback. Check if exist first in case someone
		// called destroy() twice.
		if ( callbacks ) {
			callbacks.delete( callback );

			// If no callbacks left for the element, also remove the element.
			if ( !callbacks.size ) {
				ResizeObserver._elementCallbacks!.delete( element );
				ResizeObserver._observerInstance!.unobserve( element );
			}
		}

		if ( ResizeObserver._elementCallbacks && !ResizeObserver._elementCallbacks.size ) {
			ResizeObserver._observerInstance = null;
			ResizeObserver._elementCallbacks = null;
		}
	}

	/**
	 * Returns are registered resize callbacks for the DOM element.
	 */
	private static _getElementCallbacks( element: Element ): Set<( entry: ResizeObserverEntry ) => void> | null | undefined {
		if ( !ResizeObserver._elementCallbacks ) {
			return null;
		}

		return ResizeObserver._elementCallbacks.get( element );
	}

	/**
	 * Creates the single native observer shared across all `ResizeObserver` instances.
	 */
	private static _createObserver(): void {
		ResizeObserver._observerInstance = new global.window.ResizeObserver( entries => {
			for ( const entry of entries ) {
				const callbacks = ResizeObserver._getElementCallbacks( entry.target );

				if ( callbacks ) {
					for ( const callback of callbacks ) {
						callback( entry );
					}
				}
			}
		} );
	}
}
