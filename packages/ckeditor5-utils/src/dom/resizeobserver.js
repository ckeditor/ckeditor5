/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/dom/resizeobserver
 */

/* globals setTimeout, clearTimeout */

import mix from '../mix';
import global from './global';
import Rect from './rect';
import DomEmitterMixin from './emittermixin';

const RESIZE_CHECK_INTERVAL = 100;

/**
 * A helper class which instances allow performing custom actions when native DOM elements are resized.
 *
 *		const editableElement = editor.editing.view.getDomRoot();
 *
 *		const observer = new ResizeObserver( editableElement, entry => {
 *			console.log( 'The editable element has been resized in DOM.' );
 *			console.log( entry.target ); // -> editableElement
 *			console.log( entry.contentRect.width ); // -> e.g. '423px'
 *		} );
 *
 * By default, it uses the [native DOM resize observer](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)
 * under the hood and in browsers that do not support the native API yet, a polyfilled observer is
 * used instead.
 */
export default class ResizeObserver {
	/**
	 * Creates an instance of the `ResizeObserver` class.
	 *
	 * @param {HTMLElement} element A DOM element that is to be observed for resizing. Note that
	 * the element must be visible (i.e. not detached from DOM) for the observer to work.
	 * @param {Function} callback A function called when the observed element was resized. It passes
	 * the [`ResizeObserverEntry`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserverEntry)
	 * object with information about the resize event.
	 */
	constructor( element, callback ) {
		// **Note**: For the maximum performance, this class ensures only a single instance of the native
		// (or polyfilled) observer is used no matter how many instances of this class were created.
		if ( !ResizeObserver._observerInstance ) {
			ResizeObserver._createObserver();
		}

		/**
		 * The element observer by this observer.
		 *
		 * @readonly
		 * @private
		 * @member {HTMLElement}
		 */
		this._element = element;

		/**
		 * The callback executed each time {@link #_element} is resized.
		 *
		 * @readonly
		 * @private
		 * @member {Function}
		 */
		this._callback = callback;

		ResizeObserver._addElementCallback( element, callback );
		ResizeObserver._observerInstance.observe( element );
	}

	/**
	 * Destroys the observer which disables the `callback` passed to the {@link #constructor}.
	 */
	destroy() {
		ResizeObserver._deleteElementCallback( this._element, this._callback );
	}

