/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/dom/getresizeobserver
 */

/* globals setTimeout, clearTimeout */

import mix from '../mix';
import global from './global';
import Rect from './rect';
import DomEmitterMixin from './emittermixin';

const RESIZE_CHECK_INTERVAL = 100;

/**
 * Returns an instance of [`ResizeObserver`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver).
 * In browsers that support the `ResizeObserver` API, the native observer instance is returned.
 * In other browsers, a polyfilled instance is returned instead with a compatible API.
 *
 * [Learn more](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) about the native API.
 *
 * @param {Function} callback A function called when any observed element was resized. Refer to the
 * native [`ResizeObserver`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) API to
 * learn more.
 * @returns {module:utils/dom/getresizeobserver~ResizeObserver} An observer instance.
 */
export default function getResizeObserver( callback ) {
	// TODO: One day, the `ResizeObserver` API will be supported in all modern web browsers.
	// When it happens, this module will no longer make sense and should be removed and
	// the native implementation should be used across the project to save bytes.
	// Check out https://caniuse.com/#feat=resizeobserver.
	if ( typeof global.window.ResizeObserver === 'function' ) {
		return new global.window.ResizeObserver( callback );
	} else {
		return new ResizeObserverPolyfill( callback );
	}
}

/**
 * A polyfill class for the native [`ResizeObserver`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver).
 *
 * @private
 * @mixes module:utils/domemittermixin~DomEmitterMixin
 */
class ResizeObserverPolyfill {
	/**
	 * Creates an instance of the {@link module:utils/dom/getresizeobserver~ResizeObserverPolyfill} class.
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
	 * Stops observing all observed DOM elements.
	 *
	 * Learn more in the
	 * [native method documentation](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver/disconnect).
	 *
	 * @param {HTMLElement} element
	 */
	disconnect() {
		this._elements.forEach( element => this.unobserve( element ) );
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

		periodicCheck();
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

/**
 * A resize observer object (either native or {@link module:utils/dom/getresizeobserver~getResizeObserver polyfilled})
 * offering the [`ResizeObserver`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) API.
 *
 * @typedef {Function} module:utils/dom/getresizeobserver~ResizeObserver
 */