	/**
	 * Registers a new resize callback for the DOM element.
	 *
	 * @private
	 * @static
	 * @param {HTMLElement} element
	 * @param {Function} callback
	 */
	static _addElementCallback( element, callback ) {
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
	 *
	 * @private
	 * @static
	 * @param {HTMLElement} element
	 * @param {Function} callback
	 */
	static _deleteElementCallback( element, callback ) {
		const callbacks = ResizeObserver._getElementCallbacks( element );

		// Remove the element callback. Check if exist first in case someone
		// called destroy() twice.
		if ( callbacks ) {
			callbacks.delete( callback );

			// If no callbacks left for the element, also remove the element.
			if ( !callbacks.size ) {
				ResizeObserver._elementCallbacks.delete( element );
				ResizeObserver._observerInstance.unobserve( element );
			}
		}

		if ( ResizeObserver._elementCallbacks && !ResizeObserver._elementCallbacks.size ) {
			ResizeObserver._observerInstance = null;
			ResizeObserver._elementCallbacks = null;
		}
	}

	/**
	 * Returns are registered resize callbacks for the DOM element.
	 *
	 * @private
	 * @static
	 * @param {HTMLElement} element
	 * @returns {Set.<HTMLElement>|null}
	 */
	static _getElementCallbacks( element ) {
		if ( !ResizeObserver._elementCallbacks ) {
			return null;
		}

		return ResizeObserver._elementCallbacks.get( element );
	}

	/**
	 * Creates the single native observer shared across all `ResizeObserver` instances.
	 * If the browser does not support the native API, it creates a polyfill.
	 *
	 * @private
	 * @static
	 */
	static _createObserver() {
		let ObserverConstructor;

		// TODO: One day, the `ResizeObserver` API will be supported in all modern web browsers.
		// When it happens, this module will no longer make sense and should be removed and
		// the native implementation should be used across the project to save bytes.
		// Check out https://caniuse.com/#feat=resizeobserver.
		if ( typeof global.window.ResizeObserver === 'function' ) {
			ObserverConstructor = global.window.ResizeObserver;
		} else {
			ObserverConstructor = ResizeObserverPolyfill;
		}

		ResizeObserver._observerInstance = new ObserverConstructor( entries => {
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

/**
 * The single native observer instance (or polyfill in browsers that do not support the API)
 * shared across all {@link module:utils/dom/resizeobserver~ResizeObserver} instances.
 *
 * @static
 * @protected
 * @readonly
 * @property {Object|null} module:utils/dom/resizeobserver~ResizeObserver#_observerInstance
 */
ResizeObserver._observerInstance = null;

/**
 * A mapping of native DOM elements and their callbacks shared across all
 * {@link module:utils/dom/resizeobserver~ResizeObserver} instances.
 *
 * @static
 * @private
 * @readonly
 * @property {Map.<HTMLElement,Set>|null} module:utils/dom/resizeobserver~ResizeObserver#_elementCallbacks
 */
ResizeObserver._elementCallbacks = null;

/**
 * A polyfill class for the native [`ResizeObserver`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver).
 *
 * @private
 * @mixes module:utils/domemittermixin~DomEmitterMixin
 */
class ResizeObserverPolyfill {
	/**
	 * Creates an instance of the {@link module:utils/dom/resizeobserver~ResizeObserverPolyfill} class.
	 *
	 * It synchronously reacts to resize of the window to check if observed elements' geometry changed.
	 *
	 * Additionally, the polyfilled observer uses a timeout to check if observed elements' geometry has changed
	 * in some other way (dynamic layouts, scrollbars showing up, etc.), so its response can also be asynchronous.
	 *
	 * @param {Function} callback A function called when any observed element was resized. Refer to the
	 * native [`ResizeObserver`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) API to
	 * learn more.
	 */
	constructor( callback ) {
		/**
		 * A function called when any observed {@link #_elements element} was resized.
		 *
		 * @readonly
		 * @protected
		 * @member {Function}
		 */
		this._callback = callback;

		/**
		 * DOM elements currently observed by the observer instance.
		 *
		 * @readonly
		 * @protected
		 * @member {Set}
		 */
		this._elements = new Set();

		/**
		 * Cached DOM {@link #_elements elements} bounding rects to compare to upon the next check.
		 *
		 * @readonly
		 * @protected
		 * @member {Map.<HTMLElement,module:utils/dom/rect~Rect>}
		 */
		this._previousRects = new Map();

		/**
		 * An UID of the current timeout upon which the observed elements rects
		 * will be compared to the {@link #_previousRects previous rects} from the past.
		 *
		 * @readonly
		 * @protected
		 * @member {Map.<HTMLElement,module:utils/dom/rect~Rect>}
		 */
		this._periodicCheckTimeout = null;
	}

	/**
	 * Starts observing a DOM element.
	 *
	 * Learn more in the
	 * [native method documentation](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver/observe).
	 *
	 * @param {HTMLElement} element
	 */
	observe( element ) {
		this._elements.add( element );

		this._checkElementRectsAndExecuteCallback();

		if ( this._elements.size === 1 ) {
			this._startPeriodicCheck();
		}
	}

	/**
	 * Stops observing a DOM element.
	 *
	 * Learn more in the
	 * [native method documentation](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver/unobserve).
	 *
	 * @param {HTMLElement} element
	 */
	unobserve( element ) {
		this._elements.delete( element );
		this._previousRects.delete( element );

		if ( !this._elements.size ) {
			this._stopPeriodicCheck();
		}
	}

	/**
	 * When called, the observer calls the {@link #_callback resize callback} for all observed
	 * {@link #_elements elements} but also starts checking periodically for changes in the elements' geometry.
	 * If some are detected, {@link #_callback resize callback} is called for relevant elements that were resized.
	 *
	 * @protected
	 */
	_startPeriodicCheck() {
		const periodicCheck = () => {
			this._checkElementRectsAndExecuteCallback();
			this._periodicCheckTimeout = setTimeout( periodicCheck, RESIZE_CHECK_INTERVAL );
		};

		this.listenTo( global.window, 'resize', () => {
			this._checkElementRectsAndExecuteCallback();
		} );

		this._periodicCheckTimeout = setTimeout( periodicCheck, RESIZE_CHECK_INTERVAL );
	}

	/**
	 * Stops checking for changes in all observed {@link #_elements elements} geometry.
	 *
	 * @protected
	 */
	_stopPeriodicCheck() {
		clearTimeout( this._periodicCheckTimeout );
		this.stopListening();
		this._previousRects.clear();
	}

	/**
	 * Checks if the geometry of any of the {@link #_elements element} has changed. If so, executes
	 * the {@link #_callback resize callback} with element geometry data.
	 *
	 * @protected
	 */
	_checkElementRectsAndExecuteCallback() {
		const entries = [];

		for ( const element of this._elements ) {
			if ( this._hasRectChanged( element ) ) {
				entries.push( {
					target: element,
					contentRect: this._previousRects.get( element )
				} );
			}
		}

		if ( entries.length ) {
			this._callback( entries );
		}
	}

	/**
	 * Compares the DOM element geometry to the {@link #_previousRects cached geometry} from the past.
	 * Returns `true` if geometry has changed or the element is checked for the first time.
	 *
	 * @protected
	 * @param {HTMLElement} element
	 * @returns {Boolean}
	 */
	_hasRectChanged( element ) {
		if ( !element.ownerDocument.body.contains( element ) ) {
			return false;
		}

		const currentRect = new Rect( element );
		const previousRect = this._previousRects.get( element );

		// The first check should always yield true despite no Previous rect to compare to.
		// The native ResizeObserver does that and... that makes sense. Sort of.
		const hasChanged = !previousRect || !previousRect.isEqual( currentRect );

		this._previousRects.set( element, currentRect );

		return hasChanged;
	}
}

mix( ResizeObserverPolyfill, DomEmitterMixin );
